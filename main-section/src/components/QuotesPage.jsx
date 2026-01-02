import { useState, useRef } from 'react';
import NavigationBar from './NavigationBar';
import SEO from './SEO';
import QuoteWheel from './QuoteWheel';
import QuoteModal from './QuoteModal';

const QuotesPage = ({ data }) => {
  const [selectedQuote, setSelectedQuote] = useState(null);
  const quoteRefs = useRef([]);

  const handleQuoteClick = (quoteItem) => {
    setSelectedQuote(quoteItem);
  };

  const handleCloseModal = () => {
    setSelectedQuote(null);
  };

  const handleSpinComplete = (quote, quoteIndex) => {
    // Scroll to the quote in the list
    if (quoteRefs.current[quoteIndex]) {
      quoteRefs.current[quoteIndex].scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // Wait a bit for scroll to start, then open modal
      setTimeout(() => {
        setSelectedQuote(quote);
      }, 300);
    }
  };

  return (
    <>
      <SEO
        title="Quotes - alex gaoth | Curated Wisdom & Inspiration"
        description="Explore alex gaoth's collection of favorite quotes from philosophers, writers, and thinkers. A curated selection of wisdom and inspiration."
        keywords="quotes, philosophy quotes, inspirational quotes, wisdom, curated quotes collection"
        url="https://app.alexgaoth.com/quotes"
      />
      <NavigationBar />
      <div className="page-container">
        <div className="content-wrapper-narrow">

          <h1 className="title-page">Quotes</h1>

          <QuoteWheel
            quotes={data.content}
            onQuoteClick={handleQuoteClick}
            onSpinComplete={handleSpinComplete}
          />

          <div className="space-y-large">
            {data.content.map((item, index) => (
              <blockquote
                key={index}
                ref={(el) => (quoteRefs.current[index] = el)}
                className="quote-block"
                onClick={() => handleQuoteClick(item)}
                style={{ cursor: 'pointer' }}
              >
                <p className="quote-text">
                  "{item.quote}"
                </p>
                <cite className="quote-author">— {item.author}</cite>
              </blockquote>
            ))}
          </div>
        </div>
      </div>

      {selectedQuote && (
        <QuoteModal
          quote={selectedQuote.quote}
          author={selectedQuote.author}
          description={selectedQuote.description}
          relatedArticles={selectedQuote.relatedArticles}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
};

export default QuotesPage;