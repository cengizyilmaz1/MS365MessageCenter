import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article';
}

const SEO: React.FC<SEOProps> = ({
  title = 'Microsoft 365 Message Center',
  description = 'Stay updated with all Microsoft 365 service announcements, planned maintenance, and feature updates.',
  keywords = ['Microsoft 365', 'Office 365', 'Service Updates', 'Maintenance', 'Feature Updates'],
  image = 'https://message.cengizyilmaz.net/og-image.png',
  url = 'https://message.cengizyilmaz.net',
  type = 'website'
}) => {
  const siteTitle = title.includes('Microsoft 365') ? title : `${title} | Microsoft 365 Message Center`;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords.join(', ')} />

      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="Microsoft 365 Message Center" />

      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO; 