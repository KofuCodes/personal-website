// Serverless function: my five most-played Spotify tracks lately (the "on repeat" shelf).
// For Vercel: lives at /api/top-tracks. Needs SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET and a
// SPOTIFY_REFRESH_TOKEN granted the user-top-read scope (get one with scripts/spotify-auth.mjs).
//
// Spotify's short_term range is its own ~4-week affinity ranking — not a calendar month, and
// no play counts — which is fine for a changing showcase. The CDN caches the response for an
// hour, so the shelf refreshes itself without the credentials ever reaching the browser.

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

// Smallest cover that's still crisp on a ~130px tile at 2x (Spotify serves 640/300/64).
const pickCover = (images: SpotifyImage[]) =>
  [...images].sort((a, b) => (a.width ?? 0) - (b.width ?? 0)).find((i) => (i.width ?? 0) >= 250)?.url ??
  images[0]?.url ??
  null;

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

    const topRes = await fetch('https://api.spotify.com/v1/me/top/tracks?time_range=short_term&limit=5', {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const top = await topRes.json();
    if (!topRes.ok) {
      throw new Error(top.error?.message || 'Top tracks request failed');
    }

    const tracks = (top.items as SpotifyTrack[]).map((t) => ({
      id: t.id,
      title: t.name,
      artist: t.artists.map((a) => a.name).join(', '),
      url: t.external_urls.spotify,
      cover: pickCover(t.album.images),
    }));

    // Edge-cached for an hour; a stale copy keeps serving while the next one is fetched.
    res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
    return res.status(200).json({ tracks });
  } catch (error) {
    console.error('Top tracks error:', error);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(502).json({ error: 'Could not load top tracks' });
  }
}
