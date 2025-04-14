/**
 * Base AI Service Interface
 * 
 * This file defines the base interface that all AI provider services will implement.
 * It provides a consistent API for interacting with different AI providers.
 */

import {
  AIProvider,
  AIModel,
  BaseRequestOptions,
  TextCompletionOptions,
  ChatCompletionOptions,
  ImageGenerationOptions,
  TextCompletionResponse,
  ChatCompletionResponse,
  ImageGenerationResponse,
  RateLimitInfo,
  AIResponse
} from '../types/aiProviders';

/**
 * Base interface for all AI provider services
 */
export interface AIService {
  /**
   * The provider identifier
   */
  provider: AIProvider;
  
  /**
   * Get available models for this provider
   */
  getModels(): AIModel[];
  
  /**
   * Get the default model for this provider
   */
  getDefaultModel(): AIModel;
  
  /**
   * Check if the provider is configured (has API key if required)
   */
  isConfigured(): boolean;
  
  /**
   * Set the API key for this provider
   */
  setApiKey(apiKey: string): void;
  
  /**
   * Get the API key for this provider
   */
  getApiKey(): string | null;
  
  /**
   * Get the current rate limit status
   */
  getRateLimitStatus(): Promise<RateLimitInfo>;
  
  /**
   * Generate a text completion
   */
  createTextCompletion(options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>>;
  
  /**
   * Generate a chat completion
   */
  createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>>;
  
  /**
   * Generate an image
   */
  createImage?(options: ImageGenerationOptions): Promise<AIResponse<ImageGenerationResponse>>;
}

/**
 * AI Service Registry
 * 
 * This registry manages all available AI services and provides methods to access them.
 */
class AIServiceRegistry {
  private services: Map<AIProvider, AIService> = new Map();
  private defaultProvider: AIProvider = 'openai';
  
  /**
   * Register an AI service
   */
  registerService(service: AIService): void {
    this.services.set(service.provider, service);
  }
  
  /**
   * Get an AI service by provider
   */
  getService(provider: AIProvider): AIService | undefined {
    return this.services.get(provider);
  }
  
  /**
   * Get all registered services
   */
  getAllServices(): AIService[] {
    return Array.from(this.services.values());
  }
  
  /**
   * Get all available models across all providers
   */
  getAllModels(): AIModel[] {
    return this.getAllServices().flatMap(service => service.getModels());
  }
  
  /**
   * Get the default service
   */
  getDefaultService(): AIService | undefined {
    return this.services.get(this.defaultProvider);
  }
  
  /**
   * Set the default provider
   */
  setDefaultProvider(provider: AIProvider): void {
    if (this.services.has(provider)) {
      this.defaultProvider = provider;
    }
  }
  
  /**
   * Get the default provider
   */
  getDefaultProvider(): AIProvider {
    return this.defaultProvider;
  }
  
  /**
   * Get a service for a specific model ID
   */
  getServiceForModel(modelId: string): AIService | undefined {
    for (const service of this.services.values()) {
      const models = service.getModels();
      if (models.some(model => model.id === modelId)) {
        return service;
      }
    }
    return undefined;
  }
}

// Create and export the global AI service registry
export const aiServiceRegistry = new AIServiceRegistry();

export default aiServiceRegistry;