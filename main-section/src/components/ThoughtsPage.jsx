import React from 'react';
import { Link } from 'react-router-dom';
import BackButton from './BackButton';
import SEO from './SEO';
import { Clock, Tag } from 'lucide-react';
import ThoughtsSidebar from './ThoughtsSidebar';

const ThoughtsPage = ({ data, setCurrentPage }) => {

  return (
    <>
      <SEO
        title="Thoughts - alex gaoth | Writing on Tech, Philosophy & Ideas"
        description="Read alex gaoth's articles and essays on technology, AI, history, philosophy, and software development. Explore technical writings and personal reflections from a Math-CS student at UCSD."
        keywords="alex gaoth blog, tech articles, philosophy essays, AI writing, software development blog, UCSD student blog, programming thoughts"
        url="https://app.alexgaoth.com/thoughts"
      />
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
    </>
  );
};

export default ThoughtsPage;