/**
 * Shared Services Index
 *
 * This file exports all the shared services to make them easier to import.
 */

// Export the app registry
export { appRegistry, type AppId, type AppRegistrationOptions, type RegisteredApp } from './appRegistry';

// Export the unified settings
export { unifiedSettings, type UnifiedSettings } from './unifiedSettings';

// Export the AI service initializer
export {
  initializeAIServices,
  initializeAIServicesWithTracking,
  areServicesInitialized,
  resetInitializationState,
  getServiceByProvider,
  getServiceForModel,
  getAllModels
} from './aiServiceInitializer';

// Export the enhanced usage tracking
export {
  enhancedUsageTracking,
  type UsageData,
  type UsageEntry
} from './enhancedUsageTracking';

// Define TimeRange type since it's not exported from enhancedUsageTracking
export type TimeRange = 'day' | 'week' | 'month' | 'year';

// Re-export existing services for convenience
export { aiServiceRegistry } from './AIService';
export { wrapAIService, initializeUsageTracking } from './aiServiceWrapper';