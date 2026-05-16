import { ArrowRight, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/site';

const FEATURED_PROJECT_COUNT = 3;
const FEATURED_THOUGHT_COUNT = 3;

const NOW_PREVIEW_BOOKS = [
  'Currently Working On',
  'Currently Consuming',
  'Currently At',
];

const formatPreviewDate = (dateString) => new Date(`${dateString}T00:00:00`).toLocaleDateString(
  'en-US',
  {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }
);

const getProjectImage = (project) => process.env.PUBLIC_URL + (project.images?.[0] || project.image);

const PreviewSectionHeader = ({ eyebrow, title, description, linkTo, linkLabel }) => (
  <div className="home-preview-header">
    <div>
      <p className="home-preview-eyebrow">{eyebrow}</p>
      <h2 className="title-section home-preview-title">{title}</h2>
      <p className="text-gray home-preview-description">{description}</p>
    </div>
    {linkTo && linkLabel && (
      <Link to={linkTo} className="home-preview-link-pill">
        {linkLabel}
        <ArrowRight size={15} />
      </Link>
    )}
  </div>
);

const ProjectPreviewCard = ({ project, featured = false }) => (
  <Link
    to={APP_ROUTES.projects}
    className={`home-preview-entry-card ${featured ? 'home-preview-entry-card--feature' : 'home-preview-entry-card--support'}`}
  >
    <div className="home-preview-entry-image">
      <img
        src={getProjectImage(project)}
        alt={`${project.name} preview`}
      />
    </div>

    <div className="home-preview-entry-body">
      <div className="home-preview-entry-meta">
        <span className="date-badge">Project</span>
        <span className="home-preview-panel-kicker">
          {project.tech.split(', ').slice(0, featured ? 3 : 2).join(' / ')}
        </span>
      </div>

      <h3 className="title-card home-preview-entry-title">{project.name}</h3>
      <p className="text-gray home-preview-entry-copy">{project.description}</p>

      <div className="flex flex-wrap gap-small">
        {project.tech.split(', ').slice(0, featured ? 4 : 3).map((tech) => (
          <span key={`${project.name}-${tech}`} className="tag">
            {tech}
          </span>
        ))}
      </div>
    </div>
  </Link>
);

const ThoughtPreviewCard = ({ thought, featured = false }) => (
  <Link
    to={`${APP_ROUTES.thoughts}/${thought.slug}`}
    className={`home-preview-entry-card ${featured ? 'home-preview-entry-card--feature' : 'home-preview-entry-card--support'}`}
  >
    <div className="home-preview-entry-image">
      <img
        src={process.env.PUBLIC_URL + thought.image}
        alt={thought.title}
      />
    </div>

    <div className="home-preview-entry-body">
      <div className="home-preview-entry-meta">
        <span className="date-badge">{formatPreviewDate(thought.date)}</span>
        {thought.readTime && (
          <span className="read-time">
            <Clock size={14} />
            {thought.readTime}
          </span>
        )}
      </div>

      <h3 className="title-card home-preview-entry-title">{thought.title}</h3>

      {thought.tags && (
        <div className="article-tags home-preview-article-tags">
          {thought.tags.slice(0, featured ? 3 : 2).map((tag) => (
            <span key={`${thought.slug}-${tag}`} className="article-tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <p className="text-gray home-preview-entry-copy">{thought.excerpt}</p>
    </div>
  </Link>
);

const HomePreviewRail = ({ content, progress, style }) => {
  const featuredProjects = content.projects.content.slice(0, FEATURED_PROJECT_COUNT);
  const featuredThoughts = content.thoughts.content.slice(0, FEATURED_THOUGHT_COUNT);
  const [projectFeature, ...projectStack] = featuredProjects;
  const [thoughtFeature, ...thoughtStack] = featuredThoughts;
  const [viewportHeight, setViewportHeight] = useState(() => {
    const pagePadding = window.innerWidth >= 768 ? 80 : 140;
    return Math.max(window.innerHeight - pagePadding - 28, 420);
  });

  useEffect(() => {
    const updateViewportHeight = () => {
      const pagePadding = window.innerWidth >= 768 ? 80 : 140;
      setViewportHeight(Math.max(window.innerHeight - pagePadding - 28, 420));
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  const slideGap = window.innerWidth >= 768 ? 36 : 24;
  const totalTravel = (viewportHeight + slideGap) * 2;
  const translateY = progress * totalTravel;
  const activeIndex = progress * 2;
  const getSlideStyle = (index) => {
    const distance = Math.abs(activeIndex - index);
    const opacity = Math.max(0.26, 1 - distance * 0.55);
    const scale = 1 - Math.min(distance * 0.08, 0.16);
    const blur = Math.min(distance * 1.4, 2.8);

    return {
      opacity,
      transform: `scale(${scale})`,
      filter: `blur(${blur}px)`,
    };
  };

  return (
    <div className="cards-section-parallax home-preview-rail" style={style}>
      <div className="home-preview-viewport">
        <div
          className="home-preview-track"
          style={{
            transform: `translateY(-${translateY}px)`,
            gap: `${slideGap}px`,
          }}
        >
          <section
            className="home-preview-section home-preview-section-showcase home-preview-slide"
            style={{
              minHeight: `${viewportHeight}px`,
              ...getSlideStyle(0),
            }}
          >
            <PreviewSectionHeader
              eyebrow={APP_ROUTES.projects}
              title="Projects"
              description="Two supporting cards on the left, one larger feature on the right."
              linkTo={APP_ROUTES.projects}
              linkLabel="Projects"
            />

            <div className="home-preview-showcase home-preview-showcase-projects">
              <div className="home-preview-column home-preview-column-stack">
                {projectStack.map((project) => (
                  <ProjectPreviewCard key={project.name} project={project} />
                ))}
              </div>

              {projectFeature && (
                <div className="home-preview-column home-preview-column-feature">
                  <ProjectPreviewCard project={projectFeature} featured />
                </div>
              )}
            </div>
          </section>

          <section
            className="home-preview-section home-preview-section-showcase home-preview-slide"
            style={{
              minHeight: `${viewportHeight}px`,
              ...getSlideStyle(1),
            }}
          >
            <PreviewSectionHeader
              eyebrow={APP_ROUTES.thoughts}
              title="Thoughts"
              description="One larger feature on the left, two supporting cards on the right."
              linkTo={APP_ROUTES.thoughts}
              linkLabel="Thoughts"
            />

            <div className="home-preview-showcase home-preview-showcase-thoughts">
              {thoughtFeature && (
                <div className="home-preview-column home-preview-column-feature">
                  <ThoughtPreviewCard thought={thoughtFeature} featured />
                </div>
              )}

              <div className="home-preview-column home-preview-column-stack">
                {thoughtStack.map((thought) => (
                  <ThoughtPreviewCard key={thought.slug} thought={thought} />
                ))}
              </div>
            </div>
          </section>

          <section
            className="home-preview-section home-preview-section-now home-preview-slide"
            style={{
              minHeight: `${viewportHeight}px`,
              ...getSlideStyle(2),
            }}
          >
            <PreviewSectionHeader
              eyebrow={APP_ROUTES.now}
              title="Now"
              description="A short bookshelf pause."
              linkTo={APP_ROUTES.now}
              linkLabel="Now"
            />

            <div className="home-preview-now-shell">
              <Link to={APP_ROUTES.now} className="home-preview-panel home-preview-panel-now">
                <div className="home-preview-panel-topline">
                  <span className="date-badge">Now</span>
                  <span className="home-preview-panel-kicker">bookshelf snapshot</span>
                </div>

                <h3 className="title-card home-preview-panel-title">What I&apos;m up to now</h3>

                <div className="home-now-book-stack">
                  {NOW_PREVIEW_BOOKS.map((title, index) => (
                    <div
                      key={title}
                      className="home-now-book"
                      style={{
                        '--book-color': ['#8B4513', '#2F4F4F', '#8B0000'][index],
                        '--book-spine-color': ['#A0522D', '#708090', '#DC143C'][index],
                      }}
                    >
                      <span>{title}</span>
                    </div>
                  ))}
                </div>

                <p className="text-gray">
                  Open the route to read the current working, consuming, and location notes in the full bookshelf layout.
                </p>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default HomePreviewRail;
