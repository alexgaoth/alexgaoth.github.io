import React, { useState } from 'react';
import CompactViewButton from '../components/CompactViewButton';
import SEO from '../components/SEO';
import ContentPage from '../components/layout/ContentPage';
import ProjectCard from '../components/projects/ProjectCard';
import { APP_ROUTES } from '../config/site';
import { getCompactGridDimensions } from '../utils/compactGrid';

const ProjectsPage = ({ data }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState({});
  const [progress, setProgress] = useState(0);
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
            <ProjectCard
              key={index}
              project={project}
              index={index}
              currentImage={getCurrentImage(project, index)}
              selectedImageIndex={selectedImageIndex[index] || 0}
              onPreviousImage={prevImage}
              onNextImage={nextImage}
            />
          ))}
        </div>
      </ContentPage>
    </>
  );
};

export default ProjectsPage;
