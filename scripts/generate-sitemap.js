import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://message.cengizyilmaz.net';
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');
const DATA_DIR = path.join(__dirname, '../@data');

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

// Generate message ID - matching the logic in src/utils/slug.ts
function generateMessageId(title, id) {
  // If we have an ID, use it directly (matching the updated logic)
  if (id) {
    return id.toString();
  }
  // Otherwise fall back to slug
  return generateSlug(title);
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

  // Try to read messages from @data directory
  let messageUrls = [];
  try {
    // Try @data directory first
    let messagesPath = path.join(DATA_DIR, 'messages.json');
    
    // Fallback to dist directory
    if (!fs.existsSync(messagesPath)) {
      messagesPath = path.join(DIST_DIR, '@data', 'messages.json');
    }
    
    // Fallback to public directory
    if (!fs.existsSync(messagesPath)) {
      messagesPath = path.join(PUBLIC_DIR, 'messages.json');
    }
    
    if (fs.existsSync(messagesPath)) {
      const messagesData = JSON.parse(await fs.promises.readFile(messagesPath, 'utf8'));
      
      messageUrls = messagesData.map(msg => {
        const title = msg.Title || msg.title || '';
        
        // Always use title slug for URLs (matching MessageCard and MessageDetail)
        const messageSlug = generateSlug(title);
        const messageUrl = `${BASE_URL}/message/${messageSlug}`;
        
        const lastMod = msg.LastModifiedDateTime || msg.lastModifiedDate || msg.StartDateTime || msg.publishedDate || today;
        
        return {
          loc: messageUrl,
          lastmod: new Date(lastMod).toISOString().split('T')[0],
          changefreq: 'weekly',
          priority: '0.7'
        };
      });
      
      console.log(`✓ Generated ${messageUrls.length} message URLs`);
    }
  } catch (error) {
    console.warn('Could not read messages.json:', error);
  }

  // Combine all URLs
  const allUrls = [...staticUrls, ...messageUrls];

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `<url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n  ')}
</urlset>`;

  // Write sitemap to both public and dist directories
  const publicSitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  const distSitemapPath = path.join(DIST_DIR, 'sitemap.xml');
  
  await fs.promises.writeFile(publicSitemapPath, xml);
  console.log(`✓ Sitemap written to public folder`);
  
  if (fs.existsSync(DIST_DIR)) {
    await fs.promises.writeFile(distSitemapPath, xml);
    console.log(`✓ Sitemap written to dist folder`);
  }
  
  console.log(`✓ Sitemap generated with ${allUrls.length} URLs!`);
}

// Run the generator
generateSitemap().catch(console.error); 