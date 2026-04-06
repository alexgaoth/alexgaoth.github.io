import { useEffect, useRef } from 'react';

/* ─── tuning ─────────────────────────────────────────────────── */
const SCALE       = 0.0048;   // spatial frequency of the flow field
const FADE        = 0.009;    // how fast old trails fade (lower = longer persistence)
const MOUSE_R     = 150;      // vortex radius in px
const VORTEX_STR  = 1.6;      // swirl strength
const TIME_STEP   = 0.0025;   // how fast the field evolves

/* ─── flow field angle ───────────────────────────────────────── */
function fieldAngle(x, y, t) {
  const a = Math.sin(x * SCALE        + t * 0.38) * Math.cos(y * SCALE * 1.25 + t * 0.27);
  const b = Math.sin((x - y * 0.65)  * SCALE * 1.85 + t * 0.52) * 0.55;
  const c = Math.cos((x * 1.35 + y)  * SCALE * 0.82 - t * 0.17) * 0.28;
  return (a + b + c) * Math.PI;
}

/* ─── particle factory ───────────────────────────────────────── */
function spawn(w, h) {
  return {
    x:       Math.random() * w,
    y:       Math.random() * h,
    px:      0,
    py:      0,
    speed:   0.38 + Math.random() * 0.52,
    sz:      0.14 + Math.random() * 0.44,
    life:    Math.floor(Math.random() * 320), // stagger start
    maxLife: 200 + Math.floor(Math.random() * 260),
  };
}

/* ─── component ──────────────────────────────────────────────── */
const ArtBackground = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let w = 0, h = 0;
    let particles = [];
    let raf;
    let t = 0;
    let mx = null, my = null;

    /* ── resize ── */
    function resize() {
      w = canvas.width  = window.innerWidth;
      h = canvas.height = window.innerHeight;
      ctx.fillStyle = '#F4F1EA';
      ctx.fillRect(0, 0, w, h);
    }

    function count() { return window.innerWidth < 768 ? 160 : 380; }

    function init() {
      particles = Array.from({ length: count() }, () => spawn(w, h));
      particles.forEach(p => { p.px = p.x; p.py = p.y; });
    }

    /* ── per-particle step ── */
    function step(p) {
      p.px = p.x;
      p.py = p.y;

      const a = fieldAngle(p.x, p.y, t);
      p.x += Math.cos(a) * p.speed;
      p.y += Math.sin(a) * p.speed;

      // mouse vortex (swirl + slight push)
      if (mx !== null) {
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < MOUSE_R * MOUSE_R && d2 > 0.5) {
          const d = Math.sqrt(d2);
          const f = (1 - d / MOUSE_R) * VORTEX_STR;
          p.x += (-dy / d * 0.65 + dx / d * 0.18) * f;
          p.y += ( dx / d * 0.65 + dy / d * 0.18) * f;
        }
      }

      p.life++;
      if (p.life > p.maxLife || p.x < -12 || p.x > w + 12 || p.y < -12 || p.y > h + 12) {
        Object.assign(p, spawn(w, h));
        p.life = 0; p.px = p.x; p.py = p.y;
      }
    }

    /* ── draw single particle ── */
    function draw(p) {
      const alpha = Math.sin((p.life / p.maxLife) * Math.PI) * 0.38;
      if (alpha < 0.006) return;
      ctx.beginPath();
      ctx.moveTo(p.px, p.py);
      ctx.lineTo(p.x,  p.y);
      ctx.lineWidth   = p.sz;
      ctx.strokeStyle = `rgba(18,12,6,${alpha.toFixed(3)})`;
      ctx.stroke();
    }

    /* ── main loop ── */
    function frame() {
      ctx.fillStyle = `rgba(244,241,234,${FADE})`;
      ctx.fillRect(0, 0, w, h);

      t += TIME_STEP;

      for (let i = 0; i < particles.length; i++) {
        step(particles[i]);
        draw(particles[i]);
      }

      raf = requestAnimationFrame(frame);
    }

    /* ── burst on click (background only) ── */
    function burst(cx, cy) {
      const n = 18;
      for (let i = 0; i < n; i++) {
        const p   = spawn(w, h);
        p.x       = cx + (Math.random() - 0.5) * 24;
        p.y       = cy + (Math.random() - 0.5) * 24;
        p.px      = p.x;
        p.py      = p.y;
        p.life    = 0;
        p.maxLife = 80 + Math.random() * 120;
        p.speed   = 0.9 + Math.random() * 1.6;
        p.sz      = 0.2 + Math.random() * 0.5;
        particles.push(p);
      }
      // trim so we don't grow unboundedly
      const cap = count() + 60;
      if (particles.length > cap) particles.splice(0, particles.length - cap);
    }

    /* ── events ── */
    const onResize = () => { resize(); init(); };

    const onMove = (e) => {
      mx = e.clientX ?? e.touches?.[0]?.clientX ?? null;
      my = e.clientY ?? e.touches?.[0]?.clientY ?? null;
    };
    const onTouch = (e) => {
      mx = e.touches?.[0]?.clientX ?? null;
      my = e.touches?.[0]?.clientY ?? null;
    };
    const onLeave = () => { mx = null; my = null; };

    const onClick = (e) => {
      if (e.target.closest('.art-portal') || e.target.closest('.art-back')) return;
      burst(e.clientX, e.clientY);
    };
    const onTap = (e) => {
      if (e.target.closest('.art-portal') || e.target.closest('.art-back')) return;
      const t0 = e.touches?.[0];
      if (t0) burst(t0.clientX, t0.clientY);
    };

    resize();
    init();
    raf = requestAnimationFrame(frame);

    window.addEventListener('resize',     onResize);
    window.addEventListener('mousemove',  onMove);
    window.addEventListener('mouseleave', onLeave);
    window.addEventListener('click',      onClick);
    window.addEventListener('touchmove',  onTouch, { passive: true });
    window.addEventListener('touchstart', onTap,   { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize',     onResize);
      window.removeEventListener('mousemove',  onMove);
      window.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('click',      onClick);
      window.removeEventListener('touchmove',  onTouch);
      window.removeEventListener('touchstart', onTap);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        display: 'block',
      }}
    />
  );
};

export default ArtBackground;
