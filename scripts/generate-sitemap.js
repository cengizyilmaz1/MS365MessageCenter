import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const BASE_URL = 'https://message.cengizyilmaz.net';
const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');
const DATA_DIR = path.join(__dirname, '../@data');

// Clean title by removing 'Updated:', 'Update:' gibi önekleri
function cleanTitle(title) {
  return title.replace(/^(updated|update)[:\-\s]+/i, '').trim();
}

// Generate slug from cleaned title
function generateSlug(title) {
  if (!title) return '';
  const cleaned = cleanTitle(title);
  return cleaned
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate message ID from title (same as in MessageDetail.tsx)
function generateMessageId(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Validate message data
function isValidMessage(msg) {
  return (
    msg &&
    (msg.Title || msg.title) && // Must have a title
    (msg.Id || msg.id) && // Must have an ID
    (msg.StartDateTime || msg.publishedDate) // Must have a publish date
  );
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
      
      // Filter and process valid messages
      messageUrls = messagesData
        .filter(isValidMessage)
        .map(msg => {
          const title = msg.Title || msg.title || '';
          const id = msg.Id || msg.id || '';
          const messageId = generateSlug(title);
          
          // Skip if no valid ID could be generated
          if (!messageId) {
            console.warn(`Skipping message ${id} - could not generate valid ID from title: ${title}`);
            return null;
          }
          
          const messageUrl = `${BASE_URL}/message/${messageId}`;
          const lastMod = msg.LastModifiedDateTime || msg.lastModifiedDate || msg.StartDateTime || msg.publishedDate || today;
          
          return {
            loc: messageUrl,
            lastmod: new Date(lastMod).toISOString().split('T')[0],
            changefreq: 'weekly',
            priority: '0.7'
          };
        })
        .filter(Boolean); // Remove any null entries
      
      console.log(`✓ Generated ${messageUrls.length} valid message URLs`);
      
      // Log any skipped messages
      const skippedCount = messagesData.length - messageUrls.length;
      if (skippedCount > 0) {
        console.warn(`⚠ Skipped ${skippedCount} invalid messages`);
      }
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Combine all URLs
  const allUrls = [...staticUrls, ...messageUrls];

  // Generate XML with XSL stylesheet
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allUrls.map(url => `<url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n  ')}
</urlset>`;

  try {
    // Write sitemap XML
    await fs.promises.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
    console.log(`✓ Sitemap written to public folder`);
    
    if (fs.existsSync(DIST_DIR)) {
      await fs.promises.writeFile(path.join(DIST_DIR, 'sitemap.xml'), xml);
      console.log(`✓ Sitemap written to dist folder`);
    }

    // Write XSL stylesheet
    const xsl = await fs.promises.readFile(path.join(__dirname, '../public/sitemap.xsl'), 'utf8');
    await fs.promises.writeFile(path.join(PUBLIC_DIR, 'sitemap.xsl'), xsl);
    console.log(`✓ XSL stylesheet written to public folder`);
    
    if (fs.existsSync(DIST_DIR)) {
      await fs.promises.writeFile(path.join(DIST_DIR, 'sitemap.xsl'), xsl);
      console.log(`✓ XSL stylesheet written to dist folder`);
    }
    
    console.log(`✓ Sitemap generated with ${allUrls.length} URLs!`);
  } catch (error) {
    console.error('Error writing sitemap files:', error);
  }
}

// Run the generator
generateSitemap().catch(console.error); 