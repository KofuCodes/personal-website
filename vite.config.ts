import fs from 'fs';
import path from 'path';
import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Serve /api/<name> from api/<name>.ts during `npm run dev`, the way Vercel
 * does in production — with the small res.status().json() helpers its
 * handlers use. Secrets come from .env.local and stay on the dev server.
 */
const devApi = (): Plugin => ({
  name: 'dev-api',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      const name = req.url?.match(/^\/api\/([\w-]+)(?:[?#]|$)/)?.[1];
      const file = name && path.resolve(__dirname, 'api', `${name}.ts`);
      if (!file || !fs.existsSync(file)) return next();
      try {
        const { default: handler } = await server.ssrLoadModule(file);
        const vercelRes = Object.assign(res, {
          status(code: number) {
            res.statusCode = code;
            return vercelRes;
          },
          json(body: unknown) {
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(body));
            return vercelRes;
          },
        });
        await handler(req, vercelRes);
      } catch (error) {
        next(error);
      }
    });
  },
});

const TAGS = path.resolve(__dirname, 'data/photo-tags.json');

/** One photo per block, one tag per line, so edits diff cleanly. */
const formatTags = (all: Record<string, unknown[]>) =>
  `{\n${Object.keys(all)
    .sort()
    .map((url) => `  ${JSON.stringify(url)}: [\n${all[url].map((t) => `    ${JSON.stringify(t)}`).join(',\n')}\n  ]`)
    .join(',\n')}\n}\n`;

const percent = (v: unknown) => typeof v === 'number' && v >= 0 && v <= 100;

/**
 * Dev only: the gallery's tag editor (components/TagEditor.tsx) saves a
 * photo's tags here, into data/photo-tags.json. The dev server listens on the
 * network, so only requests from this machine may write.
 */
const tagEditor = (): Plugin => ({
  name: 'tag-editor',
  apply: 'serve',
  configureServer(server) {
    server.middlewares.use('/__tags', (req, res) => {
      const local = ['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress ?? '');
      if (req.method !== 'PUT' || !local) {
        res.statusCode = 403;
        return res.end();
      }
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', () => {
        try {
          const { url, tags } = JSON.parse(body);
          const valid =
            typeof url === 'string' &&
            url.startsWith('/photography/') &&
            Array.isArray(tags) &&
            tags.every(
              (t) =>
                typeof t.label === 'string' &&
                /^https?:\/\//.test(t.href) &&
                percent(t.x) &&
                percent(t.y) &&
                (t.face === undefined || percent(t.face))
            );
          if (!valid) throw new Error('bad tags');
          const all = JSON.parse(fs.readFileSync(TAGS, 'utf8'));
          if (tags.length) all[url] = tags.map(({ label, href, x, y, face }) => ({ label, href, x, y, face }));
          else delete all[url];
          fs.writeFileSync(TAGS, formatTags(all));
          res.end();
        } catch (error) {
          res.statusCode = 400;
          res.end(String(error));
        }
      });
    });
  },
  // The editor already shows its own changes; a hot update would remount the
  // gallery and close the photo mid-tagging.
  handleHotUpdate({ file }) {
    if (path.resolve(file) === TAGS) return [];
  },
});

export default defineConfig(({ mode }) => {
  // Expose .env.local to the dev API handlers (server side only — nothing here
  // is prefixed VITE_, so none of it reaches the browser bundle).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  // Without the Spotify secrets locally, borrow the live site's /api instead,
  // so `npm run dev` still shows the real on-repeat shelf.
  const hasSecrets = !!process.env.SPOTIFY_REFRESH_TOKEN;
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: hasSecrets ? undefined : { '/api': { target: 'https://www.ethantran.ca', changeOrigin: true } },
    },
    plugins: [react(), hasSecrets && devApi(), tagEditor()],
  };
});
