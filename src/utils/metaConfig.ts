/**
 * Metadata Configuration
 * 
 * This file contains the metadata configuration for all routes in the application.
 * It is used by the SEO component to dynamically generate meta tags based on the current route.
 */

export interface MetaConfig {
  title: string;
  description: string;
  image: string;
  canonical: string;
  robots?: string;
  structuredData?: object;
  keywords?: string;
}

export interface MetaConfigMap {
  [key: string]: MetaConfig;
}

// Base URL for canonical links and OG URLs
const BASE_URL = 'https://smashingapps.ai';

// Default meta configuration (fallback)
export const defaultMetaConfig: MetaConfig = {
  title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
  description: 'SmashingApps.ai provides free AI productivity apps and tools. Smash your way through mundane tasks with smart AI-powered productivity tools.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'free ai planner, magic to-do, ai task manager, ai task planner, smart to-do lists, auto task manager, ai to-do lists'
};

// Route-specific meta configurations
const metaConfig: MetaConfigMap = {
  '/': {
    title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
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
    description: 'Smash complex tasks into smart, manageable lists using our free AI planner. TaskSmasher is an AI task manager tool that creates magic to-do lists for greater productivity.',
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
      description: 'Smash complex tasks into smart, manageable lists using our free AI planner. TaskSmasher is an AI task manager tool that creates magic to-do lists for greater productivity.'
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

// Generate meta configs for all TaskSmasher use cases
const useCaseDefinitions = {
  daily: {
    label: "Daily Organizer",
    description: "Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists."
  },
  goals: {
    label: "Goal Planner",
    description: "Achieve goals faster using our free AI task planner. Break down objectives into smart to-do lists."
  },
  marketing: {
    label: "Marketing Tasks",
    description: "Organise marketing campaigns easily. Smart AI task manager creates structured to-do lists."
  },
  recipe: {
    label: "Recipe Steps",
    description: "Turn any recipe into step-by-step smart to-do lists. Simplify cooking tasks with free AI planning."
  },
  home: {
    label: "Home Chores",
    description: "Effortlessly manage chores with AI to-do lists. Keep your home organised using our free AI task manager."
  },
  freelance: {
    label: "Freelancer Projects",
    description: "Manage freelance tasks effectively. Free AI planner to help create clear project workflows."
  },
  travel: {
    label: "Trip Planner",
    description: "Free AI task planner for seamless travel. Smart to-do lists cover packing, bookings, and activities."
  },
  shopping: {
    label: "Shopping Tasks",
    description: "Plan your shopping effortlessly. Free AI-generated smart to-do lists keep purchases organised and on budget."
  },
  study: {
    label: "Study Plan",
    description: "Optimise studying with free AI-powered task breakdowns. Magic to-do lists help you stay focused and productive."
  },
  events: {
    label: "Event Planning",
    description: "Plan events with ease. Free AI auto task manager to organise guest lists, schedules, and more."
  },
  diy: {
    label: "DIY Projects",
    description: "Simplify your DIY projects using our free AI task manager. Create clear and manageable steps."
  },
  creative: {
    label: "Creative Projects",
    description: "Turn creative ideas into reality with free AI task planners. Smart to-do lists structure your creative process."
  }
};

// Add use case routes to metaConfig
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  const path = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`;
  metaConfig[path] = {
    title: `${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`,
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

export default metaConfig;