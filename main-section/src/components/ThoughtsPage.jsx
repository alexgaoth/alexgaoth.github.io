import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import NavigationBar from './NavigationBar';
import SEO from './SEO';
import { Clock, Tag } from 'lucide-react';
import ThoughtsSidebar from './ThoughtsSidebar';
import CompactViewButton from './CompactViewButton';

const ThoughtsPage = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const totalCards = data.content.length;

  // Calculate optimal grid layout to fit all cards
  // Assume viewport height of ~800px, header/footer ~250px, leaves ~550px
  // Each card needs ~200px height in compact mode
  const availableHeight = 550;
  const cardHeight = 200;
  const maxRows = Math.floor(availableHeight / cardHeight);
  const optimalColumns = Math.ceil(totalCards / maxRows);
  const actualRows = Math.ceil(totalCards / optimalColumns);

  return (
    <>
      <SEO
        title="Thoughts — Alex Gao"
        description="Writing by Alex Gao (alexgaoth)."
        keywords="Alex Gao, alexgaoth, writing, thoughts"
        url="https://app.alexgaoth.com/thoughts"
      />
      <NavigationBar />
      <div className="thoughts-page-layout">
      <ThoughtsSidebar articles={data.content} />

      <div className="thoughts-page-content">
        <div className="page-container">
          <div className="content-wrapper-narrow">

        <h1 className="title-page">Thoughts</h1>

        <CompactViewButton progress={progress} setProgress={setProgress} />

        <div
          className={`space-y-medium thoughts-compact-container ${progress > 0 ? 'compacting' : ''}`}
          style={{
            '--columns': optimalColumns,
            '--rows': actualRows
          }}
        >
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
    </>
  );
};

export default ThoughtsPage;