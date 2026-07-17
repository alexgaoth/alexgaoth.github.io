import { useCallback, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import '../styles/quote-wheel.css';

function QuoteWheel({ quotes, onQuoteClick, onSpinComplete }) {
  const visibleCount = 5;
  const itemHeight = 100 / visibleCount;
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const animationRef = useRef(null);

  const spinWheel = () => {
    if (isSpinning || quotes.length === 0) return;

    setIsSpinning(true);

    const targetQuoteIndex = Math.floor(Math.random() * quotes.length);
    const targetQuote = quotes[targetQuoteIndex];
    const startRotation = rotation;
    const totalHeight = quotes.length * itemHeight;
    const numFullSpins = 10 + Math.floor(Math.random() * 6);
    const fullRotations = numFullSpins * totalHeight;
    const targetRotationPosition = targetQuoteIndex * itemHeight - 50;
    const minTargetRotation = startRotation + fullRotations;
    const rotationsNeeded = Math.ceil(
      (minTargetRotation - targetRotationPosition) / totalHeight,
    );
    const finalRotation = targetRotationPosition + rotationsNeeded * totalHeight;
    const totalRotation = finalRotation - startRotation;
    const startTime = Date.now();
    const duration = 3800;

    const animate = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1);

      if (progress < 1) {
        const easeOut = 1 - Math.pow(1 - progress, 4);
        setRotation(startRotation + totalRotation * easeOut);
        animationRef.current = requestAnimationFrame(animate);
        return;
      }

      setRotation(finalRotation);
      setIsSpinning(false);
      onSpinComplete?.(targetQuote, targetQuoteIndex);
    };

    animationRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current);
  }, []);

  const getQuoteStyle = (index) => {
    const totalHeight = quotes.length * itemHeight;
    const position = (index * itemHeight - rotation) % totalHeight;
    const normalizedPosition = ((position % totalHeight) + totalHeight) % totalHeight;
    const centerOffset = Math.abs(normalizedPosition - 50);
    const distanceFactor = 1 - centerOffset / 50;
    const spacingFactor = (normalizedPosition - 50) / itemHeight;
    const opacity = Math.max(0.03, Math.pow(distanceFactor, 3.5) * 0.97 + 0.03);
    const scale = Math.max(0.65, Math.pow(distanceFactor, 1.5) * 0.35 + 0.65);
    const fontWeight = distanceFactor > 0.9 ? 700 : distanceFactor > 0.6 ? 500 : 400;

    return {
      containerStyle: {
        transform: `translateY(calc(${spacingFactor} * var(--quote-wheel-spacing))) scale(${scale})`,
        opacity,
        zIndex: Math.round(distanceFactor * 100),
      },
      textStyle: { fontWeight },
    };
  };

  return (
    <div className="quote-wheel-container">
      <div className="quote-wheel-viewport">
        <div className="quote-wheel">
          {quotes.map((item, index) => {
            const styles = getQuoteStyle(index);
            return (
              <button
                type="button"
                key={`${item.quote}-${index}`}
                className="quote-wheel-item"
                style={styles.containerStyle}
                onClick={() => onQuoteClick(item)}
                aria-label={`Open quote by ${item.author}`}
              >
                <span className="wheel-quote-text" style={styles.textStyle}>
                  &ldquo;{item.quote}&rdquo;
                </span>
                <cite className="wheel-quote-author">— {item.author}</cite>
              </button>
            );
          })}
        </div>
      </div>

      <button
        type="button"
        className="spin-button"
        onClick={spinWheel}
        disabled={isSpinning || quotes.length === 0}
      >
        {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
      </button>
    </div>
  );
}

function QuoteModal({ quote, articles, onClose }) {
  const relatedArticles = (quote.relatedArticles || [])
    .map((slug) => articles[slug])
    .filter(Boolean);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return (
    <div className="quote-modal-overlay" onClick={onClose} role="presentation">
      <div
        className="quote-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-modal-text"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="quote-modal-header">
          <button type="button" className="close-button" onClick={onClose} aria-label="Close modal">
            <X size={24} />
          </button>
        </div>

        <div className="quote-modal-content">
          <blockquote className="quote-modal-quote">
            <p id="quote-modal-text" className="quote-modal-text">
              &ldquo;{quote.quote}&rdquo;
            </p>
            <cite className="quote-modal-author">— {quote.author}</cite>
          </blockquote>

          {quote.description && (
            <div className="quote-modal-section">
              <h3 className="quote-modal-section-title">Why This Matters</h3>
              <p className="quote-modal-description">{quote.description}</p>
            </div>
          )}

          {relatedArticles.length > 0 && (
            <div className="quote-modal-section">
              <h3 className="quote-modal-section-title">Related Articles</h3>
              <div className="quote-modal-articles">
                {relatedArticles.map((article) => (
                  <a
                    key={article.slug}
                    href={`/thoughts/${article.slug}`}
                    className="quote-modal-article-link"
                    onClick={onClose}
                  >
                    <div className="quote-modal-article">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="quote-modal-article-image"
                        />
                      )}
                      <div className="quote-modal-article-info">
                        <h4 className="quote-modal-article-title">{article.title}</h4>
                        <p className="quote-modal-article-excerpt">{article.excerpt}</p>
                        <span className="quote-modal-article-readtime">{article.readTime}</span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuotesPage({ quotes, articles }) {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const quoteRefs = useRef([]);
  const closeModal = useCallback(() => setSelectedQuote(null), []);

  const handleSpinComplete = (quote, quoteIndex) => {
    quoteRefs.current[quoteIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    window.setTimeout(() => setSelectedQuote(quote), 300);
  };

  return (
    <>
      <h1 className="title-page">Quotes</h1>

      <QuoteWheel
        quotes={quotes}
        onQuoteClick={setSelectedQuote}
        onSpinComplete={handleSpinComplete}
      />

      <div className="space-y-large">
        {quotes.map((item, index) => (
          <blockquote
            key={`${item.quote}-${index}`}
            ref={(element) => { quoteRefs.current[index] = element; }}
            className="quote-block quote-list-item"
            onClick={() => setSelectedQuote(item)}
            tabIndex={0}
            role="button"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setSelectedQuote(item);
              }
            }}
          >
            <p className="quote-text">&ldquo;{item.quote}&rdquo;</p>
            <cite className="quote-author">— {item.author}</cite>
          </blockquote>
        ))}
      </div>

      {selectedQuote && (
        <QuoteModal quote={selectedQuote} articles={articles} onClose={closeModal} />
      )}
    </>
  );
}
