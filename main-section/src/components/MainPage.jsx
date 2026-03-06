import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NowButton  from './NowButton';
import SEO from './SEO';
import ParallaxSideEffects from './ParallaxSideEffects';

// ─── Scroll timeline (progress 0 → 1 over 5× viewport height) ──────────────
const TITLE_RISE_END   = 0.25;  // title reaches top position (slow, deliberate rise)
const CARDS_RISE_START = 0.63;  // cards begin their slow crawl (still off-screen)
const PHRASE_CUTOFF    = 0.73;  // ALL phrases gone; cards accelerate from here
const CARDS_SLOW_FRAC  = 0.06;  // during slow phase, cover only 6% of journey
const SUB_FADE_START   = 0.85;  // subtitle opacity begins
// ─────────────────────────────────────────────────────────────────────────────

const PHRASES = [
  {
    id: 0,
    start: 0.13, peak: 0.22, end: 0.38,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 'clamp(1.38rem, 2.0vw, 1.9rem)',
    mobileFontSize: '1.2rem',
    weight: 500,
    style: 'italic',
    spacing: '0.02em',
    lineHeight: 1.75,
    mobileLineHeight: 1.65,
  },
  {
    id: 1,
    start: 0.36, peak: 0.47, end: 0.60,
    fontFamily: "'Cormorant Garamond', Georgia, serif",
    fontSize: 'clamp(1.32rem, 1.05vw, 0.9rem)',
    mobileFontSize: '0.8rem',
    weight: 450,
    style: 'italic',
    spacing: '0.18em',
    mobileSpacing: '0.05em',
    lineHeight: 1.65,
    mobileLineHeight: 1.75,
  },
];

