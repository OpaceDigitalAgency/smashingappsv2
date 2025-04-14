/**
 * AI Services Index
 * 
 * This file exports all AI services and the service registry.
 * It serves as the entry point for accessing AI services.
 */

// Import the service registry
import { aiServiceRegistry } from './aiService';

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
  return aiServiceRegistry.getServiceForModel(modelId);
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