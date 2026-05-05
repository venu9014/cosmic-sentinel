import { useEffect, useRef } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  rotation: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  hue: number;
}

export function CursorStarTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animRef = useRef<number>(0);

  useEffect(() => {
    // Skip entirely on touch-only / coarse-pointer devices (phones, tablets)
    // and respect users who prefer reduced motion.
    const isFinePointer =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(pointer: fine)').matches;
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!isFinePointer || prefersReducedMotion) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const resize = () => {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let lastX = 0, lastY = 0;

    const spawn = (x: number, y: number) => {
      const dx = x - lastX;
      const dy = y - lastY;
      const speed = Math.sqrt(dx * dx + dy * dy);
      mouseRef.current = { x, y };

      const count = Math.min(Math.floor(speed / 4), 5);
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spread = Math.random() * 8;
        starsRef.current.push({
          x: x + Math.cos(angle) * spread,
          y: y + Math.sin(angle) * spread,
          size: Math.random() * 3 + 1.5,
          opacity: 1,
          rotation: Math.random() * Math.PI * 2,
          vx: (Math.random() - 0.5) * 2 - dx * 0.05,
          vy: (Math.random() - 0.5) * 2 - dy * 0.05 + 0.3,
          life: 0,
          maxLife: 30 + Math.random() * 30,
          hue: 200 + Math.random() * 60,
        });
      }

      lastX = x;
      lastY = y;
    };

    // Use Pointer Events so it works across mouse, pen, trackpad consistently.
    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') return; // skip touch devices
      spawn(e.clientX, e.clientY);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const drawStar = (ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rotation: number, opacity: number, hue: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = opacity;

      // Four-point star
      const outer = size;
      const inner = size * 0.35;
      ctx.beginPath();
      for (let i = 0; i < 8; i++) {
        const r = i % 2 === 0 ? outer : inner;
        const a = (i * Math.PI) / 4;
        if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
        else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
      }
      ctx.closePath();

      // Glow
      ctx.shadowBlur = size * 4;
      ctx.shadowColor = `hsla(${hue}, 80%, 70%, ${opacity})`;
      ctx.fillStyle = `hsla(${hue}, 90%, 85%, ${opacity})`;
      ctx.fill();

      ctx.restore();
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      starsRef.current = starsRef.current.filter(s => s.life < s.maxLife);

      for (const star of starsRef.current) {
        star.life++;
        star.x += star.vx;
        star.y += star.vy;
        star.vy += 0.02; // gravity
        star.rotation += 0.05;
        star.vx *= 0.98;
        star.vy *= 0.98;

        const progress = star.life / star.maxLife;
        const fade = progress < 0.1 ? progress / 0.1 : 1 - (progress - 0.1) / 0.9;
        star.opacity = fade;
        const currentSize = star.size * (1 - progress * 0.5);

        drawStar(ctx, star.x, star.y, currentSize, star.rotation, star.opacity, star.hue);
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-50 pointer-events-none"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}
