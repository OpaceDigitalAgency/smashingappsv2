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

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for development server
// During Netlify build, we'll use a local server
const DEV_SERVER_URL = process.env.NETLIFY ? 'http://localhost:8888' : 'http://localhost:5173';

// Routes to prerender
const ROUTES_TO_PRERENDER = [
  '/',
  '/tools/task-smasher/',
  '/contact'
];

// Import use case definitions from a temporary copy to avoid TypeScript issues
const useCaseDefinitions = {
  daily: { label: "Daily Organizer", description: "Organize your everyday tasks efficiently with AI assistance" },
  goals: { label: "Goal Planner", description: "Break down long-term objectives into actionable steps" },
  marketing: { label: "Marketing Tasks", description: "Organize marketing campaigns and tasks with AI guidance" },
  recipe: { label: "Recipe Steps", description: "Break down cooking recipes into clear, manageable steps" },
  home: { label: "Home Chores", description: "Organize household tasks and chores efficiently" },
  travel: { label: "Trip Planner", description: "Plan your travel itinerary with AI-powered organization" },
  study: { label: "Study Plan", description: "Break down academic tasks and study sessions effectively" },
  events: { label: "Event Planning", description: "Organize events and parties with AI task management" },
  freelance: { label: "Freelancer Projects", description: "Manage client work and freelance projects efficiently" },
  shopping: { label: "Shopping Tasks", description: "Organize shopping lists and tasks with AI assistance" },
  diy: { label: "DIY Projects", description: "Break down do-it-yourself projects into manageable steps" },
  creative: { label: "Creative Projects", description: "Organize creative endeavors and artistic projects" }
};

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
  
  // Get the meta information from our metaConfig
  const routePath = route.endsWith('/') || route === '/' ? route : `${route}/`;
  const metaConfigJs = await page.evaluate(() => {
    // This will run in the browser context
    return window.__META_CONFIG__ || {};
  });
  
  // Get the HTML content
  let html = await page.content();
  
  // If we couldn't get the meta config from the window object,
  // we'll need to manually inject the meta tags based on the route
  if (!metaConfigJs[routePath]) {
    // Import the meta config directly
    const metaConfigPath = path.resolve(__dirname, '../src/utils/metaConfig.ts');
    // Fallback to .js if .ts doesn't exist
    const metaConfigFile = fs.existsSync(metaConfigPath) ? metaConfigPath : path.resolve(__dirname, '../src/utils/metaConfig.js');
    const metaConfigContent = fs.readFileSync(metaConfigFile, 'utf8');
    
    // Extract the route-specific meta config using regex
    const routePattern = new RegExp(`'${routePath}':\\s*{([^}]+)}`, 's');
    const match = metaConfigContent.match(routePattern);
    
    if (match) {
      // Basic meta tags to inject if we can't get them from the browser
      const title = match[1].match(/title:\s*['"]([^'"]+)['"]/)?.[1] || 'SmashingApps.ai';
      const description = match[1].match(/description:\s*['"]([^'"]+)['"]/)?.[1] || '';
      const canonical = match[1].match(/canonical:\s*['"]([^'"]+)['"]/)?.[1] || `https://smashingapps.ai${route}`;
      
      // Replace the title tag
      html = html.replace(/<title>[^<]*<\/title>/, `<title>${title}</title>`);
      
      // Replace or add meta description
      if (html.includes('<meta name="description"')) {
        html = html.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${description}">`);
      } else {
        html = html.replace('</head>', `  <meta name="description" content="${description}">\n  </head>`);
      }
      
      // Replace or add canonical link
      if (html.includes('<link rel="canonical"')) {
        html = html.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${canonical}">`);
      } else {
        html = html.replace('</head>', `  <link rel="canonical" href="${canonical}">\n  </head>`);
      }
    }
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
// Create a script element to expose metaConfig
const script = document.createElement('script');
script.textContent = \`
  window.__META_CONFIG__ = ${JSON.stringify({})};
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