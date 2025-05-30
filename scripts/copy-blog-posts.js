import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function copyBlogPosts() {
  try {
    // Possible source locations
    const possibleSources = [
      path.join(__dirname, '..', 'public', 'data', 'CengizYILMAZBlogPost_20250528.csv'),
      path.join(__dirname, '..', 'public', 'CengizYILMAZBlogPost_20250528.csv'),
      path.join(__dirname, '..', 'CengizYILMAZBlogPost_20250528.csv')
    ];
    
    // Target location
    const targetPath = path.join(__dirname, '..', 'data', 'CengizYILMAZBlogPost_20250528.csv');
    
    // Find the source file
    let sourceFound = false;
    for (const sourcePath of possibleSources) {
      try {
        await fs.access(sourcePath);
        console.log(`✓ Found blog posts at: ${sourcePath}`);
        
        // Copy to target
        await fs.copyFile(sourcePath, targetPath);
        console.log(`✓ Copied to: ${targetPath}`);
        sourceFound = true;
        break;
      } catch (error) {
        // Continue to next possible location
      }
    }
    
    if (!sourceFound) {
      console.log('⚠ Blog posts CSV file not found in any of the expected locations');
      console.log('Expected locations:');
      possibleSources.forEach(p => console.log(`  - ${p}`));
    }
    
  } catch (error) {
    console.error('Error copying blog posts:', error);
    process.exit(1);
  }
}

copyBlogPosts(); 