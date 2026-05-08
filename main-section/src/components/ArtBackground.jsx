import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createNoise3D } from 'simplex-noise';

/* ─── config ─────────────────────────────────────────────────── */
const COUNT        = 12000;
const NOISE_SCALE  = 0.38;
const NOISE_T      = 0.026;
const DRIFT_SPD    = 0.0030;
const MOUSE_R      = 0.30;
const MORPH_SPD    = 0.0072;   // ~139 frames ≈ 2.3 s to form
const DISSOLVE_SPD = 0.0030;   // ~333 frames ≈ 5.6 s to dissolve
const FORM_FRAMES  = 480;      // ~8 s hold
const DRIFT_FRAMES = 300;      // ~5 s drift (next painting pre-computed here)
const DT           = 0.016;

/* ─── noise ──────────────────────────────────────────────────── */
const noise3D = createNoise3D();  // ambient flow field
const noiseM  = createNoise3D();  // mountain silhouette detail (separate seed)

function flowAngle(x, y, t) {
  return noise3D(x * NOISE_SCALE, y * NOISE_SCALE, t * NOISE_T) * Math.PI * 2;
}

/* ─── Fractal mountain height ─────────────────────────────────
   Returns height above baseY at horizontal position x.
   Each unique seed samples a different region of noiseM, producing
   genuinely different irregular silhouettes.
*/
function peakH(x, cx, spread, height, seed) {
  const nx = (x - cx) / spread;
  if (Math.abs(nx) > 1.0) return 0;

  // Asymmetric bell — Chinese peaks lean and are not symmetric cones
  const lean = 0.13 * Math.sin(seed * 3.7 + 1.1);
  const base = Math.max(0, 1 - Math.pow(Math.abs(nx + lean) * 1.18, 1.65));
  let h = Math.pow(base, 1.35) * height;

  // Horizontal stratification bands (geological layering texture)
  h += Math.sin(h / Math.max(height, 0.01) * 16 + seed * 2.8) * 0.011 * height;

  // 3 octaves of fractal detail — silhouette irregularity
  h += noiseM(x * 2.6 + seed * 10,  seed * 0.4,           0) * 0.072 * height;
  h += noiseM(x * 6.2 + seed * 10,  h * 0.5 + seed * 0.4, 0) * 0.028 * height;
  h += noiseM(x * 13  + seed * 10,  h * 1.0 + seed * 0.4, 0) * 0.011 * height;

  return Math.max(0, h);
}

/* ══════════════════════════════════════════════════════════════
   POINT HELPERS
   Each returns [[x, y, tone], …]
   tone 0 = 清墨 (palest/farthest)   tone 1 = 焦墨 (darkest/nearest)
   Tone is stored in position.z in the GPU buffer (safe — vertex
   shader overrides z to 0.0 for actual 3-D rendering).
   ══════════════════════════════════════════════════════════════ */

/* Mountain body: surface-biased fill inside fractal silhouette.
   toneEdge = darkness at silhouette rim, toneFill = minimum inside. */
function emitPeak(cx, baseY, height, spread, seed, toneEdge, toneFill, n) {
  const pts = [];
  let tr = 0;
  while (pts.length < n && tr++ < n * 14) {
    const x  = cx + (Math.random() * 2 - 1) * spread;
    const sy = peakH(x, cx, spread, height, seed);
    if (sy < 0.008) continue;
    const t = Math.pow(Math.random(), 0.50); // bias toward silhouette surface
    const y = baseY + t * sy;
    // Darker near the silhouette edge, lighter in interior, lighter at top (mist cap)
    const surfDist   = Math.min(1, ((baseY + sy) - y) / Math.max(sy * 0.60, 0.001));
    const heightFrac = sy > 0 ? (y - baseY) / sy : 0;
    const raw = toneEdge * (1 - surfDist * 0.45) * (0.52 + 0.48 * (1 - heightFrac * 0.5));
    pts.push([x, y, Math.max(toneFill, Math.min(1, raw))]);
  }
  return pts;
}

/* Sparse particles right at silhouette rim — dry-brush ragged edge */
function emitEdge(cx, baseY, height, spread, seed, tone, n) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const x  = cx + (Math.random() * 2 - 1) * spread;
    const sy = peakH(x, cx, spread, height, seed);
    if (sy < 0.006) continue;
    const j = (Math.random() - 0.5) * 0.020;
    pts.push([x + j, baseY + sy * (0.92 + Math.random() * 0.14) + j,
              tone * (0.5 + Math.random() * 0.5)]);
  }
  return pts;
}

/* Near-invisible mist band — marks the 留白 between depth planes */
function mistBand(x0, x1, y, thick, n, tone = 0.07) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const x  = x0 + Math.random() * (x1 - x0);
    const dy = (Math.random() - 0.5) * 2;
    pts.push([x + (Math.random() - 0.5) * 0.04,
              y + dy * thick * Math.exp(-Math.abs(dy) * 1.6),
              tone + Math.random() * 0.05]);
  }
  return pts;
}