const MainPage = ({ content }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const parallaxContainerRef = useRef(null);
  // Measures full title section including subtitle (always rendered, no height shift)
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const [parallaxDistance, setParallaxDistance] = useState(0);
  const [isParallaxActive, setIsParallaxActive] = useState(true);
  const [titleHeight, setTitleHeight] = useState(130);

  useEffect(() => {
    const calculateParallaxDistance = () => {
      setParallaxDistance(window.innerHeight * 5);
    };

    const measureTitleHeight = () => {
      if (titleRef.current) {
        setTitleHeight(titleRef.current.offsetHeight);
      }
    };

    calculateParallaxDistance();
    measureTitleHeight();

    const handleResizeMobile = () => setIsMobile(window.innerWidth < 768);

    window.addEventListener('resize', calculateParallaxDistance);
    window.addEventListener('resize', measureTitleHeight);
    window.addEventListener('resize', handleResizeMobile);

    return () => {
      window.removeEventListener('resize', calculateParallaxDistance);
      window.removeEventListener('resize', measureTitleHeight);
      window.removeEventListener('resize', handleResizeMobile);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxDistance === 0) return;
      const rawProgress = window.scrollY / parallaxDistance;
      if (rawProgress >= 1) {
        setIsParallaxActive(false);
        setScrollProgress(1);
      } else {
        setIsParallaxActive(true);
        setScrollProgress(rawProgress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxDistance]);

  const getPagePadding = () => window.innerWidth >= 768 ? 80 : 140;
  const getSidePadding = () => window.innerWidth >= 768 ? 64 : 32;

  const ease = (p) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 3);
  // Quintic ease-out: far more pronounced deceleration as title nears top
  const easeTitle = (p) => 1 - Math.pow(1 - Math.max(0, Math.min(1, p)), 5);

  const getTitleStyle = () => {
    const sidePadding = getSidePadding();

    if (!isParallaxActive) {
      return { position: 'relative', transform: 'none' };
    }

    const titleProgress = scrollProgress / TITLE_RISE_END;
    const eased = easeTitle(titleProgress);
    const pagePadding = getPagePadding();
    const startTop = (window.innerHeight - titleHeight) * 0.5;
    const endTop = pagePadding;
    const currentTop = startTop + (endTop - startTop) * eased;

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      zIndex: 10,
    };
  };

  const getCardsStyle = () => {
    const sidePadding = getSidePadding();

    if (!isParallaxActive) {
      return { position: 'relative', transform: 'none' };
    }

    const pagePadding = getPagePadding();
    const startTop = window.innerHeight + 60;
    const endTop = pagePadding + titleHeight;

    let journeyFraction;
    if (scrollProgress <= CARDS_RISE_START) {
      // Cards are stationary, off-screen below
      journeyFraction = 0;
    } else if (scrollProgress < PHRASE_CUTOFF) {
      // Slow phase: cover only CARDS_SLOW_FRAC of the journey (cards barely peek)
      const p = (scrollProgress - CARDS_RISE_START) / (PHRASE_CUTOFF - CARDS_RISE_START);
      journeyFraction = CARDS_SLOW_FRAC * ease(p);
    } else {
      // Fast phase: accelerate through the remaining (1 - CARDS_SLOW_FRAC) of journey
      const p = (scrollProgress - PHRASE_CUTOFF) / (1 - PHRASE_CUTOFF);
      journeyFraction = CARDS_SLOW_FRAC + (1 - CARDS_SLOW_FRAC) * ease(p);
    }

    const currentTop = startTop + (endTop - startTop) * journeyFraction;

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      zIndex: 1,
    };
  };

  const getContainerStyle = () => {
    if (isParallaxActive) {
      return {
        minHeight: `${parallaxDistance + window.innerHeight}px`,
        position: 'relative',
      };
    }
    return {
      paddingTop: `${parallaxDistance}px`,
      position: 'relative',
    };
  };

  const getFooterStyle = () => {
    if (!isParallaxActive) return {};
    const sidePadding = getSidePadding();
    return {
      position: 'absolute',
      top: `${-window.innerHeight * 0.5}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      zIndex: 0,
    };
  };

  const getPhraseOpacity = (phrase) => {
    const p = scrollProgress;
    if (p <= phrase.start || p >= phrase.end) return 0;
    if (p <= phrase.peak) return (p - phrase.start) / (phrase.peak - phrase.start);
    return 1 - (p - phrase.peak) / (phrase.end - phrase.peak);
  };

  // Subtitle: always at natural height (no layout shift), only opacity changes
  const subtitleOpacity = isParallaxActive
    ? Math.max(0, Math.min(1, (scrollProgress - SUB_FADE_START) / (1 - SUB_FADE_START)))
    : 1;

  const hintOpacity = scrollProgress <= 0.07 ? 1 - scrollProgress / 0.07 : 0;

  return (
    <>
      <SEO
        title="Alex Gao — Student Builder"
        description="Alex Gao (alexgaoth). Student builder at UCSD."
        keywords="Alex Gao, alexgaoth, Student Builder, UCSD"
        url="https://app.alexgaoth.com/"
      />
      <div className="page-container">
        <NowButton />

        {/* ── Side effects — independent component ── */}
        <ParallaxSideEffects scrollProgress={scrollProgress} isParallaxActive={isParallaxActive} />

        {/* ── Phrase overlay — fixed, only during parallax ── */}
        {isParallaxActive && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 8 }}>

            {/* Scroll hint */}
            <div style={{
              position: 'absolute',
              bottom: '2.5rem',
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.6rem',
              opacity: hintOpacity,
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '0.6rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                color: '#000',
                opacity: 0.38,
              }}>scroll</span>
              <div className="scroll-line-indicator" />
            </div>

            {/* Phrases — end by PHRASE_CUTOFF so they never overlap the rising cards */}
            {PHRASES.map(phrase => {
              const opacity = getPhraseOpacity(phrase);
              const fontSize    = isMobile && phrase.mobileFontSize    ? phrase.mobileFontSize    : phrase.fontSize;
              const spacing     = isMobile && phrase.mobileSpacing     ? phrase.mobileSpacing     : phrase.spacing;
              const lineHeight  = isMobile && phrase.mobileLineHeight  ? phrase.mobileLineHeight  : phrase.lineHeight;
              return (
                <div
                  key={phrase.id}
                  style={{
                    position: 'absolute',
                    top: '54%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                    width: 'calc(100vw - 6rem)',
                    maxWidth: '960px',
                    opacity,
                  }}
                >
                  <p style={{
                    fontFamily: phrase.fontFamily,
                    fontSize,
                    fontWeight: phrase.weight,
                    fontStyle: phrase.style,
                    letterSpacing: spacing,
                    lineHeight,
                    margin: 0,
                    color: '#000',
                  }}>
                    {phrase.id === 0 && "this a directory of things I find necessary or interesting to share about myself and how I've interacted with the world."}
                    {phrase.id === 1 && <>
                      Please look through around the site, there might just be something that inerest you. If that is the case, you very much should contact me via{' '}
                      <a
                        href="https://alexgaoth.com/#contact"
                        style={{
                          color: 'inherit',
                          textDecoration: 'underline',
                          pointerEvents: 'auto',
                        }}
                      >all these methods</a>
                    </>}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        <div
          className="parallax-container"
          ref={parallaxContainerRef}
          style={getContainerStyle()}
        >
          <div className="content-wrapper">

            {/* ── Title section: h1 + always-rendered subtitle ── */}
            <div
              className="title-section-parallax"
              ref={titleRef}
              style={getTitleStyle()}
            >
              <h1 className="title-main">this is alex gaoth's directory</h1>
              {/*
                Subtitle is always at its natural height — never collapsed.
                Since this element is position:fixed during parallax, its
                height has zero effect on document flow. Only opacity changes,
                so there is no layout shift when parallax ends.
              */}
              <div className="title-sub" style={{
                opacity: subtitleOpacity,
                paddingTop: '0.4rem',
              }}>
                <p>I am alex gao, the additional 'th' is here so you can find me easier</p>
                <p className='reverse-hidden'>'th' is the initials of my chinese first name, and u can find me elsewhere all by alexgaoth</p>
                <p className="hidden">I spy a mobile user - this site is better on desktop</p>
              </div>
            </div>

            {/* ── Cards section ── */}
            <div
              className="cards-section-parallax"
              ref={cardsRef}
              style={getCardsStyle()}
            >
              <div className="grid-2col">
                {Object.entries(content).map(([key, data]) => (
                  <Link
                    key={key}
                    to={`/${key}`}
                    className="card"
                  >
                    <div className="card-image">
                      <img
                        src={process.env.PUBLIC_URL + data.previewImage}
                        alt={`${data.title} preview`}
                      />
                    </div>
                    <h2 className="title-card">{data.title}</h2>
                    <p className="card-description">
                      {key === 'resume' && "My professional experience and skills"}
                      {key === 'projects' && "Creative projects funded by my relentless mind"}
                      {key === 'thoughts' && "Ideas worth saying - maybe worth reading"}
                      {key === 'quotes' && "The good and the bad"}
                    </p>
                  </Link>
                ))}
              </div>
            </div>

            <div style={{ ...getFooterStyle(), display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '5rem' }}>
              <a
                href="https://alexgaoth.com/#contact"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  border: '1px solid #000',
                  padding: '0.6rem 1.2rem',
                  textDecoration: 'none',
                  color: 'inherit',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                  transition: 'background 0.25s ease, color 0.25s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#000'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={e => { e.currentTarget.style.background = ''; e.currentTarget.style.color = 'inherit'; }}
              >
                contact me &nbsp;·&nbsp; stay up to date
              </a>
              <div className="footer">
                <p>this page is written with React @2022 (now deprecated)</p>
                <p>No rights reserved – this work by alex is free to use for any purpose.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
