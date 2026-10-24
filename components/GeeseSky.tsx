import React, { useEffect, useRef } from 'react';

/**
 * The flock: the watercolor geese gliding across the paper behind the page.
 *
 * Only slow, soft motion — nothing that darts or reverses visibly. Three nested
 * layers, each owning one motion so nothing fights over a transform: the outer
 * one hangs back on scroll and leans faintly away from the cursor (eased in
 * JS), then a slow rise-and-fall, then an even slower few-pixel sway with a
 * breath of pitch. The idle motions are WAAPI transforms on the compositor.
 *
 * On first load the painting "blooms" in like a fresh wash settling into wet
 * paper: it spreads out from the lead goose while the blur dries off.
 *
 * It's big, so it rides at the top of the page behind the header and scrolls
 * away rather than sitting behind body text all the way down. It scrolls a
 * little slower than the page, so it still reads as far off.
 */

// Parallax reach, in px. Small on purpose: the flock should feel far away.
const CURSOR_REACH = 5;
const SCROLL_LAG = 0.15; // fraction of the scroll the flock hangs back by
const SCROLL_LAG_MAX = 150;
const EASE = 0.025; // per-frame catch-up toward the parallax target — slow and floaty

let bloomed = false; // once per page load, not per remount

const GeeseSky: React.FC = () => {
  const paintRef = useRef<HTMLDivElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const bobRef = useRef<HTMLDivElement>(null);
  const driftRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Idle glide + parallax.
  useEffect(() => {
    if (reduce) return;

    // Long, non-multiple periods with sine easing: the turnarounds are too slow
    // to read as a bounce, and the loop never visibly repeats.
    const bob = bobRef.current?.animate(
      [{ transform: 'translateY(-4px)' }, { transform: 'translateY(4px)' }],
      { duration: 8300, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.37, 0, 0.63, 1)' }
    );
    const drift = driftRef.current?.animate(
      [
        { transform: 'translateX(-3px) rotate(-0.25deg)' },
        { transform: 'translateX(3px) rotate(0.2deg)' },
      ],
      { duration: 19700, iterations: Infinity, direction: 'alternate', easing: 'cubic-bezier(0.37, 0, 0.63, 1)' }
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
      // Settled: park the loop until the next scroll / pointer move.
      raf =
        Math.abs(target.x - cur.x) > 0.05 || Math.abs(target.y - cur.y) > 0.05
          ? requestAnimationFrame(step)
          : 0;
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(step);
    };

    // The two parallax sources are kept apart so a pointer move never has to
    // re-read the scroll position.
    let scrollY = 0;
    const pointer = { x: 0, y: 0 };
    const retarget = () => {
      target.x = pointer.x;
      target.y = scrollY + pointer.y;
      kick();
    };
    const onScroll = () => {
      scrollY = Math.min(Math.max(window.scrollY, 0) * SCROLL_LAG, SCROLL_LAG_MAX);
      retarget();
    };
    const onPointer = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse' && e.pointerType !== 'pen') return;
      // Drift a little against the cursor, as distant things do.
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
      drift?.cancel();
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reduce]);

  // First paint: the wash spreads out from the lead goose as the blur dries.
  const bloom = () => {
    const el = paintRef.current;
    if (!el || bloomed) return;
    bloomed = true;
    if (reduce) {
      el.style.opacity = '1';
      return;
    }
    let spreads = false;
    try {
      // Registering the property is what makes the mask radius animatable.
      CSS.registerProperty({ name: '--wash', syntax: '<percentage>', inherits: false, initialValue: '0%' });
      spreads = true;
    } catch {
      // Already registered (HMR) works too; unsupported falls back to a plain fade.
      spreads = CSS.supports('mask-image', 'radial-gradient(black, transparent)');
    }
    if (spreads) {
      const mask = 'radial-gradient(circle at 92% 42%, #000 calc(var(--wash) - 22%), transparent var(--wash))';
      el.style.setProperty('mask-image', mask);
      el.style.setProperty('-webkit-mask-image', mask);
      el.animate([{ '--wash': '0%' }, { '--wash': '160%' }] as Keyframe[], {
        duration: 3200,
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
        { opacity: 0, filter: 'blur(9px) saturate(1.5)', transform: 'scale(1.035)' },
        { opacity: 1, filter: 'blur(0px) saturate(1)', transform: 'scale(1)' },
      ],
      { duration: 2600, delay: 250, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' }
    ).finished.then(() => {
      el.style.opacity = '1';
    }, () => {});
  };

  // Bloom once the painting is decoded — from onLoad, or straight away if it
  // was already cached when we mounted.
  const tryBloom = () => {
    const img = imgRef.current;
    if (img?.complete && img.naturalWidth) bloom();
  };

  useEffect(tryBloom, []);

  return (
    // Upper right, across the header. The image carries its own clear margin
    // and feathered edges, so no box edge shows at any size. The opacity is the
    // highest that keeps the bio (ink-600) >= 4.5:1 over the darkest wing — the
    // image's darks are pre-softened to make that possible.
    <div
      aria-hidden="true"
      className="pointer-events-none absolute right-0 top-[clamp(20px,5vh,72px)] w-[clamp(300px,64vw,840px)] select-none opacity-[0.38] print:hidden"
    >
      <div ref={parallaxRef} className="h-full w-full will-change-transform">
        <div ref={bobRef} className="h-full w-full">
          <div ref={driftRef} className="h-full w-full">
            <div ref={paintRef} className="h-full w-full" style={{ opacity: bloomed ? 1 : 0 }}>
              <img
                ref={imgRef}
                src="/geese.webp"
                alt=""
                width={1080}
                height={610}
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

export default GeeseSky;
