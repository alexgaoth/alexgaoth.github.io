import { Clock, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/site';

const ThoughtCard = ({ thought }) => (
  <Link
    to={`${APP_ROUTES.thoughts}/${thought.slug}`}
    className="thought-card-link"
  >
    <article className="thought-card">
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
);

export default ThoughtCard;
