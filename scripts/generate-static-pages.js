import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Console colors
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.bright}${colors.yellow}✗${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.magenta}▶${colors.reset} ${colors.bright}${msg}${colors.reset}`)
};

async function ensureDirectoryExists(dirPath) {
  try {
    await fs.access(dirPath);
  } catch {
    await fs.mkdir(dirPath, { recursive: true });
    log.info(`Created directory: ${dirPath}`);
  }
}

async function copyDirectory(src, dest) {
  await ensureDirectoryExists(dest);
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      // Skip archive and backups directories
      if (entry.name === 'archive' || entry.name === 'backups') {
        log.warning(`Skipping ${entry.name} directory to reduce build size`);
        continue;
      }
      await copyDirectory(srcPath, destPath);
    } else {
      await fs.copyFile(srcPath, destPath);
    }
  }
}

async function generateStaticPages() {
  log.section('🚀 Starting static site generation...');
  
  const distPath = path.join(__dirname, '..', 'dist');
  const publicPath = path.join(__dirname, '..', 'public');
  const dataPath = path.join(__dirname, '..', 'public', 'data');
  const atDataPath = path.join(__dirname, '..', '@data');
  
  try {
    // 1. Ensure dist directory exists
    log.info('Preparing dist directory...');
    await ensureDirectoryExists(distPath);
    
    // 2. Copy public files (excluding index.html which is handled by Vite)
    log.info('Copying public files...');
    const publicFiles = await fs.readdir(publicPath);
    for (const file of publicFiles) {
      if (file !== 'index.html' && file !== 'data') { // Skip index.html and data dir
        const srcPath = path.join(publicPath, file);
        const destPath = path.join(distPath, file);
        const stat = await fs.stat(srcPath);
        
        if (stat.isDirectory()) {
          await copyDirectory(srcPath, destPath);
        } else {
          await fs.copyFile(srcPath, destPath);
        }
      }
    }
    log.success('Public files copied');
    
    // 3. Create data directory in dist
    log.info('Setting up data directory...');
    const distDataPath = path.join(distPath, 'data');
    await ensureDirectoryExists(distDataPath);
    
    // 4. Copy blog posts CSV
    log.info('Copying blog posts data...');
    try {
      const blogPostFile = 'CengizYILMAZBlogPost_latest.csv';
      const blogSrcPath = path.join(dataPath, blogPostFile);
      const blogDestPath = path.join(distDataPath, blogPostFile);
      await fs.copyFile(blogSrcPath, blogDestPath);
      log.success('Blog posts data copied');
    } catch (error) {
      log.warning('Blog posts file not found, skipping...');
    }
    
    // 5. Copy @data contents
    log.info('Copying message data...');
    const atDataDestPath = path.join(distPath, '@data');
    await copyDirectory(atDataPath, atDataDestPath);
    log.success('Message data copied');
    
    // 6. Generate static HTML pages for messages
    log.info('Generating static message pages...');
    await generateMessagePages(distPath, atDataPath);
    log.success('Static message pages generated');
    
    // 7. Generate dynamic sitemap
    log.info('Generating dynamic sitemap...');
    await generateSitemap(distPath, atDataPath);
    log.success('Sitemap generated');
    
    // 8. Generate service worker for PWA
    log.info('Generating service worker...');
    await generateServiceWorker(distPath);
    log.success('Service worker generated');
    
    // 9. Create .nojekyll file for GitHub Pages
    await fs.writeFile(path.join(distPath, '.nojekyll'), '');
    log.success('Created .nojekyll file');
    
    // 10. Generate build info
    const buildInfo = {
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0',
      commit: process.env.GITHUB_SHA || 'local',
      environment: process.env.NODE_ENV || 'production'
    };
    await fs.writeFile(
      path.join(distPath, 'build-info.json'),
      JSON.stringify(buildInfo, null, 2)
    );
    log.success('Build info generated');
    
    // Calculate and log build size
    const buildSize = await calculateDirectorySize(distPath);
    log.info(`Total build size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
    
    if (buildSize > 1000 * 1024 * 1024) { // If over 1GB
      log.error(`Build size exceeds 1GB! Current size: ${(buildSize / 1024 / 1024).toFixed(2)} MB`);
      log.warning('Check for unnecessary files or large assets');
    }
    
    log.section('✨ Static site generation completed successfully!');
    
  } catch (error) {
    log.error(`Error during static generation: ${error.message}`);
    process.exit(1);
  }
}

async function calculateDirectorySize(dirPath) {
  let totalSize = 0;
  const files = await fs.readdir(dirPath, { withFileTypes: true });
  
  for (const file of files) {
    const filePath = path.join(dirPath, file.name);
    if (file.isDirectory()) {
      totalSize += await calculateDirectorySize(filePath);
    } else {
      const stats = await fs.stat(filePath);
      totalSize += stats.size;
    }
  }
  
  return totalSize;
}