/* 雨点皴 raindrop cun (Fan Kuan): short vertical dotted marks */
function rainCun(x0, x1, y0, y1, n) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const cx = x0 + Math.random() * (x1 - x0);
    const cy = y0 + Math.random() * (y1 - y0);
    const h  = 0.005 + Math.random() * 0.010;
    const t  = 0.52 + Math.random() * 0.42;
    for (let j = 0; j < 3; j++)
      pts.push([cx + (Math.random() - 0.5) * 0.003, cy - h * (j / 2), t]);
  }
  return pts;
}

/* 斧劈皴 axe-cut cun (Ma Yuan): sharp diagonal strokes */
function axeCun(x0, x1, y0, y1, n) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const cx  = x0 + Math.random() * (x1 - x0);
    const cy  = y0 + Math.random() * (y1 - y0);
    const len = 0.016 + Math.random() * 0.030;
    const ang = -Math.PI * (0.26 + Math.random() * 0.18);
    const t   = 0.58 + Math.random() * 0.38;
    for (let j = 0; j < 4; j++) {
      const f = j / 3;
      pts.push([cx + Math.cos(ang) * len * f, cy + Math.sin(ang) * len * f, t * (1 - f * 0.22)]);
    }
  }
  return pts;
}

/* 披麻皴 hemp fiber cun (Xia Gui): long gentle horizontal marks */
function hempCun(x0, x1, y0, y1, n) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const cy  = y0 + Math.random() * (y1 - y0);
    const cx  = x0 + Math.random() * (x1 - x0);
    const len = 0.024 + Math.random() * 0.050;
    const t   = 0.36 + Math.random() * 0.32;
    for (let j = 0; j < 5; j++)
      pts.push([cx + len * (j / 4 - 0.5) + (Math.random() - 0.5) * 0.003,
                cy + (Math.random() - 0.5) * 0.004, t]);
  }
  return pts;
}

/* 米点 Mi Fu horizontal dots: oval elliptical clusters */
function miDots(cx, cy, rx, ry, n, toneBase) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.42); // denser toward center
    pts.push([cx + Math.cos(a) * r * rx, cy + Math.sin(a) * r * ry,
              Math.min(1, toneBase * (0.55 + r * 0.55))]);
  }
  return pts;
}

/* Water wave strokes */
function waveStrokes(x0, x1, y, amp, freq, n, tone = 0.15) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const x = x0 + Math.random() * (x1 - x0);
    const j = (Math.random() - 0.5) * 0.003;
    pts.push([x + j, y + Math.sin(x * freq + Math.random() * 0.4) * amp + j,
              tone * (0.7 + Math.random() * 0.4)]);
  }
  return pts;
}

/* Elliptical scatter cluster (figure, boat, rock) */
function cluster(cx, cy, rx, ry, n, tone = 0.74) {
  const pts = [];
  for (let k = 0; k < n; k++) {
    const a = Math.random() * Math.PI * 2, r = Math.sqrt(Math.random());
    pts.push([cx + Math.cos(a) * r * rx, cy + Math.sin(a) * r * ry,
              tone * (0.7 + Math.random() * 0.3)]);
  }
  return pts;
}

/* Pine tree 松 — tiered triangular canopy */
function pine(cx, base, h, n, tone = 0.74) {
  const pts = [];
  const trk = Math.max(1, Math.floor(n * 0.12));
  for (let k = 0; k < trk; k++)
    pts.push([cx + (Math.random() - 0.5) * h * 0.05, base - (k / trk) * h * 0.22, tone]);
  const tiers = 3, pt = Math.floor((n - trk) / tiers);
  for (let t = 0; t < tiers; t++) {
    const top = base - h * (0.44 + t * 0.26), bot = base - h * (0.22 + t * 0.26);
    const hw  = h * (0.40 - t * 0.11);
    for (let k = 0; k < pt; k++) {
      const py = bot + Math.random() * (top - bot);
      const pw = hw * (1 - ((py - bot) / (top - bot)) * 0.5);
      pts.push([cx + (Math.random() * 2 - 1) * pw, py, tone * (0.8 + Math.random() * 0.2)]);
    }
  }
  return pts;
}

