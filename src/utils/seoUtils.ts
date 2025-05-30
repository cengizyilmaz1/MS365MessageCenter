import { Message } from '../types';

export const generateMetaDescription = (message: Message | any): string => {
  // Try to get content from various fields
  const title = message.title || message.Title || '';
  const summary = message.summary || message.Summary || '';
  const content = message.content || message.Body?.Content || '';
  const category = message.category || message.Category || '';
  const service = message.service || message.Services?.[0] || 'Microsoft 365';
  
  // Remove HTML tags
  const cleanContent = content.replace(/<[^>]*>/g, '');
  
  // Priority order for description
  if (summary && summary.length > 0) {
    return summary.length > 160 ? summary.substring(0, 157) + '...' : summary;
  }
  
  if (cleanContent && cleanContent.length > 0) {
    const description = cleanContent.substring(0, 157) + '...';
    return description;
  }
  
  // Fallback description
  return `${service} ${category.replace(/_/g, ' ')} update: ${title.substring(0, 100)}${title.length > 100 ? '...' : ''}`;
};

export const generateKeywords = (message: Message | any): string[] => {
  const keywords: string[] = [];
  
  // Add service/platform
  const service = message.service || message.Services?.[0] || 'Microsoft 365';
  keywords.push(service);
  
  // Add category
  const category = message.category || message.Category || '';
  if (category) {
    keywords.push(category.replace(/_/g, ' '));
  }
  
  // Add tags
  const tags = message.tags || message.Tags || [];
  keywords.push(...tags);
  
  // Add severity
  const severity = message.severity || message.Severity || '';
  if (severity) {
    keywords.push(severity);
  }
  
  // Extract key words from title
  const title = message.title || message.Title || '';
  const titleWords = title.split(' ')
    .filter(word => word.length > 4)
    .slice(0, 5);
  keywords.push(...titleWords);
  
  // Add platform-specific keywords
  if (message.affectedWorkloads && message.affectedWorkloads.length > 0) {
    keywords.push(...message.affectedWorkloads);
  }
  
  // Add common keywords
  keywords.push('Microsoft 365', 'Office 365', 'M365', 'Update', 'Service Announcement');
  
  // Remove duplicates and empty values
  return [...new Set(keywords.filter(k => k && k.trim().length > 0))];
};

export const generateCanonicalUrl = (message: Message | any): string => {
  const baseUrl = 'https://message.cengizyilmaz.net';
  const title = message.title || message.Title || '';
  const slug = title.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  return `${baseUrl}/message/${slug}`;
};

export const generateStructuredData = (message: Message | any) => {
  const title = message.title || message.Title || '';
  const description = generateMetaDescription(message);
  const keywords = generateKeywords(message);
  const url = generateCanonicalUrl(message);
  
  return {
    '@context': 'https://schema.org',
    '@type': 'TechArticle',
    'headline': title,
    'description': description,
    'keywords': keywords.join(', '),
    'url': url,
    'datePublished': message.publishedDate || message.StartDateTime,
    'dateModified': message.lastModifiedDate || message.LastModifiedDateTime || message.publishedDate,
    'author': {
      '@type': 'Organization',
      'name': 'Microsoft',
      'url': 'https://www.microsoft.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Microsoft 365 Message Center',
      'url': 'https://message.cengizyilmaz.net',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://message.cengizyilmaz.net/logo.svg'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': url
    },
    'articleSection': message.category || message.Category || 'Service Update',
    'inLanguage': 'en',
    'isAccessibleForFree': true,
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Microsoft 365 Message Center',
      'url': 'https://message.cengizyilmaz.net'
    }
  };
}; 