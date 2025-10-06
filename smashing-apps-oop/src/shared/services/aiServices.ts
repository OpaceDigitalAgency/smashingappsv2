/**
 * AI Services Index
 *
 * This file exports all AI services and the service registry.
 * It serves as the entry point for accessing AI services.
 */

// Import the service registry
import { aiServiceRegistry } from './AIService';

// Import all services
import OpenAIService from './openaiService';
import OpenRouterService from './openRouterService';
import AnthropicService from './anthropicService';
import GoogleService from './googleService';
import ImageService from './imageService';

// Import the adapter for backward compatibility
import OpenAIServiceAdapter from './openaiServiceAdapter';

// Export everything
export {
  aiServiceRegistry,
  OpenAIService,
  OpenRouterService,
  AnthropicService,
  GoogleService,
  ImageService,
  OpenAIServiceAdapter
};

// Export a function to get a service by provider
export const getServiceByProvider = (provider: string) => {
  return aiServiceRegistry.getService(provider as any);
};

// Export a function to get a service for a specific model
export const getServiceForModel = (modelId: string) => {
  const service = aiServiceRegistry.getServiceForModel(modelId);
  if (!service) return null;
  
  // Get the current app ID from localStorage or URL
  let appId = 'unknown-app';
  
  // Check for app identification flags in priority order
  // 1. FORCE_APP_ID has highest priority
  const forcedAppId = localStorage.getItem('FORCE_APP_ID');
  if (forcedAppId) {
    console.log(`[APP IDENTIFICATION] Using forced app ID: ${forcedAppId}`);
    appId = forcedAppId;
  }
  // 2. current_app has second priority
  else if (localStorage.getItem('current_app')) {
    appId = localStorage.getItem('current_app') || 'unknown-app';
    console.log(`[APP IDENTIFICATION] Using current_app: ${appId}`);
  }
  // 3. App-specific flags have third priority
  else if (localStorage.getItem('article_smasher_app') || localStorage.getItem('article_wizard_state')) {
    appId = 'article-smasher';
    console.log('[APP IDENTIFICATION] Using article-smasher based on app-specific flags');
  } else if (localStorage.getItem('task_list_state')) {
    appId = 'task-smasher';
    console.log('[APP IDENTIFICATION] Using task-smasher based on app-specific flags');
  }
  // 4. URL path has lowest priority
  else {
    // Check URL path as a fallback
    const path = window.location.pathname;
    if (path.includes('/article-smasher') || path.includes('/tools/article-smasher')) {
      appId = 'article-smasher';
      console.log('[APP IDENTIFICATION] Using article-smasher based on URL path');
    } else if (path.includes('/task-smasher') || path.includes('/tools/task-smasher')) {
      appId = 'task-smasher';
      console.log('[APP IDENTIFICATION] Using task-smasher based on URL path');
    } else {
      console.log(`[APP IDENTIFICATION] Using default app ID: ${appId}`);
    }
  }
  
  // Import wrapAIService dynamically to avoid circular dependencies
  const { wrapAIService } = require('./aiServiceWrapper');
  
  // Return a wrapped service with usage tracking
  return wrapAIService(service, appId);
};

// Export a function to get all available models
export const getAllModels = () => {
  return aiServiceRegistry.getAllModels();
};

// Export a function to get all models grouped by provider
export const getModelsByProvider = () => {
  const services = aiServiceRegistry.getAllServices();
  const modelsByProvider: Record<string, any[]> = {};
  
  services.forEach(service => {
    modelsByProvider[service.provider] = service.getModels();
  });
  
  return modelsByProvider;
};

// Export a function to get all models grouped by category
export const getModelsByCategory = () => {
  const allModels = aiServiceRegistry.getAllModels();
  const modelsByCategory: Record<string, any[]> = {};
  
  allModels.forEach(model => {
    const category = model.category || 'other';
    if (!modelsByCategory[category]) {
      modelsByCategory[category] = [];
    }
    modelsByCategory[category].push(model);
  });
  
  return modelsByCategory;
};

// Export default as the registry for convenience
export default aiServiceRegistry;