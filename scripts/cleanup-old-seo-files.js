/**
 * Cleanup script to remove old SEO files
 * 
 * This script should only be run after confirming that the new unified SEO system
 * is working properly. It will remove the old SEO files that are no longer needed.
 */

const fs = require('fs');
const path = require('path');

// Files to be removed
const filesToRemove = [
  path.resolve(__dirname, '../src/utils/seoMaster.js'),
  path.resolve(__dirname, '../src/utils/seoMaster.cjs'),
  path.resolve(__dirname, '../src/utils/metaConfig.ts'),
  path.resolve(__dirname, '../src/utils/metaConfig.cjs')
];

// Check if the new files exist before removing old ones
const newFiles = [
  path.resolve(__dirname, '../src/utils/seoMaster.ts'),
  path.resolve(__dirname, '../src/utils/seoMaster.cjs.ts')
];

// Verify new files exist
const allNewFilesExist = newFiles.every(file => {
  const exists = fs.existsSync(file);
  if (!exists) {
    console.error(`Error: New file ${file} does not exist. Aborting cleanup.`);
  }
  return exists;
});

if (!allNewFilesExist) {
  console.error('Cleanup aborted: Some new SEO files are missing.');
  process.exit(1);
}

// Remove old files
console.log('Removing old SEO files...');
filesToRemove.forEach(file => {
  if (fs.existsSync(file)) {
    try {
      fs.unlinkSync(file);
      console.log(`Successfully removed: ${file}`);
    } catch (error) {
      console.error(`Error removing ${file}:`, error);
    }
  } else {
    console.log(`File not found (already removed): ${file}`);
  }
});

console.log('\nCleanup complete!');
console.log('\nIMPORTANT: Make sure to test the application thoroughly to ensure the new SEO system is working properly.');
console.log('If you encounter any issues, you can restore the old files from version control.');