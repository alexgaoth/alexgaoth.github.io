import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SITE, buildAppUrl, buildAssetUrl } from '../config/site';

const SEO = ({
  title = SITE.title,
  description = SITE.description,
  keywords = SITE.keywords,
  image,
  imagePath = SITE.defaultImagePath,
  path = '/',
  type = 'website',
  structuredData = [],
  alternates = [],
  publishedTime,
  modifiedTime,
}) => {
  const keywordList = Array.isArray(keywords)
    ? keywords
    : `${keywords}`.split(',').map((keyword) => keyword.trim()).filter(Boolean);

  const canonicalUrl = buildAppUrl(path);
  const imageUrl = image || buildAssetUrl(imagePath);

  // Base Person/WebSite schemas live in public/index.html only (the richer
  // copy, visible to crawlers without JS) — do not re-inject them here.
  const articleStructuredData = type === 'article'
    ? [{
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: title,
        description,
        author: {
          '@type': 'Person',
          name: SITE.name,
          alternateName: SITE.handle,
          url: SITE.rootUrl,
        },
        mainEntityOfPage: canonicalUrl,
        image: [imageUrl],
        datePublished: publishedTime,
        dateModified: modifiedTime || publishedTime,
        keywords: keywordList,
      }]
    : [];

  const allStructuredData = [
    ...articleStructuredData,
    ...structuredData,
  ];

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywordList.join(', ')} />
      <meta name="author" content={SITE.name} />
      <meta name="creator" content={SITE.handle} />
      <meta name="publisher" content={SITE.name} />
      <meta name="robots" content="index, follow" />
      <meta name="application-name" content={SITE.name} />
      <link rel="canonical" href={canonicalUrl} />

      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />

      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={imageUrl} />
      <meta property="twitter:creator" content={SITE.twitterHandle} />

      {publishedTime ? <meta property="article:published_time" content={publishedTime} /> : null}
      {modifiedTime ? <meta property="article:modified_time" content={modifiedTime} /> : null}
      {type === 'article' && keywordList.map((keyword) => (
        <meta key={keyword} property="article:tag" content={keyword} />
      ))}

      {alternates.map(({ href, hrefLang }) => (
        <link key={`${hrefLang}-${href}`} rel="alternate" hrefLang={hrefLang} href={href} />
      ))}
      {SITE.socialProfiles.map((profileUrl) => (
        <link key={profileUrl} rel="me" href={profileUrl} />
      ))}
      {allStructuredData.map((item, index) => (
        <script
          key={index}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(item) }}
        />
      ))}
    </Helmet>
  );
};

export default SEO;
