import React, { Suspense, lazy, useEffect, useRef } from 'react';

// Heavy (three.js) — code-split so it doesn't block the initial page load.
const ClosedLoopControlTerrain = lazy(() => import('./ClosedLoopControlTerrain'));

const EXPAND_PX = 340; // scroll distance over which the stage opens fully
const START = 0.62; // stage size at the very top of the page

/** Final stage height — matches the `h-[clamp(280px,38vh,400px)]` it used to be. */
const fullHeight = () => Math.min(Math.max(280, window.innerHeight * 0.38), 400);

/**
 * The terrain masthead, opening on scroll: the stage starts at ~62% and grows
 * to full size over the first ~340px of scroll, dollying the camera in step so
 * the scene appears to grow with it.
 *
 * The canvas itself is pinned to the final size (see --stage-h in
 * ClosedLoopControlTerrain) and cropped by this box, so nothing resizes the
 * WebGL buffer while the user scrolls.
 */
const TerrainStage: React.FC = () => {
  const boxRef = useRef<HTMLDivElement>(null);
  const zoomRef = useRef(START);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;

    let full = fullHeight();
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    let raf = 0;
    // Only touch browsers have a collapsing URL bar. On desktop every resize is
    // real, and skipping one would strand `full` — apply() writes an inline
    // height, so no CSS path can correct it afterwards.
    const urlBarQuirk = window.matchMedia('(pointer: coarse)').matches;

    const apply = () => {
      raf = 0;
      const p = Math.min(1, Math.max(0, window.scrollY / EXPAND_PX));
      const zoom = START + (1 - START) * (1 - (1 - p) * (1 - p)); // easeOutQuad
      const h = full * zoom;
      box.style.height = `${h}px`;
      box.style.setProperty('--stage-h', `${full}px`);
      box.style.setProperty('--stage-offset', `${-(full - h) / 2}px`);
      zoomRef.current = zoom;
    };

    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const onResize = () => {
      // Ignore the mobile URL-bar collapse, which fires resize with a
      // height-only delta and would otherwise make the stage jump mid-scroll.
      const w = window.innerWidth;
      const h = window.innerHeight;
      if (w !== lastW || !urlBarQuirk || Math.abs(h - lastH) > 140) {
        lastW = w;
        lastH = h;
        full = fullHeight();
        apply();
      }
    };

    apply();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    // The class height is START × the full clamp, so there's no jump before
    // the effect takes over.
    <div ref={boxRef} className="w-full h-[clamp(174px,23.5vh,248px)]">
      <Suspense fallback={<div className="h-full w-full" />}>
        <ClosedLoopControlTerrain zoomRef={zoomRef} />
      </Suspense>
    </div>
  );
};

export default TerrainStage;
