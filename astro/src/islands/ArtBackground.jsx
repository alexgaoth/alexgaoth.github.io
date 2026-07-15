import { useEffect, useRef } from 'react';
import { createNoise3D } from 'simplex-noise';

const PARTICLE_COUNT = 900;
const FLOW_SCALE = 0.0016;
const FLOW_TIME_SCALE = 0.00016;
const FLOW_STRENGTH = 0.075;
const DAMPING = 0.992;
const MAX_SPEED = 2.1;
const TRAIL_FADE = 0.08;
const MOUSE_RADIUS = 140;
const MOUSE_SWIRL = 0.085;
const WRAP_MARGIN = 24;

const noise3D = createNoise3D();

function createParticle(width, height) {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    px: 0,
    py: 0,
    vx: (Math.random() - 0.5) * 0.8,
    vy: (Math.random() - 0.5) * 0.8,
    size: 0.5 + Math.random() * 1.7,
    alpha: 0.08 + Math.random() * 0.22,
  };
}

function wrapParticle(particle, width, height) {
  let wrapped = false;

  if (particle.x < -WRAP_MARGIN) {
    particle.x = width + WRAP_MARGIN;
    wrapped = true;
  } else if (particle.x > width + WRAP_MARGIN) {
    particle.x = -WRAP_MARGIN;
    wrapped = true;
  }

  if (particle.y < -WRAP_MARGIN) {
    particle.y = height + WRAP_MARGIN;
    wrapped = true;
  } else if (particle.y > height + WRAP_MARGIN) {
    particle.y = -WRAP_MARGIN;
    wrapped = true;
  }

  if (wrapped) {
    particle.px = particle.x;
    particle.py = particle.y;
  }
}

const ArtBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = canvas.getContext('2d', { alpha: false });
    if (!context) return undefined;

    const pointer = { x: 0, y: 0, active: false };
    let width = 0;
    let height = 0;
    let raf = 0;
    let time = 0;
    let particles = [];

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.fillStyle = '#f2eee4';
      context.fillRect(0, 0, width, height);
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const particle = createParticle(width, height);
        particle.px = particle.x;
        particle.py = particle.y;
        return particle;
      });
    };

    const updateParticle = (particle) => {
      particle.px = particle.x;
      particle.py = particle.y;

      const nx = particle.x * FLOW_SCALE;
      const ny = particle.y * FLOW_SCALE;
      const angle = noise3D(nx, ny, time * FLOW_TIME_SCALE) * Math.PI * 2;

      particle.vx += Math.cos(angle) * FLOW_STRENGTH;
      particle.vy += Math.sin(angle) * FLOW_STRENGTH;

      if (pointer.active) {
        const dx = particle.x - pointer.x;
        const dy = particle.y - pointer.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < MOUSE_RADIUS && distance > 0.001) {
          const influence = (1 - distance / MOUSE_RADIUS) * MOUSE_SWIRL;
          particle.vx += (-dy / distance) * influence;
          particle.vy += (dx / distance) * influence;
        }
      }

      particle.vx *= DAMPING;
      particle.vy *= DAMPING;

      const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
      if (speed > MAX_SPEED) {
        const factor = MAX_SPEED / speed;
        particle.vx *= factor;
        particle.vy *= factor;
      }

      particle.x += particle.vx;
      particle.y += particle.vy;
      wrapParticle(particle, width, height);
    };

    const drawParticle = (particle) => {
      context.strokeStyle = `rgba(33, 25, 17, ${particle.alpha})`;
      context.lineWidth = particle.size;
      context.beginPath();
      context.moveTo(particle.px, particle.py);
      context.lineTo(particle.x, particle.y);
      context.stroke();
    };

    const frame = () => {
      raf = window.requestAnimationFrame(frame);
      time += 1;

      context.fillStyle = `rgba(242, 238, 228, ${TRAIL_FADE})`;
      context.fillRect(0, 0, width, height);

      for (let index = 0; index < particles.length; index += 1) {
        const particle = particles[index];
        updateParticle(particle);
        drawParticle(particle);
      }
    };

    const updatePointer = (clientX, clientY) => {
      pointer.x = clientX;
      pointer.y = clientY;
      pointer.active = true;
    };

    const handleMouseMove = (event) => updatePointer(event.clientX, event.clientY);
    const handleMouseLeave = () => {
      pointer.active = false;
    };
    const handleTouchMove = (event) => {
      const touch = event.touches?.[0];
      if (touch) updatePointer(touch.clientX, touch.clientY);
    };
    const handleTouchEnd = () => {
      pointer.active = false;
    };
    const handleVisibility = () => {
      if (document.hidden) {
        window.cancelAnimationFrame(raf);
        raf = 0;
      } else if (!raf) {
        raf = window.requestAnimationFrame(frame);
      }
    };

    resize();
    raf = window.requestAnimationFrame(frame);

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
        background: '#f2eee4',
      }}
    />
  );
};

export default ArtBackground;
