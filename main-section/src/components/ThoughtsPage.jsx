import React, { useState } from 'react';
import BackButton from './BackButton';
import { X, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ThoughtsPage = ({ data, setCurrentPage }) => {
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [articleContent, setArticleContent] = useState('');
  const [loading, setLoading] = useState(false);

  const openArticle = async (thoughtItem) => {
    setLoading(true);
    setSelectedArticle(thoughtItem);
    
    try {
      // Dynamically import the article content
      setArticleContent(thoughtItem.articleFile.content);
    } catch (error) {
      console.error('Error loading article:', error);
      setArticleContent('Error loading article content.');
    }
    
    setLoading(false);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeArticle = () => {
    setSelectedArticle(null);
    setArticleContent('');
    // Restore body scroll
    document.body.style.overflow = 'unset';
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeArticle();
      }
    };

    if (selectedArticle) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [selectedArticle]);

  return (
    <div className="page-container">
      <div className="content-wrapper-narrow">
        <BackButton setCurrentPage={setCurrentPage} />

        <h1 className="title-page">Thoughts</h1>

        <div className="space-y-medium">
          {data.content.map((thought, index) => (
            <article 
              key={thought.id}
              className="thought-card"
              onClick={() => openArticle(thought)}
            >
              {/* Article Image */}
              {thought.image && (
                <div className="thought-image-container">
                  <img 
                    src={process.env.PUBLIC_URL + thought.image} 
                    alt={thought.title}
                    className="thought-image"
                  />
                </div>
              )}
              
              <div className="thought-content">
                <div className="article-header">
                  <h2 className="title-article">{thought.title}</h2>
                  <div className="article-meta">
                    <time className="date-badge">
                      {thought.date}
                    </time>
                    {thought.readTime && (
                      <span className="read-time">
                        <Clock size={14} />
                        {thought.readTime}
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Tags */}
                {thought.tags && (
                  <div className="article-tags">
                    {thought.tags.map((tag, tagIndex) => (
                      <span key={tagIndex} className="article-tag">
                        <Tag size={12} />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                
                <p className="text-gray leading-relaxed">{thought.excerpt}</p>
                <button className="read-more-btn">Read Full Article →</button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Article Modal */}
      {selectedArticle && (
        <div className="article-modal-overlay" onClick={closeArticle}>
          <div className="article-modal" onClick={(e) => e.stopPropagation()}>
            <div className="article-modal-header">
              <button 
                className="close-button"
                onClick={closeArticle}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="article-modal-content">
              {/* Featured Image */}
              {selectedArticle.image && (
                <div className="article-featured-image">
                  <img 
                    src={process.env.PUBLIC_URL + selectedArticle.image} 
                    alt={selectedArticle.title}
                  />
                </div>
              )}
              
              {/* Article Meta */}
              <div className="article-modal-meta">
                <time className="article-date">{selectedArticle.date}</time>
                {selectedArticle.readTime && (
                  <span className="article-read-time">
                    <Clock size={16} />
                    {selectedArticle.readTime}
                  </span>
                )}
              </div>
              
              {/* Tags */}
              {selectedArticle.tags && (
                <div className="article-modal-tags">
                  {selectedArticle.tags.map((tag, tagIndex) => (
                    <span key={tagIndex} className="article-modal-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Article Content */}
              <div className="article-body markdown-content">
                {loading ? (
                  <div className="loading-spinner">Loading article...</div>
                ) : (
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({node, ...props}) => <h1 className="article-h1" {...props} />,
                      h2: ({node, ...props}) => <h2 className="article-h2" {...props} />,
                      h3: ({node, ...props}) => <h3 className="article-h3" {...props} />,
                      p: ({node, ...props}) => <p className="article-paragraph" {...props} />,
                      li: ({node, ...props}) => <li className="article-list-item" {...props} />,
                      ul: ({node, ...props}) => <ul className="article-ul" {...props} />,
                      ol: ({node, ...props}) => <ol className="article-ol" {...props} />,
                      strong: ({node, ...props}) => <strong {...props} />,
                      em: ({node, ...props}) => <em {...props} />,
                    }}
                  >
                    {articleContent}
                  </ReactMarkdown>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ThoughtsPage;