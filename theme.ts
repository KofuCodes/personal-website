import { useSyncExternalStore } from 'react';
import { flushSync } from 'react-dom';

/**
 * Day and night. Every visit opens by day, whatever the system prefers or was
 * picked last time; the toggle switches to night for the rest of that visit
 * (nothing is saved).
 *
 * A switch runs inside a view transition, so the whole page dissolves from one
 * palette to the other instead of every colour snapping at once. React's half
 * (the toggle's icon, the day ⇄ night flock) is flushed inside the same
 * callback so it lands in the new snapshot too.
 */

export type Theme = 'light' | 'dark';

// Keep in step with --paper in index.css and the theme-color meta in index.html
const BG: Record<Theme, string> = { light: '#fbfaf6', dark: '#161616' };
// The painting each theme hangs, so a hover on the toggle can warm the cache
export const ART: Record<Theme, string> = { light: '/geese.webp', dark: '/geese-night.webp' };

const root = document.documentElement;
const listeners = new Set<() => void>();

export const getTheme = (): Theme => (root.classList.contains('dark') ? 'dark' : 'light');

const apply = (t: Theme) => {
  root.classList.toggle('dark', t === 'dark');
  root.style.colorScheme = t;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', BG[t]);
  flushSync(() => listeners.forEach((l) => l()));
};

export const setTheme = (t: Theme) => {
  if (t === getTheme()) return;
  if (!('startViewTransition' in document)) return apply(t);
  // A dissolve has no movement, so it stays under reduced motion too, like
  // the site's other fades
  root.classList.add('theme-fade');
  document
    .startViewTransition(() => apply(t))
    .finished.finally(() => root.classList.remove('theme-fade'));
};

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export const useTheme = (): Theme => useSyncExternalStore(subscribe, getTheme);

/** Fetch a painting ahead of a switch, so it can bloom straight away. */
const warmed = new Set<Theme>();
export const warm = (t: Theme) => {
  if (warmed.has(t)) return;
  warmed.add(t);
  new Image().src = ART[t];
};
