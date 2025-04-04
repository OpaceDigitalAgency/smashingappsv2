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
const DEV_SERVER_URL = 'http://localhost:5173';

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
  
  // Wait for any additional content to load (adjust as needed)
  await page.waitForTimeout(2000);
  
  // Get the HTML content
  const html = await page.content();
  
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
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
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
prerenderRoutes();