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

// The main website address - don't change this unless the domain changes
const BASE_URL = 'https://smashingapps.ai';

// DEFAULT SEO SETTINGS (used as fallback if specific page settings are missing)
// Edit these to change the default SEO settings for the entire website
const defaultMetaConfig = {
  title: 'SmashingApps.ai | AI-Powered Productivity Tools',
  description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'AI tools, productivity, task management, AI apps, SmashingApps, AI assistants'
};

// SPECIFIC PAGE SEO SETTINGS
// Each section below controls the SEO for a specific page on the website
// The part in quotes (like '/') is the page URL path
const metaConfig = {
  // HOMEPAGE SEO SETTINGS
  // This controls what appears in search results for the main homepage
  '/': {
    title: 'SmashingApps.ai | AI-Powered Productivity Tools',
    description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
    image: `${BASE_URL}/og/homepage.png`,
    canonical: BASE_URL,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'SmashingApps.ai',
      url: BASE_URL,
      description: 'AI-powered micro-apps that help you smash through tasks with smart, fun, and focused tools',
      potentialAction: {
        '@type': 'SearchAction',
        target: `${BASE_URL}/search?q={search_term_string}`,
        'query-input': 'required name=search_term_string'
      }
    }
  },
  // TASKSMASHER MAIN PAGE SEO SETTINGS
  // This controls what appears in search results for the TaskSmasher tool page
  '/tools/task-smasher/': {
    title: 'TaskSmasher – AI Task Planner | Break Down Complex Tasks Easily',
    description: 'Use AI to break down overwhelming tasks into manageable subtasks. TaskSmasher helps you organize, prioritize, and complete tasks efficiently with AI assistance.',
    image: `${BASE_URL}/og/task-smasher.png`,
    canonical: `${BASE_URL}/tools/task-smasher/`,
    keywords: 'task management, AI task breakdown, AI TO-DO planner, AI Task planner, productivity tool, task organizer',
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
      description: 'AI-powered task management tool that breaks down complex tasks into manageable subtasks'
    }
  },
  // CONTACT PAGE SEO SETTINGS
  // This controls what appears in search results for the Contact page
  '/contact': {
    title: 'Contact Us | SmashingApps.ai Support & Inquiries',
    description: 'Get in touch with the SmashingApps.ai team for support, feature requests, or partnership inquiries. We\'d love to hear from you and help with your productivity needs!',
    image: `${BASE_URL}/og/contact.png`,
    canonical: `${BASE_URL}/contact`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      name: 'Contact SmashingApps.ai',
      url: `${BASE_URL}/contact`,
      description: 'Contact information for SmashingApps.ai'
    }
  }
};

// TASKSMASHER USE CASE DEFINITIONS
// This section defines all the different use cases/tools within TaskSmasher
// Each use case automatically gets its own page with SEO settings based on these definitions
// TO ADD A NEW USE CASE: Simply add a new entry following the same pattern as the others
const useCaseDefinitions = {
  daily: {
    label: "Daily Organizer",
    description: "Organize your everyday tasks efficiently with AI assistance. Our Daily Organizer helps you plan your day, prioritize activities, and stay on track with smart reminders."
  },
  goals: {
    label: "Goal Planner",
    description: "Break down long-term objectives into actionable steps with our AI Goal Planner. Set SMART goals, track progress, and achieve your ambitions with structured planning."
  },
  marketing: {
    label: "Marketing Tasks",
    description: "Organize marketing campaigns and tasks with AI guidance. Our Marketing Tasks planner helps you coordinate content, social media, and promotional activities effectively."
  },
  recipe: {
    label: "Recipe Steps",
    description: "Break down cooking recipes into clear, manageable steps with AI assistance. Our Recipe Steps tool helps you plan meals, organize ingredients, and execute complex dishes."
  },
  home: {
    label: "Home Chores",
    description: "Organize household tasks and chores efficiently with AI planning. Our Home Chores tool helps you maintain your living space with scheduled cleaning and maintenance tasks."
  },
  travel: {
    label: "Trip Planner",
    description: "Plan your travel itinerary with AI-powered organization. Our Trip Planner helps you coordinate transportation, accommodations, activities, and packing lists for stress-free travel."
  },
  study: {
    label: "Study Plan",
    description: "Break down academic tasks and study sessions effectively with AI guidance. Our Study Plan tool helps you master subjects with organized learning schedules and resources."
  },
  events: {
    label: "Event Planning",
    description: "Organize events and parties with AI task management. Our Event Planning tool helps you coordinate venues, guests, catering, and activities for successful gatherings."
  },
  freelance: {
    label: "Freelancer Projects",
    description: "Manage client work and freelance projects efficiently with AI assistance. Our Freelancer Projects tool helps you track deliverables, deadlines, and client communications."
  },
  shopping: {
    label: "Shopping Tasks",
    description: "Organize shopping lists and tasks with AI assistance. Our Shopping Tasks tool helps you plan purchases, compare options, and stay within budget for all your shopping needs."
  },
  diy: {
    label: "DIY Projects",
    description: "Break down do-it-yourself projects into manageable steps with AI guidance. Our DIY Projects tool helps you plan materials, techniques, and timelines for successful completion."
  },
  creative: {
    label: "Creative Projects",
    description: "Organize creative endeavors and artistic projects with AI assistance. Our Creative Projects tool helps you structure your creative process from inspiration to final execution."
  }
};

// AUTOMATIC PAGE GENERATION - TECHNICAL SECTION
// This code automatically creates pages for each use case defined above
// You don't need to edit this section unless you're a developer
// It converts each use case into a full page with proper SEO settings
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  // Creates URL paths like /tools/task-smasher/goal-planner/
  const path = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`;
  metaConfig[path] = {
    title: `${definition.label} - AI Task Planner | TaskSmasher by SmashingApps.ai`,
    description: definition.description,
    image: `${BASE_URL}/og/task-smasher-${id}.png`,
    canonical: `${BASE_URL}${path}`,
    keywords: `task management, ${definition.label.toLowerCase()}, AI task breakdown, productivity tool, SmashingApps`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: `TaskSmasher - ${definition.label}`,
      applicationCategory: 'ProductivityApplication',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD'
      },
      operatingSystem: 'Web',
      description: definition.description
    }
  };
});

module.exports = {
  default: metaConfig,
  defaultMetaConfig
};