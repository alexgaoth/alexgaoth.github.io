// CPU twin of the shader's distance estimator, for designing the camera
// path: pick surface points under a pixel and check a path never grazes the
// set. Dev only.
import { cameraBasis } from '../../astro/src/lib/qjulia/renderer.js';

export function de(p, c, slice = 0, iter = 16) {
  let [a, b, cc, d] = [p[0], p[1], p[2], slice];
  let md2 = 1, mz2 = a * a + b * b + cc * cc + d * d;
  for (let i = 0; i < iter; i++) {
    md2 *= 4 * mz2;
    const na = a * a - b * b - cc * cc - d * d + c[0];
    const nb = 2 * a * b + c[1], nc = 2 * a * cc + c[2], nd = 2 * a * d + c[3];
    a = na; b = nb; cc = nc; d = nd;
    mz2 = a * a + b * b + cc * cc + d * d;
    if (mz2 > 256) break;
  }
  return 0.25 * Math.sqrt(mz2 / md2) * Math.log(mz2);
}

// Ray through normalised screen point (x, y in half-heights, y up).
export function pick(cam, x, y, c, aspect = 1.6) {
  const b = cameraBasis(cam);
  const th = Math.tan((cam.fov * Math.PI) / 360);
  const sx = x - (cam.offset ? cam.offset[0] : 0), sy = y - (cam.offset ? cam.offset[1] : 0);
  let rd = [sx * th * b.right[0] + sy * th * b.up[0] + b.fwd[0], sx * th * b.right[1] + sy * th * b.up[1] + b.fwd[1], sx * th * b.right[2] + sy * th * b.up[2] + b.fwd[2]];
  const l = Math.hypot(...rd); rd = rd.map((v) => v / l);
  let t = 0;
  for (let i = 0; i < 2000; i++) {
    const p = [cam.pos[0] + t * rd[0], cam.pos[1] + t * rd[1], cam.pos[2] + t * rd[2]];
    const h = de(p, c);
    if (h < 1e-4) return { t, p };
    t += h * 0.9;
    if (t > 20) return null;
  }
  return null;
}

// Smallest distance from the camera to the set along a sampled path.
export function clearance(sample, c, n = 400) {
  let worst = { d: Infinity, at: 0 };
  for (let i = 0; i <= n; i++) {
    const cam = sample(i / n);
    const d = de(cam.pos, c);
    if (d < worst.d) worst = { d, at: i / n };
  }
  return worst;
}

// March a ray; returns { t, p } at the first surface hit, or null.
export function castRay(ro, rd, c, iter = 16, tmax = 12) {
  let t = 0;
  for (let i = 0; i < 3000; i++) {
    const p = [ro[0] + t * rd[0], ro[1] + t * rd[1], ro[2] + t * rd[2]];
    const h = de(p, c, 0, iter);
    if (h < 2e-4) return { t, p };
    t += h * 0.9;
    if (t > tmax) return null;
  }
  return null;
}

// Outward surface normal from the distance estimate's gradient.
export function normalAt(p, c, iter = 16, e = 1e-4) {
  const g = [0, 1, 2].map((k) => {
    const a = [...p], b = [...p];
    a[k] += e; b[k] -= e;
    return de(a, c, 0, iter) - de(b, c, 0, iter);
  });
  const l = Math.hypot(...g) || 1;
  return g.map((v) => v / l);
}

// Whether p's orbit stays bounded: inside the filled set.
export function inside(p, c, iter = 40) {
  let [a, b, cc, d] = [p[0], p[1], p[2], 0];
  for (let i = 0; i < iter; i++) {
    const na = a * a - b * b - cc * cc - d * d + c[0];
    const nb = 2 * a * b + c[1], nc = 2 * a * cc + c[2], nd = 2 * a * d + c[3];
    a = na; b = nb; cc = nc; d = nd;
    if (a * a + b * b + cc * cc + d * d > 16) return false;
  }
  return true;
}

// The distance estimate on a turned or shifted slice: q = M (p, slice), with
// M the column-major matrix the shader gets as uRot.
export function deLift(p, c, M, slice = 0, iter = 16) {
  const v = [p[0], p[1], p[2], slice];
  let [a, b, cc, d] = [0, 1, 2, 3].map((r) => M[r] * v[0] + M[4 + r] * v[1] + M[8 + r] * v[2] + M[12 + r] * v[3]);
  let md2 = 1, mz2 = a * a + b * b + cc * cc + d * d;
  for (let i = 0; i < iter; i++) {
    md2 *= 4 * mz2;
    const na = a * a - b * b - cc * cc - d * d + c[0];
    const nb = 2 * a * b + c[1], nc = 2 * a * cc + c[2], nd = 2 * a * d + c[3];
    a = na; b = nb; cc = nc; d = nd;
    mz2 = a * a + b * b + cc * cc + d * d;
    if (mz2 > 256) break;
  }
  return 0.25 * Math.sqrt(mz2 / md2) * Math.log(mz2);
}
