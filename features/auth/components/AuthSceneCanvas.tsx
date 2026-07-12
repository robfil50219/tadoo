'use client';

import { useEffect, useRef } from 'react';

type AuthSceneCanvasProps = {
  isNight: boolean;
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  seed: number;
  speed: number;
};

type EffectParticles = {
  birds: Particle[];
  dayDust: Particle[];
  dayLight: Particle[];
  embers: Particle[];
  fireflies: Particle[];
  moonDust: Particle[];
  nightStars: Particle[];
};

const createParticles = (count: number, factory: (index: number) => Particle) =>
  Array.from({ length: count }, (_, index) => factory(index));

const randomBetween = (min: number, max: number) => min + Math.random() * (max - min);

const wrap01 = (value: number) => ((value % 1) + 1) % 1;

const drawSoftCircle = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  alpha: number,
) => {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
  gradient.addColorStop(0, color.replace('ALPHA', String(alpha)));
  gradient.addColorStop(1, color.replace('ALPHA', '0'));
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};

const makeParticles = (): EffectParticles => ({
  birds: createParticles(4, () => ({
    x: randomBetween(0.05, 0.95),
    y: randomBetween(0.11, 0.34),
    vx: randomBetween(0.003, 0.006),
    vy: 0,
    size: randomBetween(6, 10),
    alpha: randomBetween(0.18, 0.34),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.6, 1.2),
  })),
  dayDust: createParticles(26, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: randomBetween(0.001, 0.003),
    vy: randomBetween(-0.003, -0.001),
    size: randomBetween(1.2, 2.6),
    alpha: randomBetween(0.06, 0.16),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.4, 1.2),
  })),
  dayLight: createParticles(9, () => ({
    x: randomBetween(0.08, 0.94),
    y: randomBetween(0.08, 0.78),
    vx: randomBetween(-0.001, 0.001),
    vy: randomBetween(-0.0015, -0.0004),
    size: randomBetween(10, 24),
    alpha: randomBetween(0.05, 0.12),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.35, 0.9),
  })),
  embers: createParticles(12, () => ({
    x: randomBetween(0.08, 0.16),
    y: randomBetween(0.76, 0.9),
    vx: randomBetween(-0.0018, 0.0026),
    vy: randomBetween(-0.007, -0.004),
    size: randomBetween(1.4, 3.2),
    alpha: randomBetween(0.18, 0.48),
    seed: Math.random(),
    speed: randomBetween(0.5, 1.25),
  })),
  fireflies: createParticles(9, () => ({
    x: randomBetween(0.16, 0.86),
    y: randomBetween(0.48, 0.78),
    vx: randomBetween(-0.0012, 0.0012),
    vy: randomBetween(-0.001, 0.001),
    size: randomBetween(2.2, 4.2),
    alpha: randomBetween(0.12, 0.32),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.7, 1.5),
  })),
  moonDust: createParticles(14, () => ({
    x: randomBetween(0.54, 0.96),
    y: randomBetween(0.06, 0.48),
    vx: randomBetween(-0.0012, 0.0002),
    vy: randomBetween(0.0002, 0.0014),
    size: randomBetween(6, 16),
    alpha: randomBetween(0.025, 0.08),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.35, 1),
  })),
  nightStars: createParticles(28, () => ({
    x: Math.random(),
    y: randomBetween(0.04, 0.46),
    vx: 0,
    vy: 0,
    size: randomBetween(0.7, 1.8),
    alpha: randomBetween(0.1, 0.34),
    seed: randomBetween(0, Math.PI * 2),
    speed: randomBetween(0.6, 1.8),
  })),
});

