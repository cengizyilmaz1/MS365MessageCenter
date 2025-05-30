import { Message } from '../types';

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

export const generateSitemap = (messages: Message[]): string => {
  const baseUrl = 'https://message.cengizyilmaz.net';
  const currentDate = new Date().toISOString();
  
  const staticPages: SitemapUrl[] = [
    { loc: '/', lastmod: currentDate, changefreq: 'daily', priority: '1.0' },
    { loc: '/about', lastmod: currentDate, changefreq: 'monthly', priority: '0.8' },
    { loc: '/privacy', lastmod: currentDate, changefreq: 'monthly', priority: '0.5' },
    { loc: '/terms', lastmod: currentDate, changefreq: 'monthly', priority: '0.5' }
  ];
  
  // Generate dynamic URLs for each message
  const messageUrls = messages
    .filter(message => {
      const title = message.title || message.Title;
      return title && typeof title === 'string' && title.trim().length > 0;
    })
    .map(message => {
      const title = message.title || message.Title;
      if (!title) return null;
      
      const slug = title.toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
      
      const lastmod = message.lastModifiedDate || message.LastModifiedDateTime || 
                      message.publishedDate || message.StartDateTime || currentDate;
      
      return {
        loc: `/message/${slug}`,
        lastmod: new Date(lastmod).toISOString(),
        changefreq: 'weekly',
        priority: '0.7'
      };
    })
    .filter((url): url is SitemapUrl => url !== null);
  
  const allUrls = [...staticPages, ...messageUrls];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;
  
  return sitemap;
};

export const downloadSitemap = (messages: Message[]) => {
  const sitemap = generateSitemap(messages);
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}; 