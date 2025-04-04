/**
 * Metadata Configuration (JavaScript version)
 * 
 * This file contains the metadata configuration for all routes in the application.
 * It is used by the prerendering script to generate meta tags for static HTML files.
 */

// Base URL for canonical links and OG URLs
const BASE_URL = 'https://smashingapps.ai';

// Default meta configuration (fallback)
const defaultMetaConfig = {
  title: 'SmashingApps.ai | AI-powered simplicity',
  description: 'SmashingApps.ai - AI-powered micro-apps that help you smash through tasks with smart, fun, and focused tools',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'AI tools, productivity, task management, AI apps, SmashingApps'
};

// Route-specific meta configurations
const metaConfig = {
  '/': {
    title: 'SmashingApps.ai – AI-Powered Micro Tools',
    description: 'Tiny, smart, AI-powered tools to help you smash through tasks effortlessly.',
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
  '/tools/task-smasher/': {
    title: 'TaskSmasher – Break Tasks into AI Steps | SmashingApps.ai',
    description: 'Use AI to break down overwhelming tasks into easy subtasks with TaskSmasher. Organize, prioritize, and complete tasks efficiently.',
    image: `${BASE_URL}/og/task-smasher.png`,
    canonical: `${BASE_URL}/tools/task-smasher/`,
    keywords: 'task management, AI task breakdown, productivity tool, task organizer, SmashingApps',
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
  '/contact': {
    title: 'Contact Us | SmashingApps.ai',
    description: 'Get in touch with the SmashingApps.ai team. We\'d love to hear from you!',
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

// Generate meta configs for all TaskSmasher use cases
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

// Add use case routes to metaConfig
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  const path = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`;
  metaConfig[path] = {
    title: `${definition.label} - TaskSmasher | SmashingApps.ai`,
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