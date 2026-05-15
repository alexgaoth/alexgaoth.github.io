import { useState, useRef } from 'react';
import ContentPage from '../components/layout/ContentPage';
import QuoteModal from '../components/QuoteModal';
import QuoteWheel from '../components/QuoteWheel';
import SEO from '../components/SEO';
import { APP_ROUTES } from '../config/site';

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
        title="Quotes — Alex Gao"
        description="Quotes collected by Alex Gao (alexgaoth)."
        keywords={['Alex Gao', 'alexgaoth', 'quotes']}
        path={APP_ROUTES.quotes}
      />
      <ContentPage>

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
      </ContentPage>

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
