/**
 * First-load gate. Every `.reveal` entrance holds (invisible) while <html>
 * has `booting`, and lifts once the serif (upright and italic) is in — so the
 * fallback-to-webfont swap reflows text nobody can see yet, and the hero →
 * nav → page stagger plays from one clean start instead of in pieces.
 *
 * Capped, so a slow or blocked font CDN only costs a moment, never the page.
 */
const MAX_WAIT = 1200;

const root = document.documentElement;
root.classList.add('booting');

const fonts = Promise.all(
  ['400 1em Newsreader', '600 1em Newsreader', 'italic 400 1em Newsreader'].map((f) => document.fonts.load(f))
).catch(() => undefined);

export const ready: Promise<void> = Promise.race([
  fonts,
  new Promise((resolve) => setTimeout(resolve, MAX_WAIT)),
]).then(() => {
  root.classList.remove('booting');
});

/** True until the gate lifts — content arriving before then joins the reveal. */
export const isBooting = () => root.classList.contains('booting');
