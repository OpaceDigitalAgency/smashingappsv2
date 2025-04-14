import { aiServiceRegistry } from './aiServices';
import { wrapAIService, initializeUsageTracking } from './aiServiceWrapper';
import { AIProvider } from '../types/aiProviders';

/**
 * Initialize all AI services with usage tracking
 */
export function initializeAIServicesWithTracking(): void {
  // Initialize usage tracking
  initializeUsageTracking();
  
  // Get all registered services
  const services = aiServiceRegistry.getAllServices();
  
  // Wrap each service with usage tracking
  services.forEach(service => {
    // Determine the app ID based on the context
    // This is a simplified approach - in a real app, you might want to
    // determine this dynamically based on which app is using the service
    const appId = getAppIdForService(service.provider);
    
    // Wrap the service with usage tracking
    const wrappedService = wrapAIService(service, appId);
    
    // Replace the original service in the registry
    // Note: This is a bit of a hack since we're modifying the service in-place
    // In a real app, you might want to create a new registry with wrapped services
    Object.assign(service, wrappedService);
  });
  
  console.log('AI services initialized with usage tracking');
}

/**
 * Get the app ID for a service based on its provider
 */
function getAppIdForService(provider: AIProvider): string {
  // This is a simplified mapping - in a real app, you might want to
  // determine this dynamically based on which app is using the service
  // Get the current URL to determine which app is using the service
  const url = window.location.href;
  
  // Check if the URL contains article-smasher (either v2 or original)
  if (url.includes('article-smasher')) {
    return 'article-smasher';
  }
  
  // Check if the URL contains task-smasher
  if (url.includes('task-smasher')) {
    return 'task-smasher';
  }
  
  // If we can't determine from the URL, try to determine from the provider
  // This is a fallback for when the URL doesn't contain the app name
  switch (provider) {
    case 'openai':
      // If we're using OpenAI, check if we're in an article context
      if (url.includes('article') || url.includes('content') || url.includes('blog') || url.includes('post')) {
        return 'article-smasher';
      }
      return 'task-smasher';
    case 'anthropic':
      return 'article-smasher'; // Default app for Anthropic
    case 'google':
      return 'article-smasher'; // Default app for Google
    case 'openrouter':
      return 'task-smasher'; // Default app for OpenRouter
    case 'image':
      return 'task-smasher'; // Default app for image generation
    default:
      return 'unknown-app';
  }
}

/**
 * Get the current app ID based on the URL or other context
 */
export function getCurrentAppId(): string {
  // In a real app, you would determine this based on the current route or context
  const path = window.location.pathname;
  
  if (path.includes('task-smasher')) {
    return 'task-smasher';
  } else if (path.includes('article-smasherv2')) {
    return 'article-smasherv2';
  } else if (path.includes('article-smasher')) {
    return 'article-smasher';
  } else {
    return 'main-app';
  }
}