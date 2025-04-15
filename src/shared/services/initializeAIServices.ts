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
  
  // Get the current URL to help with debugging
  const url = window.location.href;
  console.log('Initializing AI services with usage tracking for URL:', url);
  
  // Wrap each service with usage tracking
  services.forEach(service => {
    // Determine the app ID based on the context
    // This is a simplified approach - in a real app, you might want to
    // determine this dynamically based on which app is using the service
    const appId = getAppIdForService(service.provider);
    
    console.log(`Service provider: ${service.provider}, App ID: ${appId}`);
    
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
  // First try to determine from the current route/path
  const path = window.location.pathname;
  const url = window.location.href;
  
  // Check for exact path matches first
  if (path.includes('/tools/article-smasher') || path.includes('/article-smasher')) {
    console.log('Detected ArticleSmasher from path');
    return 'article-smasher';
  }
  
  if (path.includes('/tools/task-smasher') || path.includes('/task-smasher')) {
    console.log('Detected TaskSmasher from path');
    return 'task-smasher';
  }
  
  // If path doesn't help, try to determine from the current context
  const currentContext = getCurrentContext();
  if (currentContext) {
    console.log(`Detected app from context: ${currentContext}`);
    return currentContext;
  }
  
  // Finally, use provider as a hint, but with more specific conditions
  switch (provider) {
    case 'openai':
    case 'anthropic':
    case 'google':
    case 'openrouter':
      // For AI providers, we need to check the actual usage context
      if (isArticleContext()) {
        console.log(`Provider ${provider} used in article context`);
        return 'article-smasher';
      }
      if (isTaskContext()) {
        console.log(`Provider ${provider} used in task context`);
        return 'task-smasher';
      }
      break;
      
    case 'image':
      // Image generation is used by both apps, determine from context
      if (isArticleContext()) {
        return 'article-smasher';
      }
      return 'task-smasher';
  }
  
  // If we still can't determine, log a warning and return unknown
  console.warn(`Could not determine app ID for provider ${provider}, defaulting to unknown-app`);
  return 'unknown-app';
}

/**
 * Get the current app context from React components or other signals
 */
function getCurrentContext(): string | null {
  try {
    // Check for React component signals
    const articleRoot = document.querySelector('.article-smasher-container');
    if (articleRoot) {
      return 'article-smasher';
    }
    
    const taskRoot = document.querySelector('.task-smasher-container');
    if (taskRoot) {
      return 'task-smasher';
    }
    
    return null;
  } catch (error) {
    console.error('Error determining current context:', error);
    return null;
  }
}

/**
 * Check if we're in an article-related context
 */
function isArticleContext(): boolean {
  return (
    // Check for article-specific UI elements
    !!document.querySelector('.article-smasher-container') ||
    // Check for article-specific routes
    window.location.pathname.includes('/article') ||
    // Check for article-specific localStorage data
    !!localStorage.getItem('article_wizard_state')
  );
}

/**
 * Check if we're in a task-related context
 */
function isTaskContext(): boolean {
  return (
    // Check for task-specific UI elements
    !!document.querySelector('.task-smasher-container') ||
    // Check for task-specific routes
    window.location.pathname.includes('/task') ||
    // Check for task-specific localStorage data
    !!localStorage.getItem('task_list_state')
  );
}

/**
 * Get the current app ID based on the URL or other context
 */
export function getCurrentAppId(): string {
  // In a real app, you would determine this based on the current route or context
  const path = window.location.pathname;
  
  if (path.includes('task-smasher')) {
    return 'task-smasher';
  } else if (path.includes('article-smasher')) {
    return 'article-smasher';
  } else {
    return 'main-app';
  }
}