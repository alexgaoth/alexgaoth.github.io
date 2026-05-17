import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CompactViewButton from '../components/CompactViewButton';
import SEO from '../components/SEO';
import ContentPage from '../components/layout/ContentPage';
import ProjectCard from '../components/projects/ProjectCard';
import { APP_ROUTES } from '../config/site';
import { getCompactGridDimensions } from '../utils/compactGrid';

const projectSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ProjectsPage = ({ data }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [progress, setProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1));
      if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
    }
  }, [location.hash]);
  const totalCards = data.content.length;
  const { columns, rows } = getCompactGridDimensions(totalCards);

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
      return process.env.PUBLIC_URL + project.images[selectedImageIndex[projectIndex] || 0];
    }
    return process.env.PUBLIC_URL + project.image;
  };

  return (
    <>
      <SEO
        title="Projects — Alex Gao"
        description="Things Alex Gao (alexgaoth) has built."
        keywords={['Alex Gao', 'alexgaoth', 'Student Builder', 'projects']}
        path={APP_ROUTES.projects}
      />
      <ContentPage>

        <h1 className="title-page">Things That I've Made</h1>

        <CompactViewButton progress={progress} setProgress={setProgress} isProjectsPage />

        <div
          className={`grid-1col projects-compact-container ${progress > 0 ? 'compacting' : ''}`}
          style={{
            '--columns': columns,
            '--rows': rows
          }}
        >
          {data.content.map((project, index) => (
            <div key={index} id={`project-${projectSlug(project.name)}`}>
              <ProjectCard
                project={project}
                index={index}
                currentImage={getCurrentImage(project, index)}
                selectedImageIndex={selectedImageIndex[index] || 0}
                onPreviousImage={prevImage}
                onNextImage={nextImage}
              />
            </div>
          ))}
        </div>
      </ContentPage>
    </>
  );
};

export default ProjectsPage;
