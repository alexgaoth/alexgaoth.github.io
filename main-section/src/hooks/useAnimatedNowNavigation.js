import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { APP_ROUTES } from '../config/site';

export function useAnimatedNowNavigation() {
  const [isAnimating, setIsAnimating] = useState(false);
  const buttonRef = useRef(null);
  const navigate = useNavigate();

  const updateGradientOrigin = useCallback(() => {
    if (!buttonRef.current) {
      return;
    }

    const rect = buttonRef.current.getBoundingClientRect();
    const buttonCenterX = rect.left + rect.width / 2;
    const buttonCenterY = rect.top + rect.height / 2;

    buttonRef.current.style.setProperty('--mouse-x', `${buttonCenterX}px`);
    buttonRef.current.style.setProperty('--mouse-y', `${buttonCenterY}px`);
    buttonRef.current.style.setProperty('--offset-x', `${buttonCenterX}px`);
    buttonRef.current.style.setProperty('--offset-y', `${buttonCenterY}px`);
  }, []);

  const handleMouseEnter = useCallback(() => {
    updateGradientOrigin();
  }, [updateGradientOrigin]);

  const handleClick = useCallback(() => {
    if (isAnimating) {
      return;
    }

    updateGradientOrigin();

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setIsAnimating(true);
        setTimeout(() => {
          navigate(APP_ROUTES.now);
          setIsAnimating(false);
        }, 1800);
      });
    });
  }, [isAnimating, navigate, updateGradientOrigin]);

  return {
    buttonRef,
    isAnimating,
    handleClick,
    handleMouseEnter,
  };
}
