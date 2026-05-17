import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NowButton from '../components/NowButton';
import ParallaxSideEffects from '../components/ParallaxSideEffects';
import SEO from '../components/SEO';
import HomePreviewRail from '../components/main/HomePreviewRail';
import MainPageCards from '../components/main/MainPageCards';
import MainPageFooter from '../components/main/MainPageFooter';
import MainPageTitle from '../components/main/MainPageTitle';
import { APP_ROUTES, SITE } from '../config/site';

// KNOWN panel background rgb values — used for the scroll-driven bg fade
const CREAM = [235, 225, 200];

const MainPage = ({ content }) => {
  const [scrollY, setScrollY] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const [winH, setWinH] = useState(() => window.innerHeight);
  const titleRef = useRef(null);
  const [titleHeight, setTitleHeight] = useState(130);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    const onResize = () => {
      setIsMobile(window.innerWidth < 768);
      setWinH(window.innerHeight);
      if (titleRef.current) setTitleHeight(titleRef.current.offsetHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    onResize();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  const navH    = isMobile ? 140 : 80;
  const sidePad = isMobile ? 32 : 64;

  // Intro section: provides scroll distance for the title-rise animation.
  // The title rises from vertical centre to the nav bar during the first
  // 55% of the intro scroll, then stays pinned.
  const introH      = winH * 1.6;
  const titleRiseBy = introH * 0.55;
  const tp          = Math.min(1, scrollY / titleRiseBy);
  const easedTp     = 1 - Math.pow(1 - tp, 5);
  const startTop    = (winH - titleHeight) * 0.5;
  const titleTop    = startTop + (navH - startTop) * easedTp;
  const subtitleOpacity = Math.max(0, (tp - 0.8) / 0.2);

  const titleStyle = {
    position: 'fixed',
    top: `${titleTop}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '1152px',
    width: `calc(100% - ${sidePad}px)`,
    zIndex: 10,
  };

  // Background fade: white → cream → white as the KNOWN panel scrolls through.
  // Each panel is 100 vh. rawPanelT counts viewport-heights since panels began.
  // panelIndex 0 = BUILT centre, 1 = KNOWN centre, 2 = NOW centre.
  const rawPanelT  = (scrollY - introH) / winH;
  const panelIndex = rawPanelT - 0.5;
  const creamness  = Math.max(0, 1 - Math.abs(panelIndex - 1));
  const pageBg     = `rgb(${Math.round(255 + (CREAM[0] - 255) * creamness)},${Math.round(255 + (CREAM[1] - 255) * creamness)},${Math.round(255 + (CREAM[2] - 255) * creamness)})`;

  // Left-edge scroll progress indicator covers intro + 3 panels
  const totalTracked    = introH + winH * 3;
  const overallProgress = Math.min(1, scrollY / totalTracked);

  // Scroll hint: appears after 5 s idle, fades out as soon as user scrolls
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  useEffect(() => {
    let t;
    const arm = () => {
      clearTimeout(t);
      setScrollHintVisible(false);
      t = setTimeout(() => setScrollHintVisible(true), 5000);
    };
    arm();
    window.addEventListener('scroll', arm, { passive: true });
    return () => { clearTimeout(t); window.removeEventListener('scroll', arm); };
  }, []);
  const hintOpacity = scrollY < winH * 0.12 ? 1 - scrollY / (winH * 0.12) : 0;

  // skipParallax: used when navigating back to home — skip past the intro
  useEffect(() => {
    if (location.state?.skipParallax && introH > 0) {
      window.scrollTo({ top: introH, behavior: 'instant' });
    }
  }, [introH, location.state]);

  const inIntro = scrollY < introH;

  return (
    <>
      <SEO
        title={SITE.title}
        description={SITE.description}
        keywords={SITE.keywords}
        path={APP_ROUTES.home}
      />

      <div
        className="page-container"
        style={{ backgroundColor: pageBg, transition: 'background-color 0.3s ease' }}
      >
        <NowButton />

        {/* Scroll-progress rail on the left edge */}
        <ParallaxSideEffects
          scrollProgress={overallProgress}
          isParallaxActive={scrollY < totalTracked}
        />

        {/* Scroll hint shown when idle */}
        {scrollHintVisible && (
          <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 8 }}>
            <div style={{
              position: 'absolute', bottom: '2.5rem', left: '50%', transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.6rem',
              opacity: hintOpacity,
            }}>
              <span style={{
                fontFamily: "'Space Mono', monospace", fontSize: '0.6rem',
                letterSpacing: '0.28em', textTransform: 'uppercase', color: '#000', opacity: 0.38,
              }}>scroll</span>
              <div className="scroll-line-indicator" />
            </div>
          </div>
        )}

        {/* ── Intro section ──────────────────────────────────────────────────
            Empty space that gives the title-rise animation its scroll distance.
            The title itself is fixed-position and driven by scrollY above. */}
        <div style={{ height: `${introH}px`, position: 'relative' }}>
          {inIntro && (
            <MainPageTitle
              sectionRef={titleRef}
              style={titleStyle}
              subtitleOpacity={subtitleOpacity}
            />
          )}
        </div>

        {/* ── Preview panels ─────────────────────────────────────────────────
            Real scrollable sections, full viewport width.
            No fixed positioning, no translateY tricks. */}
        <HomePreviewRail isMobile={isMobile} />

        {/* ── Directory ─────────────────────────────────────────────────────
            Title reappears in static flow, followed by the 2×2 card grid. */}
        <div className="content-wrapper" style={{ paddingTop: '2.5rem', paddingBottom: '3rem' }}>
          <MainPageTitle
            style={{ position: 'relative', transform: 'none' }}
            subtitleOpacity={1}
          />
          <MainPageCards content={content} />
          <MainPageFooter />
        </div>
      </div>
    </>
  );
};

export default MainPage;
