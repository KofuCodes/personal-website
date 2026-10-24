// One-time helper: get a Spotify refresh token for /api/top-tracks.
//
// 1. In the Spotify developer dashboard, open your app and add this Redirect URI:
//      http://127.0.0.1:8888/callback
// 2. Put the app's SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, then run
//    (works the same in PowerShell, cmd and bash):
//      node --env-file=.env.local scripts/spotify-auth.mjs
// 3. Open the printed link, approve, and copy the refresh token it prints into .env.local
//    and your Vercel project's env vars as SPOTIFY_REFRESH_TOKEN.

import http from 'node:http';
import crypto from 'node:crypto';

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const PORT = 8888;
const redirectUri = `http://127.0.0.1:${PORT}/callback`;

if (!clientId || !clientSecret) {
  console.error('Set SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET first.');
  process.exit(1);
}

const state = crypto.randomBytes(12).toString('hex');
const authUrl =
  'https://accounts.spotify.com/authorize?' +
  new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    scope: 'user-top-read',
    redirect_uri: redirectUri,
    state,
  });

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', redirectUri);
  if (url.pathname !== '/callback') {
    res.writeHead(404).end();
    return;
  }
  const code = url.searchParams.get('code');
  if (!code || url.searchParams.get('state') !== state) {
    const reason = url.searchParams.get('error') ?? 'state mismatch (an old link?)';
    res.writeHead(400).end(`Authorization failed: ${reason}`);
    console.error(`Callback rejected: ${reason}. Still waiting — open the link above again.`);
    return;
  }

  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({ grant_type: 'authorization_code', code, redirect_uri: redirectUri }),
  });
  const data = await tokenRes.json();

  if (!tokenRes.ok || !data.refresh_token) {
    res.writeHead(500).end('Token exchange failed — see the terminal.');
    console.error('Token exchange failed:', data);
  } else {
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done — you can close this tab and go back to the terminal.');
    console.log('\nSPOTIFY_REFRESH_TOKEN=' + data.refresh_token + '\n');
  }
  server.close();
});

server.listen(PORT, '127.0.0.1', () => {
  console.log('Open this link, log in to Spotify and approve:\n\n' + authUrl + '\n');
});
