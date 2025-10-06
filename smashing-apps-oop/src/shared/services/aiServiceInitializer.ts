/**
 * AI Service Initializer
 * 
 * This service provides a standardized way to initialize AI services across all SmashingApps.
 * It ensures consistent behavior between Task Smasher and Article Smasher by:
 * 
 * 1. Providing one-time initialization at the application root level
 * 2. Ensuring consistent configuration of all AI services
 * 3. Integrating with the centralized app registry
 * 4. Integrating with the unified settings store
 */

import { aiServiceRegistry } from './AIService';
import { wrapAIService, initializeUsageTracking } from './aiServiceWrapper';
import { appRegistry } from './appRegistry';
import { unifiedSettings } from './unifiedSettings';
import { AIProvider } from '../types/aiProviders';

// Flag to track if services have been initialized
let servicesInitialized = false;

/**
 * Initialize all AI services with consistent configuration
 * 
 * This function should be called once at the application root level.
 * It will:
 * 1. Initialize usage tracking
 * 2. Configure all services with settings from the unified settings store
 * 3. Wrap all services with usage tracking using the correct app ID
 * 
 * @returns {boolean} True if services were initialized, false if already initialized
 */
export function initializeAIServices(): boolean {
  // If services are already initialized, don't initialize again
  if (servicesInitialized) {
    console.log('[AIServiceInitializer] Services already initialized, skipping');
    return false;
  }

  console.log('[AIServiceInitializer] Initializing AI services');

  // Initialize usage tracking
  initializeUsageTracking();
  
  // Initialize enhanced usage tracking
  try {
    const { enhancedUsageTracking } = require('./index');
    enhancedUsageTracking.refreshData();
    console.log('[AIServiceInitializer] Enhanced usage tracking initialized');
  } catch (error) {
    console.error('[AIServiceInitializer] Error initializing enhanced usage tracking:', error);
  }

  // Get all registered services
  const services = aiServiceRegistry.getAllServices();
  
  // Get the current app ID from the app registry
  const activeApp = appRegistry.getActiveApp();
  const appId = activeApp || appRegistry.determineCurrentApp();
  
  console.log(`[AIServiceInitializer] Initializing services for app: ${appId}`);

  // Get AI settings from unified settings
  const aiSettings = unifiedSettings.getAISettings();
  console.log('[AIServiceInitializer] Using AI settings:', aiSettings);

  // Configure and wrap each service
  services.forEach(service => {
    // Configure the service with API keys from unified settings
    const apiKey = aiSettings.apiKeys[service.provider];
    if (apiKey) {
      console.log(`[AIServiceInitializer] Setting API key for ${service.provider}`);
      service.setApiKey(apiKey);
    }
    
    // Wrap the service with usage tracking
    console.log(`[AIServiceInitializer] Wrapping service ${service.provider} with usage tracking for app ${appId}`);
    const wrappedService = wrapAIService(service, appId);
    
    // Replace the original service in the registry
    Object.assign(service, wrappedService);
  });

  // Set the default provider in the registry based on unified settings
  aiServiceRegistry.setDefaultProvider(aiSettings.provider);
  
  // Mark services as initialized
  servicesInitialized = true;
  
  // Set up event listeners for settings changes
  setupEventListeners();
  
  console.log('[AIServiceInitializer] AI services initialized successfully');
  return true;
}

/**
 * Set up event listeners for settings changes
 */
function setupEventListeners(): void {
  // Listen for settings changes
  window.addEventListener('unifiedSettingsChanged', (event: any) => {
    if (!event.detail) return;
    
    const settings = event.detail;
    const aiSettings = settings.ai;
    
    console.log('[AIServiceInitializer] Settings changed, updating services');
    
    // Update API keys for all services
    const services = aiServiceRegistry.getAllServices();
    services.forEach(service => {
      const apiKey = aiSettings.apiKeys[service.provider];
      if (apiKey) {
        service.setApiKey(apiKey);
      }
    });
    
    // Update default provider
    aiServiceRegistry.setDefaultProvider(aiSettings.provider);
  });
  
  // Listen for app changes
  window.addEventListener('app-changed', (event: any) => {
    if (!event.detail || !event.detail.appId) return;
    
    const appId = event.detail.appId;
    console.log(`[AIServiceInitializer] App changed to ${appId}, updating service wrappers`);
    
    // Re-wrap services with the new app ID
    const services = aiServiceRegistry.getAllServices();
    services.forEach(service => {
      const wrappedService = wrapAIService(service, appId);
      Object.assign(service, wrappedService);
    });
  });
}

/**
 * Check if AI services are initialized
 * 
 * @returns {boolean} True if services are initialized, false otherwise
 */
export function areServicesInitialized(): boolean {
  return servicesInitialized;
}

/**
 * Reset the initialization state (mainly for testing)
 */
export function resetInitializationState(): void {
  servicesInitialized = false;
}

/**
 * Get the service for a specific provider
 * 
 * This is a convenience function that ensures services are initialized
 * before returning a service.
 * 
 * @param provider The AI provider to get a service for
 * @returns The AI service for the specified provider
 */
export function getServiceByProvider(provider: AIProvider) {
  // Ensure services are initialized
  if (!servicesInitialized) {
    initializeAIServices();
  }
  
  return aiServiceRegistry.getService(provider);
}

/**
 * Get the service for a specific model
 * 
 * This is a convenience function that ensures services are initialized
 * before returning a service.
 * 
 * @param modelId The model ID to get a service for
 * @returns The AI service for the specified model
 */
export function getServiceForModel(modelId: string) {
  // Ensure services are initialized
  if (!servicesInitialized) {
    initializeAIServices();
  }
  
  return aiServiceRegistry.getServiceForModel(modelId);
}

/**
 * Get all available models
 * 
 * This is a convenience function that ensures services are initialized
 * before returning models.
 * 
 * @returns All available models across all providers
 */
export function getAllModels() {
  // Ensure services are initialized
  if (!servicesInitialized) {
    initializeAIServices();
  }
  
  return aiServiceRegistry.getAllModels();
}

// For backward compatibility with the existing code
export { initializeAIServices as initializeAIServicesWithTracking };