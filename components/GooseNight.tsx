import React, { useEffect, useRef } from 'react';
import { ready } from '../boot';

/**
 * Night's painting: one goose, swimming, in the bottom-left corner of the
 * screen. The flock flies across the top of the page by day (GeeseSky); by
 * night the page is water and this one settles on it.
 *
 * The image is the painting lifted off its paper (scripts/goose-night.mjs):
 * the goose stays opaque, the washes around it fade to a pale mist, and they
 * thin out to nothing along a ragged edge well before the top, right and
 * bottom of the picture, so no box edge shows. The left runs off the screen.
 *
 * Sizing follows the gutter beside the 46rem column: on a wide screen the goose
 * fills it, its tail tucking just under the edge of the text. A touch fainter
 * than the flock (0.38), it stays well back in the page; narrower, it sits under more of the
 * text, so it ghosts down further until the lightest part (the chest) still
 * leaves body text >= 4.5:1.
 *
 * Motion is the flock's, at the flock's size, so day and night feel the same.
 * Three nested layers, one motion each so nothing fights over a transform: the
 * outer one leans faintly away from the cursor and, mirroring the flock (which
 * hangs back and drifts down as you scroll), rises off the bottom of the
 * screen as you scroll (eased in JS); then a slow rise and fall; then an even
 * slower few-px sway with a breath of tilt, pivoting at the waterline so it
 * rocks like something afloat. The idle motions are WAAPI transforms on the
 * compositor. It blooms in once, the first time it's shown.
 */

// The flock's numbers (GeeseSky), with its scroll drift pointed up
const CURSOR_REACH = 5;
const SCROLL_RISE = 0.15; // fraction of the scroll the goose rises by
const SCROLL_RISE_MAX = 150;
const EASE = 0.025; // per-frame catch-up toward the parallax target, slow and floaty

let bloomed = false; // once per page load, like the flock

const GooseNight: React.FC = () => {
  const paintRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const swayRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Idle float + parallax.
  useEffect(() => {
    if (reduce) return;

    const sine = 'cubic-bezier(0.37, 0, 0.63, 1)';
    const bob = bobRef.current?.animate(
      [{ transform: 'translateY(-4px)' }, { transform: 'translateY(4px)' }],
      { duration: 8300, iterations: Infinity, direction: 'alternate', easing: sine }
    );
    const sway = swayRef.current?.animate(
      [
        { transform: 'translateX(-3px) rotate(-0.25deg)' },
        { transform: 'translateX(3px) rotate(0.2deg)' },
      ],
      { duration: 19700, iterations: Infinity, direction: 'alternate', easing: sine }
    );

    const hover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const target = { x: 0, y: 0 };
    const cur = { x: 0, y: 0 };
    let raf = 0;

    const step = () => {
      cur.x += (target.x - cur.x) * EASE;
      cur.y += (target.y - cur.y) * EASE;
      const el = parallaxRef.current;
      if (el) el.style.transform = `translate3d(${cur.x.toFixed(2)}px, ${cur.y.toFixed(2)}px, 0)`;
      // Settled: park the loop until the next scroll / pointer move
      raf =
        Math.abs(target.x - cur.x) > 0.05 || Math.abs(target.y - cur.y) > 0.05
          ? requestAnimationFrame(step)
          : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    // Kept apart so a pointer move never has to re-read the scroll position
    let rise = 0;
    const pointer = { x: 0, y: 0 };
    const retarget = () => {
      target.x = pointer.x;
      target.y = pointer.y - rise;
      kick();
    };
    const onScroll = () => {
      rise = Math.min(Math.max(window.scrollY, 0) * SCROLL_RISE, SCROLL_RISE_MAX);
      retarget();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      // Drift a little against the cursor, as distant things do
      pointer.x = -((e.clientX / window.innerWidth) * 2 - 1) * CURSOR_REACH;
      pointer.y = -((e.clientY / window.innerHeight) * 2 - 1) * CURSOR_REACH * 0.6;
      retarget();
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    if (hover) window.addEventListener('pointermove', onPointer, { passive: true });
    return () => {
      bob?.cancel();
      sway?.cancel();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduce]);

  // The wash spreads out from the goose as the blur dries, like the flock's
  const bloom = () => {
    const el = paintRef.current;
    if (!el || bloomed) return;
    bloomed = true;
    const settle = () => {
      el.style.opacity = '1';
    };
    if (reduce) {
      el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1400, delay: 150, easing: 'ease-out', fill: 'both' })
        .finished.then(settle, () => {});
      return;
    }
    let spreads = false;
    try {
      CSS.registerProperty({ name: '--wash', syntax: '<percentage>', inherits: false, initialValue: '0%' });
      spreads = true;
    } catch {
      // Already registered by the flock (or HMR) still works
      spreads = CSS.supports('mask-image', 'radial-gradient(black, transparent)');
    }
    if (spreads) {
      const mask = 'radial-gradient(circle at 42% 36%, #000 calc(var(--wash) - 22%), transparent var(--wash))';
      el.style.setProperty('mask-image', mask);
      el.style.setProperty('-webkit-mask-image', mask);
      el.animate([{ '--wash': '0%' }, { '--wash': '150%' }] as Keyframe[], {
        duration: 3000,
        delay: 250,
        easing: 'cubic-bezier(0.25, 0.6, 0.3, 1)',
        fill: 'both',
      }).finished.then(() => {
        el.style.removeProperty('mask-image');
        el.style.removeProperty('-webkit-mask-image');
      }, () => {});
    }
    el.animate(
      [
        { opacity: 0, filter: 'blur(9px)', transform: 'scale(1.035)' },
        { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' },
      ],
      { duration: 2600, delay: 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
    ).finished.then(settle, () => {});
  };

  const tryBloom = () => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) ready.then(bloom);
  };

  useEffect(tryBloom, []);

  return (
    // ~1.2x the gutter-fitting size it started at, shifted a little further off
    // the left edge (the beak still clears it) so the tail only just tucks
    // under the text
    <div
      aria-hidden="true"
      className="pointer-events-none fixed bottom-[-12px] left-0 w-[clamp(280px,calc((100vw-46rem)*0.66+2.64rem),720px)] -translate-x-[6%] select-none opacity-[0.16] lg:opacity-[0.25] xl:opacity-[0.34] print:hidden"
    >
      <div ref={parallaxRef} className="will-change-transform">
        <div ref={bobRef}>
          <div ref={swayRef} className="origin-[50%_53%]">
            <div ref={paintRef} style={{ opacity: bloomed ? 1 : 0 }}>
              <img
                ref={imgRef}
                src="/goose-night.webp"
                alt=""
                width={750}
                height={749}
                draggable={false}
                decoding="async"
                onLoad={tryBloom}
                className="block h-auto w-full"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GooseNight;
