/**
 * SEO Files Generator
 *
 * This script generates sitemap.xml and robots.txt files for the SmashingApps.ai website.
 * It should be run as part of the build process.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Base URL for the site
const BASE_URL = 'https://smashingapps.ai';

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