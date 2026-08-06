import React, { useEffect, useRef, useState } from 'react';

/**
 * The site's thesis, live: a small amber dot chasing the cursor under real PD
 * control. The cursor is the setpoint, the dot is the plant — deliberately
 * underdamped, so it overshoots and settles instead of gliding. "Always
 * self-adjusting to the targeted goal."
 *
 * Skipped on touch input and under reduced motion (both tracked live, not
 * just at mount). The rAF loop parks itself once the dot settles, so an idle
 * page does no per-frame work.
 */
const KP = 0.045; // proportional gain (per frame²) — pull toward the cursor
const KD = 0.22; // derivative gain — damping; < critical, so it overshoots

const LoopCursor: React.FC = () => {
  const dotRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  // Live gates: mouse-precision pointer and no reduced-motion preference.
  useEffect(() => {
    const fine = window.matchMedia('(pointer: fine)');
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setActive(fine.matches && !reduce.matches);
    update();
    fine.addEventListener('change', update);
    reduce.addEventListener('change', update);
    return () => {
      fine.removeEventListener('change', update);
      reduce.removeEventListener('change', update);
    };
  }, []);

  useEffect(() => {
    if (!active) return;
    const dot = dotRef.current;
    if (!dot) return;

    let tx = 0, ty = 0; // setpoint (cursor)
    let x = 0, y = 0, vx = 0, vy = 0;
    let seen = false;
    let running = false;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      // normalize to 60fps frames so behavior is rate-independent
      const dt = Math.min((now - last) / 16.67, 3);
      last = now;
      // settled on the setpoint → snap, park the loop, stop burning frames
      if (Math.abs(tx - x) < 0.1 && Math.abs(ty - y) < 0.1 && Math.abs(vx) < 0.01 && Math.abs(vy) < 0.01) {
        x = tx;
        y = ty;
        vx = 0;
        vy = 0;
        dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        running = false;
        return;
      }
      const ax = KP * (tx - x) - KD * vx;
      const ay = KP * (ty - y) - KD * vy;
      vx += ax * dt;
      vy += ay * dt;
      x += vx * dt;
      y += vy * dt;
      dot.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: PointerEvent) => {
      // On hybrid touchscreen laptops a finger must not become the setpoint
      if (e.pointerType === 'touch') return;
      tx = e.clientX;
      ty = e.clientY;
      if (!seen) {
        seen = true;
        x = tx;
        y = ty;
        dot.style.opacity = '1';
      }
      start();
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      dot.style.opacity = '0';
    };
  }, [active]);

  return (
    <div
      ref={dotRef}
      aria-hidden="true"
      className="fixed left-0 top-0 z-[90] pointer-events-none opacity-0 transition-opacity duration-700"
      style={{ willChange: 'transform' }}
    >
      <div className="w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/80" />
    </div>
  );
};

export default LoopCursor;
