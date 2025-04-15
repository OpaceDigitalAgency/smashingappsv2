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
  console.log('[DEBUG] Initializing AI services with usage tracking for URL:', url);
  console.log('[DEBUG] localStorage article_wizard_state:', localStorage.getItem('article_wizard_state'));
  console.log('[DEBUG] localStorage task_list_state:', localStorage.getItem('task_list_state'));
  
  // Wrap each service with usage tracking
  services.forEach(service => {
    // Determine the app ID based on the context
    // This is a simplified approach - in a real app, you might want to
    // determine this dynamically based on which app is using the service
    const appId = getAppIdForService(service.provider);
    
    console.log(`[DEBUG] Service provider: ${service.provider}, App ID: ${appId}`);
    
    // Wrap the service with usage tracking
    const wrappedService = wrapAIService(service, appId);
    
    // Replace the original service in the registry
    // Note: This is a bit of a hack since we're modifying the service in-place
    // In a real app, you might want to create a new registry with wrapped services
    Object.assign(service, wrappedService);
  });
  
  console.log('[DEBUG] AI services initialized with usage tracking');
}

/**
 * Get the app ID for a service based on its provider
 */
function getAppIdForService(provider: AIProvider): string {
  console.log('[DEBUG] Determining app ID for provider:', provider);
  
  // First try to determine from localStorage
  const articleState = localStorage.getItem('article_wizard_state');
  const taskState = localStorage.getItem('task_list_state');
  const articleSmasherFlag = localStorage.getItem('article_smasher_app');
  
  if (articleSmasherFlag) {
    console.log('[DEBUG] Detected ArticleSmasher from dedicated flag');
    return 'article-smasher';
  }
  
  if (articleState) {
    console.log('[DEBUG] Detected ArticleSmasher from localStorage state');
    return 'article-smasher';
  }
  
  if (taskState) {
    console.log('[DEBUG] Detected TaskSmasher from localStorage state');
    return 'task-smasher';
  }
  
  // Then check URL path
  const path = window.location.pathname;
  
  if (path.includes('/article-smasher') || path.includes('/tools/article-smasher')) {
    console.log('[DEBUG] Detected ArticleSmasher from path');
    // Set the flag for future API calls
    localStorage.setItem('article_smasher_app', 'true');
    return 'article-smasher';
  }
  
  if (path.includes('/task-smasher') || path.includes('/tools/task-smasher')) {
    console.log('[DEBUG] Detected TaskSmasher from path');
    // Set the flag for future API calls
    localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
    return 'task-smasher';
  }
  
  // Finally check DOM, but only if document is ready
  if (document.readyState !== 'loading') {
    if (document.querySelector('.article-smasher-container')) {
      console.log('[DEBUG] Detected ArticleSmasher from DOM');
      // Set the flag for future API calls
      localStorage.setItem('article_smasher_app', 'true');
      return 'article-smasher';
    }
    
    if (document.querySelector('.task-smasher-container')) {
      console.log('[DEBUG] Detected TaskSmasher from DOM');
      // Set the flag for future API calls
      localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
      return 'task-smasher';
    }
  }
  
  // If we still can't determine, use provider hints
  if (provider === 'image') {
    // Default image generation to task-smasher if unclear
    return 'task-smasher';
  }
  
  // Log warning and return unknown
  console.warn(`[DEBUG] Could not determine app ID for provider ${provider}, defaulting to unknown-app`);
  return 'unknown-app';
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