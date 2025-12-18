import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';
import { Clock, Tag } from 'lucide-react';
import ThoughtsSidebar from './ThoughtsSidebar';

const ThoughtsPage = ({ data, setCurrentPage }) => {

  return (
    <div className="thoughts-page-layout">
      <ThoughtsSidebar articles={data.content} />

      <div className="thoughts-page-content">
        <div className="page-container">
          <div className="content-wrapper-narrow">
            <BackButton setCurrentPage={setCurrentPage} />

        <h1 className="title-page">Thoughts</h1>

        <div className="space-y-medium">
          {data.content.map((thought, index) => (
            <Link
              key={thought.slug || index}
              to={`/thoughts/${thought.slug}`}
              className="thought-card-link"
            >
              <article className="thought-card">
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
                  <span className="read-more-btn">Read Full Article →</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </div>
      </div>
    </div>
  );
};

export default ThoughtsPage;