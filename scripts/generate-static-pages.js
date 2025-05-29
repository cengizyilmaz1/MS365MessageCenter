import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesPath = path.join(__dirname, '../@data/messages.json');
const distPath = path.join(__dirname, '../dist');

// Read messages
const messages = JSON.parse(fs.readFileSync(messagesPath, 'utf8'));

// Create message directory if it doesn't exist
const messageDir = path.join(distPath, 'message');
if (!fs.existsSync(messageDir)) {
  fs.mkdirSync(messageDir, { recursive: true });
}

console.log('Generating static pages...');
let count = 0;
const total = messages.length;

// Generate static HTML for each message
messages.forEach(message => {
  const messageId = message.id;
  const messageHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${message.title} - Microsoft 365 Message Center</title>
  <meta name="description" content="${message.messageBody?.substring(0, 160)}">
  <link rel="stylesheet" href="/assets/index.css">
  <link rel="canonical" href="https://message.cengizyilmaz.net/message/${messageId}" />
</head>
<body>
  <div id="root">
    <div class="message-container">
      <h1>${message.title}</h1>
      <div class="message-content">
        ${message.messageBody || ''}
      </div>
      <div class="message-meta">
        <p>Last Modified: ${new Date(message.lastModifiedDateTime).toLocaleDateString()}</p>
        <p>Category: ${message.category || 'N/A'}</p>
      </div>
    </div>
  </div>
  <script type="module" src="/assets/index.js"></script>
  <script>
    window.__INITIAL_MESSAGE__ = ${JSON.stringify(message)};
    window.__INITIAL_STATE__ = {
      messages: ${JSON.stringify(messages)},
      currentMessage: ${JSON.stringify(message)}
    };
  </script>
</body>
</html>`;

  fs.writeFileSync(path.join(messageDir, `${messageId}.html`), messageHtml);
  
  count++;
  if (count % 50 === 0) {
    console.log(`Generated ${count}/${total} pages`);
  }
});

// Helper function to safely format date
const formatDate = (dateStr) => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return new Date().toISOString(); // Return current date if invalid
    }
    return date.toISOString();
  } catch (error) {
    return new Date().toISOString(); // Return current date if error
  }
};

// Generate sitemap
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://message.cengizyilmaz.net/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  ${messages.map(message => `
  <url>
    <loc>https://message.cengizyilmaz.net/message/${message.id}</loc>
    <lastmod>${formatDate(message.lastModifiedDateTime)}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`).join('')}
</urlset>`;

fs.writeFileSync(path.join(distPath, 'sitemap.xml'), sitemap);

console.log(`✓ Generated all ${total} static pages`);
console.log('✓ Generated sitemap.xml'); 