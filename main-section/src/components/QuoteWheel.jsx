import React, { useState, useEffect, useRef } from 'react';
import '../styles/quote-wheel.css';

const QuoteWheel = ({ quotes }) => {
  const visibleCount = 5; // Number of visible quotes at a time (2 top, 1 center, 2 bottom)
  const itemHeight = 100 / visibleCount;

  // Initialize with first quote centered (at position 50)
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef(null);

  const spinWheel = () => {
    if (isSpinning) return;

    setIsSpinning(true);

    // Pre-select a random quote (roll the dice!)
    const targetQuoteIndex = Math.floor(Math.random() * quotes.length);

    const startRotation = rotation;
    const totalHeight = quotes.length * itemHeight;

    // Add many full rotations (10-15 spins) for the quick spinning effect
    const numFullSpins = 10 + Math.floor(Math.random() * 6);
    const fullRotations = numFullSpins * totalHeight;

    // Calculate where this quote needs to be in rotation to appear at center (position 50)
    const desiredCenterPosition = 50;
    const targetRotationPosition = targetQuoteIndex * itemHeight - desiredCenterPosition;

    // Find the nearest occurrence of this position that's beyond our full rotations
    // This ensures we spin forward properly
    const minTargetRotation = startRotation + fullRotations;
    const rotationsNeeded = Math.ceil((minTargetRotation - targetRotationPosition) / totalHeight);
    const finalRotation = targetRotationPosition + (rotationsNeeded * totalHeight);

    const totalRotation = finalRotation - startRotation;

    const startTime = Date.now();
    const duration = 3800; // 3.8 seconds for slower, more dramatic ending

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      if (progress < 1) {
        // Ease out quart for slower, more dramatic deceleration
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const currentRotation = startRotation + (totalRotation * easeOut);

        setRotation(currentRotation);
        animationRef.current = requestAnimationFrame(animate);
      } else {
        // Ensure we land exactly on target
        setRotation(finalRotation);
        setIsSpinning(false);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const getQuoteStyle = (index) => {
    const totalQuotes = quotes.length;
    const totalHeight = totalQuotes * itemHeight;

    const position = (index * itemHeight - rotation) % totalHeight;
    const normalizedPosition = ((position % totalHeight) + totalHeight) % totalHeight;

    // Center position is at 50 (in our 0-100 range for 5 visible quotes)
    const centerOffset = Math.abs(normalizedPosition - 50);
    const maxOffset = 50;

    // Distance factor: 1.0 at center, 0.0 at edges
    const distanceFactor = 1 - (centerOffset / maxOffset);

    // Spacing: responsive based on screen size
    // Desktop (400px container): 90px apart, Mobile (320px container): 72px apart
    const spacing = window.innerWidth <= 768 ? 72 : 90;
    const translateY = (normalizedPosition - 50) * (spacing / itemHeight);

    // Much more dramatic opacity gradient - center should really pop
    // Center is 1.0, immediate neighbors ~0.3, outer neighbors ~0.05
    const opacity = Math.max(0.03, Math.pow(distanceFactor, 3.5) * 0.97 + 0.03);

    // Scale: center is bigger, gradual decrease
    const scale = Math.max(0.65, Math.pow(distanceFactor, 1.5) * 0.35 + 0.65);

    // Bold weight for center quote only (within 10% of perfect center)
    const fontWeight = distanceFactor > 0.9 ? 700 : distanceFactor > 0.6 ? 500 : 400;

    return {
      containerStyle: {
        transform: `translateY(${translateY}px) scale(${scale})`,
        opacity: opacity,
        zIndex: Math.round(distanceFactor * 100)
      },
      textStyle: {
        fontWeight: fontWeight
      }
    };
  };

  return (
    <div className="quote-wheel-container">
      <div className="quote-wheel-viewport">
        <div className="quote-wheel">
          {quotes.map((item, index) => {
            const styles = getQuoteStyle(index);
            return (
              <div
                key={index}
                className="quote-wheel-item"
                style={styles.containerStyle}
              >
                <p className="wheel-quote-text" style={styles.textStyle}>"{item.quote}"</p>
                <cite className="wheel-quote-author">— {item.author}</cite>
              </div>
            );
          })}
        </div>
      </div>

      <button
        className="spin-button"
        onClick={spinWheel}
        disabled={isSpinning}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </button>
    </div>
  );
};

export default QuoteWheel;
