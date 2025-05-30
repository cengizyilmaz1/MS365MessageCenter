import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Handle API routes first
app.get('/messages.json', (req, res) => {
  const messagesPath = path.join(__dirname, 'dist', 'messages.json');
  if (fs.existsSync(messagesPath)) {
    res.sendFile(messagesPath);
  } else {
    res.status(404).send('Messages file not found');
  }
});

// Handle data files
app.get('/data/*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Handle @data files
app.get('/@data/*', (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Handle message detail routes
app.get('/message/:slug', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run npm run build first.');
  }
});

// Handle sitemap and robots.txt
app.get(['/sitemap.xml', '/robots.txt'], (req, res) => {
  const filePath = path.join(__dirname, 'dist', req.path);
  if (fs.existsSync(filePath)) {
    res.sendFile(filePath);
  } else {
    res.status(404).send('File not found');
  }
});

// Handle all other routes by serving index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'dist', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Build files not found. Please run npm run build first.');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 