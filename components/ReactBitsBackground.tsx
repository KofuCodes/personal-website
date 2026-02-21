import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'polaroid' | 'camera';
  baseX: number;
  baseY: number;
}

const ReactBitsBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const particles: Particle[] = [];
    const particleCount = 18;
    const types: Array<'polaroid' | 'camera'> = ['polaroid', 'camera'];

    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x, y,
        baseX: x,
        baseY: y,
        size: Math.random() * 35 + 25,
        speedX: (Math.random() - 0.5) * 0.25,
        speedY: (Math.random() - 0.5) * 0.25,
        opacity: Math.random() * 0.07 + 0.02,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.25,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    const isDark = () => document.documentElement.classList.contains('dark');

    const drawPolaroid = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      const color = isDark() ? '#a1785d' : '#8B7355';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      const w = size * 0.75;
      const h = size;

      // White polaroid body
      ctx.fillStyle = isDark() ? 'rgba(245,245,220,0.06)' : 'rgba(255,255,255,0.5)';
      ctx.fillRect(-w / 2, -h / 2, w, h);
      ctx.strokeRect(-w / 2, -h / 2, w, h);

      // Photo area
      const photoH = h * 0.68;
      ctx.strokeStyle = isDark() ? 'rgba(161,120,93,0.5)' : 'rgba(139,115,85,0.4)';
      ctx.strokeRect(-w / 2 + 3, -h / 2 + 3, w - 6, photoH - 3);

      // Label area lines (handwritten caption simulation)
      ctx.strokeStyle = isDark() ? 'rgba(161,120,93,0.25)' : 'rgba(139,115,85,0.2)';
      ctx.lineWidth = 0.8;
      const labelY = -h / 2 + photoH + 4;
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 6, labelY + 8);
      ctx.lineTo(w / 2 - 6, labelY + 8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(-w / 2 + 6, labelY + 14);
      ctx.lineTo(w / 2 - 14, labelY + 14);
      ctx.stroke();

      ctx.restore();
    };

    const drawCamera = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      const color = isDark() ? 'rgba(161,120,93,0.8)' : 'rgba(139,115,85,0.7)';
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;

      const w = size;
      const h = size * 0.65;

      // Body
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.stroke();

      // Lens
      ctx.beginPath();
      ctx.arc(0, h * 0.05, size * 0.18, 0, Math.PI * 2);
      ctx.stroke();

      // Inner lens ring
      ctx.beginPath();
      ctx.arc(0, h * 0.05, size * 0.09, 0, Math.PI * 2);
      ctx.stroke();

      // Viewfinder bump on top
      ctx.strokeRect(-w * 0.15, -h / 2 - 4, w * 0.3, 4);

      // Flash
      ctx.fillStyle = color;
      ctx.fillRect(-w / 2 + 5, -h / 2 + 5, 8, 5);

      ctx.restore();
    };

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        particle.baseX += particle.speedX;
        particle.baseY += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        if (particle.baseX < -100) particle.baseX = canvas.width + 100;
        if (particle.baseX > canvas.width + 100) particle.baseX = -100;
        if (particle.baseY < -100) particle.baseY = canvas.height + 100;
        if (particle.baseY > canvas.height + 100) particle.baseY = -100;

        const dx = particle.baseX - mouse.x;
        const dy = particle.baseY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 180;

        if (distance < maxDistance && distance > 0) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.x = particle.baseX + Math.cos(angle) * force * 45;
          particle.y = particle.baseY + Math.sin(angle) * force * 45;
        } else {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        }

        if (particle.type === 'polaroid') {
          drawPolaroid(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
        } else {
          drawCamera(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
        }
      });

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
};

export default ReactBitsBackground;
