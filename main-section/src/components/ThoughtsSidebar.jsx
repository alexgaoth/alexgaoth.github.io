import React, { useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronRight, ChevronDown } from 'lucide-react';

const ThoughtsSidebar = ({ articles }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedMonths, setExpandedMonths] = useState({});
  const location = useLocation();

  // Group articles by year and month
  const groupedArticles = useMemo(() => {
    const groups = {};

    articles.forEach(article => {
      const date = new Date(article.date);
      const year = date.getFullYear();
      const month = date.toLocaleString('en-US', { month: 'long' });

      if (!groups[year]) {
        groups[year] = {};
      }

      if (!groups[year][month]) {
        groups[year][month] = [];
      }

      groups[year][month].push(article);
    });

    // Sort years descending
    return Object.keys(groups)
      .sort((a, b) => b - a)
      .reduce((acc, year) => {
        acc[year] = groups[year];
        return acc;
      }, {});
  }, [articles]);

  // Initialize all years as expanded
  const [expandedYears, setExpandedYears] = useState(() => {
    const initialExpanded = {};
    Object.keys(groupedArticles).forEach(year => {
      initialExpanded[year] = true;
    });
    return initialExpanded;
  });

  const monthOrder = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const truncateTitle = (title, maxLength = 40) => {
    return title.length > maxLength ? title.substring(0, maxLength) + '...' : title;
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleYear = (year) => {
    setExpandedYears(prev => ({
      ...prev,
      [year]: !prev[year]
    }));
  };

  const toggleMonth = (yearMonth) => {
    setExpandedMonths(prev => ({
      ...prev,
      [yearMonth]: !prev[yearMonth]
    }));
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="sidebar-mobile-toggle"
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside className={`thoughts-sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-content">
          {Object.entries(groupedArticles).map(([year, months]) => (
            <div key={year} className="sidebar-year">
              <h4
                className="sidebar-year-title clickable"
                onClick={() => toggleYear(year)}
              >
                {expandedYears[year] ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                {year}
              </h4>

              {/* Show months only if year is expanded */}
              {expandedYears[year] && monthOrder
                .filter(month => months[month])
                .map(month => {
                  const yearMonth = `${year}-${month}`;
                  return (
                    <div key={month} className="sidebar-month">
                      <h5
                        className="sidebar-month-title clickable"
                        onClick={() => toggleMonth(yearMonth)}
                      >
                        {expandedMonths[yearMonth] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                        {month}
                      </h5>

                      {/* Show articles only if month is expanded */}
                      {expandedMonths[yearMonth] && (
                        <ul className="sidebar-articles">
                          {months[month].map(article => (
                            <li key={article.slug}>
                              <Link
                                to={`/thoughts/${article.slug}`}
                                className={`sidebar-article-link ${
                                  location.pathname === `/thoughts/${article.slug}` ? 'active' : ''
                                }`}
                                onClick={() => setIsOpen(false)}
                              >
                                {truncateTitle(article.title)}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="sidebar-overlay"
          onClick={toggleSidebar}
        />
      )}
    </>
  );
};

export default ThoughtsSidebar;
