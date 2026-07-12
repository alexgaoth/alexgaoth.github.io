const PHRASES = [
  {
    id: 0,
    label: '// 01',
    start: 0.0,
    peak: 0.10,
    end: 0.30,
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.82rem',
    mobileFontSize: '0.72rem',
    weight: 400,
    style: 'normal',
    spacing: '0.01em',
    lineHeight: 1.85,
    mobileLineHeight: 1.8,
  },
  {
    id: 1,
    label: '// 02',
    start: 0.22,
    peak: 0.35,
    end: 0.50,
    fontFamily: "'Space Mono', monospace",
    fontSize: '0.82rem',
    mobileFontSize: '0.72rem',
    weight: 400,
    style: 'normal',
    spacing: '0.01em',
    lineHeight: 1.85,
    mobileLineHeight: 1.8,
  },
];

function getPhraseOpacity(scrollProgress, phrase) {
  if (scrollProgress <= phrase.start || scrollProgress >= phrase.end) {
    return 0;
  }

  if (scrollProgress <= phrase.peak) {
    return (scrollProgress - phrase.start) / (phrase.peak - phrase.start);
  }

  const fadeProgress = (scrollProgress - phrase.peak) / (phrase.end - phrase.peak);
  return 1 - Math.pow(fadeProgress, 1.45);
}

const MainPageOverlay = ({
  isMobile,
  isParallaxActive,
  scrollProgress,
}) => {
  if (!isParallaxActive) {
    return null;
  }

  return (
    <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 8 }}>

      {PHRASES.map((phrase) => {
        const opacity = getPhraseOpacity(scrollProgress, phrase);
        const fontSize = isMobile && phrase.mobileFontSize ? phrase.mobileFontSize : phrase.fontSize;
        const lineHeight = isMobile && phrase.mobileLineHeight ? phrase.mobileLineHeight : phrase.lineHeight;

        return (
          <div
            key={phrase.id}
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(640px, calc(100vw - 4rem))',
              opacity,
              borderLeft: '1px solid rgba(0,0,0,0.18)',
              paddingLeft: '1.25rem',
            }}
          >
            <span style={{
              display: 'block',
              fontFamily: "'Space Mono', monospace",
              fontSize: '0.74rem',
              letterSpacing: '0.1em',
              color: 'rgba(0,0,0,0.35)',
              marginBottom: '0.6rem',
            }}>{phrase.label}</span>
            <p style={{
              fontFamily: phrase.fontFamily,
              fontSize,
              fontWeight: phrase.weight,
              fontStyle: phrase.style,
              letterSpacing: phrase.spacing,
              lineHeight,
              margin: 0,
              color: '#000',
            }}>
              {phrase.id === 0 && 'this site is an index of things i find worth sharing. look around — there might just be something that interests you. '}
              {phrase.id === 1 && (
                <>
                  if you found things here interesting, i will be just as interesting in person. <br />
                  reach me{' '}
                  <a
                    href="https://intro.alexgaoth.com/#contact"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      color: 'inherit',
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                      pointerEvents: 'auto',
                    }}
                  >
                    in all these different ways
                  </a>
                  {' '}
                </>
              )}
            </p>
          </div>
        );
      })}
    </div>
  );
};

export default MainPageOverlay;
