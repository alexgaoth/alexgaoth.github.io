import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO component for managing page metadata dynamically
 * Install: npm install react-helmet-async
 * Wrap your app with: import { HelmetProvider } from 'react-helmet-async';
 */

const SEO = ({
  title = "alex gaoth's Portfolio",
  description = "Portfolio of alex gaoth: Math-CS student at UCSD, full-stack developer, and DevOps enthusiast.",
  keywords = "alex gaoth, alexgaoth, Alex Gao, Portfolio, UCSD, Full-Stack Developer, React, Python",
  image = "https://alexgaoth.com/main-section/logo.jpg",
  url = "https://alexgaoth.com/main-section/",
  type = "website"
}) => {
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={url} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
    </Helmet>
  );
};

export default SEO;
