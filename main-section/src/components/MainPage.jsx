import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NowButton  from './NowButton';
import SEO from './SEO';


const MainPage = ({ content }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const parallaxContainerRef = useRef(null);
  const titleRef = useRef(null);
  const cardsRef = useRef(null);
  const [parallaxDistance, setParallaxDistance] = useState(0);
  const [isParallaxActive, setIsParallaxActive] = useState(true);
  const [titleHeight, setTitleHeight] = useState(130);

  useEffect(() => {
    const calculateParallaxDistance = () => {
      const viewportHeight = window.innerHeight;
      const distance = viewportHeight * 1.5;
      setParallaxDistance(distance);
    };

    const measureTitleHeight = () => {
      if (titleRef.current) {
        setTitleHeight(titleRef.current.offsetHeight);
      }
    };

    calculateParallaxDistance();
    measureTitleHeight();
    
    window.addEventListener('resize', calculateParallaxDistance);
    window.addEventListener('resize', measureTitleHeight);

    return () => {
      window.removeEventListener('resize', calculateParallaxDistance);
      window.removeEventListener('resize', measureTitleHeight);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxDistance === 0) return;

      const scrollY = window.scrollY;
      const rawProgress = scrollY / parallaxDistance;

      // Simple transition: parallax until progress >= 1, then normal scroll
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

  const getPagePadding = () => window.innerWidth >= 768 ? 32 : 16;
  const getSidePadding = () => window.innerWidth >= 768 ? 64 : 32;
  const getPagePaddingx = () => window.innerWidth >= 768 ? 40 : 128;

  // Get positioning and transform for title section
  const getTitleStyle = () => {
    const pagePadding = getPagePadding();
    const sidePadding = getSidePadding();

    if (!isParallaxActive) {
      return {
        position: 'relative',
        transform: 'none'
      };
    }

    const progress = Math.min(scrollProgress, 1);
    const startTop = (window.innerHeight - titleHeight) * 0.5;
    const endTop = pagePadding;
    const currentTop = startTop + (endTop - startTop) * progress;

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: `translateX(-50%)`,
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      zIndex: 10
    };
  };

  // Get positioning and transform for cards section
  const getCardsStyle = () => {
    const pagePadding = getPagePadding();
    const sidePadding = getSidePadding();

    if (!isParallaxActive) {
      return {
        position: 'relative',
        transform: 'none'
      };
    }

    const progress = Math.min(scrollProgress, 1);
    const startTop = window.innerHeight * 2.0;
    const endTop = pagePadding + titleHeight;
    const currentTop = startTop + (endTop - startTop) * progress;

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: 'translateX(-50%)',
      maxWidth: '1152px',
      width: `calc(100% - ${sidePadding}px)`,
      zIndex: 1
    };
  };

  const getFadeOpacity = () => {
    const progress = Math.min(scrollProgress, 1);
    if (progress >= 0.7) return 0;
    return 1 - (progress / 0.7);
  };

  const getFooterStyle = () => {
    if (isParallaxActive) {
      const sidePadding = getSidePadding();
      // Position footer at very top so it scrolls off immediately
      const footerOffset = -window.innerHeight * 0.5;
      return {
        position: 'absolute',
        top: `${footerOffset}px`,
        left: '50%',
        transform: 'translateX(-50%)',
        maxWidth: '1152px',
        width: `calc(100% - ${sidePadding}px)`,
        zIndex: 0
      };
    }
    return {};
  };

  const getContainerStyle = () => {
    const pagePadding = getPagePadding();

    if (isParallaxActive) {
      // During parallax: just enough height to complete the animation
      const lil = window.innerWidth >= 768 ? 0 : 10;

      return {
        minHeight: `${parallaxDistance + window.innerHeight + lil}px`,
        position: 'relative'
      };
    }

   
    return {
      paddingTop: `${parallaxDistance - getPagePaddingx()}px`,
      position: 'relative'
    };
  };

  return (
    <>
      <SEO
        title="alex gaoth - Portfolio | Math-CS Student & Developer"
        description="Explore alex gaoth's portfolio: full-stack projects, technical writings on AI and history, professional resume, and favorite quotes. Math-CS student at UC San Diego."
        keywords="alex gaoth, alexgaoth, Alex Gao, Portfolio, UCSD, Math-CS, Full-Stack Developer, React Projects, Python, DevOps, Software Engineer"
        url="https://app.alexgaoth.com/"
      />
      <div className="page-container">
        <NowButton />

        <div
          className="parallax-container"
          ref={parallaxContainerRef}
          style={getContainerStyle()}
        >
          <div className="content-wrapper">
            <div
              className="title-section-parallax"
              ref={titleRef}
              style={getTitleStyle()}
            >
              <h1 className="title-main">this is alex gaoth's directory</h1>
              <div className="title-sub">
                <p>I am alex gao, the additional 'th' is for "uniqueness"</p>
                <p className='reverse-hidden'>it is the initials of my chinese first name, it is here so you can find me easier</p>
                <p className="hidden">I spy a mobile user - this site is better on desktop </p>
                <p
                  className="fade-text"
                  style={{ opacity: getFadeOpacity() }}
                >
                  scroll to explore
                  <br></br>
                  have a look around, there be something that interests u
                </p>
              </div>
            </div>

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

            <div className="footer" style={getFooterStyle()}>
              this page is written with React @2022 (now deprecated)
              <br></br>
              No rights reserved – this work by alex is free to use for any purpose.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;