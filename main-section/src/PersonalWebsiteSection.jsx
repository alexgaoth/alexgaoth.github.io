import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MainPage from './components/MainPage';
import ResumePage from './components/ResumePage';
import ProjectsPage from './components/ProjectsPage';
import ThoughtsPage from './components/ThoughtsPage';
import QuotesPage from './components/QuotesPage';
import NowPage from './components/NowPage';
import { content } from './data/content';
import { getNowData } from './data/nowData';
import './styles/global.css';
import './styles/components.css';
import './styles/bookshelf.css';

const PersonalWebsiteSection = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState('main');

  // Update current page based on route
  useEffect(() => {
    const path = location.pathname.replace('/main-section', '').replace('/', '');
    if (path && path !== currentPage) {
      setCurrentPage(path || 'main');
    }
  }, [location, currentPage]);

  // Handle page navigation
  const handleSetCurrentPage = (page) => {
    setCurrentPage(page);
    navigate(page === 'main' ? '/' : `/${page}`);
  };

  const renderPage = () => {
    switch(currentPage) {
      case 'now': return <NowPage data={getNowData} setCurrentPage={handleSetCurrentPage}/>
      case 'resume': return <ResumePage data={content.resume} setCurrentPage={handleSetCurrentPage} />;
      case 'projects': return <ProjectsPage data={content.projects} setCurrentPage={handleSetCurrentPage} />;
      case 'thoughts': return <ThoughtsPage data={content.thoughts} setCurrentPage={handleSetCurrentPage} />;
      case 'quotes': return <QuotesPage data={content.quotes} setCurrentPage={handleSetCurrentPage} />;
      default: return <MainPage content={content} setCurrentPage={handleSetCurrentPage} />;
    }
  };

  return renderPage();
};

export default PersonalWebsiteSection;