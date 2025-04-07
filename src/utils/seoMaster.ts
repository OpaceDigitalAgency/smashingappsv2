/**
 * MASTER SEO CONFIGURATION
 *
 * This is the SINGLE SOURCE OF TRUTH for all SEO-related content.
 * It controls both the static HTML generation and the React app's SEO.
 *
 * HOW TO USE:
 * - Edit this file to update SEO for any page
 * - All changes will be reflected in both the static HTML and the React app
 * - The build process will automatically use this file for all SEO-related tasks
 * - URL names, meta tags, and fallback content are all defined here
 */

// Type definitions for SEO metadata
export interface MetaConfig {
  title: string;
  description: string;
  image: string;
  canonical: string;
  urlPath?: string;
  robots?: string;
  structuredData?: object;
  keywords?: string;
}

export interface MetaConfigMap {
  [key: string]: MetaConfig;
}

export interface UseCaseDefinition {
  label: string;
  description: string;
  keywords?: string[];
}

export interface UseCaseDefinitionsMap {
  [key: string]: UseCaseDefinition;
}

// Base URL for canonical links and OG URLs
const BASE_URL = 'https://smashingapps.ai';

// Default meta configuration (fallback)
export const defaultMeta: MetaConfig = {
  title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
  description: 'SmashingApps.ai provides free AI productivity apps and tools. Smash your way through mundane tasks with smart AI-powered productivity tools.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  urlPath: '/',
  robots: 'index, follow',
  keywords: 'free ai planner, magic to-do, ai task manager, ai task planner, smart to-do lists, auto task manager, ai to-do lists',
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
};

// Use case definitions for TaskSmasher
export const useCaseDefinitions: UseCaseDefinitionsMap = {
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

// Route-specific meta configurations
export const routeMeta: MetaConfigMap = {
  '/': {
    title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
    description: 'Get things done faster with free AI planners and smart to-do lists. Smash tasks easily using auto task management from SmashingApps.ai.',
    image: `${BASE_URL}/og/homepage.png`,
    canonical: BASE_URL,
    urlPath: '/',
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
    urlPath: '/tools/task-smasher/',
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
    urlPath: '/contact',
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
Object.entries(useCaseDefinitions).forEach(([id, definition]) => {
  // Generate URL-friendly path from the definition label
  const urlPath = `/tools/task-smasher/${definition.label.toLowerCase().replace(/\s+/g, '-')}/`;
  
  // Store the meta data for this use case
  routeMeta[urlPath] = {
    title: `${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`,
    description: definition.description,
    image: `${BASE_URL}/og/task-smasher-${id}.png`,
    canonical: `${BASE_URL}${urlPath}`,
    urlPath: urlPath,
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

// Helper functions for SEO

/**
 * Get meta data for a specific route or URL path
 * @param {string} route - The route or URL path to get meta data for
 * @returns {MetaConfig} - The meta data for the route
 */
export function getMetaForRoute(route: string): MetaConfig {
  // Ensure trailing slash for consistency
  const normalizedRoute = route.endsWith('/') || route === '/' ? route : `${route}/`;
  
  // Try to find an exact match first
  if (routeMeta[normalizedRoute]) {
    return routeMeta[normalizedRoute];
  }
  
  // If no exact match, try to find a parent route
  const pathParts = normalizedRoute.split('/').filter(Boolean);
  while (pathParts.length > 0) {
    const parentPath = `/${pathParts.join('/')}/`;
    if (routeMeta[parentPath]) {
      return routeMeta[parentPath];
    }
    pathParts.pop();
  }
  
  // Fall back to default if no match found
  return defaultMeta;
}

/**
 * Get URL path for a route name or label
 * @param {string} routeNameOrLabel - The route name or label to get URL path for
 * @returns {string} - The URL path
 */
export function getUrlPath(routeNameOrLabel: string): string {
  // Check if it's already a valid URL path
  if (routeNameOrLabel.startsWith('/')) {
    return routeNameOrLabel;
  }
  
  // Try to find a matching route by name or label
  for (const [path, meta] of Object.entries(routeMeta)) {
    if (meta.title.includes(routeNameOrLabel)) {
      return meta.urlPath || path;
    }
  }
  
  // If no match found, convert to URL-friendly format
  return `/${routeNameOrLabel.toLowerCase().replace(/\s+/g, '-')}/`;
}

/**
 * Generate HTML meta tags for a route
 * @param {string} route - The route to generate meta tags for
 * @returns {string} - HTML meta tags
 */
export function generateMetaTags(route: string): string {
  const meta = getMetaForRoute(route);
  
  return `
    <title>${meta.title}</title>
    <meta name="description" content="${meta.description}">
    ${meta.keywords ? `<meta name="keywords" content="${meta.keywords}">` : ''}
    <link rel="canonical" href="${meta.canonical}">
    
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="website">
    <meta property="og:url" content="${meta.canonical}">
    <meta property="og:title" content="${meta.title}">
    <meta property="og:description" content="${meta.description}">
    <meta property="og:image" content="${meta.image}">
    <meta property="og:site_name" content="SmashingApps.ai">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${meta.title}">
    <meta name="twitter:description" content="${meta.description}">
    <meta name="twitter:image" content="${meta.image}">
    
    ${meta.structuredData ? `
    <!-- Structured Data -->
    <script type="application/ld+json">
      ${JSON.stringify(meta.structuredData, null, 2)}
    </script>
    ` : ''}
  `;
}

/**
 * Generate fallback content for a route
 * @param {string} route - The route to generate fallback content for
 * @returns {string} - HTML fallback content
 */
export function generateFallbackContent(route: string): string {
  const meta = getMetaForRoute(route);
  
  return `
    <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
    <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
      <h1>${meta.title}</h1>
      <p>${meta.description}</p>
      <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
    </div>
  `;
}

/**
 * Get all meta information for a route or URL path
 * This is the main function to use when you need all SEO information for a page
 * @param {string} routeOrPath - The route or URL path
 * @returns {object} - All SEO information including meta tags and fallback content
 */
export function getAllSeoInfo(routeOrPath: string): {
  meta: MetaConfig;
  metaTags: string;
  fallbackContent: string;
  urlPath: string;
} {
  const meta = getMetaForRoute(routeOrPath);
  return {
    meta: meta,
    metaTags: generateMetaTags(routeOrPath),
    fallbackContent: generateFallbackContent(routeOrPath),
    urlPath: meta.urlPath || routeOrPath
  };
}

// Also make available on window for browser use
declare global {
  interface Window {
    seoMaster: {
      defaultMeta: MetaConfig;
      routeMeta: MetaConfigMap;
      useCaseDefinitions: UseCaseDefinitionsMap;
      getMetaForRoute: (route: string) => MetaConfig;
      getUrlPath: (routeNameOrLabel: string) => string;
      generateMetaTags: (route: string) => string;
      generateFallbackContent: (route: string) => string;
      getAllSeoInfo: (routeOrPath: string) => {
        meta: MetaConfig;
        metaTags: string;
        fallbackContent: string;
        urlPath: string;
      };
    };
  }
}

if (typeof window !== 'undefined') {
  window.seoMaster = {
    defaultMeta,
    routeMeta,
    useCaseDefinitions,
    getMetaForRoute,
    getUrlPath,
    generateMetaTags,
    generateFallbackContent,
    getAllSeoInfo
  };
}

// Default export for convenience
export default {
  defaultMeta,
  routeMeta,
  useCaseDefinitions,
  getMetaForRoute,
  getUrlPath,
  generateMetaTags,
  generateFallbackContent,
  getAllSeoInfo
};