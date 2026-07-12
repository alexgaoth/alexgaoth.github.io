import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import NowButton from '../components/NowButton';
import ParallaxSideEffects from '../components/ParallaxSideEffects';
import SEO from '../components/SEO';
import HomePreviewRail from '../components/main/HomePreviewRail';
import MainPageCards from '../components/main/MainPageCards';
import MainPageFooter from '../components/main/MainPageFooter';
import MainPageOverlay from '../components/main/MainPageOverlay';
import MainPageTitle from '../components/main/MainPageTitle';
import { APP_ROUTES, SITE } from '../config/site';

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

  // Title fades out in the last 30% of the intro scroll (after rising is complete)
  const inIntroProgress = Math.min(1, scrollY / introH);
  const titleOpacity    = Math.max(0, 1 - Math.max(0, (inIntroProgress - 0.7) / 0.3));

  const titleStyle = {
    position: 'fixed',
    top: `${titleTop}px`,
    left: '50%',
    transform: 'translateX(-50%)',
    maxWidth: '1152px',
    width: `calc(100% - ${sidePad}px)`,
    zIndex: 10,
    opacity: titleOpacity,
  };

  // Return stage: overlay text plays while the directory scrolls naturally
  // into view from below. returnH is the extra spacer above the directory
  // that gives the text phrases their scroll distance.
  const returnH        = winH * 1.1;
  const returnStart    = introH + winH * 3;
  const returnProgress = Math.min(1, Math.max(0, (scrollY - returnStart) / returnH));
  const inReturn       = scrollY >= returnStart && returnProgress < 1;
  // Ease used for the directory's entrance translateY — only activates in back half
  const cardP    = Math.max(0, (returnProgress - 0.5) / 0.5);
  const cardEase = 1 - Math.pow(1 - cardP, 3);

  // Left-edge progress rail covers intro + 3 panels + return spacer
  const totalTracked    = introH + winH * 3 + returnH;
  const overallProgress = Math.min(1, scrollY / totalTracked);

  // Scroll hint: appears after 5 s idle, hidden immediately on scroll
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

  // skipParallax: used when navigating back to home — skip past the intro
  useEffect(() => {
    if (location.state?.skipParallax && introH > 0) {
      window.scrollTo({ top: introH, behavior: 'instant' });
    }
  }, [introH, location.state]);

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
        style={{ backgroundColor: '#fff' }}
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
        {/* Title always mounted so titleRef stays attached for height measurement.
            opacity:0 + pointerEvents:none makes it inert once the intro scroll completes. */}
        <div style={{ height: `${introH}px`, position: 'relative' }}>
          <MainPageTitle
            sectionRef={titleRef}
            style={{ ...titleStyle, pointerEvents: titleOpacity > 0 ? 'auto' : 'none' }}
            subtitleOpacity={subtitleOpacity}
          />
        </div>

        {/* ── Preview panels ─────────────────────────────────────────────────
            Real scrollable sections, full viewport width.
            No fixed positioning, no translateY tricks. */}
        <HomePreviewRail isMobile={isMobile} />

        {/* ── Return stage spacer ────────────────────────────────────────────
            Scroll distance for the MainPageOverlay text phrases.
            The directory below scrolls naturally into view through this space. */}
        <div style={{ height: `${returnH}px` }} />

        {/* ── Return overlay (floating text phrases, z-index above everything) */}
        {inReturn && (
          <MainPageOverlay
            isMobile={isMobile}
            isParallaxActive
            scrollProgress={returnProgress}
          />
        )}

        {/* ── Directory ─────────────────────────────────────────────────────
            Single render in normal document flow — no duplicate, no fixed
            overlay, no visibility hacks. It scrolls into view naturally as
            the user moves through the return spacer above. The fade + slight
            translateY are driven by returnProgress for a smooth entrance. */}
        <div
          className="content-wrapper"
          style={{
            paddingTop: '2.5rem',
            paddingBottom: '3rem',
            opacity: Math.min(1, Math.max(0, (returnProgress - 0.5) * 2)),
            transform: `translateY(${Math.max(0, (1 - cardEase) * 28)}px)`,
          }}
        >
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
