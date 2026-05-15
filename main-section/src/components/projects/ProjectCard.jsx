import { ChevronLeft, ChevronRight, ExternalLink, Github } from 'lucide-react';

const ProjectCard = ({
  project,
  index,
  currentImage,
  selectedImageIndex,
  onPreviousImage,
  onNextImage,
}) => (
  <div className="project-card">
    {(project.image || project.images) && (
      <div className="project-image-container">
        <img
          src={currentImage}
          alt={`${project.name} preview`}
          className="project-image"
        />

        {project.images && project.images.length > 1 && (
          <>
            <button
              onClick={() => onPreviousImage(index)}
              className="image-nav-btn prev"
            >
              <ChevronLeft size={26} strokeWidth={1.5} />
            </button>
            <button
              onClick={() => onNextImage(index)}
              className="image-nav-btn next"
            >
              <ChevronRight size={26} strokeWidth={1.5} />
            </button>
            <span className="image-counter">
              {selectedImageIndex + 1} / {project.images.length}
            </span>
          </>
        )}
      </div>
    )}

    <h2 className="title-card">{project.name}</h2>

    <div className="flex flex-wrap gap-small mb-medium">
      {project.tech.split(', ').map((tech, techIndex) => (
        <span key={techIndex} className="tag">
          {tech}
        </span>
      ))}
    </div>

    <p className="text-gray mb-medium">{project.description}</p>

    {(project.liveDemo || project.github || project.pypi) && (
      <div className="project-links">
        {project.liveDemo && (
          <a
            href={project.liveDemo}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            <ExternalLink size={16} />
            Live Demo
          </a>
        )}
        {project.github && (
          <a
            href={project.github}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            <Github size={16} />
            GitHub
          </a>
        )}
        {project.pypi && (
          <a
            href={project.pypi}
            target="_blank"
            rel="noopener noreferrer"
            className="project-link"
          >
            <img
              src="https://www.google.com/s2/favicons?domain=pypi.org&sz=32"
              alt="PyPI"
              style={{ width: 16, height: 16, filter: 'invert(1) opacity(0.55)' }}
            />
            PyPI
          </a>
        )}
      </div>
    )}
  </div>
);

export default ProjectCard;
