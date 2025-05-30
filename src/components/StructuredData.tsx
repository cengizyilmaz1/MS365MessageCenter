import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Message } from '../types';

interface StructuredDataProps {
  message?: Message;
  type: 'website' | 'article';
}

const StructuredData: React.FC<StructuredDataProps> = ({ message, type }) => {
  const baseData = {
    '@context': 'https://schema.org',
    '@type': type === 'website' ? 'WebSite' : 'Article',
    name: type === 'website' ? 'Microsoft 365 Message Center' : (message?.title || message?.Title || 'Microsoft 365 Update'),
    description: type === 'website' 
      ? 'Stay updated with all Microsoft 365 service announcements and changes'
      : (message?.summary || message?.Body?.Content?.substring(0, 160) || 'Microsoft 365 service update'),
    url: type === 'website' 
      ? 'https://message.cengizyilmaz.net'
      : `https://message.cengizyilmaz.net/message/${(message?.title || message?.Title || '').toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    publisher: {
      '@type': 'Organization',
      name: 'Microsoft 365 Message Center',
      logo: {
        '@type': 'ImageObject',
        url: 'https://message.cengizyilmaz.net/logo.png'
      }
    }
  };

  if (type === 'article' && message) {
    Object.assign(baseData, {
      datePublished: message.publishedDate || message.StartDateTime,
      dateModified: message.lastModifiedDate || message.LastModifiedDateTime,
      author: {
        '@type': 'Organization',
        name: 'Microsoft 365'
      },
      keywords: [
        ...(message.tags || message.Tags || []),
        message.service || message.Services?.[0] || 'Microsoft 365',
        message.category || message.Category || 'Update'
      ].join(', ')
    });
  }

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(baseData)}
      </script>
    </Helmet>
  );
};

export default StructuredData; 