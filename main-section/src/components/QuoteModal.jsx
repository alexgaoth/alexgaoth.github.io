import React from 'react';
import { X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { thoughtsIndex } from '../data/thoughtsIndex';

const QuoteModal = ({ quote, author, description, relatedArticles, onClose }) => {
  // Find article details from slugs
  const getArticleDetails = (slugs) => {
    if (!slugs || !Array.isArray(slugs)) return [];
    return slugs
      .map(slug => thoughtsIndex.find(article => article.slug === slug))
      .filter(article => article !== undefined);
  };

  const articles = getArticleDetails(relatedArticles);

  return (
    <div className="quote-modal-overlay" onClick={onClose}>
      <div className="quote-modal" onClick={(e) => e.stopPropagation()}>
        <div className="quote-modal-header">
          <button
            className="close-button"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={24} />
          </button>
        </div>

        <div className="quote-modal-content">
          <blockquote className="quote-modal-quote">
            <p className="quote-modal-text">
              "{quote}"
            </p>
            <cite className="quote-modal-author">— {author}</cite>
          </blockquote>

          {description && (
            <div className="quote-modal-section">
              <h3 className="quote-modal-section-title">Why This Matters</h3>
              <p className="quote-modal-description">{description}</p>
            </div>
          )}

          {articles && articles.length > 0 && (
            <div className="quote-modal-section">
              <h3 className="quote-modal-section-title">Related Articles</h3>
              <div className="quote-modal-articles">
                {articles.map((article) => (
                  <Link
                    key={article.slug}
                    to={`/thoughts/${article.slug}`}
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
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuoteModal;