/* Crab-claw tree 蟹爪 (Guo Xi — vigorous curling branches) */
function crabClaw(cx, base, h, n, tone = 0.76) {
  const pts = [];
  // Slightly curved trunk
  const trk = Math.floor(n * 0.12);
  for (let k = 0; k < trk; k++)
    pts.push([cx + Math.sin(k / trk * 1.8) * 0.006, base - (k / trk) * h * 0.46, tone]);
  // 4 arms: angle increases as arm extends (the "claw curl")
  const arms = [[-1.0, 0.30, 0.22], [1.0, 0.26, 0.20], [-0.5, 0.20, 0.14], [0.6, 0.18, 0.13]];
  const sy = base - h * 0.43;
  arms.forEach(([dir, spread, frac]) => {
    const cnt = Math.floor(n * frac);
    for (let k = 0; k < cnt; k++) {
      const t   = Math.pow(Math.random(), 0.65);
      const ang = dir * (0.4 + t * 1.4);
      const r   = spread * t;
      pts.push([cx + Math.sin(ang) * r + (Math.random() - 0.5) * 0.005,
                sy - Math.cos(ang * 0.55) * r * h * 0.85 + (Math.random() - 0.5) * 0.005,
                tone * (0.70 + Math.random() * 0.28)]);
    }
  });
  return pts;
}

/* Bare winter tree — trunk + radiating skeleton branches */
// eslint-disable-next-line no-unused-vars
function bareTree(cx, base, h, n, tone = 0.68) {
  const pts = [];
  const trk = Math.floor(n * 0.30);
  for (let k = 0; k < trk; k++)
    pts.push([cx + (Math.random() - 0.5) * 0.006, base - (k / trk) * h * 0.58, tone]);
  const brs = [[-1, 0.26], [1, 0.22], [-0.6, 0.48], [0.72, 0.46], [-0.28, 0.66], [0.38, 0.68]];
  const pb  = Math.floor(n * 0.70 / brs.length);
  brs.forEach(([bx, by]) => {
    for (let k = 0; k < pb; k++) {
      const t = Math.random();
      pts.push([cx + bx * h * 0.30 * t + (Math.random() - 0.5) * 0.005,
                base - h * 0.50 - by * h * 0.26 * t + (Math.random() - 0.5) * 0.005,
                tone * (0.70 + Math.random() * 0.30)]);
    }
  });
  return pts;
}

/* Evenly-spaced points along a polyline; pts entries can be [x, y] or [x, y, tone] */
// eslint-disable-next-line no-unused-vars
function polyLine(pts, n, j = 0.003) {
  const lens = [0];
  for (let i = 1; i < pts.length; i++) {
    const dx = pts[i][0] - pts[i-1][0], dy = pts[i][1] - pts[i-1][1];
    lens.push(lens[i-1] + Math.sqrt(dx * dx + dy * dy));
  }
  const total = lens[lens.length - 1], out = [];
  for (let k = 0; k < n; k++) {
    const d = total > 0 ? (k / Math.max(n - 1, 1)) * total : 0;
    let s = 0;
    while (s < lens.length - 2 && lens[s + 1] < d) s++;
    const span = lens[s + 1] - lens[s], f = span > 1e-9 ? (d - lens[s]) / span : 0;
    const t0 = pts[s][2] ?? 0.65, t1 = pts[s + 1]?.[2] ?? t0;
    out.push([
      pts[s][0] + f * (pts[s+1][0] - pts[s][0]) + (Math.random() - 0.5) * j,
      pts[s][1] + f * (pts[s+1][1] - pts[s][1]) + (Math.random() - 0.5) * j,
      t0 + f * (t1 - t0),
    ]);
  }
  return out;
}

/* Sample all point pools into a Float32Array(n*3).
   Position layout: x=geo x, y=geo y, z=ink tone (0–1).
   The vertex shader reads z as tone and renders at z=0. */
function assemble(pools, n) {
  const all = [];
  for (const pool of pools) for (const p of pool) all.push(p);
  const buf = new Float32Array(n * 3);
  if (!all.length) return buf;
  for (let i = 0; i < n; i++) {
    const p = all[Math.floor(Math.random() * all.length)];
    buf[i*3]   = p[0];
    buf[i*3+1] = p[1];
    buf[i*3+2] = Math.max(0, Math.min(1, p[2] ?? 0.5));
  }
  return buf;
}

/* ══════════════════════════════════════════════════════════════
   五幅山水画  (Five landscape compositions)
   A = viewport aspect ratio
   ══════════════════════════════════════════════════════════════ */

/* ① 溪山行旅 — Fan Kuan  高远 Gao Yuan
   Towering monumental central peak; tiny travelers below; raindrop cun 雨点皴 */
