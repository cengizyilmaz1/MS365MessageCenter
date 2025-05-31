const fs = require('fs');
const path = require('path');
const glob = require('glob');

const BASE_URL = 'https://message.cengizyilmaz.net';
const PUBLIC_DIR = path.join(__dirname, '../public');

// Get all message files
const messageFiles = glob.sync(path.join(__dirname, '../data/messages/*.json'));

// Generate sitemap XML
function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  const urls = [
    {
      loc: `${BASE_URL}/`,
      lastmod: today,
      changefreq: 'daily',
      priority: '1.0'
    },
    {
      loc: `${BASE_URL}/messages`,
      lastmod: today,
      changefreq: 'daily',
      priority: '0.9'
    },
    {
      loc: `${BASE_URL}/about`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.8'
    },
    {
      loc: `${BASE_URL}/privacy`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    },
    {
      loc: `${BASE_URL}/terms`,
      lastmod: today,
      changefreq: 'monthly',
      priority: '0.5'
    }
  ];

  // Add message URLs
  messageFiles.forEach(file => {
    const messageData = JSON.parse(fs.readFileSync(file, 'utf8'));
    const messageId = path.basename(file, '.json');
    urls.push({
      loc: `${BASE_URL}/message/${messageId}`,
      lastmod: messageData.lastModified || today,
      changefreq: 'weekly',
      priority: '0.7'
    });
  });

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

  // Write sitemap
  fs.writeFileSync(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log('Sitemap generated successfully!');
}

generateSitemap(); 