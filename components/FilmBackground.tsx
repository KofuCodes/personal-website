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

    // Pre-generate a few grain canvases to cycle through (performance)
    const GRAIN_FRAMES = 6;
    const SCALE = 5; // draw grain at 1/5 size, upscale for blocky look
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
          // Vary grain amount: dark gets more contrast grain, light gets subtle warm grain
          const grain = Math.random() * (isDark ? 80 : 70) - (isDark ? 40 : 35);
          if (isDark) {
            data[i]     = Math.max(0, Math.min(255, 20 + grain));
            data[i + 1] = Math.max(0, Math.min(255, 15 + grain * 0.75));
            data[i + 2] = Math.max(0, Math.min(255, 10 + grain * 0.5));
            data[i + 3] = 22;
          } else {
            // Light mode: warm brown grain visible against cream #f5e6d3
            data[i]     = Math.max(0, Math.min(255, 160 + grain));
            data[i + 1] = Math.max(0, Math.min(255, 135 + grain * 0.85));
            data[i + 2] = Math.max(0, Math.min(255, 105 + grain * 0.65));
            data[i + 3] = 28;
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

    // Rebuild grain when theme changes
    const themeObserver = new MutationObserver(() => buildGrainFrames());
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', onMouseMove);

    const NAVBAR_H = 80; // h-20 navbar
    const drawFilmEdges = () => {
      const isDark = document.documentElement.classList.contains('dark');
      if (!isDark) return; // light mode: no film strips

      const stripAlpha = 0.22;
      const holeAlpha  = 0.40;
      const topStripH  = 22;
      const botStripH  = 28;
      const holeW = 10;
      const holeH = 8;
      const spacing = 28;
      const topY = NAVBAR_H;

      // Strip bars
      ctx.fillStyle = `rgba(42, 35, 24, ${stripAlpha})`;
      ctx.fillRect(0, topY, canvas.width, topStripH);
      ctx.fillRect(0, canvas.height - botStripH, canvas.width, botStripH);

      const cols = Math.ceil(canvas.width / spacing) + 1;

      // Sprocket holes
      ctx.strokeStyle = `rgba(139, 115, 85, ${holeAlpha})`;
      ctx.lineWidth = 1;
      for (let i = 0; i < cols; i++) {
        const x = i * spacing + spacing / 2;
        ctx.beginPath();
        ctx.rect(x - holeW / 2, topY + 4, holeW, holeH);
        ctx.stroke();
        ctx.beginPath();
        ctx.rect(x - holeW / 2, canvas.height - botStripH + 5, holeW, holeH);
        ctx.stroke();
      }

      // Frame tick marks
      ctx.strokeStyle = `rgba(139, 115, 85, ${holeAlpha * 0.5})`;
      ctx.lineWidth = 0.5;
      for (let i = 0; i < cols; i++) {
        const x = i * spacing + spacing;
        ctx.beginPath();
        ctx.moveTo(x, topY);
        ctx.lineTo(x, topY + topStripH);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, canvas.height - botStripH);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
    };

    let grainOffset = 0;

    const draw = () => {
      frame++;
      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      // Cycle through pre-generated grain frames
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
        const glowA1 = isDark ? 0.09 : 0.13;
        const glowA2 = isDark ? 0.05 : 0.07;
        const hotA   = isDark ? 0.07 : 0.10;

        const glow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 320);
        glow.addColorStop(0,   `rgba(255, 210, 140, ${glowA1})`);
        glow.addColorStop(0.3, `rgba(220, 170, 90,  ${glowA2})`);
        glow.addColorStop(1,   'rgba(0, 0, 0, 0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, w, h);

        // Tight inner hotspot
        const hotspot = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 70);
        hotspot.addColorStop(0, `rgba(255, 240, 200, ${hotA})`);
        hotspot.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = hotspot;
        ctx.fillRect(0, 0, w, h);
      }

      // Film edge strips + sprockets
      drawFilmEdges();

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