function mkFanKuan(A) {
  // Giant central peak — dominates 85 % of frame height
  const main = [
    ...emitPeak(0.00, -0.30, 1.15, 0.44, 1.0, 0.90, 0.30, 3000),
    ...emitEdge(0.00, -0.30, 1.15, 0.44, 1.0, 0.74, 240),
    ...rainCun(-0.34, 0.34, -0.10, 0.74, 310),
  ];
  // Left shoulder — subsidiary, lower
  const lShoulder = [
    ...emitPeak(-0.66, -0.28, 0.60, 0.27, 2.0, 0.72, 0.22, 760),
    ...emitEdge(-0.66, -0.28, 0.60, 0.27, 2.0, 0.56, 70),
  ];
  // Right shoulder
  const rShoulder = [
    ...emitPeak(0.62, -0.26, 0.56, 0.25, 3.0, 0.68, 0.20, 700),
    ...emitEdge(0.62, -0.26, 0.56, 0.25, 3.0, 0.52, 65),
  ];
  // Distant flanking peaks (淡-清 — faint atmosphere)
  const farL = emitPeak(-A * 0.60, -0.20, 0.36, 0.26, 4.0, 0.26, 0.10, 240);
  const farR = emitPeak( A * 0.58, -0.22, 0.34, 0.24, 5.0, 0.24, 0.09, 220);

  // Mist bands — 留白 separating peak from forest, and horizon haze
  const mist1 = mistBand(-0.60, 0.60,    0.18, 0.038, 120, 0.07);
  const mist2 = mistBand(-A + 0.1, A - 0.1, -0.06, 0.026,  80, 0.06);

  // Treeline below mist (浓墨 strip, 18 pines)
  const trees = [];
  for (let i = 0; i < 18; i++) {
    const tx = -0.90 + i * 0.10 + (Math.random() - 0.5) * 0.05;
    trees.push(...pine(tx, -0.11 + Math.random() * 0.04, 0.12 + Math.random() * 0.05, 22, 0.82));
  }

  // Waterfall — thin pale vertical column on right flank of central peak
  const falls = [];
  for (let k = 0; k < 210; k++)
    falls.push([0.068 + (Math.random() - 0.5) * 0.013, -0.26 + Math.random() * 0.84,
                0.09 + Math.random() * 0.10]);

  // Tiny travelers at base (焦墨 accent)
  const travelers = cluster(0.04, -0.28, 0.026, 0.011, 16, 0.90);

  // River at bottom — sparse horizontal wave strokes (淡-清)
  const water = [];
  for (let w = 0; w < 6; w++)
    water.push(...waveStrokes(-A + 0.2, A - 0.2, -0.46 + w * 0.048, 0.005, 11, 58, 0.13));

  return assemble([main, lShoulder, rShoulder, farL, farR, mist1, mist2, trees, falls, travelers, water], COUNT);
}

/* ② 早春 — Guo Xi  深远 Shen Yuan
   S-curve composition, crab-claw 蟹爪 trees, three depth planes with mist valleys */
function mkGuoXi(A) {
  // Background plane (far, 清-淡)
  const bgL  = emitPeak(-0.54,  0.20, 0.58, 0.34, 6.0, 0.28, 0.10, 520);
  const bgR  = emitPeak( 0.46,  0.18, 0.54, 0.30, 7.0, 0.26, 0.09, 480);
  const bgM  = mistBand(-A, A,  0.24, 0.058, 170, 0.05);

  // Mid-ground S-curve masses (重墨)
  const midL = emitPeak(-0.32, -0.02, 0.64, 0.32, 8.0, 0.64, 0.22, 860);
  const midR = emitPeak( 0.28, -0.06, 0.60, 0.30, 9.0, 0.60, 0.20, 800);
  const midM = mistBand(-A, A, -0.01, 0.046, 150, 0.06);

  // Foreground rocky mass — offset left to form S (浓-焦)
  const fg = [
    ...emitPeak(-0.52, -0.30, 0.58, 0.34, 10.0, 0.92, 0.40, 1060),
    ...emitEdge(-0.52, -0.30, 0.58, 0.34, 10.0, 0.80, 110),
  ];
  const fgM = mistBand(-A, A, -0.28, 0.036, 110, 0.07);

  // Crab-claw trees — Guo Xi's signature vigorous branching
  const trees = [];
  [[-0.80, -0.29, 0.27], [-0.64, -0.30, 0.23], [0.56, -0.09, 0.19], [0.40, -0.11, 0.17]]
    .forEach(([tx, ty, th]) => trees.push(...crabClaw(tx, ty, th, 52, 0.82)));
  // Small distant pines (right background, 淡)
  for (let i = 0; i < 6; i++) trees.push(...pine(0.74 + i * 0.10, 0.15, 0.09, 11, 0.36));

  // S-curve stream (implied by dot trail)
  const stream = [];
  for (let k = 0; k < 160; k++) {
    const t = k / 160;
    stream.push([-0.04 + Math.sin(t * Math.PI * 1.8) * 0.26 + (Math.random() - 0.5) * 0.012,
                 -0.38 + t * 0.68, 0.11 + Math.random() * 0.08]);
  }

  const water = [];
  for (let w = 0; w < 5; w++)
    water.push(...waveStrokes(-A + 0.3, A - 0.3, -0.50 + w * 0.046, 0.006, 8, 50, 0.11));

  return assemble([bgL, bgR, bgM, midL, midR, midM, fg, fgM, trees, stream, water], COUNT);
}

