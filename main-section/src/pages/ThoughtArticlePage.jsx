import React, { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import ArticleShareButtons from '../components/ArticleShareButtons';
import SEO from '../components/SEO';
import ThoughtsSidebar from '../components/ThoughtsSidebar';
import thoughtsManifest from '../data/thoughtsManifest.json';
import { APP_ROUTES } from '../config/site';
import { toIsoDateString } from '../utils/articleDates';
import { preprocessThoughtMarkdown } from '../utils/markdownMath';

const ThoughtArticlePage = () => {
  const { slug } = useParams();
  const [markdownContent, setMarkdownContent] = useState('');
  const [loadError, setLoadError] = useState(false);
  const articleBodyRef = useRef(null);

  // Find the article by slug
  const article = thoughtsManifest.find((entry) => entry.slug === slug);
  const articlePublishedTime = article ? toIsoDateString(article.date) : undefined;

  useEffect(() => {
    // Scroll to top when article changes
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    let ignore = false;

    if (!article) {
      setMarkdownContent('');
      setLoadError(false);
      return undefined;
    }

    setLoadError(false);
    setMarkdownContent('');

    fetch(`${process.env.PUBLIC_URL}${article.contentPath}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load article content for ${article.slug}`);
        }

        return response.text();
      })
      .then((content) => {
        if (!ignore) {
          setMarkdownContent(preprocessThoughtMarkdown(content));
        }
      })
      .catch(() => {
        if (!ignore) {
          setLoadError(true);
        }
      });

    return () => {
      ignore = true;
    };
  }, [article]);

  useEffect(() => {
    let ignore = false;

    if (!markdownContent || loadError || !articleBodyRef.current) {
      return undefined;
    }

    const typesetMath = () => {
      if (ignore || !articleBodyRef.current || !window.MathJax?.typesetPromise) {
        return;
      }

      if (window.MathJax.typesetClear) {
        window.MathJax.typesetClear([articleBodyRef.current]);
      }

      window.MathJax.typesetPromise([articleBodyRef.current]).catch(() => {});
    };

    if (window.MathJax?.typesetPromise) {
      typesetMath();
      return undefined;
    }

    const handleReady = () => {
      typesetMath();
    };

    window.addEventListener('mathjax-ready', handleReady);

    return () => {
      ignore = true;
      window.removeEventListener('mathjax-ready', handleReady);
    };
  }, [loadError, markdownContent]);

  if (!article) {
    return (
      <div className="page-container">
        <div className="content-wrapper-narrow">
          <h1 className="title-page">Article Not Found</h1>
          <p>The article you're looking for doesn't exist.</p>
          <Link to={APP_ROUTES.thoughts} className="btn-back">
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
        title={`${article.title} — Alex Gao (alexgaoth)`}
        description={article.excerpt}
        keywords={['Alex Gao', 'alexgaoth', ...(article.tags || ['blog', 'article'])]}
        path={`${APP_ROUTES.thoughts}/${article.slug}`}
        imagePath={article.image || undefined}
        type="article"
        publishedTime={articlePublishedTime}
        modifiedTime={articlePublishedTime}
      />
      <div className="article-page-layout">
      {/* Sidebar */}
      <ThoughtsSidebar articles={thoughtsManifest} />

      {/* Main Content */}
      <div className="article-page-content">
        <div className="article-page-wrapper">
          {/* Back Button */}
          <Link to={APP_ROUTES.thoughts} className="btn-back">
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
          <article ref={articleBodyRef} className="article-body markdown-content">
            {loadError ? (
              <p className="article-paragraph">Unable to load this article right now.</p>
            ) : markdownContent ? (
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
                {markdownContent}
              </ReactMarkdown>
            ) : null}
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
