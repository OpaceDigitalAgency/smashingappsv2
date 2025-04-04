/**
 * Open Graph Image Generator
 * 
 * This script generates Open Graph images for each route in the application.
 * It uses Puppeteer to render HTML templates and capture screenshots.
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Define the routes for which to generate OG images
const routes = [
  { 
    id: 'homepage',
    title: 'SmashingApps.ai',
    subtitle: 'AI-Powered Micro Tools',
    description: 'Tiny, smart, AI-powered tools to help you smash through tasks effortlessly.'
  },
  { 
    id: 'contact',
    title: 'Contact Us',
    subtitle: 'SmashingApps.ai',
    description: 'Get in touch with the SmashingApps.ai team. We\'d love to hear from you!'
  },
  { 
    id: 'task-smasher',
    title: 'TaskSmasher',
    subtitle: 'Break Tasks into AI Steps',
    description: 'Use AI to break down overwhelming tasks into easy subtasks with TaskSmasher.'
  }
];

// Add all TaskSmasher use case routes
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  routes.push({
    id: `task-smasher-${id}`,
    title: definition.label,
    subtitle: 'TaskSmasher',
    description: definition.description
  });
});

/**
 * Generate an HTML template for the OG image
 * @param {Object} route - The route object with title, subtitle, and description
 * @returns {string} - The HTML template
 */
function generateOgTemplate(route) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>OG Image - ${route.title}</title>
      <style>
        body, html {
          margin: 0;
          padding: 0;
          font-family: 'Nunito', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 1200px;
          height: 630px;
          overflow: hidden;
        }
        .og-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          padding: 60px;
          box-sizing: border-box;
          position: relative;
        }
        .logo {
          position: absolute;
          top: 40px;
          left: 40px;
          font-size: 24px;
          font-weight: bold;
          display: flex;
          align-items: center;
        }
        .logo-icon {
          width: 40px;
          height: 40px;
          margin-right: 12px;
          background-color: white;
          border-radius: 8px;
        }
        .content {
          max-width: 900px;
          text-align: center;
        }
        h1 {
          font-size: 72px;
          margin: 0 0 20px 0;
          line-height: 1.1;
        }
        h2 {
          font-size: 36px;
          margin: 0 0 30px 0;
          opacity: 0.9;
        }
        p {
          font-size: 28px;
          margin: 0;
          opacity: 0.8;
          line-height: 1.4;
        }
        .footer {
          position: absolute;
          bottom: 40px;
          right: 40px;
          font-size: 20px;
          opacity: 0.7;
        }
      </style>
    </head>
    <body>
      <div class="og-container">
        <div class="logo">
          <div class="logo-icon"></div>
          SmashingApps.ai
        </div>
        <div class="content">
          <h1>${route.title}</h1>
          <h2>${route.subtitle}</h2>
          <p>${route.description}</p>
        </div>
        <div class="footer">smashingapps.ai</div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Generate an OG image for a route
 * @param {Object} route - The route object
 * @param {puppeteer.Browser} browser - The Puppeteer browser instance
 */
async function generateOgImage(route, browser) {
  console.log(`Generating OG image for ${route.id}...`);
  
  // Create a temporary HTML file
  const tempHtmlPath = path.resolve(__dirname, `../temp-og-${route.id}.html`);
  fs.writeFileSync(tempHtmlPath, generateOgTemplate(route));
  
  // Create a new page
  const page = await browser.newPage();
  
  // Set viewport to OG image dimensions
  await page.setViewport({ width: 1200, height: 630 });
  
  // Navigate to the HTML file
  await page.goto(`file://${tempHtmlPath}`);
  
  // Ensure the output directory exists
  const outputDir = path.resolve(__dirname, '../dist/og');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Take a screenshot
  const outputPath = path.resolve(outputDir, `${route.id}.png`);
  await page.screenshot({ path: outputPath, type: 'png' });
  
  // Clean up
  await page.close();
  fs.unlinkSync(tempHtmlPath);
  
  console.log(`✅ Generated OG image for ${route.id} at ${outputPath}`);
}

/**
 * Main function to generate all OG images
 */
async function generateOgImages() {
  console.log('Starting OG image generation...');
  
  // Launch Puppeteer
  const browser = await puppeteer.launch({
    headless: 'new', // Use the new headless mode
  });
  
  try {
    // Generate OG images for each route
    for (const route of routes) {
      await generateOgImage(route, browser);
    }
    
    // Generate a default OG image
    await generateOgImage({
      id: 'default',
      title: 'SmashingApps.ai',
      subtitle: 'AI-Powered Simplicity',
      description: 'Smart, focused tools that help you get things done faster and more efficiently.'
    }, browser);
    
    console.log('OG image generation complete!');
  } catch (error) {
    console.error('Error during OG image generation:', error);
  } finally {
    // Close the browser
    await browser.close();
  }
}

// Run the OG image generation
generateOgImages();