/* ③ 一角 — Ma Yuan  One-Corner
   ~65 % void 留白; diagonal cliff lower-left; axe-cut cun 斧劈皴; vast empty water */
function mkMaYuan(A) {
  // Diagonal cliff — lower-left quadrant only (浓-焦)
  const cliff = [
    ...emitPeak(-A * 0.55, -0.36, 0.76, 0.32, 11.0, 0.94, 0.38, 1500),
    ...emitEdge(-A * 0.55, -0.36, 0.76, 0.32, 11.0, 0.82, 130),
    ...axeCun(-A + 0.1, -0.18, -0.36, 0.38, 210),
  ];
  // Subsidiary rocks at base
  const rocks = [
    ...emitPeak(-0.74, -0.38, 0.32, 0.20, 12.0, 0.80, 0.30, 400),
    ...emitPeak(-0.30, -0.42, 0.28, 0.18, 13.0, 0.76, 0.28, 340),
  ];
  // Single focal pine at cliff promontory
  const focalPine = pine(-A * 0.20, 0.30, 0.24, 76, 0.88);
  // Scholar figure (焦墨 tiny cluster)
  const scholar = cluster(-A * 0.13, 0.10, 0.017, 0.010, 11, 0.92);

  // Far mountains upper-left (清墨 — almost invisible)
  const farL = emitPeak(-A * 0.62, 0.40, 0.28, 0.28, 14.0, 0.20, 0.06, 200);
  const farR = emitPeak(-A * 0.30, 0.38, 0.24, 0.24, 15.0, 0.17, 0.05, 170);
  const farM = mistBand(-A, -0.08, 0.38, 0.042, 85, 0.05);

  // Vast void lower-right: only 4 sparse wave lines suggesting infinite water
  const water = [];
  for (let w = 0; w < 4; w++)
    water.push(...waveStrokes(0.12, A - 0.1, -0.44 + w * 0.042, 0.004, 6, 36, 0.09));
  // Ghost marks in the void — suggest infinite empty space
  for (let k = 0; k < 50; k++)
    water.push([0.20 + Math.random() * (A - 0.30), 0.08 + Math.random() * 0.54,
                0.04 + Math.random() * 0.04]);

  return assemble([cliff, rocks, focalPine, scholar, farL, farR, farM, water], COUNT);
}

/* ④ 米点山水 — Mi Fu  米点 Dot Mountains
   Everything built from horizontal oval dot clusters — no outlines.
   Five receding tonal planes: 清→淡→重→浓→焦 */
function mkMiFu(A) {
  // Plane 1 — far, 清 (y ≈ 0.44–0.60)
  const p1 = [
    ...miDots(-0.06,  0.53, 0.30, 0.13, 200, 0.12),
    ...miDots( 0.24,  0.51, 0.24, 0.11, 170, 0.10),
    ...miDots(-0.32,  0.49, 0.22, 0.10, 150, 0.11),
    ...miDots( 0.46,  0.47, 0.20, 0.10, 140, 0.09),
  ];
  // Plane 2 — 淡 (y ≈ 0.20–0.38)
  const p2 = [
    ...miDots(-0.18,  0.36, 0.36, 0.16, 270, 0.22),
    ...miDots( 0.32,  0.34, 0.30, 0.14, 240, 0.20),
    ...miDots(-0.44,  0.30, 0.26, 0.13, 200, 0.21),
    ...miDots( 0.58,  0.28, 0.24, 0.12, 180, 0.19),
  ];
  // Plane 3 — 重 (y ≈ 0.04–0.22)
  const p3 = [
    ...miDots(-0.10,  0.18, 0.40, 0.18, 350, 0.38),
    ...miDots( 0.28,  0.14, 0.34, 0.16, 310, 0.35),
    ...miDots(-0.46,  0.10, 0.28, 0.14, 270, 0.36),
    ...miDots( 0.54,  0.08, 0.26, 0.13, 240, 0.33),
  ];
  // Plane 4 — 浓 (y ≈ -0.16 to 0.04)
  const p4 = [
    ...miDots(-0.22,  0.02, 0.44, 0.20, 390, 0.56),
    ...miDots( 0.24, -0.02, 0.38, 0.18, 350, 0.52),
    ...miDots(-0.48, -0.08, 0.30, 0.15, 290, 0.54),
    ...miDots( 0.52, -0.10, 0.28, 0.14, 260, 0.50),
  ];
  // Plane 5 — 焦 near (y ≈ -0.38 to -0.14)
  const p5 = [
    ...miDots(-0.12, -0.18, 0.46, 0.22, 420, 0.76),
    ...miDots( 0.30, -0.22, 0.40, 0.20, 380, 0.72),
    ...miDots(-0.48, -0.26, 0.32, 0.16, 310, 0.74),
    ...miDots( 0.50, -0.28, 0.28, 0.14, 270, 0.70),
  ];

  // Mist gaps between planes (near-invisible 清墨)
  const mists = [];
  [0.42, 0.26, 0.08, -0.12].forEach(my =>
    mists.push(...mistBand(-A + 0.2, A - 0.2, my, 0.020, 50, 0.04)));

  // Distant horizon scatter (清)
  const horizon = [];
  for (let k = 0; k < 80; k++)
    horizon.push([-A + Math.random() * 2 * A, 0.60 + Math.random() * 0.08, 0.06 + Math.random() * 0.04]);

  // River — very light horizontal marks (清)
  const river = [];
  for (let w = 0; w < 7; w++)
    river.push(...waveStrokes(-A + 0.3, A - 0.3, -0.46 + w * 0.036, 0.007, 7, 44, 0.09));

  return assemble([[...p1, ...p2, ...p3, ...p4, ...p5], mists, horizon, river], COUNT);
}

