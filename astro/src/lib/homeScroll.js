// Single source of truth for the homepage's scroll → visual-state mapping.
//
// Every value below is a pure function of scrollY, so scrolling back runs the
// page in reverse. Today the only consumer is the DOM choreography (the
// inline script in index.astro); a visual layer behind the panels would be
// the second, and `turn` / `unfold` exist for exactly that — a normalised
// driver so a scene never has to do scroll math of its own.

export const MOBILE_BREAKPOINT = 768;

// Scroll distance, in viewport heights, given to the two empty stages.
// The inline script sizes the real spacers to match.
export const INTRO_VH = 1.6;
export const RETURN_VH = 1.1;

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
    panels: [...document.querySelectorAll('.rail-panel')],
    cards: [...document.querySelectorAll('.grid-2col .card')],
    introSpacer: document.querySelector('.intro-spacer'),
    returnSpacer: document.querySelector('.return-spacer'),
  };
}

/**
 * The whole page state for one scroll position. This object *is* the scene
 * contract: a style reads these numbers and draws. It never touches the DOM,
 * never listens to scroll, and holds no state of its own, so scrolling
 * backwards runs any style exactly in reverse.
 *
 *   acts    per-act progress, 0 → 1, one entry per act (always 3)
 *   turn    the sum of those, 0 → 3 — a single monotonic driver
 *   unfold  0 → 1 across the return stage, where the finale resolves
 *   finale  where the four directory cards actually are, in normalised device
 *           coordinates (−1..1, y up), measured from the DOM
 *
 * `finale` exists so a style never has to guess where the cards are. Hand-tuned
 * viewport fractions land correctly under one camera and wrongly under every
 * other, and silently drift the moment the grid's CSS changes.
 *
 * Note the shape of `acts`: an act's progress completes as its panel *enters*
 * the viewport and then sits at 1 for as long as the reader is reading it. So
 * `turn` climbs during transitions and plateaus in between. Styles should
 * treat integer turn values as the resting state for act (turn − 1), not as a
 * moment of transition.
 */
export function computeState(stage, vh = window.innerHeight, y = window.scrollY) {
  const introH = vh * INTRO_VH;

  // panels sweep a uniform window: entering at the viewport bottom → 20% up
  const acts = stage.panels.map((panel) => {
    const rect = panel.getBoundingClientRect();
    return clamp01((vh - rect.top) / (vh * 0.8));
  });

  const returnRect = stage.returnSpacer
    ? stage.returnSpacer.getBoundingClientRect()
    : { top: vh * 9, bottom: vh * 9 };
  const ret = clamp01((vh * 0.25 - returnRect.top) / (vh * 1.25));

  // Card centres in NDC, so any style — orthographic or perspective, at any
  // zoom — can put its finale marks exactly on them.
  const finale = stage.cards.map((card) => {
    const r = card.getBoundingClientRect();
    const x = ((r.left + r.width / 2) / innerWidth) * 2 - 1;
    const y = -(((r.top + r.height / 2) / innerHeight) * 2 - 1);
    const w = (r.width / innerWidth) * 2;
    const h = (r.height / innerHeight) * 2;
    return {
      x,
      y,
      w,
      h,
      // Where a mark can sit and still be seen. The canvas is behind the DOM,
      // so anything landing on a card is hidden the moment that card has an
      // opaque image — which most of them do. The gutter outside the card's
      // outer edge is always clear.
      markX: x + Math.sign(x || 1) * (w / 2 + 0.055),
      markY: y,
    };
  });

  return {
    // intro title rise (0 → 1 over the first 55% of the intro stage) and the
    // intro's own overall progress, used for its fade-out
    rise: clamp01(y / (introH * 0.55)),
    intro: clamp01(y / introH),
    acts,
    finale,
    ret,
    returnRect,
    // the scene's driver
    turn: acts.reduce((sum, p) => sum + p, 0),
    unfold: ret,
    // left-edge progress track spans intro + rails + return
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
