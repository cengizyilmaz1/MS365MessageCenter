import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PUBLIC_DIR = path.join(__dirname, '../public');
const DIST_DIR = path.join(__dirname, '../dist');

// Copy necessary files to dist
async function copyFiles() {
  try {
    // Ensure dist directory exists
    if (!fs.existsSync(DIST_DIR)) {
      fs.mkdirSync(DIST_DIR, { recursive: true });
    }
    
    // Copy 404.html
    const source404 = path.join(PUBLIC_DIR, '404.html');
    const dest404 = path.join(DIST_DIR, '404.html');
    
    if (fs.existsSync(source404)) {
      await fs.promises.copyFile(source404, dest404);
      console.log('✓ Copied 404.html to dist folder');
    }
    
    // Copy CNAME
    const sourceCNAME = path.join(PUBLIC_DIR, 'CNAME');
    const destCNAME = path.join(DIST_DIR, 'CNAME');
    
    if (fs.existsSync(sourceCNAME)) {
      await fs.promises.copyFile(sourceCNAME, destCNAME);
      console.log('✓ Copied CNAME to dist folder');
    }
    
    // Also create .nojekyll file for GitHub Pages
    const nojekyllPath = path.join(DIST_DIR, '.nojekyll');
    await fs.promises.writeFile(nojekyllPath, '');
    console.log('✓ Created .nojekyll file');
    
  } catch (error) {
    console.error('Error in post-build:', error);
    process.exit(1);
  }
}

copyFiles(); 