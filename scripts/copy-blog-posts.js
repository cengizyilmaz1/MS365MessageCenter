import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source and destination paths
const sourceDir = path.join(__dirname, '../data');
const destDir = path.join(__dirname, '../public/data');

// Create destination directory if it doesn't exist
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

// Find the latest CSV file
const files = fs.readdirSync(sourceDir)
  .filter(file => file.startsWith('CengizYILMAZBlogPost_') && file.endsWith('.csv'))
  .sort()
  .reverse();

if (files.length === 0) {
  console.error('No blog post CSV files found in data directory');
  process.exit(1);
}

const latestFile = files[0];
const sourcePath = path.join(sourceDir, latestFile);
const destPath = path.join(destDir, 'CengizYILMAZBlogPost_latest.csv');

// Copy the file
fs.copyFileSync(sourcePath, destPath);
console.log(`✅ Copied ${latestFile} to public/data/CengizYILMAZBlogPost_latest.csv`); 