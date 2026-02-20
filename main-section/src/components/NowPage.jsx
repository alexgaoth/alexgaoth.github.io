import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { getNowData } from '../data/nowData';
import SEO from './SEO';

const NowPage = () => {
  const navigate = useNavigate();
  const [nowData, setNowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedBook, setSelectedBook] = useState(null);
  const [isBookFixed, setIsBookFixed] = useState(false);

  useEffect(() => {
    const loadNowData = async () => {
      try {
        const data = await getNowData();
        setNowData(data);
      } catch (error) {
        console.error('Error loading now data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadNowData();
  }, []);

  if (loading) {
    return (
      <div className="page-container bookshelf-page">
        <div className="content-wrapper-narrow">
          <div className="loading-spinner">Loading...</div>
        </div>
      </div>
    );
  }

  const handleBookHover = (index) => {
    if (!isBookFixed) {
      setSelectedBook(index);
    }
  };

  const handleBookLeave = () => {
    if (!isBookFixed) {
      setSelectedBook(null);
    }
  };

  const handleBookClick = (index) => {
    if (selectedBook === index && isBookFixed) {
      setSelectedBook(null);
      setIsBookFixed(false);
    } else {
      setSelectedBook(index);
      setIsBookFixed(true);
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation(); 
  };

  const handleBackgroundClick = (e) => {
    // Only close if clicking outside of book content
    if (e.target.classList.contains('bookshelf-main')) {
      setSelectedBook(null);
      setIsBookFixed(false);
    }
  };

  return (
    <>
      <SEO
        title="Now — Alex Gao"
        description="What Alex Gao (alexgaoth) is doing now."
        keywords="Alex Gao, alexgaoth, now"
        url="https://app.alexgaoth.com/now"
      />
      <div className="page-container bookshelf-page">
      <div className="bookshelf-wrapper">
        <div className="bookshelf-header">
          <button
            onClick={() => navigate('/')}
            className="btn-back-bookshelf"
          >
            <ArrowLeft size={18} />
            Back
          </button>

          <div className="bookshelf-title-section">
            <h1 className="bookshelf-title">{nowData.title}</h1>
            {nowData?.lastUpdated && (
              <p className="bookshelf-last-updated">
                Last updated: {nowData.lastUpdated}
              </p>
            )}
          </div>
        </div>

        <div className="bookshelf-main" onClick={handleBackgroundClick}>
          <div className="bookshelf-container">
            <div className="bookshelf">
              <div className="shelf-wood"></div>
              <div className="books-row">
                {nowData?.sections?.map((section, index) => (
                  <div
                    key={index}
                    className={`book ${selectedBook === index ? 'pulled' : ''}`}
                    style={{
                      '--book-color': ['#8B4513', '#2F4F4F', '#8B0000', '#4B0082', '#006400', '#B8860B'][index % 6],
                      '--book-spine-color': ['#A0522D', '#708090', '#DC143C', '#9370DB', '#228B22', '#DAA520'][index % 6]
                    }}
                    onMouseEnter={() => handleBookHover(index)}
                    onMouseLeave={handleBookLeave}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBookClick(index);
                    }}
                  >
                    <div className="book-spine">
                      <div className="book-title-spine">{section.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {selectedBook !== null && (
            <div className="book-content-display" onClick={handleContentClick}>
              <div className="open-book">
                <h2 className="book-content-title">{nowData.sections[selectedBook].title}</h2>
                <div className="book-content-text">
                  {Array.isArray(nowData.sections[selectedBook].content) ? (
                    nowData.sections[selectedBook].content.map((item, itemIndex) => (
                      <p key={itemIndex} className="book-content-item">
                        {item}
                      </p>
                    ))
                  ) : (
                    Object.entries(nowData.sections[selectedBook].content).map(([key, value], itemIndex) => (
                      <p key={itemIndex} className="book-content-item">
                        <strong>{key}:</strong> {value}
                      </p>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bookshelf-footer">
          <div className="shelf-wood-bottom"></div>
          <p className="bookshelf-footer-text">
            {window.innerWidth >= 768 ? 'Hover over books to preview • Click to pin open' : 'Tap books to read'} • Inspired by Derek Sivers' <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer" className="bookshelf-link">now page movement</a>
            <div class ="footer">
            this page is written with React @2022 (now deprecated)
            <br></br>
            No rights reserved — this work by alex is free to use for any purpose.
            </div>         
          </p>
        </div>
      </div>
    </div>
    </>
  );
};

export default NowPage;

