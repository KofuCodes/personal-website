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
  type: 'polaroid' | 'camera' | 'film';
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

    // Mouse position tracking
    const mouse = { x: -1000, y: -1000 };
    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create particles
    const particles: Particle[] = [];
    const particleCount = 25;

    const types: Array<'polaroid' | 'camera' | 'film'> = ['polaroid', 'camera', 'film'];
    for (let i = 0; i < particleCount; i++) {
      const x = Math.random() * canvas.width;
      const y = Math.random() * canvas.height;
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        size: Math.random() * 40 + 30,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.08 + 0.03,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 0.3,
        type: types[Math.floor(Math.random() * types.length)],
      });
    }

    const isDark = () => document.documentElement.classList.contains('dark');
    
    // Draw Polaroid frame
    const drawPolaroid = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      const color = isDark() ? '#a1785d' : '#8B7355';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      // Polaroid frame
      const width = size * 0.8;
      const height = size;
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      
      // Image area (smaller rectangle inside)
      ctx.strokeRect(-width / 2 + 4, -height / 2 + 4, width - 8, height * 0.75 - 4);

      ctx.restore();
    };

    // Draw vintage camera
    const drawCamera = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      const color = isDark() ? '#a1785d' : '#8B7355';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      // Camera body
      ctx.strokeRect(-size / 2, -size / 3, size, size * 0.6);
      
      // Lens
      ctx.beginPath();
      ctx.arc(0, 0, size / 5, 0, 2 * Math.PI);
      ctx.stroke();
      
      // Viewfinder
      ctx.fillRect(-size / 3, -size / 2, size / 6, size / 8);

      ctx.restore();
    };

    // Draw film strip
    const drawFilm = (x: number, y: number, size: number, rotation: number, opacity: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.globalAlpha = opacity;

      const color = isDark() ? '#a1785d' : '#8B7355';
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;

      const width = size * 1.2;
      const height = size * 0.6;
      
      // Film strip outline
      ctx.strokeRect(-width / 2, -height / 2, width, height);
      
      // Sprocket holes
      for (let i = 0; i < 4; i++) {
        const xPos = -width / 2 + width / 5 + (i * width / 5);
        ctx.fillRect(xPos - 3, -height / 2 + 2, 6, 4);
        ctx.fillRect(xPos - 3, height / 2 - 6, 6, 4);
      }
      
      // Frames
      for (let i = 0; i < 3; i++) {
        const xPos = -width / 2 + width / 6 + (i * width / 3);
        ctx.strokeRect(xPos - width / 8, -height / 4, width / 4, height / 2);
      }

      ctx.restore();
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach((particle) => {
        // Update base position
        particle.baseX += particle.speedX;
        particle.baseY += particle.speedY;
        particle.rotation += particle.rotationSpeed;

        // Wrap around screen
        if (particle.baseX < -100) particle.baseX = canvas.width + 100;
        if (particle.baseX > canvas.width + 100) particle.baseX = -100;
        if (particle.baseY < -100) particle.baseY = canvas.height + 100;
        if (particle.baseY > canvas.height + 100) particle.baseY = -100;

        // Mouse interaction - repulsion effect
        const dx = particle.baseX - mouse.x;
        const dy = particle.baseY - mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance && distance > 0) {
          const force = (maxDistance - distance) / maxDistance;
          const angle = Math.atan2(dy, dx);
          particle.x = particle.baseX + Math.cos(angle) * force * 50;
          particle.y = particle.baseY + Math.sin(angle) * force * 50;
        } else {
          particle.x = particle.baseX;
          particle.y = particle.baseY;
        }

        // Draw particle based on type
        if (particle.type === 'polaroid') {
          drawPolaroid(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
        } else if (particle.type === 'camera') {
          drawCamera(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
        } else {
          drawFilm(particle.x, particle.y, particle.size, particle.rotation, particle.opacity);
        }
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 0.5 }}
    />
  );
};

export default ReactBitsBackground;
