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

const TITLE_RISE_END = 0.25;
const CARDS_RISE_START = 0.63;
const PHRASE_CUTOFF = 0.73;
const CARDS_SLOW_FRAC = 0.06;
const SUB_FADE_START = 0.85;
const PREVIEW_START = 0.22;
const PREVIEW_END = 0.54;
const RETURN_START = 0.54;

const MainPage = ({ content }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  const location = useLocation();
  const titleRef = useRef(null);
  const [parallaxDistance, setParallaxDistance] = useState(0);
  const [isParallaxActive, setIsParallaxActive] = useState(true);
  const [titleHeight, setTitleHeight] = useState(130);

  useEffect(() => {
    const calculateParallaxDistance = () => {
      setParallaxDistance(window.innerHeight * 3.3);
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
    if (location.state?.skipParallax && parallaxDistance > 0) {
      window.scrollTo({ top: parallaxDistance, behavior: 'instant' });
    }
  }, [parallaxDistance, location.state]);

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
  const clamp01 = (p) => Math.max(0, Math.min(1, p));
  const getSegmentProgress = (progress, start, end) => clamp01((progress - start) / (end - start));

  const introProgress = getSegmentProgress(scrollProgress, 0, PREVIEW_START);
  const previewProgress = getSegmentProgress(scrollProgress, PREVIEW_START, PREVIEW_END);
  const returnProgress = getSegmentProgress(scrollProgress, RETURN_START, 1);

  const isIntroStage = isParallaxActive && scrollProgress < PREVIEW_START;
  const isPreviewStage = isParallaxActive && scrollProgress >= PREVIEW_START && scrollProgress < PREVIEW_END;
  const isReturnStage = isParallaxActive && scrollProgress >= RETURN_START;

  const getTitleStyle = (progressValue) => {
    const sidePadding = getSidePadding();
    const titleProgress = progressValue / TITLE_RISE_END;
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

  const getPreviewStyle = () => {
    const sidePadding = getSidePadding();
    const pagePadding = getPagePadding();
    const settleProgress = ease(clamp01(previewProgress / 0.18));
    const exitProgress = ease(clamp01((previewProgress - 0.88) / 0.12));
    const currentTop = pagePadding + (1 - settleProgress) * 72;
    const currentOpacity = Math.max(0, Math.min(1, settleProgress * (1 - exitProgress)));

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      height: `${Math.max(window.innerHeight - pagePadding - 28, 420)}px`,
      zIndex: 1,
      opacity: currentOpacity,
    };
  };

  const getReturnCardsStyle = () => {
    const sidePadding = getSidePadding();
    const pagePadding = getPagePadding();
    const startTop = window.innerHeight + 60;
    const endTop = pagePadding + titleHeight;

    let journeyFraction;
    if (returnProgress <= CARDS_RISE_START) {
      journeyFraction = 0;
    } else if (returnProgress < PHRASE_CUTOFF) {
      const p = (returnProgress - CARDS_RISE_START) / (PHRASE_CUTOFF - CARDS_RISE_START);
      journeyFraction = CARDS_SLOW_FRAC * ease(p);
    } else {
      const p = (returnProgress - PHRASE_CUTOFF) / (1 - PHRASE_CUTOFF);
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

  const getFooterStyle = () => {
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

  const introSubtitleOpacity = isIntroStage
    ? Math.max(0, Math.min(1, (introProgress - SUB_FADE_START) / (1 - SUB_FADE_START)))
    : 0;
  const returnSubtitleOpacity = isReturnStage
    ? Math.max(0, Math.min(1, (returnProgress - SUB_FADE_START) / (1 - SUB_FADE_START)))
    : 0;

  // Scroll hint only appears after 5s of no scrolling; hides immediately on scroll
  const [scrollHintVisible, setScrollHintVisible] = useState(false);
  useEffect(() => {
    let idleTimer = null;
    const arm = () => {
      clearTimeout(idleTimer);
      setScrollHintVisible(false);
      idleTimer = setTimeout(() => setScrollHintVisible(true), 5000);
    };
    arm();
    window.addEventListener('scroll', arm, { passive: true });
    return () => {
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', arm);
    };
  }, []);

  const hintOpacity = scrollProgress <= 0.10 ? 1 - scrollProgress / 0.10 : 0;

  return (
    <>
      <SEO
        title={SITE.title}
        description={SITE.description}
        keywords={SITE.keywords}
        path={APP_ROUTES.home}
      />
      <div className="page-container">
        <NowButton />

        <ParallaxSideEffects scrollProgress={scrollProgress} isParallaxActive={isParallaxActive} />

        <MainPageOverlay
          hintOpacity={hintOpacity}
          isMobile={isMobile}
          isParallaxActive={isReturnStage}
          scrollHintVisible={scrollHintVisible}
          scrollProgress={returnProgress}
        />

        <div
          className="parallax-container"
          style={getContainerStyle()}
        >
          <div className="content-wrapper">
            {isIntroStage && (
              <MainPageTitle
                sectionRef={titleRef}
                style={getTitleStyle(introProgress)}
                subtitleOpacity={introSubtitleOpacity}
              />
            )}

            {isPreviewStage && (
              <HomePreviewRail
                content={content}
                progress={previewProgress}
                style={getPreviewStyle()}
              />
            )}

            {isReturnStage && (
              <>
                <MainPageTitle
                  style={getTitleStyle(returnProgress)}
                  subtitleOpacity={returnSubtitleOpacity}
                />

                <MainPageCards
                  content={content}
                  style={getReturnCardsStyle()}
                />

                <MainPageFooter style={getFooterStyle()} />
              </>
            )}

            {!isParallaxActive && (
              <>
                <MainPageTitle
                  style={{ position: 'relative', transform: 'none' }}
                  subtitleOpacity={1}
                />
                <MainPageCards content={content} />
                <MainPageFooter />
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
