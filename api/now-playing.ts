// Serverless function: what I'm playing on Spotify right now (the header's now-playing widget),
// or failing that, the last track I played. Same credentials as /api/top-tracks, but the
// SPOTIFY_REFRESH_TOKEN must also carry the user-read-currently-playing and
// user-read-recently-played scopes (scripts/spotify-auth.mjs asks for all three).
//
// Spotify has no push channel (Lanyard got Discord's), so this is polled: every open page asks
// every 4 s, right away when it's looked at again, and again the moment the song playing
// should end (from progressMs/durationMs below). The CDN keeps each answer only 2 s and never
// serves one staler than that, so a change shows within a few seconds while Spotify still sees
// at most one request per 2 s however many people are on the site. The access token is kept
// between requests while the function stays warm, so most answers are a single Spotify call.

interface SpotifyImage {
  url: string;
  width: number | null;
}

interface SpotifyTrack {
  id: string;
  duration_ms: number;
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
  // 2 s at the CDN and never served staler (no stale-while-revalidate: that kept answers up
  // to 20 s old); browsers always ask again (max-age=0).
  res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=2');
  return res.status(200).json(body);
};

// Access tokens last an hour. A warm function instance keeps its last one, so most requests
// skip the token round trip; one that comes back refused is dropped and the next request
// fetches a fresh one.
let cachedToken: { value: string; expires: number } | null = null;

const accessToken = async (clientId: string, clientSecret: string, refreshToken: string) => {
  if (cachedToken && cachedToken.expires > Date.now() + 60_000) return cachedToken.value;
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
  cachedToken = { value: token.access_token, expires: Date.now() + (token.expires_in ?? 3600) * 1000 };
  return cachedToken.value;
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
    let headers = { Authorization: `Bearer ${await accessToken(clientId, clientSecret, refreshToken)}` };

    // 200 with the player's state while something is loaded (playing or paused); 204 when
    // nothing is.
    let nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
    if (nowRes.status === 401) {
      // The kept token was refused: get a fresh one and ask once more
      cachedToken = null;
      headers = { Authorization: `Bearer ${await accessToken(clientId, clientSecret, refreshToken)}` };
      nowRes = await fetch('https://api.spotify.com/v1/me/player/currently-playing', { headers });
    }
    if (nowRes.status === 200) {
      const now = await nowRes.json();
      // Podcasts and ads come back without a track: treat them like silence.
      if (now.currently_playing_type === 'track' && now.item) {
        return send(res, {
          state: now.is_playing ? 'playing' : 'paused',
          track: toTrack(now.item),
          // So the page can ask again right as the song ends
          progressMs: now.progress_ms ?? null,
          durationMs: now.item.duration_ms ?? null,
        });
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