/* ⑤ 溪山清远 — Xia Gui  平远 Ping Yuan
   Wide panorama; mountains develop horizontally; hemp cun 披麻皴; river with boats */
function mkXiaGui(A) {
  // Far continuous background ridge (清-淡) — generated from noiseM for organic shape
  const farRidge = [];
  for (let x = -A; x < A; x += 0.07) {
    const h = 0.16 + noiseM(x * 1.5, 0, 5.0) * 0.13;
    for (let k = 0; k < 8; k++) {
      const rx = x + (Math.random() - 0.5) * 0.06;
      const ry = 0.28 + Math.random() * h;
      farRidge.push([rx, ry, 0.10 + ((ry - 0.28) / Math.max(h, 0.01)) * 0.09]);
    }
  }

  // Rolling mid hills — hemp cun on gentle slopes (重-淡)
  const hillL = [
    ...emitPeak(-A * 0.50, -0.08, 0.44, 0.36, 16.0, 0.62, 0.22, 940),
    ...hempCun(-A * 0.65, -0.24, -0.10, 0.18, 150),
  ];
  const hillR = [
    ...emitPeak(A * 0.48, -0.10, 0.40, 0.34, 17.0, 0.58, 0.20, 860),
    ...hempCun(A * 0.28, -0.24, -0.12, 0.16, 130),
  ];
  const midM = mistBand(-A, A, -0.05, 0.036, 120, 0.06);

  // Near foreground hills (darker)
  const nearL = emitPeak(-A * 0.68, -0.28, 0.32, 0.26, 18.0, 0.82, 0.34, 600);
  const nearR = emitPeak( A * 0.66, -0.30, 0.30, 0.24, 19.0, 0.78, 0.32, 550);

  // River — central horizontal band of sparse wave strokes (淡-清)
  const river = [];
  for (let w = 0; w < 9; w++)
    river.push(...waveStrokes(-A + 0.3, A - 0.3, -0.15 + w * 0.034, 0.007, 9, 52, 0.11));

  // Four fishing boats with masts
  const boats = [];
  [[-0.54, -0.11], [0.22, -0.13], [-0.07, -0.17], [0.63, -0.09]].forEach(([bx, by]) => {
    boats.push(...cluster(bx, by, 0.038, 0.010, 13, 0.76));
    for (let k = 0; k < 10; k++)
      boats.push([bx + (Math.random() - 0.5) * 0.007, by - k * 0.013, 0.79]);
  });

  // Foreground trees — left bank (浓墨)
  const trees = [];
  for (let i = 0; i < 8; i++)
    trees.push(...pine(-A * 0.50 + i * 0.12, -0.26, 0.10 + Math.random() * 0.04, 18, 0.84));

  // Near foreground water detail
  const nearW = [];
  for (let w = 0; w < 5; w++)
    nearW.push(...waveStrokes(-A + 0.2, A - 0.2, -0.40 + w * 0.038, 0.005, 10, 60, 0.15));

  return assemble([farRidge, hillL, hillR, midM, nearL, nearR, river, boats, trees, nearW], COUNT);
}

const PAINTINGS = [mkFanKuan, mkGuoXi, mkMaYuan, mkMiFu, mkXiaGui];

