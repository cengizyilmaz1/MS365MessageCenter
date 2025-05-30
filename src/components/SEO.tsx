import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  tags?: string[];
}

const SEO: React.FC<SEOProps> = ({
  title = 'Microsoft 365 Message Center',
  description = 'Stay updated with all Microsoft 365 service announcements, planned maintenance, and feature updates.',
  keywords = ['Microsoft 365', 'Office 365', 'Service Updates', 'Maintenance', 'Feature Updates'],
  image = 'https://message.cengizyilmaz.net/og-image.png',
  url = 'https://message.cengizyilmaz.net',
  type = 'website',
  publishedTime,
  modifiedTime,
  author = 'Microsoft 365 Team',
  tags = []
}) => {
  const siteTitle = title.includes('Microsoft 365') ? title : `${title} | Microsoft 365 Message Center`;
  const currentUrl = typeof window !== 'undefined' ? window.location.href : url;
  const allKeywords = [...new Set([...keywords, ...tags])];

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={allKeywords.join(', ')} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={currentUrl} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Microsoft 365 Message Center" />
      {type === 'article' && (
        <>
          <meta property="article:published_time" content={publishedTime} />
          <meta property="article:modified_time" content={modifiedTime} />
          <meta property="article:author" content={author} />
          {tags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={currentUrl} />

      {/* Structured Data */}
      {type === 'article' && (
        <script type="application/ld+json">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: siteTitle,
            description: description,
            image: image,
            datePublished: publishedTime,
            dateModified: modifiedTime,
            author: {
              '@type': 'Organization',
              name: author
            },
            publisher: {
              '@type': 'Organization',
              name: 'Microsoft 365',
              logo: {
                '@type': 'ImageObject',
                url: 'https://message.cengizyilmaz.net/logo.svg'
              }
            },
            keywords: allKeywords.join(', '),
            url: currentUrl
          })}
        </script>
      )}
    </Helmet>
  );
};

export default SEO; 