// Serverless function: what I'm playing on Spotify right now (the header's now-playing widget),
// or failing that, the last track I played. Same credentials as /api/top-tracks, but the
// SPOTIFY_REFRESH_TOKEN must also carry the user-read-currently-playing and
// user-read-recently-played scopes (scripts/spotify-auth.mjs asks for all three).
//
// Every open page polls this every 10 s. The CDN caches it for 10 s, so however many people
// are on the site, Spotify sees roughly one request per 10 s.

interface SpotifyImage {
  url: string;
  width: number | null;
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: { images: SpotifyImage[] };
  external_urls: { spotify: string };
}

// The widget's cover is 20px, so Spotify's 64px size is plenty even at 3x.
const pickCover = (images: SpotifyImage[]) =>
  [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0)).find((i) => (i.width ?? 0) >= 60)?.url ??
  images[0]?.url ??
  null;

const toTrack = (t: SpotifyTrack) => ({
  id: t.id,
  title: t.name,
  artist: t.artists.map((a) => a.name).join(', '),
  url: t.external_urls.spotify,
  cover: pickCover(t.album.images),
});

const send = (res: any, body: unknown) => {
  // Short enough to feel live; a stale copy covers the moment the next one is fetched.
  res.setHeader('Cache-Control', 'public, s-maxage=10, stale-while-revalidate=10');
  return res.status(200).json(body);
};

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    res.setHeader('Cache-Control', 'no-store');
    return res.status(503).json({ error: 'Spotify is not configured' });
  }

  try {
    const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    });
    const token = await tokenRes.json();
    if (!tokenRes.ok) {
      throw new Error(token.error_description || 'Token refresh failed');
    }
    const headers = { Authorization: `Bearer ${token.access_token}` };

    // 200 with the player's state while something is loaded (playing or paused); 204 when
    // nothing is.
    const nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
    if (nowRes.status === 200) {
      const now = await nowRes.json();
      // Podcasts and ads come back without a track: treat them like silence.
      if (now.currently_playing_type === 'track' && now.item) {
        return send(res, { state: now.is_playing ? 'playing' : 'paused', track: toTrack(now.item) });
      }
    } else if (nowRes.status !== 204) {
      const err = await nowRes.json().catch(() => ({}));
      throw new Error(err.error?.message || `Currently playing request failed (${nowRes.status})`);
    }

    const recentRes = await fetch('https://api.spotify.com/v1/me/player/recently-played?limit=1', { headers });
    const recent = await recentRes.json();
    if (!recentRes.ok) {
      throw new Error(recent.error?.message || 'Recently played request failed');
    }
    const last = recent.items?.[0]?.track as SpotifyTrack | undefined;
    return send(res, { state: 'recent', track: last ? toTrack(last) : null });
  } catch (error) {
    console.error('Now playing error:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: error instanceof Error ? error.message : 'Could not load now playing' });
  }
}
