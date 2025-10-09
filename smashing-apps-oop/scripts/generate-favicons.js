/**
 * Favicon Generator
 * 
 * This script generates various favicon sizes and formats for better browser compatibility.
 * It uses sharp to resize and convert images.
 */

import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Source favicon path
const SOURCE_FAVICON = path.resolve(__dirname, '../task-smasher-favicon.png');

// Output directory
const OUTPUT_DIR = path.resolve(__dirname, '../dist/favicons');

// Favicon sizes to generate
const FAVICON_SIZES = [16, 32, 48, 64, 72, 96, 128, 144, 152, 192, 384, 512];

// Ensure the output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

/**
 * Generate PNG favicons in various sizes
 */
async function generatePngFavicons() {
  console.log('Generating PNG favicons...');
  
  for (const size of FAVICON_SIZES) {
    const outputPath = path.join(OUTPUT_DIR, `favicon-${size}x${size}.png`);
    
    await sharp(SOURCE_FAVICON)
      .resize(size, size)
      .png()
      .toFile(outputPath);
    
    console.log(`✅ Generated ${outputPath}`);
  }
}

/**
 * Generate ICO favicon (16x16, 32x32, 48x48)
 */
async function generateIcoFavicon() {
  console.log('Generating ICO favicon...');
  
  // For ICO, we'll use the PNG files we've already generated
  const sizes = [16, 32, 48];
  const pngBuffers = await Promise.all(
    sizes.map(async (size) => {
      return await sharp(SOURCE_FAVICON)
        .resize(size, size)
        .png()
        .toBuffer();
    })
  );
  
  // We'll use a simple approach here - just copy the 32x32 PNG as favicon.ico
  // For a proper multi-size ICO file, you would need a library like 'png-to-ico'
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'favicon.ico'),
    pngBuffers[1]
  );
  
  console.log(`✅ Generated ${path.join(OUTPUT_DIR, 'favicon.ico')}`);
}

/**
 * Generate Apple Touch Icon
 */
async function generateAppleTouchIcon() {
  console.log('Generating Apple Touch Icon...');
  
  const outputPath = path.join(OUTPUT_DIR, 'apple-touch-icon.png');
  
  await sharp(SOURCE_FAVICON)
    .resize(180, 180)
    .png()
    .toFile(outputPath);
  
  console.log(`✅ Generated ${outputPath}`);
}

/**
 * Generate Web App Manifest
 */
function generateWebAppManifest() {
  console.log('Generating Web App Manifest...');
  
  const manifest = {
    name: 'SmashingApps.ai',
    short_name: 'SmashingApps',
    description: 'AI-powered micro-apps that help you smash through tasks with smart, fun, and focused tools',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#6366f1',
    icons: FAVICON_SIZES.map(size => ({
      src: `/favicons/favicon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: 'image/png'
    }))
  };
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'manifest.json'),
    JSON.stringify(manifest, null, 2)
  );
  
  console.log(`✅ Generated ${path.join(OUTPUT_DIR, 'manifest.json')}`);
}

/**
 * Generate HTML for favicon links
 */
function generateFaviconHtml() {
  console.log('Generating HTML for favicon links...');
  
  const html = `
<!-- Favicon links -->
<link rel="icon" type="image/x-icon" href="/favicons/favicon.ico">
<link rel="icon" type="image/png" sizes="16x16" href="/favicons/favicon-16x16.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicons/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="48x48" href="/favicons/favicon-48x48.png">
<link rel="apple-touch-icon" href="/favicons/apple-touch-icon.png">
<link rel="manifest" href="/favicons/manifest.json">
<meta name="theme-color" content="#6366f1">
`;
  
  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'favicon-links.html'),
    html.trim()
  );
  
  console.log(`✅ Generated ${path.join(OUTPUT_DIR, 'favicon-links.html')}`);
  console.log('You can copy these links into your index.html file.');
}

/**
 * Main function to generate all favicons
 */
async function generateFavicons() {
  console.log('Starting favicon generation...');
  
  try {
    await generatePngFavicons();
    await generateIcoFavicon();
    await generateAppleTouchIcon();
    generateWebAppManifest();
    generateFaviconHtml();
    
    console.log('Favicon generation complete!');
  } catch (error) {
    console.error('Error during favicon generation:', error);
  }
}

// Run the favicon generation
generateFavicons();