// The stage: one fixed canvas behind a tall scroll. Scroll position is the
// only input. While the view moves, frames are drawn small and cheap; once it
// stops, the same view is refined at full resolution and the GPU goes idle.
// Shared by the hero page (main.js) and the shot reel (shots.js).
import { Renderer, escapeRadius } from './renderer.js';

const MOBILE = 768;           // narrower screens keep the still image
const DPR_CAP = 1.5;          // full-resolution refinement never exceeds this
const REST_DELAY = 110;       // ms without movement before refining
const REST_SAMPLES = 24;      // jittered samples averaged at rest
const SMOOTH_MS = 70;         // scroll smoothing time constant
const MIN_SPEED = 0.4;        // px/ms: the glide's floor speed, so it ends in finite time
const FADE_MS = 180;          // motion frame to refined image
const LANDSCAPE = 1.2;        // at or below this aspect ratio, keep the still

const params = new URLSearchParams(location.search);
const debug = params.has('debug');
const canvas = document.getElementById('qj');
const stats = (window.qjStats = { mode: 'loading', scale: 0, samples: 0, frames: [], firstFrameMs: 0, lastInputAt: 0, sharpAt: 0 });

const liveAllowed = () => params.has('force') || (innerWidth >= MOBILE && innerWidth / innerHeight > LANDSCAPE);

function stayOnPoster(reason) {
  stats.mode = 'poster:' + reason;
  if (debug) hud();
}

