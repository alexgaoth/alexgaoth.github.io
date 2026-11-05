// The homepage's scroll → visual-state mapping for its DOM choreography (the
// return stage's reveal and the progress track; the page script in
// index.astro). Every value is a pure function of scrollY, so scrolling back
// runs the page in reverse. The fractal layer (lib/qjulia/home.js) measures
// its own anchors.

export const MOBILE_BREAKPOINT = 768;

// Scroll distance, in viewport heights, given to the empty return stage the
// directory rises through. The page script sizes the spacer to match.
export const RETURN_VH = 1.1;

// Scroll, in viewport heights, the first title waits at rest before it rises:
// the "o" turns into the ball here, so the letter and the ball stay together
// (about one wheel notch). Read by the page script and lib/qjulia/home.js.
export const TITLE_HOLD_VH = 0.15;

const clamp01 = (n) => (n < 0 ? 0 : n > 1 ? 1 : n);

/** Desktop, and the visitor has not asked for less motion. */
export function motionEnabled() {
  if (typeof window === 'undefined') return false;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return false;
  return window.innerWidth >= MOBILE_BREAKPOINT;
}

/** Grabs the elements the scroll math measures against. */
export function readStage() {
  return {
    returnSpacer: document.querySelector('.return-spacer'),
  };
}

/**
 * The page state for one scroll position:
 *
 *   ret         0 → 1 across the return stage, where the directory rises
 *   returnRect  the return spacer's rect
 *   total       0 → 1 from the top to the end of the return stage, for the
 *               progress track
 */
export function computeState(stage, vh = window.innerHeight, y = window.scrollY) {
  const returnRect = stage.returnSpacer
    ? stage.returnSpacer.getBoundingClientRect()
    : { top: vh * 9, bottom: vh * 9 };
  const ret = clamp01((vh * 0.25 - returnRect.top) / (vh * 1.25));
  return {
    ret,
    returnRect,
    total: clamp01(y / Math.max(1, returnRect.bottom + y)),
  };
}

/**
 * rAF-throttled scroll/resize subscription. Returns an unsubscribe function.
 * Callers get the computed state; nobody recomputes scroll math themselves.
 */
export function subscribe(onState, { onResize } = {}) {
  const stage = readStage();
  let queued = false;

  const emit = () => onState(computeState(stage), stage);

  const tick = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      emit();
    });
  };

  const resize = () => {
    if (onResize) onResize(stage);
    emit();
  };

  addEventListener('scroll', tick, { passive: true });
  addEventListener('resize', resize);
  resize();

  return () => {
    removeEventListener('scroll', tick);
    removeEventListener('resize', resize);
  };
}
