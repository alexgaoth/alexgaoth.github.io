import React from 'react';
import { useAnimatedNowNavigation } from '../hooks/useAnimatedNowNavigation';

const NowButton = () => {
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
      className={`btn-now ${isAnimating ? 'animating' : ''}`}
      disabled={isAnimating}
    >
      me - rn
    </button>
  );
};

export default NowButton;
