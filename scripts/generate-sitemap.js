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
          const messageSlug = generateSlug(title);
          
          // Skip if no valid slug could be generated
          if (!messageSlug) {
            console.warn(`Skipping message ${id} - could not generate valid slug from title: ${title}`);
            return null;
          }
          
          const messageUrl = `${BASE_URL}/message/${messageSlug}`;
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

  // Generate XSL stylesheet
  const xsl = `<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - Microsoft 365 Message Center</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #333;
            max-width: 75em;
            margin: 0 auto;
            padding: 2em;
            background: #f5f5f5;
          }
          h1 {
            color: #1a73e8;
            font-size: 2em;
            margin-bottom: 1em;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 1em 0;
            background: white;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            border-radius: 8px;
            overflow: hidden;
          }
          th {
            background: #1a73e8;
            color: white;
            font-weight: 500;
            text-align: left;
            padding: 1em;
          }
          td {
            padding: 1em;
            border-bottom: 1px solid #eee;
          }
          tr:hover {
            background: #f8f9fa;
          }
          a {
            color: #1a73e8;
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .url-count {
            background: #e8f0fe;
            color: #1a73e8;
            padding: 0.5em 1em;
            border-radius: 4px;
            font-weight: 500;
            margin-bottom: 1em;
            display: inline-block;
          }
          .footer {
            margin-top: 2em;
            padding-top: 1em;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9em;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap</h1>
        <div class="url-count">
          Total URLs: <xsl:value-of select="count(sitemap:urlset/sitemap:url)"/>
        </div>
        <table>
          <tr>
            <th>URL</th>
            <th>Last Modified</th>
            <th>Change Frequency</th>
            <th>Priority</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}">
                  <xsl:value-of select="sitemap:loc"/>
                </a>
              </td>
              <td><xsl:value-of select="sitemap:lastmod"/></td>
              <td><xsl:value-of select="sitemap:changefreq"/></td>
              <td><xsl:value-of select="sitemap:priority"/></td>
            </tr>
          </xsl:for-each>
        </table>
        <div class="footer">
          <p>This sitemap was generated for Microsoft 365 Message Center.</p>
          <p>Last generated: <xsl:value-of select="current-dateTime()"/></p>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>`;

  try {
    // Write sitemap XML
    await fs.promises.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml);
    console.log(`✓ Sitemap written to public folder`);
    
    if (fs.existsSync(DIST_DIR)) {
      await fs.promises.writeFile(path.join(DIST_DIR, 'sitemap.xml'), xml);
      console.log(`✓ Sitemap written to dist folder`);
    }

    // Write XSL stylesheet
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