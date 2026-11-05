// The camera path. Scroll is the only input: page progress 0..1 maps to a
// position between stations, and each station holds still for a while so
// text can sit beside it later. Pure function of progress, so scrolling back
// runs it exactly in reverse.
//
// A station orbits a target: position = target + dist * (direction from
// azimuth and elevation). Interpolating the orbit instead of raw positions
// keeps every in-between camera swinging around the object, not through it.

const smooth = (t) => t * t * (3 - 2 * t);
const lerp = (a, b, t) => a + (b - a) * t;

const KEYS = ['az', 'el', 'dist', 'tx', 'ty', 'tz', 'fov', 'roll', 'aperture', 'ox', 'oy', 'iter', 'kx',
  'ku', 'kf', 'slice', 'ra', 'rb', 'near', 'fish', 'ortho', 'clipOn', 'clipW', 'clipAz', 'clipEl'];

// Resolve a station (or via point) to plain numbers.
const flat = (s) => ({
  az: s.az, el: s.el, dist: s.dist,
  tx: s.target[0], ty: s.target[1], tz: s.target[2],
  fov: s.fov, roll: s.roll || 0, aperture: s.aperture || 0,
  ox: (s.offset || [0, 0])[0], oy: (s.offset || [0, 0])[1],
  iter: s.iter || 16,
  kx: s.keySide ?? -0.55,
  ku: s.keyUp ?? 0.72,
  kf: s.keyFront ?? -0.42,
  slice: s.slice ?? 0,
  ra: (s.rot4 || [0, 0])[0], rb: (s.rot4 || [0, 0])[1],
  near: s.near ?? 0,
  fish: s.fish ?? 0,
  ortho: s.ortho ?? 0,
  // A cut plane sweeps in from the edge of the object as clipOn goes 0 -> 1.
  clipOn: s.clip ? 1 : 0,
  clipW: s.clip ? s.clip.w : 0, clipAz: s.clip ? s.clip.az : 0, clipEl: s.clip ? s.clip.el : 0,
});

// stations: [{ at, hold, drift, ...station }] in page progress order. A
// station is reached at `at` and held until `at + hold`, drifting by `drift`
// (same fields, added) so scrolling never feels dead. A station with no hold
// is a via point that a move passes through without stopping.
//
// A hold eases between its two ends and nothing else, so it cannot overshoot.
// A move runs from one hold to the next as a single eased sweep through its
// via points (Hermite curve, tangents from neighbouring knots), so the camera
// stops only where a station holds. With `monotone`, the tangents are limited
// (Fritsch & Carlson 1980) so no value overshoots a knot and turns back.
export function makePath(stations, { monotone = false } = {}) {
  const knots = [];
  for (const s of stations) {
    const k = { ...flat(s), at: s.at, stop: !!s.hold, holdOut: false };
    knots.push(k);
    if (s.hold) {
      const out = { ...k, at: s.at + s.hold, holdOut: true };
      for (const [f, dv] of Object.entries(s.drift || {})) out[f] += dv;
      knots.push(out);
    }
  }
  knots[0].stop = knots[knots.length - 1].stop = true;
  const last = knots.length - 1;

  const tangent = (i, s, e, key) => {
    const lo = Math.max(s, i - 1), hi = Math.min(e, i + 1);
    return (knots[hi][key] - knots[lo][key]) / (knots[hi].at - knots[lo].at);
  };
  const limited = new Map();
  const limitedTangents = (s, e) => {
    if (limited.has(s)) return limited.get(s);
    const T = {};
    for (const key of KEYS) {
      const m = [];
      for (let i = s; i <= e; i++) m.push(tangent(i, s, e, key));
      for (let i = s; i < e; i++) {
        const a = i - s, d = (knots[i + 1][key] - knots[i][key]) / (knots[i + 1].at - knots[i].at);
        if (d === 0) { m[a] = 0; m[a + 1] = 0; continue; }
        if (m[a] / d < 0) m[a] = 0;
        if (m[a + 1] / d < 0) m[a + 1] = 0;
        const al = m[a] / d, be = m[a + 1] / d, r = al * al + be * be;
        if (r > 9) { const t = 3 / Math.sqrt(r); m[a] = t * al * d; m[a + 1] = t * be * d; }
      }
      T[key] = m;
    }
    limited.set(s, T);
    return T;
  };

  return function sample(progress) {
    const p = Math.min(knots[last].at, Math.max(knots[0].at, progress));
    let i = 0;
    while (i < last - 1 && p >= knots[i + 1].at) i++;
    const a = knots[i], b = knots[i + 1];
    const v = {};
    if (b.holdOut) {
      const t = smooth((p - a.at) / (b.at - a.at));
      for (const key of KEYS) v[key] = lerp(a[key], b[key], t);
      return toCamera(v);
    }
    // The move containing this segment: from the stop before to the stop after.
    let s = i; while (!knots[s].stop) s--;
    let e = i + 1; while (!knots[e].stop) e++;
    const t0 = knots[s].at, t1 = knots[e].at;
    const tau = t0 + smooth((p - t0) / (t1 - t0)) * (t1 - t0);
    let j = s;
    while (j < e - 1 && tau >= knots[j + 1].at) j++;
    const k0 = knots[j], k1 = knots[j + 1], d = k1.at - k0.at;
    const u = (tau - k0.at) / d, u2 = u * u, u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
    const T = monotone ? limitedTangents(s, e) : null;
    for (const key of KEYS) {
      const m0 = T ? T[key][j - s] : tangent(j, s, e, key);
      const m1 = T ? T[key][j + 1 - s] : tangent(j + 1, s, e, key);
      v[key] = h00 * k0[key] + h10 * d * m0 + h01 * k1[key] + h11 * d * m1;
    }
    return toCamera(v);
  };
}

// Plane normal from azimuth/elevation; as clipOn rises the plane slides in
// from just outside the object (radius ~1.6) to its resting offset.
function clipPlane(v) {
  if (!(v.clipOn > 0.002)) return null;
  const a = (v.clipAz * Math.PI) / 180, e = (v.clipEl * Math.PI) / 180;
  const n = [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
  const on = Math.min(1, v.clipOn);
  return { n, w: 1.7 + (v.clipW - 1.7) * on };
}

export function toCamera(v) {
  const az = (v.az * Math.PI) / 180, el = (v.el * Math.PI) / 180;
  const dir = [Math.cos(el) * Math.sin(az), Math.sin(el), Math.cos(el) * Math.cos(az)];
  const target = [v.tx, v.ty, v.tz];
  const pos = [target[0] + v.dist * dir[0], target[1] + v.dist * dir[1], target[2] + v.dist * dir[2]];
  return {
    pos, target, fov: v.fov, roll: (v.roll * Math.PI) / 180,
    aperture: Math.max(0, v.aperture), focus: v.dist,
    // Screen-space shift of the subject, as a fraction of the frame height,
    // so a station can sit off-centre and leave room for text.
    offset: [v.ox, v.oy],
    // Orbit iterations: more up close, where finer layers become visible.
    iter: Math.round(v.iter),
    // Where the key light sits across the frame: -0.55 is upper left.
    keySide: v.kx,
    keyUp: v.ku,
    keyFront: v.kf,
    slice: v.slice,
    rot4: [v.ra, v.rb],
    near: Math.max(0, v.near),
    fish: Math.min(1, Math.max(0, v.fish)),
    ortho: Math.min(1, Math.max(0, v.ortho)),
    clip: clipPlane(v),
  };
}

export { lerp, smooth, flat };
