import fs from 'fs';
import path from 'path';

console.log('🧹 Cleaning build caches...');

const pathsToClean = [
  '.next',
  'node_modules/.cache',
  '.turbo'
];

let totalCleaned = 0;

pathsToClean.forEach(dirPath => {
  const fullPath = path.join(process.cwd(), dirPath);
  
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmSync(fullPath, { recursive: true, force: true });
      console.log(`  ✓ Removed ${dirPath}`);
      totalCleaned++;
    } catch (err) {
      console.log(`  ⚠ Could not remove ${dirPath}: ${err.message}`);
    }
  }
});

if (totalCleaned > 0) {
  console.log(`✨ Cleaned ${totalCleaned} cache director${totalCleaned > 1 ? 'ies' : 'y'}\n`);
} else {
  console.log('✓ No caches to clean\n');
}
