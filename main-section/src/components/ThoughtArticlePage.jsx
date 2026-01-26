import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { thoughtsIndex } from '../data/thoughtsIndex';
import ThoughtsSidebar from './ThoughtsSidebar';
import ArticleShareButtons from './ArticleShareButtons';
import SEO from './SEO';

const ThoughtArticlePage = () => {
  const { slug } = useParams();

  // Find the article by slug
  const article = thoughtsIndex.find(a => a.slug === slug);

  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [slug]);

  if (!article) {
    return (
      <div className="page-container">
        <div className="content-wrapper-narrow">
          <h1 className="title-page">Article Not Found</h1>
          <p>The article you're looking for doesn't exist.</p>
          <Link to="/thoughts" className="btn-back">
            <ArrowLeft size={20} />
            Back to Thoughts
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={`${article.title} - alex gaoth`}
        description={article.excerpt}
        keywords={article.tags ? article.tags.join(', ') : 'alex gaoth, blog, article'}
        url={`https://app.alexgaoth.com/thoughts/${article.slug}`}
        image={article.image ? `https://app.alexgaoth.com${article.image}` : undefined}
        type="article"
      />
      <div className="article-page-layout">
      {/* Sidebar */}
      <ThoughtsSidebar articles={thoughtsIndex} />

      {/* Main Content */}
      <div className="article-page-content">
        <div className="article-page-wrapper">
          {/* Back Button */}
          <Link to="/thoughts" className="btn-back">
            <ArrowLeft size={20} />
            Back to Thoughts
          </Link>

          {/* Featured Image */}
          {article.image && (
            <div className="article-page-image">
              <img
                src={process.env.PUBLIC_URL + article.image}
                alt={article.title}
              />
            </div>
          )}

          {/* Article Header */}
          <header className="article-page-header">
            <h1 className="article-page-title">{article.title}</h1>

            <div className="article-page-meta">
              <time className="article-date">{article.date}</time>
              {article.readTime && (
                <span className="article-read-time">
                  <Clock size={16} />
                  {article.readTime}
                </span>
              )}
            </div>

            {/* Tags */}
            {article.tags && (
              <div className="article-page-tags">
                {article.tags.map((tag, index) => (
                  <span key={index} className="article-page-tag">
                    <Tag size={12} />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>

          {/* Share Buttons */}
          <ArticleShareButtons title={article.title} slug={article.slug} />

          {/* Article Content */}
          <article className="article-body markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, children, ...props}) => <h1 className="article-h1" {...props}>{children}</h1>,
                h2: ({node, children, ...props}) => <h2 className="article-h2" {...props}>{children}</h2>,
                h3: ({node, children, ...props}) => <h3 className="article-h3" {...props}>{children}</h3>,
                p: ({node, ...props}) => <p className="article-paragraph" {...props} />,
                li: ({node, ...props}) => <li className="article-list-item" {...props} />,
                ul: ({node, ...props}) => <ul className="article-ul" {...props} />,
                ol: ({node, ...props}) => <ol className="article-ol" {...props} />,
                strong: ({node, ...props}) => <strong {...props} />,
                em: ({node, ...props}) => <em {...props} />,
              }}
            >
              {article.articleFile.content}
            </ReactMarkdown>
          </article>

          {/* Share Buttons at Bottom */}
          <div className="article-page-footer">
            <ArticleShareButtons title={article.title} slug={article.slug} />
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ThoughtArticlePage;