// Generate slug from title - matching src/utils/slug.ts logic
function generateSlug(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Keep letters, numbers, spaces, and hyphens
    .replace(/[\s_]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

async function generateSitemap(distPath, dataPath) {
  const messagesPath = path.join(dataPath, 'messages.json');
  const messagesData = await fs.readFile(messagesPath, 'utf-8');
  const messages = JSON.parse(messagesData);
  
  const baseUrl = 'https://message.cengizyilmaz.net';
  const currentDate = new Date().toISOString();
  
  // Generate regular sitemap
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/messages</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/about</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/privacy</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>${baseUrl}/terms</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>yearly</changefreq>
    <priority>0.5</priority>
  </url>`;

  // Add message pages
  for (const message of messages) {
    const title = message.title || message.Title;
    if (!title) continue;
    
    const slug = generateSlug(title);
    
    const lastmod = message.lastModifiedDate || message.LastModifiedDateTime || 
                    message.publishedDate || message.StartDateTime || currentDate;
    
    sitemap += `
  <url>
    <loc>${baseUrl}/message/${slug}</loc>
    <lastmod>${new Date(lastmod).toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
  }
  
  sitemap += '\n</urlset>';
  
  // Generate news sitemap
  let newsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <news:news>
      <news:publication>
        <news:name>Microsoft 365 Message Center</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${currentDate}</news:publication_date>
      <news:title>Microsoft 365 Message Center - Latest Updates</news:title>
    </news:news>
  </url>`;

  // Add message pages to news sitemap
  for (const message of messages) {
    const title = message.title || message.Title;
    if (!title) continue;
    
    const slug = generateSlug(title);
    
    const publishedDate = message.publishedDate || message.StartDateTime || currentDate;
    const tags = (message.tags || message.Tags || []).join(', ');
    
    newsSitemap += `
  <url>
    <loc>${baseUrl}/message/${slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Microsoft 365 Message Center</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${new Date(publishedDate).toISOString()}</news:publication_date>
      <news:title>${title}</news:title>
      <news:keywords>${tags}</news:keywords>
    </news:news>
  </url>`;
  }
  
  newsSitemap += '\n</urlset>';
  
  // Write both sitemaps
  await fs.writeFile(path.join(distPath, 'sitemap.xml'), sitemap);
  await fs.writeFile(path.join(distPath, 'news-sitemap.xml'), newsSitemap);
}

async function generateServiceWorker(distPath) {
  const swContent = `// Service Worker for Microsoft 365 Message Center
const CACHE_NAME = 'message-center-v${process.env.npm_package_version || '1.0.0'}';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
  '/@data/messages.json',
  '/data/CengizYILMAZBlogPost_latest.csv'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});`;

  await fs.writeFile(path.join(distPath, 'sw.js'), swContent);
}

async function generateMessagePages(distPath, dataPath) {
  const messagesPath = path.join(dataPath, 'messages.json');
  const messagesData = await fs.readFile(messagesPath, 'utf-8');
  const messages = JSON.parse(messagesData);
  
  // Read the main index.html as template
  const indexPath = path.join(distPath, 'index.html');
  const indexHtml = await fs.readFile(indexPath, 'utf-8');
  
  // Create message directory
  const messageDir = path.join(distPath, 'message');
  await ensureDirectoryExists(messageDir);
  
  let generatedCount = 0;
  
  for (const message of messages) {
    const title = message.title || message.Title;
    if (!title) continue;
    
    // Generate stable slug from title
    const slug = generateSlug(title);
    
    // Create message-specific HTML with proper meta tags and source information
    const messageHtml = generateMessageHtml(indexHtml, message, slug);
    
    // Write the HTML file - create both with and without trailing slash
    const messagePath = path.join(messageDir, slug);
    await ensureDirectoryExists(messagePath);
    
    // Write index.html in the slug directory
    await fs.writeFile(path.join(messagePath, 'index.html'), messageHtml);
    
    // Also write the HTML file directly in the message directory for direct access
    await fs.writeFile(path.join(messageDir, `${slug}.html`), messageHtml);
    
    generatedCount++;
  }
  
  log.info(`Generated ${generatedCount} static message pages`);
}

function generateMessageHtml(template, message, slug) {
  const title = message.title || message.Title || 'Microsoft 365 Update';
  const pageTitle = `${title} | Microsoft 365 Message Center`;
  
  // Extract description
  let description = '';
  if (message.summary) {
    description = message.summary;
  } else if (message.content || message.Body?.Content) {
    const text = (message.content || message.Body?.Content || '').replace(/<[^>]+>/g, '');
    description = text.substring(0, 160).trim();
  } else {
    description = 'Microsoft 365 service update and announcement details.';
  }
  
  // Extract keywords and source information
  const tags = message.tags || message.Tags || [];
  const keywords = [
    ...tags,
    'Microsoft 365',
    'Message Center',
    message.category || message.Category || 'Update',
    message.service || message.Services?.[0] || 'Microsoft 365'
  ].filter(Boolean).join(', ');
  
  // Source information
  const source = {
    name: message.source || message.Source || 'Microsoft 365 Message Center',
    url: message.sourceUrl || message.SourceUrl || 'https://admin.microsoft.com',
    type: message.sourceType || message.SourceType || 'Official'
  };
  
  // Published and modified dates
  const publishedDate = message.publishedDate || message.StartDateTime;
  const modifiedDate = message.lastModifiedDate || message.LastModifiedDateTime || publishedDate;
  
  // Generate structured data
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    'headline': title,
    'description': description,
    'datePublished': publishedDate ? new Date(publishedDate).toISOString() : undefined,
    'dateModified': modifiedDate ? new Date(modifiedDate).toISOString() : undefined,
    'author': {
      '@type': 'Organization',
      'name': 'Microsoft 365',
      'url': 'https://www.microsoft.com'
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Microsoft 365 Message Center',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://message.cengizyilmaz.net/logo.png'
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://message.cengizyilmaz.net/message/${slug}`
    },
    'keywords': keywords,
    'articleSection': message.category || message.Category || 'Service Update',
    'inLanguage': 'en-US',
    'isAccessibleForFree': true,
    'license': 'https://www.microsoft.com/en-us/legal/terms-of-use',
    'sourceOrganization': {
      '@type': 'Organization',
      'name': source.name,
      'url': source.url
    }
  };

  // Generate meta tags
  const metaTags = `
    <!-- Primary Meta Tags -->
    <title>${pageTitle}</title>
    <meta name="title" content="${pageTitle}">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta name="author" content="Microsoft 365">
    <meta name="publisher" content="Microsoft 365 Message Center">
    <meta name="robots" content="index, follow">
    
    <!-- Source Information -->
    <meta name="source" content="${source.name}">
    <meta name="source-url" content="${source.url}">
    <meta name="source-type" content="${source.type}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="article">
    <meta property="og:url" content="https://message.cengizyilmaz.net/message/${slug}">
    <meta property="og:title" content="${pageTitle}">
    <meta property="og:description" content="${description}">
    <meta property="og:image" content="https://message.cengizyilmaz.net/og-image.png">
    <meta property="og:site_name" content="Microsoft 365 Message Center">
    ${publishedDate ? `<meta property="article:published_time" content="${new Date(publishedDate).toISOString()}">` : ''}
    ${modifiedDate ? `<meta property="article:modified_time" content="${new Date(modifiedDate).toISOString()}">` : ''}
    
    <!-- Twitter -->
    <meta property="twitter:card" content="summary_large_image">
    <meta property="twitter:url" content="https://message.cengizyilmaz.net/message/${slug}">
    <meta property="twitter:title" content="${pageTitle}">
    <meta property="twitter:description" content="${description}">
    <meta property="twitter:image" content="https://message.cengizyilmaz.net/og-image.png">
    
    <!-- Canonical -->
    <link rel="canonical" href="https://message.cengizyilmaz.net/message/${slug}" />
    
    <!-- Structured Data -->
    <script type="application/ld+json">${JSON.stringify(structuredData)}</script>
  `;

  // Replace meta tags in template
  let html = template;
  
  // Update title and meta tags
  html = html.replace(/<title>.*?<\/title>/, `<title>${pageTitle}</title>`);
  html = html.replace('</head>', `${metaTags}\n</head>`);
  
  // Add source information to the page content
  const sourceInfo = `
    <div class="source-info" style="margin-top: 2rem; padding: 1rem; background-color: #f8f9fa; border-radius: 4px;">
      <h3 style="margin: 0 0 0.5rem 0; font-size: 1.1rem; color: #666;">Source Information</h3>
      <p style="margin: 0; font-size: 0.9rem; color: #666;">
        <strong>Source:</strong> ${source.name}<br>
        <strong>URL:</strong> <a href="${source.url}" target="_blank" rel="noopener noreferrer">${source.url}</a><br>
        <strong>Type:</strong> ${source.type}
      </p>
    </div>
  `;
  
  // Add source information before the closing body tag
  html = html.replace('</body>', `${sourceInfo}\n</body>`);
  
  return html;
}

// Run the script
generateStaticPages().catch(console.error); 