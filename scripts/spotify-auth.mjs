// One-time helper: get a Spotify refresh token for /api/top-tracks and /api/now-playing.
// Re-run it whenever the scopes below change — an older token lacks the new permissions.
//
// 1. In the Spotify developer dashboard, open your app and add this Redirect URI:
//      http://127.0.0.1:8888/callback
// 2. Put the app's SPOTIFY_CLIENT_ID and SPOTIFY_CLIENT_SECRET in .env.local, then run
//    (works the same in PowerShell, cmd and bash):
//      node --env-file=.env.local scripts/spotify-auth.mjs
// 3. Approve in the browser tab it opens, and copy the refresh token it prints into
//    .env.local and your Vercel project's env vars as SPOTIFY_REFRESH_TOKEN.

import http from 'node:http';
import crypto from 'node:crypto';
import { spawn } from 'node:child_process';

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
    // top tracks (on repeat) · the current track · the last track played (now playing)
    scope: 'user-top-read user-read-currently-playing user-read-recently-played',
    redirect_uri: redirectUri,
    state,
    // Always show the consent screen, so the new permissions are approved explicitly
    show_dialog: 'true',
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

// Copying the link out of a terminal tends to break it: the window wraps it, and a pasted
// line break cuts the URL short (Spotify then reports "redirect_uri: Not present"). So open
// it directly — with no shell in between, the &s in the URL survive on every platform.
const openInBrowser = (url) => {
  const [cmd, args] =
    process.platform === 'win32'
      ? ['rundll32', ['url.dll,FileProtocolHandler', url]]
      : process.platform === 'darwin'
        ? ['open', [url]]
        : ['xdg-open', [url]];
  spawn(cmd, args, { stdio: 'ignore', detached: true }).on('error', () => {}).unref();
};

server.listen(PORT, '127.0.0.1', () => {
  console.log(
    'Opening Spotify in your browser — log in and approve.\n' +
      "If no tab opens, copy this link as ONE line (widen the window if it's wrapped):\n\n" +
      authUrl +
      '\n'
  );
  openInBrowser(authUrl);
});
