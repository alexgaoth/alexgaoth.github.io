import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NowButton  from './NowButton';
import SEO from './SEO';


const MainPage = ({ content }) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const parallaxContainerRef = useRef(null);
  const [parallaxDistance, setParallaxDistance] = useState(0);
  const [isParallaxActive, setIsParallaxActive] = useState(true);

  useEffect(() => {
    const calculateParallaxDistance = () => {
      // Scroll distance for complete parallax effect
      const viewportHeight = window.innerHeight;
      const distance = viewportHeight * 1.5; // More scroll distance for smoother effect
      setParallaxDistance(distance);
    };

    calculateParallaxDistance();
    window.addEventListener('resize', calculateParallaxDistance);

    return () => window.removeEventListener('resize', calculateParallaxDistance);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (parallaxDistance === 0) return;

      const scrollY = window.scrollY;
      const rawProgress = scrollY / parallaxDistance;

      // Buffer zone logic
      let progress;
      if (rawProgress >= 0.95 && rawProgress <= 1.05) {
        progress = 1; // Lock in buffer
        setIsParallaxActive(true);
      } else if (rawProgress > 1.05) {
        // After buffer - normal scroll
        setIsParallaxActive(false);
        progress = rawProgress; // Keep tracking for potential reverse
      } else {
        // During parallax
        progress = rawProgress;
        setIsParallaxActive(true);
      }

      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [parallaxDistance]);

  // Get positioning and transform for title section
  const getTitleStyle = () => {
    if (!isParallaxActive) {
      // After parallax: normal flow
      return {
        position: 'relative',
        transform: 'none'
      };
    }

    // During parallax: fixed positioning
    const progress = Math.min(scrollProgress, 1);

    // Get approximate title height to calculate proper positioning
    const titleHeight = 120; // Approximate height of title + subtitle section

    // At progress 0: centered in viewport (considering element height)
    const startTop = (window.innerHeight - titleHeight) * 0.5;

    // At progress 1: at natural top position (matching original layout)
    const pagePadding = window.innerWidth >= 768 ? 32 : 16;
    const endTop = pagePadding;

    const currentTop = startTop + (endTop - startTop) * progress;

    // Calculate padding for width
    const sidePadding = window.innerWidth >= 768 ? 64 : 32; // 2 * padding

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: `translateX(-50%)`, // Center horizontally only
      maxWidth: '1152px', // Match content-wrapper max-width
      width: `calc(100% - ${sidePadding}px)`, // Account for page padding on both sides
      zIndex: 10
    };
  };

  // Get positioning and transform for cards section
  const getCardsStyle = () => {
    if (!isParallaxActive) {
      // After parallax: normal flow below title
      return {
        position: 'relative',
        transform: 'none'
      };
    }

    // During parallax: fixed positioning
    const progress = Math.min(scrollProgress, 1);

    // Cards move from below viewport to their natural position below title
    // Move faster than title (creating parallax effect)
    const startTop = window.innerHeight * 1.5; // Well below viewport

    // Natural position: below title section
    const pagePadding = window.innerWidth >= 768 ? 32 : 16;
    const titleSectionHeight = 180; // Approximate height of title + subtitle
    const endTop = pagePadding + titleSectionHeight;

    // Cards move faster (1.3x) to create parallax effect
    const currentTop = startTop + (endTop - startTop) * progress * 1.3;

    // Calculate padding for width
    const sidePadding = window.innerWidth >= 768 ? 64 : 32; // 2 * padding

    return {
      position: 'fixed',
      top: `${currentTop}px`,
      left: '50%',
      transform: 'translateX(-50%)', // Center horizontally
      maxWidth: '1152px', // Match content-wrapper max-width
      width: `calc(100% - ${sidePadding}px)`, // Account for page padding on both sides
      zIndex: 1
    };
  };

  const getFadeOpacity = () => {
    const progress = Math.min(scrollProgress, 1);
    if (progress >= 0.7) return 0;
    return 1 - (progress / 0.7);
  };

  const getContainerStyle = () => {
    if (isParallaxActive) {
      // During parallax: tall container to enable scrolling through the effect
      return {
        minHeight: `${parallaxDistance * 1.3}px`,
        position: 'relative'
      };
    }
    // After parallax: elements switch to normal flow
    // Add top padding equal to scroll distance so content appears at correct position
    // Add bottom padding to allow scrolling the title off-screen
    return {
      minHeight: `calc(100vh + ${parallaxDistance * 1.05}px)`,
      paddingTop: `${parallaxDistance * 1.05}px`,
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
              style={getTitleStyle()}
            >
              <h1 className="title-main">this is alex gaoth's directory</h1>
              <div className="title-sub">
                <p>known around also as gao, alexgaoth</p>
                <p>have a look around, there be something that interests u</p>
                <p className="hidden">since ur on mobile, try holding on the sections to press them.</p>
                <p
                  className="fade-text"
                  style={{ opacity: getFadeOpacity() }}
                >
                  scroll to explore
                </p>
              </div>
            </div>

            <div
              className="cards-section-parallax"
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

            <div className="footer">
              this page is written with React @2022 (now deprecated)
              <br></br>
              No rights reserved — this work by alex is free to use for any purpose.
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;