import React, { useEffect, useRef } from 'react';

/**
 * Reactive background: a faint sensor / PCB dot-grid that lights up around the
 * cursor — like a field of sensors responding to presence.
 */
const SensorField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext('2d')!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const GAP = 30;
    const RADIUS = 140;
    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let raf = 0;

    const mouse = { x: -9999, y: -9999 };
    const eased = { x: -9999, y: -9999 };

    const isDark = () => document.documentElement.classList.contains('dark');

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(W / GAP);
      rows = Math.ceil(H / GAP);
    };
    resize();
    window.addEventListener('resize', resize);

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseout', onLeave);

    const render = (interactive: boolean) => {
      const dark = isDark();
      const rgb = dark ? '255,255,255' : '20,20,20';
      const baseA = dark ? 0.05 : 0.045;
      const peakA = dark ? 0.45 : 0.4;

      if (interactive) {
        eased.x += (mouse.x - eased.x) * 0.12;
        eased.y += (mouse.y - eased.y) * 0.12;
      }
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i <= cols; i++) {
        for (let j = 0; j <= rows; j++) {
          const x = i * GAP;
          const y = j * GAP;
          let a = baseA;
          let s = 1.4;
          if (interactive) {
            const dist = Math.hypot(x - eased.x, y - eased.y);
            if (dist < RADIUS) {
              const t = 1 - dist / RADIUS;
              a += t * peakA;
              s += t * 2.0;
            }
          }
          ctx.fillStyle = `rgba(${rgb},${a})`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
        }
      }
    };

    const loop = () => {
      render(true);
      raf = requestAnimationFrame(loop);
    };

    if (reduce) {
      render(false);
      const observer = new MutationObserver(() => render(false));
      observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => {
        observer.disconnect();
        window.removeEventListener('resize', resize);
        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseout', onLeave);
      };
    }

    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseout', onLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
      aria-hidden="true"
    />
  );
};

export default SensorField;
