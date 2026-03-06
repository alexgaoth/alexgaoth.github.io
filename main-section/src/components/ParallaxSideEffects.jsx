// ── ParallaxSideEffects.jsx ──────────────────────────────────────────────────
// Independent side-animation component for the main page parallax.
// Renders a vertical progress track on the left.
// Edit freely — MainPage only passes scrollProgress + isParallaxActive.
// ─────────────────────────────────────────────────────────────────────────────

// Track occupies 15% → 85% of viewport height
const TRACK_TOP_VH    = 15;
const TRACK_BOTTOM_VH = 85;

const ParallaxSideEffects = ({ scrollProgress, isParallaxActive }) => {
  if (!isParallaxActive) return null;

  const p = scrollProgress;
  const fillPct = p * 100;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      pointerEvents: 'none',
      zIndex: 6,
    }}>

      {/* ── Left: vertical progress track ─────────────────────────────── */}
      <div style={{
        position: 'absolute',
        left: 'clamp(1.2rem, 3vw, 2.8rem)',
        top: `${TRACK_TOP_VH}vh`,
        height: `${TRACK_BOTTOM_VH - TRACK_TOP_VH}vh`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}>
        {/* Track rail */}
        <div style={{
          position: 'relative',
          width: '1px',
          height: '100%',
          background: 'rgba(0,0,0,0.10)',
        }}>
          {/* Fill */}
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: `${fillPct}%`,
            background: 'rgba(0,0,0,0.45)',
            transition: 'height 0.05s linear',
          }} />
        </div>
      </div>
    </div>
  );
};

export default ParallaxSideEffects;
