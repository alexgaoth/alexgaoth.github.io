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
      const distance = viewportHeight * 2.5;
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
    // Ease-out cubic: decelerates toward the end so the snap feels smooth
    const eased = 1 - Math.pow(1 - progress, 3);
    const startTop = (window.innerHeight - titleHeight) * 0.5;
    const endTop = pagePadding;
    const currentTop = startTop + (endTop - startTop) * eased;

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
    const eased = 1 - Math.pow(1 - progress, 3);
    const startTop = window.innerHeight * 2.0;
    const endTop = pagePadding + titleHeight;
    const currentTop = startTop + (endTop - startTop) * eased;

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

  // Returns opacity for an element that fades from 1→0 as progress moves start→end
  const getTextOpacity = (start, end) => {
    const progress = Math.min(scrollProgress, 1);
    if (progress <= start) return 1;
    if (progress >= end) return 0;
    return 1 - (progress - start) / (end - start);
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
    if (isParallaxActive) {
      // During parallax: just enough height to complete the animation
      const lil = window.innerWidth >= 768 ? 0 : 10;

      return {
        minHeight: `${parallaxDistance + window.innerHeight + lil}px`,
        position: 'relative'
      };
    }

   
    // paddingTop = parallaxDistance ensures a seamless snap at the transition point:
    // title doc-position (pagePadding + paddingTop) minus scrollY (= parallaxDistance)
    // = pagePadding, which exactly matches the fixed-mode endTop value.
    return {
      paddingTop: `${parallaxDistance}px`,
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
                <p>I am alex gao, the additional 'th' is here so you can find me easier</p>
                <p className='reverse-hidden'>'th' is the initials of my chinese first name, and u can find my elsewhere all by alexgaoth</p>
                <p className="hidden">I spy a mobile user - this site is better on desktop </p>
                <div className="fade-text-block">
                  <p
                    className="fade-scroll-hint"
                    style={{ opacity: getTextOpacity(0, 0.12) }}
                  >
                    scroll to explore
                  </p>
                  <p
                    className="fade-para"
                    style={{ opacity: getTextOpacity(0.22, 0.48) }}
                  >
                    a directory of things I find necessary or interesting to share about me and how I have interacted with the world.
                  </p>
                  <p
                    className="fade-para"
                    style={{ opacity: getTextOpacity(0.36, 0.62) }}
                  >
                    these interactions are largely: learning, thinking and building.
                  </p>
                  <p
                    className="fade-para"
                    style={{ opacity: getTextOpacity(0.50, 0.76) }}
                  >
                    have a look around, there be something that interests you
                  </p>
                </div>
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