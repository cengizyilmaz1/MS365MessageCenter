import { Message } from '../types';

interface SitemapUrl {
  loc: string;
  lastmod?: string;
  changefreq: string;
  priority: string;
}

export const generateSitemap = (messages: Message[]): string => {
  const baseUrl = 'https://message.cengizyilmaz.net';
  const currentDate = new Date().toISOString();
  
  const staticPages: SitemapUrl[] = [
    { loc: '/', changefreq: 'daily', priority: '1.0' },
    { loc: '/about', changefreq: 'monthly', priority: '0.8' }
  ];
  
  // Generate dynamic URLs for each message
  const messageUrls: SitemapUrl[] = messages.map(message => {
    const title = message.title || message.Title || '';
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const lastmod = message.lastModifiedDate || message.LastModifiedDateTime || 
                    message.publishedDate || message.StartDateTime || currentDate;
    
    return {
      loc: `/message/${slug}`,
      lastmod: new Date(lastmod).toISOString(),
      changefreq: 'weekly',
      priority: '0.7'
    };
  });
  
  const allUrls = [...staticPages, ...messageUrls];
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${baseUrl}${url.loc}</loc>
    ${url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : `<lastmod>${currentDate}</lastmod>`}
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