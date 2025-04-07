/**
 * Route Prerenderer
 * 
 * This script generates static HTML snapshots of key routes for search engines.
 * It uses Puppeteer to render the JavaScript and capture the resulting HTML.
 * These snapshots can be served to search engine crawlers for better indexing.
 */

import puppeteer from 'puppeteer';
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
const path = require('path');
const fs = require('fs');

let seoMaster;
const seoMasterPath = path.resolve(__dirname, '../dist/utils/seoMaster.cjs.js');

if (fs.existsSync(seoMasterPath)) {
  seoMaster = require(seoMasterPath);
} else {
  // Fallback to the source file if the compiled version doesn't exist
  console.log('Compiled seoMaster not found, using esbuild to compile on-the-fly');
  
  // Use esbuild to compile the TypeScript file on-the-fly
  const { buildSync } = require('esbuild');
  const fallbackPath = path.resolve(__dirname, '../src/utils/seoMaster.cjs.ts');
  const outfile = path.resolve(__dirname, '../temp-seoMaster.cjs');
  
  buildSync({
    entryPoints: [fallbackPath],
    outfile,
    bundle: true,
    platform: 'node',
    format: 'cjs',
    target: 'node14',
  });
  
  seoMaster = require(outfile);
}
const seoMaster = require('../src/utils/seoMaster.cjs');

// Base URL for development server
// During Netlify build, we'll use a local server
const DEV_SERVER_URL = process.env.NETLIFY ? 'http://localhost:8888' : 'http://localhost:5173';

// Routes to prerender - get from seoMaster
const ROUTES_TO_PRERENDER = Object.keys(seoMaster.routeMeta);

// Use the use case definitions from the seoMaster
const useCaseDefinitions = seoMaster.useCaseDefinitions;

// Add all TaskSmasher use case routes
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  const path = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`;
  ROUTES_TO_PRERENDER.push(path);
});

/**
 * Prerender a route and save the HTML
 * @param {string} route - The route to prerender
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance
 */
async function prerenderRoute(route, browser) {
  console.log(`Prerendering ${route}...`);
  
  const page = await browser.newPage();
  
  // Set viewport for a standard desktop size
  await page.setViewport({ width: 1280, height: 800 });
  
  // Navigate to the route
  await page.goto(`${DEV_SERVER_URL}${route}`, {
    waitUntil: 'networkidle0', // Wait until network is idle (no more than 2 connections for at least 500ms)
  });
  
  // Wait for React to fully render and SEO components to update meta tags
  // First wait for the root element to be populated
  await page.waitForFunction(() => {
    return document.getElementById('root') &&
           document.getElementById('root').children.length > 0;
  }, { timeout: 10000 });
  
  // Then wait a bit more to ensure all async operations complete
  await page.waitForTimeout(2000);
  
  // Get the meta information from our seoMaster
  const routePath = route.endsWith('/') || route === '/' ? route : `${route}/`;
  
  // Get the HTML content
  let html = await page.content();
  
  // Get the meta data for this route from our single source of truth
  const meta = seoMaster.getMetaForRoute(routePath);
  
  // Replace the title tag
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
  
  // Replace or add meta description
  if (html.includes('<meta name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}">`);
  } else {
    html = html.replace('</head>', `  <meta name="description" content="${meta.description}">\n  </head>`);
  }
  
  // Replace or add canonical link
  if (html.includes('<link rel="canonical"')) {
    html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}">`);
  } else {
    html = html.replace('</head>', `  <link rel="canonical" href="${meta.canonical}">\n  </head>`);
  }
  
  // Add structured data if available
  if (meta.structuredData && !html.includes('application/ld+json')) {
    const structuredDataTag = `
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(meta.structuredData, null, 2)}
  </script>
`;
    html = html.replace('</head>', `${structuredDataTag}\n  </head>`);
  }
  
  // Create the directory structure for the route
  const outputDir = path.resolve(__dirname, '../dist', route.substring(1));
  fs.mkdirSync(outputDir, { recursive: true });
  
  // Save the HTML to a file
  const outputPath = path.join(outputDir, 'index.html');
  fs.writeFileSync(outputPath, html);
  
  console.log(`✅ Prerendered ${route} to ${outputPath}`);
  
  await page.close();
}

/**
 * Main function to prerender all routes
 */
async function prerenderRoutes() {
  console.log('Starting prerendering process...');
  
  // Launch Puppeteer with appropriate options for Netlify environment
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
    args: process.env.NETLIFY ? ['--no-sandbox', '--disable-setuid-sandbox'] : [],
    executablePath: process.env.NETLIFY ? '/usr/bin/chromium-browser' : undefined,
  });
  
  try {
    // Prerender each route
    for (const route of ROUTES_TO_PRERENDER) {
      await prerenderRoute(route, browser);
    }
    
    console.log('Prerendering complete!');
  } catch (error) {
    console.error('Error during prerendering:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}
// Run the prerendering process
// First, expose the meta config to the window object
// Create a small script to inject into the page
const injectScript = `
// Create a script element to expose seoMaster
const script = document.createElement('script');
script.textContent = \`
  window.__SEO_MASTER__ = ${JSON.stringify(seoMaster.routeMeta)};
\`;
document.head.appendChild(script);
`;

// Start a local server if we're in the Netlify environment
if (process.env.NETLIFY) {
  const { exec } = require('child_process');
  const server = exec('npx serve -s dist -l 8888');
  
  // Give the server time to start
  setTimeout(() => {
    prerenderRoutes().then(() => {
      // Kill the server when done
      server.kill();
    });
  }, 3000);
} else {
  prerenderRoutes();
}