export default function AuthSceneCanvas({ isNight }: AuthSceneCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isNightRef = useRef(isNight);
  const modeRef = useRef(isNight ? 1 : 0);
  const particlesRef = useRef<EffectParticles | null>(null);
  const renderStaticFrameRef = useRef<(() => void) | null>(null);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    isNightRef.current = isNight;
    if (reducedMotionRef.current) {
      modeRef.current = isNight ? 1 : 0;
      renderStaticFrameRef.current?.();
    }
  }, [isNight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return undefined;
    }

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) {
      return undefined;
    }

    particlesRef.current = makeParticles();

    let width = 0;
    let height = 0;
    let rafId = 0;
    let lastTime = performance.now();
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = Math.max(1, rect.width);
      height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const drawBird = (particle: Particle, time: number, alpha: number) => {
      const x = particle.x * width;
      const y = particle.y * height + Math.sin(time * 0.0012 * particle.speed + particle.seed) * 4;
      const size = particle.size;
      ctx.strokeStyle = `rgba(67, 93, 98, ${alpha})`;
      ctx.lineWidth = 1.3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.quadraticCurveTo(x - size * 0.45, y - size * 0.5, x, y);
      ctx.quadraticCurveTo(x + size * 0.45, y - size * 0.5, x + size, y);
      ctx.stroke();
    };

    const drawFrame = (time: number, deltaMs: number, staticFrame = false) => {
      const particles = particlesRef.current;
      if (!particles) {
        return;
      }

      const targetMode = isNightRef.current ? 1 : 0;
      if (staticFrame) {
        modeRef.current = targetMode;
      } else {
        const easing = Math.min(1, deltaMs / 900);
        modeRef.current += (targetMode - modeRef.current) * easing;
      }

      const nightAlpha = modeRef.current;
      const dayAlpha = 1 - nightAlpha;

      ctx.clearRect(0, 0, width, height);

      if (dayAlpha > 0.01) {
        particles.dayLight.forEach((particle) => {
          if (!staticFrame) {
            particle.x = wrap01(particle.x + particle.vx * deltaMs * 0.04);
            particle.y = wrap01(particle.y + particle.vy * deltaMs * 0.04);
          }
          const pulse = 0.75 + Math.sin(time * 0.0008 * particle.speed + particle.seed) * 0.25;
          drawSoftCircle(
            ctx,
            particle.x * width,
            particle.y * height,
            particle.size,
            'rgba(255, 218, 142, ALPHA)',
            particle.alpha * dayAlpha * pulse,
          );
        });

        particles.dayDust.forEach((particle) => {
          if (!staticFrame) {
            particle.x = wrap01(particle.x + particle.vx * deltaMs * 0.05);
            particle.y = wrap01(particle.y + particle.vy * deltaMs * 0.05);
          }
          const shimmer = 0.7 + Math.sin(time * 0.001 * particle.speed + particle.seed) * 0.3;
          ctx.fillStyle = `rgba(255, 207, 132, ${particle.alpha * dayAlpha * shimmer})`;
          ctx.beginPath();
          ctx.arc(particle.x * width, particle.y * height, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        particles.birds.forEach((particle) => {
          if (!staticFrame) {
            particle.x = wrap01(particle.x + particle.vx * deltaMs * 0.012);
          }
          drawBird(particle, time, particle.alpha * dayAlpha);
        });
      }

      if (nightAlpha > 0.01) {
        particles.moonDust.forEach((particle) => {
          if (!staticFrame) {
            particle.x = wrap01(particle.x + particle.vx * deltaMs * 0.04);
            particle.y = wrap01(particle.y + particle.vy * deltaMs * 0.04);
          }
          const pulse = 0.72 + Math.sin(time * 0.0007 * particle.speed + particle.seed) * 0.28;
          drawSoftCircle(
            ctx,
            particle.x * width,
            particle.y * height,
            particle.size,
            'rgba(210, 226, 255, ALPHA)',
            particle.alpha * nightAlpha * pulse,
          );
        });

        particles.nightStars.forEach((particle) => {
          const twinkle = 0.58 + Math.sin(time * 0.0016 * particle.speed + particle.seed) * 0.42;
          ctx.fillStyle = `rgba(255, 248, 205, ${particle.alpha * nightAlpha * twinkle})`;
          ctx.beginPath();
          ctx.arc(particle.x * width, particle.y * height, particle.size, 0, Math.PI * 2);
          ctx.fill();
        });

        particles.fireflies.forEach((particle) => {
          if (!staticFrame) {
            particle.x = wrap01(particle.x + Math.sin(time * 0.0005 + particle.seed) * 0.00018 + particle.vx * deltaMs * 0.03);
            particle.y = wrap01(particle.y + Math.cos(time * 0.00045 + particle.seed) * 0.00012 + particle.vy * deltaMs * 0.03);
          }
          const glow = Math.max(0, Math.sin(time * 0.0018 * particle.speed + particle.seed));
          drawSoftCircle(
            ctx,
            particle.x * width,
            particle.y * height,
            particle.size * 2.5,
            'rgba(255, 214, 105, ALPHA)',
            particle.alpha * nightAlpha * glow,
          );
          ctx.fillStyle = `rgba(255, 237, 154, ${particle.alpha * nightAlpha * glow})`;
          ctx.beginPath();
          ctx.arc(particle.x * width, particle.y * height, particle.size * 0.48, 0, Math.PI * 2);
          ctx.fill();
        });

        particles.embers.forEach((particle) => {
          if (!staticFrame) {
            particle.seed = wrap01(particle.seed + particle.speed * deltaMs * 0.00009);
          }
          const rise = particle.seed;
          const drift = Math.sin(rise * Math.PI * 2 + particle.x * 18) * 0.018;
          const x = (particle.x + drift) * width;
          const y = (0.86 - rise * 0.22) * height;
          const fade = Math.sin(rise * Math.PI);
          const alpha = particle.alpha * nightAlpha * fade;
          ctx.fillStyle = `rgba(255, 147, 65, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, particle.size * (0.7 + fade * 0.45), 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    const loop = (time: number) => {
      const deltaMs = Math.min(48, time - lastTime);
      lastTime = time;
      drawFrame(time, deltaMs);
      rafId = window.requestAnimationFrame(loop);
    };

    const stopLoop = () => {
      if (rafId) {
        window.cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const startLoop = () => {
      if (!rafId) {
        lastTime = performance.now();
        rafId = window.requestAnimationFrame(loop);
      }
    };

    renderStaticFrameRef.current = () => drawFrame(performance.now(), 16, true);

    const handleReducedMotionChange = () => {
      reducedMotionRef.current = motionQuery.matches;
      if (reducedMotionRef.current) {
        stopLoop();
        renderStaticFrameRef.current?.();
      } else {
        startLoop();
      }
    };

    const handleResize = () => {
      resizeCanvas();
      if (reducedMotionRef.current) {
        renderStaticFrameRef.current?.();
      }
    };

    resizeCanvas();
    handleReducedMotionChange();
    window.addEventListener('resize', handleResize);
    motionQuery.addEventListener('change', handleReducedMotionChange);

    return () => {
      stopLoop();
      window.removeEventListener('resize', handleResize);
      motionQuery.removeEventListener('change', handleReducedMotionChange);
      renderStaticFrameRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} className="auth-scene-canvas" aria-hidden="true" />;
}
