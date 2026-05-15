import React from 'react';
import { useAnimatedNowNavigation } from '../hooks/useAnimatedNowNavigation';

const NavNowButton = () => {
  const {
    buttonRef,
    handleClick,
    handleMouseEnter,
    isAnimating,
  } = useAnimatedNowNavigation();

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      className={`nav-now-button ${isAnimating ? 'animating' : ''}`}
      disabled={isAnimating}
    >
      Now
    </button>
  );
};

export default NavNowButton;
