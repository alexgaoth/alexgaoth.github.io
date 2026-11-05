// Routes a sequence of held shots so no move puts the camera inside visible
// solid, by adding via points to shots[i].vias (the move from shot i to the
// next). Used by make-home.mjs; the qjulia reel (~/Documents/qjulia) has its
// own copy.
//
// shots: [{ st, vias: [], drift? }], stations as path.js takes them.
import { SCENE } from '../../astro/src/lib/qjulia/scene.js';
import { makePath } from '../../astro/src/lib/qjulia/path.js';
import { rot4 } from '../../astro/src/lib/qjulia/renderer.js';
import { deLift } from './qjcpu.mjs';

const C = SCENE.c;
const mid = (a, b) => a.map((v, k) => (v + b[k]) / 2);
const camOf = (st) => makePath([{ ...st, at: 0 }, { ...st, at: 1 }])(0);
const fib = Array.from({ length: 300 }, (_, i) => { const y = 1 - (2 * i + 1) / 300, r = Math.sqrt(1 - y * y), a = i * 2.399963; return [r * Math.cos(a), y, r * Math.sin(a)]; });

// Shot i holds over [i, i + 0.4] and moves to shot i + 1, its vias evenly
// spaced: the same curves the pages draw, whatever their timing.
function path(shots) {
  const stations = [];
  shots.forEach((s, i) => {
    stations.push({ ...s.st, at: i, hold: 0.4, drift: s.drift });
    s.vias.forEach((v, k) => stations.push({ ...v, at: i + 0.4 + ((k + 1) / (s.vias.length + 1)) * 0.6 }));
  });
  return makePath(stations, { monotone: true });
}

// Distance from the camera to the solid it can see: infinite on the side of a
// cut plane that is cut away.
function inSolid(cam) {
  if (cam.clip) { const n = cam.clip.n; if (n[0] * cam.pos[0] + n[1] * cam.pos[1] + n[2] * cam.pos[2] > cam.clip.w) return Infinity; }
  return deLift(cam.pos, C, rot4(cam.rot4), cam.slice, 18);
}

// Moves whose camera would sit inside visible solid, unless it cuts the solid
// around itself (near > 0).
function check(shots) {
  const p = path(shots);
  const bad = [];
  for (let i = 0; i < shots.length - 1; i++) {
    let min = Infinity, nearAtMin = 0;
    for (let k = 0; k <= 80; k++) {
      const cam = p(i + k / 80);
      const d = inSolid(cam);
      if (d < min) { min = d; nearAtMin = cam.near; }
    }
    if (min < 0.004 && nearAtMin < 0.05) bad.push({ i, min });
  }
  return bad;
}

// The hop: the camera slides straight out along the most open direction
// (favouring backwards), keeping its view direction, so the move between the
// shot and the hop is the clear segment found here.
function escape(st) {
  const cam = camOf(st), M = rot4(cam.rot4), dS = (q) => deLift(q, C, M, cam.slice, 18);
  const d0 = dS(cam.pos);
  if (d0 > 0.3) return null;
  const back = cam.pos.map((v, k) => v - st.target[k]), bl = Math.hypot(...back);
  let best = null;
  for (const dir of fib) {
    let lo = Infinity, s, ok = false;
    for (s = 0.01; s <= 1.6; s += 0.01) {
      const d = dS(cam.pos.map((v, k) => v + dir[k] * s));
      if (s > 0.03) lo = Math.min(lo, d);
      if (d < Math.min(0.02, 0.7 * d0)) break;
      if (d > 0.3) { ok = true; break; }
    }
    if (!ok) continue;
    const score = lo + (0.02 * (dir[0] * back[0] + dir[1] * back[1] + dir[2] * back[2])) / bl - 0.01 * s;
    if (!best || score > best.score) best = { score, off: dir.map((x) => x * s) };
  }
  if (!best) return null;
  return { ...st, target: st.target.map((v, k) => v + best.off[k]), aperture: 0 };
}

const swingOut = (a, b) => ({ az: (a.st.az + b.st.az) / 2, el: (a.st.el + b.st.el) / 2, dist: Math.max(2.8, a.st.dist, b.st.dist), target: mid(a.st.target, b.st.target), fov: 45, iter: 18 });

export function route(shots, log = console.log) {
  // Azimuths unwrapped so every swing takes the short way round.
  let prevAz = shots[0].st.az;
  for (const s of shots) {
    for (const st of [s.st, ...s.vias]) {
      st.az = prevAz + ((((st.az - prevAz) % 360) + 540) % 360) - 180;
      prevAz = st.az;
    }
    prevAz += (s.drift && s.drift.az) || 0;
  }
  // First a swing out halfway, pulled back to where the whole object shows;
  // if that is not enough, a short clear hop away from the surface at each
  // close end, so the camera backs out before swinging and dives in along a
  // clear line; as a last resort the move cuts the solid around the camera.
  for (let round = 0; round < 3; round++) {
    const bad = check(shots);
    if (!bad.length) break;
    for (const { i } of bad) {
      const a = shots[i], b = shots[i + 1];
      if (round === 0 && !a.vias.length) {
        a.vias.push(swingOut(a, b));
        log(`move ${i + 1} → ${i + 2}: swings out around the object`);
      } else if (round === 1) {
        const ea = escape(a.st), eb = escape(b.st);
        a.vias = [...(ea ? [ea] : []), ...a.vias, ...(eb ? [eb] : [])];
        log(`move ${i + 1} → ${i + 2}: backs out of ${ea ? 'both ends' : 'the far end'} first`);
      } else if (round === 2) {
        a.vias = a.vias.map((v) => ({ ...v, near: 0.12 }));
        log(`move ${i + 1} → ${i + 2}: cuts the solid around the camera as it passes`);
      }
    }
  }
  for (const { i, min } of check(shots)) log(`STILL INSIDE: move ${i + 1} → ${i + 2}, distance ${min.toFixed(4)}`);
}
