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
  const dataPath = path.join(__dirname, '..', 'data');
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
      const blogPostFile = 'CengizYILMAZBlogPost_20250528.csv';
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
    
    // 6. Generate dynamic sitemap
    log.info('Generating dynamic sitemap...');
    await generateSitemap(distPath, atDataPath);
    log.success('Sitemap generated');
    
    // 7. Generate service worker for PWA
    log.info('Generating service worker...');
    await generateServiceWorker(distPath);
    log.success('Service worker generated');
    
    // 8. Create .nojekyll file for GitHub Pages
    await fs.writeFile(path.join(distPath, '.nojekyll'), '');
    log.success('Created .nojekyll file');
    
    // 9. Generate build info
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

async function generateSitemap(distPath, dataPath) {
  const messagesPath = path.join(dataPath, 'messages.json');
  const messagesData = await fs.readFile(messagesPath, 'utf-8');
  const messages = JSON.parse(messagesData);
  
  const baseUrl = 'https://message.cengizyilmaz.net';
  const currentDate = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">`;
  
  // Static pages
  const staticPages = [
    { loc: '/', priority: '1.0', changefreq: 'daily' },
    { loc: '/about', priority: '0.8', changefreq: 'monthly' },
    { loc: '/privacy', priority: '0.5', changefreq: 'yearly' },
    { loc: '/terms', priority: '0.5', changefreq: 'yearly' }
  ];
  
  for (const page of staticPages) {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  }
  
  // Dynamic message pages
  for (const message of messages) {
    const title = message.title || message.Title;
    if (!title) continue;
    
    const slug = title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
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
  
  await fs.writeFile(path.join(distPath, 'sitemap.xml'), sitemap);
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
  '/data/CengizYILMAZBlogPost_20250528.csv'
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

// Run the script
generateStaticPages().catch(console.error); 