/* ─── React component ────────────────────────────────────────── */
const ArtBackground = () => {
  const mountRef = useRef(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    /* ── renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xF2EEE4, 1); // warm xuan paper 宣纸 tone
    Object.assign(renderer.domElement.style, {
      position: 'fixed', inset: '0', zIndex: '0',
      pointerEvents: 'none', display: 'block',
    });
    el.appendChild(renderer.domElement);

    /* ── camera ── */
    let aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-aspect, aspect, 1, -1, 0.1, 10);
    camera.position.z = 1;
    const scene = new THREE.Scene();

    /* ── particle buffers ── */
    const pos        = new Float32Array(COUNT * 3);
    const driftX     = new Float32Array(COUNT);
    const driftY     = new Float32Array(COUNT);
    const frozenX    = new Float32Array(COUNT);
    const frozenY    = new Float32Array(COUNT);
    const baseSizes  = new Float32Array(COUNT);
    const morphSizes = new Float32Array(COUNT);

    for (let i = 0; i < COUNT; i++) {
      const x = (Math.random() - 0.5) * 2 * aspect;
      const y = (Math.random() - 0.5) * 2;
      driftX[i] = x; driftY[i] = y;
      pos[i*3] = x; pos[i*3+1] = y;
      const r = Math.random();
      baseSizes[i] = r < 0.62 ? 0.6 + Math.random() * 0.6
                   : r < 0.90 ? 1.2 + Math.random() * 0.8
                   :              2.0 + Math.random() * 1.2;
      morphSizes[i] = 1.4 + Math.random() * 2.0; // updated per painting via applyPainting
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position',   new THREE.BufferAttribute(pos,        3));
    geo.setAttribute('aBaseSize',  new THREE.BufferAttribute(baseSizes,  1));
    geo.setAttribute('aMorphSize', new THREE.BufferAttribute(morphSizes, 1));

    const dpr           = Math.min(window.devicePixelRatio, 2);
    const morphUniform  = { value: 0.0 };
    const aspectUniform = { value: aspect };

    const mat = new THREE.ShaderMaterial({
      uniforms: { dpr: { value: dpr }, uMorph: morphUniform, uAspect: aspectUniform },
      vertexShader: /* glsl */`
        attribute float aBaseSize;
        attribute float aMorphSize;
        uniform float dpr, uMorph, uAspect;
        varying float vEdgeFade;
        varying float vTone;
        void main() {
          // position.z carries ink tone (0=清, 1=焦); project at z=0 to avoid clipping
          vTone = position.z;
          vec4 mvPos = modelViewMatrix * vec4(position.x, position.y, 0.0, 1.0);
          gl_PointSize = mix(aBaseSize, aMorphSize, uMorph) * dpr;
          gl_Position  = projectionMatrix * mvPos;
          // Fade particles near viewport edges during drift; painting particles stay opaque
          float ex = 1.0 - smoothstep(0.74, 1.0, abs(position.x / uAspect));
          float ey = 1.0 - smoothstep(0.79, 1.0, abs(position.y));
          vEdgeFade = mix(min(ex, ey), 1.0, uMorph);
        }
      `,
      fragmentShader: /* glsl */`
        uniform float uMorph;
        varying float vEdgeFade;
        varying float vTone;
        void main() {
          float d = length(gl_PointCoord - 0.5) * 2.0;
          if (d > 1.0) discard;

          // Ink tone: 0=清 (pale gray), 1=焦 (near black)
          float tone = vTone;

          // Lightness: 清→0.76, 淡→0.50, 重→0.26, 浓→0.10, 焦→0.02
          float L = mix(0.76, 0.02, tone);
          // Warm in lighter tones (xuan paper quality), cooler in heavy ink
          vec3 inkCol   = vec3(L * 1.03, L * 0.96, L * 0.87);
          vec3 driftCol = vec3(0.22, 0.17, 0.11); // warm mid-gray ambient dust

          vec3 col = mix(driftCol, inkCol, uMorph);

          // Lighter tones have softer particle edges; darker tones crisper
          float sharpness = mix(0.55, mix(0.60, 0.74, tone), uMorph);
          float circle = 1.0 - smoothstep(sharpness, 1.0, d);

          // Opacity: tone-driven in painting mode (清=0.10, 焦=0.90)
          float paintAlpha = mix(0.10, 0.90, tone) * circle * vEdgeFade;
          float driftAlpha = 0.26 * circle * vEdgeFade;
          float a = mix(driftAlpha, paintAlpha, uMorph);

          gl_FragColor = vec4(col, a);
        }
      `,
      transparent: true,
      depthWrite: false,
    });
    scene.add(new THREE.Points(geo, mat));

    /* ── state ── */
    // Pre-generate painting 0 during component mount so first formation is instant
    let nextPainting = PAINTINGS[0](aspect);
    let paintTargets = null;
    let paintingIdx  = 0;
    let morph        = 0;
    let state        = 'drift';
    let stateTimer   = DRIFT_FRAMES;
    let frozen       = false;
    let mX = 0, mY = 0, hasMouse = false;
    let time = 0, raf = 0;

    /* Apply a pre-generated painting buffer: set targets + update morphSizes
       so particle size matches ink tone (焦墨 = larger dots, 清墨 = fine dust) */
    function applyPainting(painting) {
      paintTargets = painting;
      for (let i = 0; i < COUNT; i++) {
        const t = painting[i*3+2]; // ink tone stored in z
        morphSizes[i] = t < 0.20 ? 0.7 + Math.random() * 0.5    // 清: tiny dust
                      : t < 0.45 ? 1.1 + Math.random() * 0.9    // 淡-重: small
                      : t < 0.72 ? 1.6 + Math.random() * 1.3    // 浓: medium
                      :              2.4 + Math.random() * 1.5;  // 焦: heavy accent
      }
      geo.attributes.aMorphSize.needsUpdate = true;
    }

    /* ── frame loop ── */
    function frame() {
      raf = requestAnimationFrame(frame);
      time += DT;

      /* state machine */
      if (state === 'drift') {
        if (--stateTimer <= 0) {
          applyPainting(nextPainting);
          frozenX.set(driftX);
          frozenY.set(driftY);
          frozen    = true;
          state     = 'forming';
        }
      } else if (state === 'forming') {
        morph = Math.min(1, morph + MORPH_SPD);
        if (morph >= 1) { state = 'hold'; stateTimer = FORM_FRAMES; }
      } else if (state === 'hold') {
        if (--stateTimer <= 0) state = 'dissolving';
      } else { // dissolving
        morph = Math.max(0, morph - DISSOLVE_SPD);
        if (morph <= 0) {
          state      = 'drift';
          stateTimer = DRIFT_FRAMES;
          frozen     = false;
          // Advance index; pre-generate next painting during the drift window
          paintingIdx  = (paintingIdx + 1) % PAINTINGS.length;
          nextPainting = PAINTINGS[paintingIdx](aspect);
        }
      }

      morphUniform.value = morph;
      const m1 = 1 - morph;

      /* particle positions */
      for (let i = 0; i < COUNT; i++) {
        if (!frozen) {
          const angle = flowAngle(driftX[i], driftY[i], time);
          driftX[i] += Math.cos(angle) * DRIFT_SPD;
          driftY[i] += Math.sin(angle) * DRIFT_SPD;
          if      (driftX[i] < -aspect) driftX[i] += aspect * 2;
          else if (driftX[i] >  aspect) driftX[i] -= aspect * 2;
          if      (driftY[i] < -1)      driftY[i] += 2;
          else if (driftY[i] >  1)      driftY[i] -= 2;
          if (hasMouse) {
            const dx = driftX[i] - mX, dy = driftY[i] - mY;
            const d2 = dx * dx + dy * dy;
            if (d2 < MOUSE_R * MOUSE_R && d2 > 1e-6) {
              const d = Math.sqrt(d2), f = (1 - d / MOUSE_R) * 0.018;
              driftX[i] += (-dy / d * 0.70 + dx / d * 0.14) * f;
              driftY[i] += ( dx / d * 0.70 + dy / d * 0.14) * f;
            }
          }
        }
        const idx = i * 3;
        if (morph > 0 && paintTargets) {
          pos[idx]   = frozenX[i] * m1 + paintTargets[idx]   * morph;
          pos[idx+1] = frozenY[i] * m1 + paintTargets[idx+1] * morph;
          pos[idx+2] = paintTargets[idx+2] * morph; // tone lerps from 0 (drift) to painting tone
        } else {
          pos[idx]   = driftX[i];
          pos[idx+1] = driftY[i];
          pos[idx+2] = 0; // no tone during pure drift
        }
      }

      geo.attributes.position.needsUpdate = true;
      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(frame);

    /* ── events ── */
    const toWorld = (cx, cy) => [
      (cx / window.innerWidth  * 2 - 1) * aspect,
      -(cy / window.innerHeight * 2 - 1),
    ];
    const onMove     = e => { [mX, mY] = toWorld(e.clientX, e.clientY); hasMouse = true; };
    const onLeave    = () => { hasMouse = false; };
    const onTouch    = e => {
      const t = e.touches?.[0];
      if (t) { [mX, mY] = toWorld(t.clientX, t.clientY); hasMouse = true; }
    };
    const onTouchEnd = () => { hasMouse = false; };
    const onResize   = () => {
      aspect = window.innerWidth / window.innerHeight;
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.left = -aspect; camera.right = aspect;
      camera.updateProjectionMatrix();
      aspectUniform.value = aspect;
    };
    const onVis = () => {
      if (document.hidden) { cancelAnimationFrame(raf); raf = 0; }
      else if (!raf)        { raf = requestAnimationFrame(frame); }
    };

    window.addEventListener('mousemove',          onMove);
    window.addEventListener('mouseleave',         onLeave);
    window.addEventListener('resize',             onResize);
    window.addEventListener('touchmove',          onTouch,    { passive: true });
    window.addEventListener('touchend',           onTouchEnd);
    document.addEventListener('visibilitychange', onVis);

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose(); geo.dispose(); mat.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
      window.removeEventListener('mousemove',          onMove);
      window.removeEventListener('mouseleave',         onLeave);
      window.removeEventListener('resize',             onResize);
      window.removeEventListener('touchmove',          onTouch);
      window.removeEventListener('touchend',           onTouchEnd);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none' }}
    />
  );
};

export default ArtBackground;
