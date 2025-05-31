import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://message.cengizyilmaz.net';
const PUBLIC_DIR = path.join(__dirname, '../public');

// Generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate message ID
function generateMessageId(title, id) {
  const slug = generateSlug(title);
  if (id) {
    return `${id}-${slug}`.substring(0, 100);
  }
  return slug;
}

// Generate sitemap XML
async function generateSitemap() {
  const today = new Date().toISOString().split('T')[0];
  
  // Static pages
  const staticUrls = [
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

  // Try to read messages from public directory
  let messageUrls = [];
  try {
    const messagesPath = path.join(PUBLIC_DIR, 'messages.json');
    if (fs.existsSync(messagesPath)) {
      const messagesData = JSON.parse(await fs.promises.readFile(messagesPath, 'utf8'));
      
      messageUrls = messagesData.map(msg => {
        const title = msg.Title || msg.title || '';
        const id = msg.Id || msg.id || '';
        const messageSlugId = generateMessageId(title, id.toString());
        const lastMod = msg.LastModifiedDateTime || msg.lastModifiedDate || msg.StartDateTime || msg.publishedDate || today;
        
        return {
          loc: `${BASE_URL}/message/${messageSlugId}`,
          lastmod: new Date(lastMod).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.7'
        };
      });
    }
  } catch (error) {
    console.warn('Could not read messages.json:', error);
  }

  // Combine all URLs
  const allUrls = [...staticUrls, ...messageUrls];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('')}
</urlset>`;

  // Write sitemap
  await fs.promises.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
  console.log(`Sitemap generated successfully with ${allUrls.length} URLs!`);
}

// Run the generator
generateSitemap().catch(console.error); 