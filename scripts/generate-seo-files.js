/**
 * SEO Files Generator
 *
 * This script generates sitemap.xml and robots.txt files for the SmashingApps.ai website.
 * It should be run as part of the build process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use require in ESM
const require = createRequire(import.meta.url);

// Import the seoMaster configuration - our single source of truth
let seoMaster;
const seoMasterPath = path.resolve(__dirname, '../dist/utils/seoMaster.cjs.js');

if (fs.existsSync(seoMasterPath)) {
  seoMaster = require(seoMasterPath);
} else {
  // Fallback to the source file if the compiled version doesn't exist
  console.log('Compiled seoMaster not found, using source file directly');
  seoMaster = require('../src/utils/seoMaster.pure.cjs');
}

// Get the base URL from the seoMaster
const BASE_URL = 'https://smashingapps.ai';

// Check if seoMaster was loaded correctly
if (!seoMaster || !seoMaster.useCaseDefinitions) {
  console.error('Error: seoMaster or useCaseDefinitions not available');
  process.exit(1);
}

// Use the use case definitions from the seoMaster
const useCaseDefinitions = seoMaster.useCaseDefinitions;

// Define all routes in the application
const routes = [
  // Main routes
  { path: '/', priority: 1.0, changefreq: 'weekly' },
  { path: '/contact', priority: 0.7, changefreq: 'monthly' },
  { path: '/tools/task-smasher/', priority: 0.9, changefreq: 'weekly' },
  
  // Add all TaskSmasher use case routes
  ...Object.entries(useCaseDefinitions).map(([id, definition]) => ({
    path: `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`,
    priority: 0.8,
    changefreq: 'weekly'
  }))
];

// Generate sitemap.xml
function generateSitemap() {
  const timestamp = new Date().toISOString();
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
`;

  routes.forEach(route => {
    sitemap += `  <url>
    <loc>${BASE_URL}${route.path}</loc>
    <lastmod>${timestamp}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>
`;
  });

  sitemap += `</urlset>`;
  
  // Ensure the dist directory exists
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write the sitemap file
  fs.writeFileSync(path.resolve(distDir, 'sitemap.xml'), sitemap);
  console.log('✅ Generated sitemap.xml');
}

// Generate robots.txt
function generateRobotsTxt() {
  const robotsTxt = `# robots.txt for SmashingApps.ai
User-agent: *
Allow: /

# Sitemap
Sitemap: ${BASE_URL}/sitemap.xml
`;

  // Ensure the dist directory exists
  const distDir = path.resolve(__dirname, '../dist');
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }
  
  // Write the robots.txt file
  fs.writeFileSync(path.resolve(distDir, 'robots.txt'), robotsTxt);
  console.log('✅ Generated robots.txt');
}

// Run the generators
generateSitemap();
generateRobotsTxt();