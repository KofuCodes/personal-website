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

export default defineConfig(({ mode }) => {
  // Expose .env.local to the dev API handlers (server side only — nothing here
  // is prefixed VITE_, so none of it reaches the browser bundle).
  Object.assign(process.env, loadEnv(mode, process.cwd(), ''));
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react(), devApi()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
  };
});
