import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import NavNowButton from './NavNowButton';
import { APP_ROUTES, NAVIGATION_ITEMS } from '../config/site';

const NavigationBar = () => {
  const location = useLocation();

  // Filter out the current page
  const otherPages = NAVIGATION_ITEMS.filter(page => page.path !== location.pathname);

  return (
    <nav className="navigation-bar">
      <div className="nav-back">
        <Link to={APP_ROUTES.home} state={{ skipParallax: true }} className="nav-back-button">
          <ArrowLeft size={20} />
          <span>Home</span>
        </Link>
      </div>

      <div className="nav-links">
        {otherPages.map(page => (
          page.isNowButton ? (
            <NavNowButton key={page.path} />
          ) : (
            <Link
              key={page.path}
              to={page.path}
              className="nav-link"
            >
              {page.label}
            </Link>
          )
        ))}
      </div>
    </nav>
  );
};

export default NavigationBar;
