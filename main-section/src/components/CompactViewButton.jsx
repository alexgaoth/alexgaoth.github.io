import React, { useState, useEffect, useRef } from 'react';
import '../styles/compact-view.css';

const CompactViewButton = ({ progress, setProgress, isProjectsPage = false }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pressStartTime, setPressStartTime] = useState(null);
  const [isFirstTime, setIsFirstTime] = useState(() => {
    // Check if user has used compact view before (mobile only)
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return !localStorage.getItem('compact-view-used');
    }
    return false;
  });
  const animationFrameRef = useRef(null);
  const startTimeRef = useRef(null);
  const isMobile = window.innerWidth < 768;

  const COMPACT_DURATION = 1000; // 1 second to compact
  const EXPAND_DURATION = 800; // 0.8 seconds to expand (faster)
  const MIN_MOBILE_ANIMATION = 500; // Minimum 0.5s animation on mobile before reversing

  useEffect(() => {
    if (isPressed) {
      // Start compacting animation
      setIsAnimating(true);
      startTimeRef.current = Date.now();
      const animate = () => {
        const elapsed = Date.now() - startTimeRef.current;
        const newProgress = Math.min(elapsed / COMPACT_DURATION, 1);
        setProgress(newProgress);

        if (newProgress < 1) {
          animationFrameRef.current = requestAnimationFrame(animate);
        } else {
          setIsAnimating(false);
          // Mark as used on first complete animation (mobile only)
          if (isMobile && isFirstTime) {
            localStorage.setItem('compact-view-used', 'true');
            setIsFirstTime(false);
          }
        }
      };
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Start expanding animation (reverse)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (progress > 0) {
        setIsAnimating(true);
        const startProgress = progress;
        startTimeRef.current = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTimeRef.current;
          const reverseProgress = Math.min(elapsed / EXPAND_DURATION, 1);
          const newProgress = startProgress * (1 - reverseProgress);
          setProgress(newProgress);

          if (reverseProgress < 1) {
            animationFrameRef.current = requestAnimationFrame(animate);
          } else {
            setProgress(0);
            setIsAnimating(false);
          }
        };
        animationFrameRef.current = requestAnimationFrame(animate);
      }
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPressed]);

  const handlePressStart = (e) => {
    e.preventDefault();
    if (!isAnimating) {
      setIsPressed(true);
      setPressStartTime(Date.now());
    }
  };

  const handlePressEnd = (e) => {
    e.preventDefault();

    // On mobile, enforce minimum animation time
    if (isMobile && pressStartTime) {
      const elapsed = Date.now() - pressStartTime;
      if (elapsed < MIN_MOBILE_ANIMATION) {
        // Wait for remaining time before releasing
        setTimeout(() => {
          setIsPressed(false);
        }, MIN_MOBILE_ANIMATION - elapsed);
        return;
      }
    }

    setIsPressed(false);
  };

  // Update progress in parent for animation
  useEffect(() => {
    document.documentElement.style.setProperty('--compact-progress', progress);
  }, [progress]);

  if (isMobile) {
    // Calculate opacity: starts at 0.5, goes to 1 as progress increases (only on first time)
    const buttonOpacity = isFirstTime ? 0.5 + (progress * 0.5) : 1;
    const buttonClass = `compact-view-button mobile ${isProjectsPage ? 'projects-position' : ''}`;

    return (
      <button
        className={buttonClass}
        style={{ opacity: buttonOpacity }}
        onMouseDown={handlePressStart}
        onMouseUp={handlePressEnd}
        onMouseLeave={handlePressEnd}
        onTouchStart={handlePressStart}
        onTouchEnd={handlePressEnd}
        onTouchCancel={handlePressEnd}
        aria-label="Hold to compact view"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
        </svg>
      </button>
    );
  }

  return (
    <div
      className="compact-view-button desktop"
      onMouseDown={handlePressStart}
      onMouseUp={handlePressEnd}
      onMouseLeave={handlePressEnd}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          handlePressStart(e);
        }
      }}
      onKeyUp={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          handlePressEnd(e);
        }
      }}
    >
      hold me to collapse posts
      <div
        className="compact-progress-bar"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
};

export default CompactViewButton;
