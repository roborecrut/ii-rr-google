import React, { useEffect, useRef } from 'react';

interface ReportParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  rotationSpeed: number;
  type: 'page' | 'check' | 'star' | 'dot';
  alpha: number;
  color: string;
}

interface ClickSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  angle: number;
  rotationSpeed: number;
  type: 'check' | 'star' | 'fragment';
  life: number;
  maxLife: number;
  color: string;
}

export default function InteractiveNetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, active: false });
  const scrollYRef = useRef(0);
  const particlesRef = useRef<ReportParticle[]>([]);
  const sparksRef = useRef<ClickSpark[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Initialize report-themed particles
    const initParticles = () => {
      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 18 : 45;
      const particles: ReportParticle[] = [];
      const colors = [
        'rgba(244, 238, 142, 0.22)', // amber-200 / gold
        'rgba(56, 189, 248, 0.18)',   // sky-400
        'rgba(52, 211, 153, 0.22)',   // emerald-400 / checkmarks
        'rgba(255, 255, 255, 0.15)',  // pure white
      ];

      const types: Array<'page' | 'check' | 'star' | 'dot'> = ['page', 'check', 'star', 'dot', 'page', 'check'];

      for (let i = 0; i < count; i++) {
        const type = types[i % types.length];
        const size = type === 'page' ? Math.random() * 14 + 12 : type === 'dot' ? Math.random() * 2 + 1 : Math.random() * 8 + 6;
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25 - 0.08, // slight upward drift like pages floating
          size,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.015,
          type,
          alpha: Math.random() * 0.4 + 0.2,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      particlesRef.current = particles;
    };

    initParticles();

    // Resize handler
    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Listeners
    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseRef.current.x = e.touches[0].clientX;
        mouseRef.current.y = e.touches[0].clientY;
        mouseRef.current.active = true;
      }
    };

    const handleTouchEnd = () => {
      mouseRef.current.active = false;
    };

    const handleScroll = () => {
      scrollYRef.current = window.scrollY;
    };

    // Burst visual sparks on click or touch (creative checks/stars erupting)
    const triggerClickSparks = (clientX: number, clientY: number) => {
      const sparks: ClickSpark[] = [];
      const sparkCount = 18;
      const sparkTypes: Array<'check' | 'star' | 'fragment'> = ['check', 'star', 'fragment'];
      const colors = [
        '#F4EE8E', // Gold
        '#34D399', // Emerald
        '#38BDF8', // Sky Blue
        '#FFFFFF'  // White
      ];

      for (let i = 0; i < sparkCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 3.5 + 1.2;
        sparks.push({
          x: clientX,
          y: clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5, // fly outwards and slightly upwards
          size: Math.random() * 8 + 6,
          angle: Math.random() * Math.PI * 2,
          rotationSpeed: (Math.random() - 0.5) * 0.1,
          type: sparkTypes[i % sparkTypes.length],
          life: 0,
          maxLife: Math.random() * 25 + 25,
          color: colors[Math.floor(Math.random() * colors.length)],
        });
      }
      sparksRef.current = [...sparksRef.current, ...sparks].slice(-120);
    };

    const handleClick = (e: MouseEvent) => {
      // Prevent spark burst if clicking on buttons or inputs directly to avoid clutter
      const target = e.target as HTMLElement;
      if (target?.closest('button') || target?.closest('input') || target?.closest('select') || target?.closest('textarea')) {
        return;
      }
      triggerClickSparks(e.clientX, e.clientY);
    };

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        const target = e.target as HTMLElement;
        if (target?.closest('button') || target?.closest('input') || target?.closest('select') || target?.closest('textarea')) {
          return;
        }
        triggerClickSparks(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('click', handleClick);
    window.addEventListener('touchstart', handleTouchStart);

    // Helper functions for drawing custom shapes
    const drawPage = (c: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, alpha: number, color: string) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.strokeStyle = color;
      c.fillStyle = color.replace(/[\d.]+\)$/, '0.02)'); // extremely subtle background fill
      c.lineWidth = 1;

      const w = size;
      const h = size * 1.35;
      const r = 2; // small corner roundness

      // Path of page outline with small dog-ear top-right corner
      c.beginPath();
      c.moveTo(-w / 2, -h / 2 + r);
      c.lineTo(w / 2 - 4, -h / 2);
      c.lineTo(w / 2, -h / 2 + 4); // Fold corner
      c.lineTo(w / 2, h / 2 - r);
      c.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
      c.lineTo(-w / 2 + r, h / 2);
      c.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
      c.lineTo(-w / 2, -h / 2 + r);
      c.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
      c.closePath();
      c.fill();
      c.stroke();

      // Fold/dog-ear flap line
      c.beginPath();
      c.moveTo(w / 2 - 4, -h / 2);
      c.lineTo(w / 2 - 4, -h / 2 + 4);
      c.lineTo(w / 2, -h / 2 + 4);
      c.stroke();

      // Horizontal lines (representing document text blocks)
      const lineYStart = -h / 2 + 8;
      const lineSpacing = 3.5;
      c.lineWidth = 0.8;
      c.strokeStyle = color.replace(/[\d.]+\)$/, '0.12)'); // softer for text lines
      for (let i = 0; i < 3; i++) {
        const lineY = lineYStart + i * lineSpacing;
        const lineLength = i === 1 ? w * 0.65 : w * 0.45;
        c.beginPath();
        c.moveTo(-w / 2 + 3, lineY);
        c.lineTo(-w / 2 + 3 + lineLength, lineY);
        c.stroke();
      }

      c.restore();
    };

    const drawCheckmark = (c: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color: string) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.strokeStyle = color;
      c.lineWidth = 1.2;
      c.beginPath();
      // Draw a neat checkmark
      c.moveTo(-size * 0.4, 0);
      c.lineTo(-size * 0.1, size * 0.3);
      c.lineTo(size * 0.4, -size * 0.4);
      c.stroke();
      c.restore();
    };

    const drawStarShape = (c: CanvasRenderingContext2D, x: number, y: number, size: number, angle: number, color: string) => {
      c.save();
      c.translate(x, y);
      c.rotate(angle);
      c.fillStyle = color;
      c.beginPath();
      // Draw 4-pointed sparkle star for ultra-modern report style
      for (let i = 0; i < 4; i++) {
        c.rotate(Math.PI / 2);
        c.lineTo(0, size * 0.5);
        c.lineTo(size * 0.15, 0);
      }
      c.closePath();
      c.fill();
      c.restore();
    };

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const sparks = sparksRef.current;
      const mouse = mouseRef.current;
      const parallaxOffset = scrollYRef.current * 0.12;

      // 1. Draw and update report particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Update physics
        p.x += p.vx;
        p.y += p.vy;
        p.angle += p.rotationSpeed;

        // Wrap around margins
        if (p.x < -30) p.x = width + 30;
        if (p.x > width + 30) p.x = -30;
        if (p.y < -30) p.y = height + 30;
        if (p.y > height + 30) p.y = -30;

        const renderedY = (p.y - parallaxOffset + height + 50) % (height + 100) - 50;

        // Interact with cursor (gently float away from cursor)
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - renderedY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 150) {
            const force = (150 - dist) * 0.00008;
            p.vx -= dx * force;
            p.vy -= dy * force;
          }
        }

        // Limit speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > 0.6) {
          p.vx = (p.vx / speed) * 0.6;
          p.vy = (p.vy / speed) * 0.6;
        }

        // Render shapes
        if (p.type === 'page') {
          drawPage(ctx, p.x, renderedY, p.size, p.angle, p.alpha, p.color);
        } else if (p.type === 'check') {
          drawCheckmark(ctx, p.x, renderedY, p.size, p.angle, p.color);
        } else if (p.type === 'star') {
          drawStarShape(ctx, p.x, renderedY, p.size, p.angle, p.color);
        } else {
          // Subtle dot connection line
          ctx.beginPath();
          ctx.arc(p.x, renderedY, p.size, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.fill();
        }
      }

      // 2. Draw and update click sparks
      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.04; // gravity feel for sparks
        s.angle += s.rotationSpeed;
        s.vx *= 0.97;
        s.vy *= 0.97;
        s.life++;

        if (s.life >= s.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        const lifeRatio = 1 - s.life / s.maxLife;

        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = s.color;
        
        const alphaColor = s.color === '#FFFFFF' ? `rgba(255,255,255,${lifeRatio * 0.85})` : s.color === '#F4EE8E' ? `rgba(244,238,142,${lifeRatio * 0.95})` : s.color === '#34D399' ? `rgba(52,211,153,${lifeRatio * 0.9})` : `rgba(56,189,248,${lifeRatio * 0.85})`;

        if (s.type === 'check') {
          drawCheckmark(ctx, s.x, s.y, s.size * (0.5 + lifeRatio * 0.75), s.angle, alphaColor);
        } else if (s.type === 'star') {
          drawStarShape(ctx, s.x, s.y, s.size * (0.5 + lifeRatio * 0.75), s.angle, alphaColor);
        } else {
          // Drawing flying page fragments (small rectangular pieces)
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle);
          ctx.strokeStyle = alphaColor;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          ctx.rect(-s.size / 2, -s.size / 1.5 / 2, s.size, s.size / 1.5);
          ctx.stroke();
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('click', handleClick);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  );
}
