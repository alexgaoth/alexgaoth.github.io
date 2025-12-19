import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NavigationBar = () => {
  const location = useLocation();

  const pages = [
    { path: '/resume', label: 'Resume' },
    { path: '/projects', label: 'Things I Made' },
    { path: '/thoughts', label: 'Thoughts' },
    { path: '/quotes', label: 'Quotes' },
    { path: '/now', label: 'Now' }
  ];

  // Filter out the current page
  const otherPages = pages.filter(page => page.path !== location.pathname);

  return (
    <nav className="navigation-bar">
      <div className="nav-back">
        <Link to="/" className="nav-back-button">
          <ArrowLeft size={20} />
          <span>Home</span>
        </Link>
      </div>

      <div className="nav-links">
        {otherPages.map(page => (
          <Link
            key={page.path}
            to={page.path}
            className="nav-link"
          >
            {page.label}
          </Link>
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
