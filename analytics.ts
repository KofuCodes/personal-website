/**
 * Vercel Web Analytics: visitors and page views, in the project's Analytics
 * tab on vercel.com. Production only — Vercel serves the script from the
 * deployment itself, so it doesn't exist on the dev server.
 *
 * The site routes by hash (#/projects), and the tracker ignores hash-only
 * changes, so it loads with auto-tracking off and every route reports itself
 * as a path instead (see TrackPageviews in App.tsx).
 */
declare global {
  interface Window {
    va?: (...args: unknown[]) => void;
    vaq?: unknown[][];
  }
}

const enabled = import.meta.env.PROD;

if (enabled) {
  // Calls made before the script lands queue up, and it replays them on load
  window.va ||= (...args) => {
    (window.vaq ||= []).push(args);
  };
  const script = document.createElement('script');
  script.src = '/_vercel/insights/script.js';
  script.defer = true;
  script.dataset.disableAutoTrack = '1';
  document.head.appendChild(script);
}

export const trackPageview = (path: string) => {
  if (enabled) window.va?.('pageview', { route: path, path });
};
