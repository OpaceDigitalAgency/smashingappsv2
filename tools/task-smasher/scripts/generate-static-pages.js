/**
 * STATIC PAGE GENERATOR FOR SEO
 *
 * This script creates HTML files for each TaskSmasher use case.
 * These files help search engines understand and index your content.
 *
 * WHAT THIS FILE DOES:
 * - Creates a separate HTML file for each use case (Goal Planner, Daily Organizer, etc.)
 * - Adds proper SEO meta tags to each file
 * - Includes static content that search engines can read
 * - Ensures each page has unique titles, descriptions, and content
 *
 * HOW TO CUSTOMIZE SEO FOR SPECIFIC PAGES:
 * - Find the section starting around line 100 that modifies meta tags
 * - Edit the text between backticks (`) to change titles, descriptions, etc.
 * - The changes will apply to all use case pages
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define the use case definitions directly
// These should match the definitions in src/utils/metaConfig.cjs
const useCaseDefinitions = {
  daily: {
    label: "Daily Organizer",
    description: "Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists.",
    keywords: ["today", "tomorrow", "morning", "evening", "daily", "schedule", "routine"]
  },
  goals: {
    label: "Goal Planner",
    description: "Achieve goals faster using our free AI task planner. Break down objectives into smart to-do lists.",
    keywords: ["goal", "objective", "milestone", "achieve", "accomplish", "target"]
  },
  marketing: {
    label: "Marketing Tasks",
    description: "Organise marketing campaigns easily. Smart AI task manager creates structured to-do lists.",
    keywords: ["marketing", "campaign", "social media", "post", "content", "email"]
  },
  recipe: {
    label: "Recipe Steps",
    description: "Turn any recipe into step-by-step smart to-do lists. Simplify cooking tasks with free AI planning.",
    keywords: ["recipe", "cook", "bake", "ingredient", "food", "meal", "prep"]
  },
  home: {
    label: "Home Chores",
    description: "Effortlessly manage chores with AI to-do lists. Keep your home organised using our free AI task manager.",
    keywords: ["clean", "tidy", "organize", "declutter", "laundry", "dishes"]
  },
  freelance: {
    label: "Freelancer Projects",
    description: "Manage freelance tasks effectively. Free AI planner to help create clear project workflows.",
    keywords: ["client", "project", "deadline", "proposal", "contract", "invoice"]
  },
  travel: {
    label: "Trip Planner",
    description: "Free AI task planner for seamless travel. Smart to-do lists cover packing, bookings, and activities.",
    keywords: ["travel", "trip", "vacation", "journey", "flight", "hotel", "booking"]
  },
  shopping: {
    label: "Shopping Tasks",
    description: "Plan your shopping effortlessly. Free AI-generated smart to-do lists keep purchases organised and on budget.",
    keywords: ["shopping", "buy", "purchase", "store", "shop", "mall", "online"]
  },
  study: {
    label: "Study Plan",
    description: "Optimise studying with free AI-powered task breakdowns. Magic to-do lists help you stay focused and productive.",
    keywords: ["study", "learn", "course", "class", "assignment", "homework"]
  },
  events: {
    label: "Event Planning",
    description: "Plan events with ease. Free AI auto task manager to organise guest lists, schedules, and more.",
    keywords: ["event", "party", "celebration", "wedding", "birthday", "anniversary"]
  },
  diy: {
    label: "DIY Projects",
    description: "Simplify your DIY projects using our free AI task manager. Create clear and manageable steps.",
    keywords: ["diy", "build", "make", "craft", "create", "project", "tool"]
  },
  creative: {
    label: "Creative Projects",
    description: "Turn creative ideas into reality with free AI task planners. Smart to-do lists structure your creative process.",
    keywords: ["creative", "art", "design", "draw", "paint", "sketch", "illustration"]
  }
};

// TEMPLATE LOADING
// This reads the base HTML template that will be customized for each page
const templatePath = path.join(__dirname, '..', 'index.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Create the dist directory structure properly
const distDir = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Create the tools/task-smasher directory within dist
const toolsDir = path.join(distDir, 'tools', 'task-smasher');
if (!fs.existsSync(toolsDir)) {
  fs.mkdirSync(toolsDir, { recursive: true });
}

// Also create the directory in the main dist directory
const mainDistDir = path.join(__dirname, '..', '..', '..', 'dist');
if (!fs.existsSync(mainDistDir)) {
  fs.mkdirSync(mainDistDir, { recursive: true });
}

// Create the tools/task-smasher directory within the main dist directory
const mainToolsDir = path.join(mainDistDir, 'tools', 'task-smasher');
if (!fs.existsSync(mainToolsDir)) {
  fs.mkdirSync(mainToolsDir, { recursive: true });
}

// PAGE GENERATION
// This loop creates a separate HTML file for each use case
// Each page gets its own directory and customized content
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  // Create the URL path (e.g., "goal-planner" from "Goal Planner")
  const urlPath = definition.label.toLowerCase().replace(/\s+/g, '-');
  const pageDir = path.join(toolsDir, urlPath);
  
  // Create the directory for this use case if it doesn't exist
  if (!fs.existsSync(pageDir)) {
    fs.mkdirSync(pageDir, { recursive: true });
  }
  
  // SEO META TAGS
  // This section customizes all the SEO meta tags for each page
  // EDIT THESE LINES to change how your pages appear in search results
  const htmlContent = template
    // PAGE TITLE - This appears in browser tabs and search results
    .replace(
      /<title>.*?<\/title>/,
      `<title>${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher</title>`
    )
    // META DESCRIPTION - This appears under the title in search results
    .replace(
      /<meta name="description" content=".*?" \/>/,
      `<meta name="description" content="${definition.description}" />`
    )
    // Fix script paths to use the proper asset references
    // Use the actual built asset filenames that are in the dist directory
    .replace(
      /<script type="module" src="\/src\/main.tsx"><\/script>/,
      `<script type="module" crossorigin src="/tools/task-smasher/assets/index.js"></script>
      <link rel="modulepreload" crossorigin href="/tools/task-smasher/assets/vendor.js">
      <link rel="stylesheet" crossorigin href="/tools/task-smasher/assets/index.css">`
    )
    // KEYWORDS - These help search engines understand your content
    .replace(
      /<meta name="keywords" content=".*?" \/>/,
      `<meta name="keywords" content="${definition.label}, AI To-Do Lists, Project Planning, Task Management, ${definition.keywords.slice(0, 5).join(', ')}" />`
    )
    // FACEBOOK/OPEN GRAPH TAGS - These control how links appear when shared on Facebook
    .replace(
      /<meta property="og:title" content=".*?" \/>/,
      `<meta property="og:title" content="${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher" />`
    )
    .replace(
      /<meta property="og:description" content=".*?" \/>/,
      `<meta property="og:description" content="${definition.description}" />`
    )
    .replace(
      /<meta property="og:url" content=".*?" \/>/,
      `<meta property="og:url" content="https://smashingapps.ai/tools/task-smasher/${urlPath}/" />`
    )
    // TWITTER CARD TAGS - These control how links appear when shared on Twitter
    .replace(
      /<meta name="twitter:title" content=".*?" \/>/,
      `<meta name="twitter:title" content="${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher" />`
    )
    .replace(
      /<meta name="twitter:description" content=".*?" \/>/,
      `<meta name="twitter:description" content="${definition.description}" />`
    )
    .replace(
      /<meta name="twitter:url" content=".*?" \/>/,
      `<meta name="twitter:url" content="https://smashingapps.ai/tools/task-smasher/${urlPath}/" />`
    );
  
  // Create assets directory
  const assetsDir = path.join(pageDir, 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  // STATIC HTML CONTENT FOR SEO
  // This adds visible content that search engines can read
  // This content is only for SEO - users will see the React app instead
  const contentHtml = `
    <div id="root">
      <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
      <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
        <h1>${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher</h1>
        <p>${definition.description}</p>
        <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
      </div>
      <div class="min-h-screen w-full flex">
        <div class="w-64 bg-white border-r border-gray-200 p-4 flex flex-col gap-2 shadow-sm z-10">
          <h2 class="text-lg font-semibold text-gray-900 mb-2">Use Case Categories</h2>
          <p class="text-sm text-gray-600 mb-4">Select a category below to create AI-generated tasks specific to that domain</p>
        </div>
        <div class="flex-1 bg-gradient-to-br p-6 overflow-auto">
          <div class="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/80 p-4 mb-6">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
                <select class="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white w-full sm:w-[250px] appearance-none bg-no-repeat bg-right">
                  <option>GPT-3.5 Turbo - Most affordable</option>
                </select>
              </div>
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-gray-600">API Calls: 0</span>
                </div>
                <div class="flex items-center gap-2 text-sm">
                  <span class="text-gray-600">Estimated cost: $0.0000</span>
                </div>
                <div class="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                  <span>API Usage: 0 of 20 (Remaining: 20)</span>
                </div>
              </div>
            </div>
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-4">
              <div class="flex items-center gap-4 w-full sm:w-auto">
                <img src="/tools/task-smasher/assets/AITaskSmasher-small.png" alt="TaskSmasher Logo" class="w-8 h-8" />
                <h1 class="text-2xl font-bold text-gray-900">${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher</h1>
                <div class="ml-4 text-sm text-gray-500">AI-powered task management</div>
              </div>
            </div>
          </div>
          <header class="mb-8">
            <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div class="flex items-center gap-4 w-full sm:w-auto">
                <h2 class="text-xl font-semibold">${definition.label}</h2>
              </div>
              <div class="flex items-center gap-2 w-full sm:w-auto">
                <button class="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                  <span class="hidden sm:inline">Excel</span>
                </button>
                <button class="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                  <span class="hidden sm:inline">PDF</span>
                </button>
                <button class="text-gray-700 px-3 py-1.5 text-sm rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center gap-2">
                  <span class="hidden sm:inline">OpenAI Proxy</span>
                </button>
              </div>
            </div>
            <p class="text-gray-700 mb-4">${definition.description}</p>
            <div class="flex flex-wrap items-center gap-4 mt-4">
              <button class="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200">
                <span>Filters</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200">
                <span>Number of subtasks: 3</span>
              </button>
              <button class="flex items-center gap-2 px-3 py-2 bg-white/80 rounded-lg border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-medium shadow-sm transition-all duration-200">
                <span>Undo</span>
              </button>
            </div>
            <div class="mb-6">
              <h3 class="text-lg font-medium mb-2">Key Features:</h3>
              <ul class="list-disc pl-5 space-y-1">
                ${definition.keywords.slice(0, 5).map(keyword => `<li class="text-gray-700">${keyword}</li>`).join('')}
              </ul>
            </div>
          </header>
        </div>
      </div>
    </div>
  `;
  
  // Replace the empty root div with our content
  const htmlWithContent = htmlContent.replace(
    /<div id="root"><\/div>/,
    contentHtml
  );
  // Write the HTML file to the local dist directory
  const indexPath = path.join(pageDir, 'index.html');
  fs.writeFileSync(indexPath, htmlWithContent);
  
  // Also write the HTML file to the main dist directory
  const mainPageDir = path.join(mainToolsDir, urlPath);
  if (!fs.existsSync(mainPageDir)) {
    fs.mkdirSync(mainPageDir, { recursive: true });
  }
  const mainIndexPath = path.join(mainPageDir, 'index.html');
  fs.writeFileSync(mainIndexPath, htmlWithContent);
  
  console.log(`Generated static page for ${definition.label} at ${indexPath} and ${mainIndexPath}`);
  console.log(`Generated static page for ${definition.label} at ${indexPath}`);
});

console.log('Static page generation complete!');