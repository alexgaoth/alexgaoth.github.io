import React from 'react';
import NavigationBar from './NavigationBar';
import SEO from './SEO';

const QuotesPage = ({ data }) => (
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

      <div className="space-y-large">
        {data.content.map((item, index) => (
          <blockquote key={index} className="quote-block">
            <p className="quote-text">
              "{item.quote}"
            </p>
            <cite className="quote-author">— {item.author}</cite>
          </blockquote>
        ))}
      </div>
    </div>
  </div>
  </>
);

export default QuotesPage;