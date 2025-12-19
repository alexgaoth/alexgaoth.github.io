import React, { useState } from 'react';
import NavigationBar from './NavigationBar';
import SEO from './SEO';
import { ExternalLink, Github, ChevronLeft, ChevronRight } from 'lucide-react';
import CompactViewButton from './CompactViewButton';

const ProjectsPage = ({ data }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [progress, setProgress] = useState(0);
  const totalCards = data.content.length;

  // Calculate optimal grid layout to fit all cards
  const availableHeight = 550;
  const cardHeight = 200;
  const maxRows = Math.floor(availableHeight / cardHeight);
  const optimalColumns = Math.ceil(totalCards / maxRows);
  const actualRows = Math.ceil(totalCards / optimalColumns);

  const nextImage = (projectIndex) => {
    const project = data.content[projectIndex];
    if (!project.images || project.images.length <= 1) return;
    
    setSelectedImageIndex(prev => ({
      ...prev,
      [projectIndex]: ((prev[projectIndex] || 0) + 1) % project.images.length
    }));
  };

  const prevImage = (projectIndex) => {
    const project = data.content[projectIndex];
    if (!project.images || project.images.length <= 1) return;
    
    setSelectedImageIndex(prev => ({
      ...prev,
      [projectIndex]: ((prev[projectIndex] || 0) - 1 + project.images.length) % project.images.length
    }));
  };

  const getCurrentImage = (project, projectIndex) => {
    if (project.images && project.images.length > 0) {
      return  process.env.PUBLIC_URL + project.images[selectedImageIndex[projectIndex] || 0];
    }
    return  process.env.PUBLIC_URL + project.image; // Fallback to single image
  };

  return (
    <>
      <SEO
        title="Projects - alex gaoth | Full-Stack Development Portfolio"
        description="Explore alex gaoth's full-stack development projects including web applications, data visualizations, and creative coding experiments. Built with React, Python, JavaScript, and more."
        keywords="alex gaoth projects, web development projects, React projects, Python projects, full-stack portfolio, software engineering projects"
        url="https://app.alexgaoth.com/projects"
      />
      <NavigationBar />
      <div className="page-container">
      <div className="content-wrapper-narrow">

        <h1 className="title-page">Things That I've Made</h1>

        <CompactViewButton progress={progress} setProgress={setProgress} />

        <div
          className={`grid-1col projects-compact-container ${progress > 0 ? 'compacting' : ''}`}
          style={{
            '--columns': optimalColumns,
            '--rows': actualRows
          }}
        >
          {data.content.map((project, index) => (
            <div key={index} className="project-card">
              {/* Project Image(s) */}
              {(project.image || project.images) && (
                <div className="project-image-container">
                  <img 
                    src={getCurrentImage(project, index)} 
                    alt={`${project.name} preview`}
                    className="project-image"
                  />
                  
                  {/* Image navigation for multiple images */}
                  {project.images && project.images.length > 1 && (
                    <div className="image-nav">
                      <button 
                        onClick={() => prevImage(index)}
                        className="image-nav-btn"
                      >
                        <ChevronLeft size={20} />
                      </button>
                      <span className="image-counter">
                        {(selectedImageIndex[index] || 0) + 1} / {project.images.length}
                      </span>
                      <button 
                        onClick={() => nextImage(index)}
                        className="image-nav-btn"
                      >
                        <ChevronRight size={20} />
                      </button>
                    </div>
                  )}
                </div>
              )}

              <h2 className="title-card">{project.name}</h2>
              
              {/* Tech stack tags */}
              <div className="flex flex-wrap gap-small mb-medium">
                {project.tech.split(', ').map((tech, techIndex) => (
                  <span key={techIndex} className="tag">
                    {tech}
                  </span>
                ))}
              </div>
              
              <p className="text-gray mb-medium">{project.description}</p>

              {/* Project links */}
              {(project.liveDemo || project.github) && (
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
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
};

export default ProjectsPage;