// scene: the Julia constant and defaults; path: progress 0..1 -> camera;
// onFrame(progress), if given, runs whenever the view moves. glide: false
// follows the scroll exactly, for pages whose DOM must stay in step with the
// view. anyScreen: run on narrow and portrait screens too. stillsOk: the page
// handles reduced motion itself (by cutting between still views), so run
// anyway. Resolves to { snap() }, which cuts straight to the scroll position
// instead of gliding.
export async function start({ scene, path, onFrame, glide = true, anyScreen = false, stillsOk = false }) {
  const allowed = () => anyScreen || liveAllowed();
  if (!stillsOk && matchMedia('(prefers-reduced-motion: reduce)').matches) return stayOnPoster('reduced-motion');
  if (!allowed()) return stayOnPoster(innerWidth < MOBILE ? 'narrow' : 'portrait');
  let r;
  try { r = new Renderer(canvas); } catch { return stayOnPoster('no-webgl2'); }
  if (!r.float) return stayOnPoster('no-float-target');
  // Software GL draws this at seconds per frame; the still is the better page.
  const info = r.gl.getExtension('WEBGL_debug_renderer_info');
  const gpuName = info ? r.gl.getParameter(info.UNMASKED_RENDERER_WEBGL) : '';
  if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(gpuName)) return stayOnPoster('software-gl');
  const t0 = performance.now();
  try { await r.compile(); } catch (e) { console.error(e); return stayOnPoster('compile'); }
  Object.assign(r.scene, scene, { bound: escapeRadius(scene.c) });

  const scrollMax = () => Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const progress = () => Math.min(1, Math.max(0, scrollY / scrollMax()));

  let shown = progress();
  let drawnAt = NaN;           // progress of the last drawn motion frame
  let scale = 0.5;             // motion resolution, adapted to the GPU
  let rows = 0;                // rest rows per frame, adapted to the budget
  let interval = 16.7;         // display frame interval, measured on idle frames
  const idle = [];
  let ema = interval;
  let last = performance.now();
  let lastMove = last;
  let resting = false, restDirty = true, mix = 0;
  let running = false, gaveUp = false, slow = 0, paused = false;

  // The canvas's own box, not the window: a classic scrollbar takes its width
  // out of the canvas but not out of innerWidth, which would squeeze the
  // image and shift it off the page's layout.
  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, DPR_CAP);
    r.setSize(Math.round(canvas.clientWidth * dpr), Math.round(canvas.clientHeight * dpr));
    drawnAt = NaN;
  };
  resize();

  function frame(now) {
    if (paused) { running = false; return; }
    const dt = Math.min(250, now - last);
    last = now;
    r.pollTimers();
    // Glide toward the scroll position: exponential, but never slower than
    // MIN_SPEED, so the tail ends in finite time instead of creeping.
    const target = progress();
    const gap = target - shown;
    const floor = (MIN_SPEED * dt) / scrollMax();
    const step = Math.max(Math.abs(gap) * (1 - Math.exp(-dt / SMOOTH_MS)), floor);
    shown = !glide || Math.abs(gap) <= step ? target : shown + Math.sign(gap) * step;

    if (shown !== drawnAt) {
      // Moving: one cheap frame at the adapted scale, shown at once.
      // Budget by measured GPU time where available, else by frame cadence.
      ema += (dt - ema) * 0.25;
      const cost = r.gpuMs ? r.gpuMs / 0.6 : ema;
      if (cost > Math.max(interval * 6, 100)) scale = 0.28;
      else if (cost > Math.max(interval * 3, 50)) scale = Math.max(0.28, scale * 0.72);
      else if (cost > Math.max(interval * 1.5, 21)) scale = Math.max(0.28, scale * 0.9);
      else if (cost < interval * 1.2) scale = Math.min(0.75, scale * 1.03);
      // Still slow at the smallest scale: a software or very weak GPU. Hand
      // back to the still image rather than stutter.
      slow = scale <= 0.29 && cost > 120 ? slow + 1 : 0;
      if (slow >= 3) {
        gaveUp = true;
        canvas.classList.remove('live');
        return stayOnPoster('slow-gpu');
      }
      r.drawMotion(path(shown), scale);
      r.present(0);
      if (onFrame) onFrame(shown);
      drawnAt = shown;
      lastMove = now;
      resting = false;
      restDirty = true;
      mix = 0;
      stats.mode = 'motion';
      stats.scale = scale;
      if (!stats.firstFrameMs) {
        stats.firstFrameMs = Math.round(now - t0);
        stats.firstFrameNavMs = Math.round(now);
      }
      canvas.classList.add('live');
      stats.frames.push(dt);
      if (stats.frames.length > 4000) stats.frames.shift();
    } else if (restDirty && now - lastMove <= REST_DELAY) {
      // Nothing drawn this frame: a clean sample of the display's cadence.
      idle.push(dt);
      if (idle.length > 31) idle.shift();
      const sorted = [...idle].sort((a, b) => a - b);
      interval = Math.min(34, Math.max(6.9, sorted[sorted.length >> 1]));
    } else if (restDirty) {
      r.restBegin(path(shown));
      rows = rows || Math.ceil(r.h / 2);
      restDirty = false;
      resting = true;
      stats.samples = 0;
      stats.restStart = now;
      stats.sharpAt = 0;
    }

    if (resting) {
      // Refining: as many rows as fit the frame budget, then show the
      // average, fading over from the motion frame once a full pass exists.
      // Nothing moves while refining, so a frame may run long; the cap keeps
      // the next scroll answered within about two display frames.
      if (dt > 34) rows = Math.max(16, Math.floor(rows * 0.7));
      else if (dt < 24) rows = Math.min(r.h, Math.ceil(rows * 1.25));
      // A first full pass that takes seconds means a weak GPU: keep the
      // motion frame rather than grind.
      if (r.sampleIndex === 0 && now - stats.restStart > 3000) {
        resting = false;
        stats.mode = 'idle-unrefined';
      }
      if (r.restStep(rows)) {
        stats.samples = r.sampleIndex;
        if (r.sampleIndex === 1) stats.firstRestMs = Math.round(now - stats.restStart);
      }
      if (r.sampleIndex >= 1) mix = Math.min(1, mix + dt / FADE_MS);
      r.present(mix);
      // When the full-resolution image is fully on screen.
      if (mix >= 1 && !stats.sharpAt) stats.sharpAt = now;
      stats.mode = 'rest';
      if (r.sampleIndex >= REST_SAMPLES && mix >= 1) {
        resting = false;
        stats.mode = 'idle';
        stats.restMs = Math.round(now - stats.restStart);
        stats.doneAt = now;
      }
    }

    if (debug) hud();
    running = resting || shown !== target || restDirty;
    if (running) requestAnimationFrame(frame);
  }

  const wake = () => {
    if (!running && !gaveUp && !paused) { running = true; last = performance.now(); requestAnimationFrame(frame); }
  };
  addEventListener('scroll', () => { stats.lastInputAt = performance.now(); wake(); }, { passive: true });
  addEventListener('resize', () => {
    // Turned to portrait or squeezed narrow: hand back to the still.
    paused = !allowed();
    if (paused) { canvas.classList.remove('live'); stats.mode = 'poster:portrait'; return; }
    resize(); restDirty = true; wake();
  });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) wake(); });
  wake();
  return { snap() { shown = progress(); wake(); } };
}

let hudEl;
function hud() {
  if (!hudEl) {
    hudEl = document.createElement('pre');
    hudEl.className = 'hud';
    document.body.appendChild(hudEl);
  }
  const f = stats.frames.slice(-60);
  const avg = f.length ? f.reduce((a, b) => a + b, 0) / f.length : 0;
  hudEl.textContent = `${stats.mode}  scale ${stats.scale.toFixed(2)}  ${avg ? (1000 / avg).toFixed(0) + ' fps' : ''}  samples ${stats.samples}`;
}
