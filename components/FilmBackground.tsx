import React, { useEffect, useRef } from 'react';

const FilmBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = { x: -2000, y: -2000 };
    let animId: number;
    let frame = 0;

    const GRAIN_FRAMES = 6;
    const SCALE = 5;
    const grainCanvases: HTMLCanvasElement[] = [];

    const buildGrainFrames = () => {
      grainCanvases.length = 0;
      const w = Math.floor(canvas.width / SCALE);
      const h = Math.floor(canvas.height / SCALE);
      const isDark = document.documentElement.classList.contains('dark');

      for (let f = 0; f < GRAIN_FRAMES; f++) {
        const tmp = document.createElement('canvas');
        tmp.width = w;
        tmp.height = h;
        const tctx = tmp.getContext('2d')!;
        const id = tctx.createImageData(w, h);
        const data = id.data;

        for (let i = 0; i < data.length; i += 4) {
          const grain = Math.random() * (isDark ? 70 : 60) - (isDark ? 35 : 30);
          if (isDark) {
            data[i]     = Math.max(0, Math.min(255, 20 + grain));
            data[i + 1] = Math.max(0, Math.min(255, 15 + grain * 0.75));
            data[i + 2] = Math.max(0, Math.min(255, 10 + grain * 0.5));
            data[i + 3] = 18;
          } else {
            data[i]     = Math.max(0, Math.min(255, 160 + grain));
            data[i + 1] = Math.max(0, Math.min(255, 135 + grain * 0.85));
            data[i + 2] = Math.max(0, Math.min(255, 105 + grain * 0.65));
            data[i + 3] = 22;
          }
        }
        tctx.putImageData(id, 0, 0);
        grainCanvases.push(tmp);
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      buildGrainFrames();
    };
    resize();
    window.addEventListener('resize', resize);

    const themeObserver = new MutationObserver(() => buildGrainFrames());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    let grainOffset = 0;

    const draw = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Cycle grain frames
      if (frame % 2 === 0) {
        grainOffset = (grainOffset + 1) % GRAIN_FRAMES;
      }
      if (grainCanvases.length > 0) {
        ctx.save();
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(grainCanvases[grainOffset], 0, 0, w, h);
        ctx.restore();
      }

      // Mouse warm lens glow
      if (mouse.x > -1900) {
        const isDark = document.documentElement.classList.contains('dark');
        const glowA1 = isDark ? 0.08 : 0.11;
        const glowA2 = isDark ? 0.04 : 0.06;
        const hotA   = isDark ? 0.06 : 0.09;

        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 300);
        glow.addColorStop(0,   `rgba(255, 210, 140, ${glowA1})`);
        glow.addColorStop(0.35, `rgba(220, 170, 90, ${glowA2})`);
        glow.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        const hotspot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 60);
        hotspot.addColorStop(0, `rgba(255, 240, 200, ${hotA})`);
        hotspot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = hotspot;
        ctx.fillRect(0, 0, w, h);
      }

      animId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      themeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
};

export default FilmBackground;
