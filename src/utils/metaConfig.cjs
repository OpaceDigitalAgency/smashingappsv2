/**
 * SEO SETTINGS MASTER FILE
 *
 * This file controls ALL the SEO settings for the entire website.
 * It defines what users and search engines see in search results, social media shares, and browser tabs.
 *
 * WHAT THIS FILE DOES:
 * - Controls page titles (what appears in browser tabs and search results)
 * - Controls meta descriptions (the text under the title in search results)
 * - Controls social media sharing images and text (what appears when pages are shared on Facebook, Twitter, etc.)
 * - Controls search engine indexing settings
 * - Defines all the pages/URLs on the website
 *
 * HOW TO USE THIS FILE:
 * - Find the section for the page you want to edit
 * - Change the text between quotes to update titles, descriptions, etc.
 * - Be careful not to remove any quotes, commas, or brackets
 */
 
/*
 core_keywords = [
    "free ai planner",
    "magic to-do",
    "ai task manager",
    "ai task planner",
    "smart to-do lists",
    "auto task manager",
    "ai to-do lists"
]

use_case_definitions = {
    "daily": "Daily Organizer",
    "goals": "Goal Planner",
    "marketing": "Marketing Tasks",
    "recipe": "Recipe Steps",
    "home": "Home Chores",
    "travel": "Trip Planner",
    "study": "Study Plan",
    "events": "Event Planning",
    "freelance": "Freelancer Projects",
    "shopping": "Shopping Tasks",
    "diy": "DIY Projects",
    "creative": "Creative Projects"
}
*/


// The main website address - don't change this unless the domain changes
const BASE_URL = 'https://smashingapps.ai';

// DEFAULT SEO SETTINGS (fallback if specific page settings are missing)
const defaultMetaConfig = {
  title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
  description: 'SmashingApps.ai provides free AI productivity apps and tools. Smash your way through mundane tasks with smart AI-powered productivity tools.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow'
  
// SPECIFIC PAGE SEO SETTINGS
const metaConfig = {
  '/': {
    title: 'SmashingApps.ai | Free AI Productivity Apps & Tools'',
  description: 'Get things done faster with free AI planners and smart to-do lists. Smash tasks easily using auto task management from SmashingApps.ai.',
    image: `${BASE_URL}/og/homepage.png`,
    canonical: BASE_URL,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SmashingApps.ai',
      url: BASE_URL,
      description: 'Get things done faster with free AI planners and smart to-do lists. Smash tasks easily using auto task management from SmashingApps.ai.',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  },
  '/tools/task-smasher/': {
    title: 'TaskSmasher - Free AI Planner | Magic To-Do Lists & AI Task Manager',
    description: 'Smash  complex tasks into smart, manageable lists using our free AI planner. TaskSmasher is an AI task manager tool that creates magic to-do lists for greater productivity.',
    image: `${BASE_URL}/og/task-smasher.png`,
    canonical: `${BASE_URL}/tools/task-smasher/`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'TaskSmasher',
      applicationCategory: 'ProductivityApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      operatingSystem: 'Web',
      description: 'AI task manager that breaks complex tasks into easy-to-follow to-do lists.'
    }
  },
  '/contact': {
    title: 'Contact SmashingApps.ai | Free AI Productivity Apps & Tools',
    description: 'Contact SmashingApps.ai for support, feedback, or collaboration. Reach out to learn more about our free AI productivity tools.',
    image: `${BASE_URL}/og/contact.png`,
    canonical: `${BASE_URL}/contact`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact SmashingApps.ai',
      url: `${BASE_URL}/contact`,
      description: 'Contact SmashingApps.ai for support, feedback, or collaboration. Reach out to learn more about our free AI productivity tools.'
    }
  }
};

// TASKSMASHER USE CASE DEFINITIONS
const useCaseDefinitions = {
  daily: { label: "Daily Organizer", description: "Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists." },
  goals: { label: "Goal Planner", description: "Achieve goals faster using our free AI task planner. Break down objectives into smart to-do lists." },
  marketing: { label: "Marketing Tasks", description: "Organise marketing campaigns easily. Smart AI task manager creates structured to-do lists." },
  recipe: { label: "Recipe Steps", description: "Turn any recipe into step-by-step smart to-do lists. Simplify cooking tasks with free AI planning." },
  home: { label: "Home Chores", description: "Effortlessly manage chores with AI to-do lists. Keep your home organised using our free AI task manager." },
  freelance: { label: "Freelancer Projects", description: "Manage freelance tasks effectively. Free AI planner to help create clear project workflows." },
  travel: { label: "Trip Planner", description: "Free AI task planner for seamless travel. Smart to-do lists cover packing, bookings, and activities." },
  shopping: { label: "Shopping Tasks", description: "Plan your shopping effortlessly. Free AI-generated smart to-do lists keep purchases organised and on budget." },
  study: { label: "Study Plan", description: "Optimise studying with free AI-powered task breakdowns. Magic to-do lists help you stay focused and productive." },
  events: { label: "Event Planning", description: "Plan events with ease. Free AI auto task manager to organise guest lists, schedules, and more." },
  diy: { label: "DIY Projects", description: "Simplify your DIY projects using our free AI task manager. Create clear and manageable steps." },
  creative: { label: "Creative Projects", description: "Turn creative ideas into reality with free AI task planners. Smart to-do lists structure your creative process." }
};

// AUTOMATIC PAGE GENERATION
Object.entries(useCaseDefinitions).forEach(([id, def]) => {
  const path = `/tools/task-smasher/${def.label.toLowerCase().replace(/\s+/g, '-')}/`;
  metaConfig[path] = {
    title: `${def.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`,
    description: def.description,
    image: `${BASE_URL}/og/task-smasher-${id}.png`,
    canonical: `${BASE_URL}${path}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `TaskSmasher - ${def.label}`,
      applicationCategory: 'ProductivityApplication',
      offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      operatingSystem: 'Web',
      description: def.description
    }
  };
});

module.exports = { default: metaConfig, defaultMetaConfig };