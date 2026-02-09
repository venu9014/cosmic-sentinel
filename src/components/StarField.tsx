import { useEffect, useRef, useCallback } from 'react';

interface Star {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
  layer: number;
}

interface ShootingStar {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  opacity: number;
  active: boolean;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  color: string;
  opacity: number;
  pulsePhase: number;
  pulseSpeed: number;
}

export function StarField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const handleMouseMove = useCallback((e: MouseEvent) => {
    mouseRef.current = {
      x: (e.clientX / window.innerWidth - 0.5) * 20,
      y: (e.clientY / window.innerHeight - 0.5) * 20,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);

    // Star colors for variety
    const starColors = [
      '255, 255, 255',     // White
      '200, 220, 255',     // Blue-white
      '255, 240, 220',     // Warm white
      '180, 200, 255',     // Light blue
      '255, 200, 150',     // Orange tint
    ];

    // Create stars with layers for parallax
    const stars: Star[] = [];
    const starCount = 300;

    for (let i = 0; i < starCount; i++) {
      const layer = Math.floor(Math.random() * 3); // 0 = far, 1 = mid, 2 = near
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: layer === 0 ? Math.random() * 1 + 0.3 : layer === 1 ? Math.random() * 1.5 + 0.5 : Math.random() * 2.5 + 1,
        speed: layer === 0 ? 0.05 : layer === 1 ? 0.15 : 0.3,
        opacity: layer === 0 ? Math.random() * 0.3 + 0.2 : layer === 1 ? Math.random() * 0.4 + 0.3 : Math.random() * 0.5 + 0.4,
        twinkleSpeed: Math.random() * 0.03 + 0.01,
        twinklePhase: Math.random() * Math.PI * 2,
        color: starColors[Math.floor(Math.random() * starColors.length)],
        layer,
      });
    }

    // Shooting stars
    const shootingStars: ShootingStar[] = [];
    const maxShootingStars = 3;

    const createShootingStar = (): ShootingStar => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height * 0.5,
      length: Math.random() * 80 + 40,
      speed: Math.random() * 15 + 10,
      angle: Math.PI / 4 + (Math.random() - 0.5) * 0.3,
      opacity: 1,
      active: true,
    });

    // Nebula clouds
    const nebulae: Nebula[] = [
      {
        x: canvas.width * 0.2,
        y: canvas.height * 0.3,
        radius: 200,
        color: '139, 92, 246', // Purple
        opacity: 0.03,
        pulsePhase: 0,
        pulseSpeed: 0.005,
      },
      {
        x: canvas.width * 0.8,
        y: canvas.height * 0.7,
        radius: 180,
        color: '6, 182, 212', // Cyan
        opacity: 0.025,
        pulsePhase: Math.PI,
        pulseSpeed: 0.007,
      },
      {
        x: canvas.width * 0.5,
        y: canvas.height * 0.5,
        radius: 250,
        color: '236, 72, 153', // Pink
        opacity: 0.02,
        pulsePhase: Math.PI / 2,
        pulseSpeed: 0.004,
      },
    ];

    let animationId: number;
    let frameCount = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      frameCount++;

      const parallaxX = mouseRef.current.x;
      const parallaxY = mouseRef.current.y;

      // Draw nebulae first (background)
      nebulae.forEach(nebula => {
        nebula.pulsePhase += nebula.pulseSpeed;
        const pulse = Math.sin(nebula.pulsePhase) * 0.3 + 0.7;
        
        const gradient = ctx.createRadialGradient(
          nebula.x, nebula.y, 0,
          nebula.x, nebula.y, nebula.radius
        );
        gradient.addColorStop(0, `rgba(${nebula.color}, ${nebula.opacity * pulse})`);
        gradient.addColorStop(0.5, `rgba(${nebula.color}, ${nebula.opacity * pulse * 0.5})`);
        gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
        
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      });

      // Draw stars with parallax
      stars.forEach(star => {
        star.twinklePhase += star.twinkleSpeed;
        const twinkle = Math.sin(star.twinklePhase) * 0.3 + 0.7;
        
        // Apply parallax based on layer
        const parallaxFactor = star.layer === 0 ? 0.2 : star.layer === 1 ? 0.5 : 1;
        const offsetX = parallaxX * parallaxFactor;
        const offsetY = parallaxY * parallaxFactor;
        
        const drawX = star.x + offsetX;
        const drawY = star.y + offsetY;

        // Main star
        ctx.beginPath();
        ctx.arc(drawX, drawY, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${star.color}, ${star.opacity * twinkle})`;
        ctx.fill();

        // Glow effect for larger stars
        if (star.size > 1.5) {
          const glowGradient = ctx.createRadialGradient(
            drawX, drawY, 0,
            drawX, drawY, star.size * 4
          );
          glowGradient.addColorStop(0, `rgba(${star.color}, ${star.opacity * twinkle * 0.4})`);
          glowGradient.addColorStop(0.5, `rgba(${star.color}, ${star.opacity * twinkle * 0.1})`);
          glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
          
          ctx.beginPath();
          ctx.arc(drawX, drawY, star.size * 4, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }

        // Subtle star movement
        star.y += star.speed * 0.15;
        if (star.y > canvas.height + 10) {
          star.y = -10;
          star.x = Math.random() * canvas.width;
        }
      });

      // Spawn shooting stars randomly
      if (frameCount % 120 === 0 && shootingStars.length < maxShootingStars && Math.random() > 0.5) {
        shootingStars.push(createShootingStar());
      }

      // Draw shooting stars
      shootingStars.forEach((star, index) => {
        if (!star.active) return;

        // Calculate end point
        const endX = star.x + Math.cos(star.angle) * star.length;
        const endY = star.y + Math.sin(star.angle) * star.length;

        // Draw trail gradient
        const gradient = ctx.createLinearGradient(star.x, star.y, endX, endY);
        gradient.addColorStop(0, `rgba(255, 255, 255, 0)`);
        gradient.addColorStop(0.3, `rgba(200, 220, 255, ${star.opacity * 0.5})`);
        gradient.addColorStop(1, `rgba(255, 255, 255, ${star.opacity})`);

        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(endX, endY);
        ctx.strokeStyle = gradient;
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.stroke();

        // Draw bright head
        ctx.beginPath();
        ctx.arc(endX, endY, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.opacity})`;
        ctx.fill();

        // Move shooting star
        star.x += Math.cos(star.angle) * star.speed;
        star.y += Math.sin(star.angle) * star.speed;
        star.opacity -= 0.008;

        // Remove if off screen or faded
        if (star.opacity <= 0 || star.x > canvas.width + 100 || star.y > canvas.height + 100) {
          shootingStars.splice(index, 1);
        }
      });

      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationId);
    };
  }, [handleMouseMove]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.8 }}
    />
  );
}
