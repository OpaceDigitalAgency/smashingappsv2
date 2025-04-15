import { ChatCompletionRequest, ChatCompletionResponse, RateLimitInfo } from '../types';
import {
  AIProvider,
  AIModel,
  BaseRequestOptions,
  TextCompletionOptions,
  ChatCompletionOptions,
  ImageGenerationOptions,
  TextCompletionResponse,
  ChatCompletionResponse as EnhancedChatCompletionResponse,
  ImageGenerationResponse,
  RateLimitInfo as EnhancedRateLimitInfo,
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
  getRateLimitStatus(): Promise<EnhancedRateLimitInfo>;
  
  /**
   * Generate a text completion
   */
  createTextCompletion(options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>>;
  
  /**
   * Generate a chat completion
   */
  createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<EnhancedChatCompletionResponse>>;
  
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

// Legacy AIService class for backward compatibility
class LegacyAIService {
  /**
   * Send a chat completion request to the AI service
   */
  async createChatCompletion(
    request: ChatCompletionRequest,
    recaptchaToken?: string | null
  ): Promise<{
    data: ChatCompletionResponse;
    rateLimit: RateLimitInfo;
  }> {
    try {
      // Get the model from global settings if available, otherwise use the requested model
      const globalSettingsModel = localStorage.getItem('smashingapps_activeModel');
      const originalModel = request.model;
      
      if (globalSettingsModel) {
        request.model = globalSettingsModel;
        console.log(`[LEGACY SERVICE] Using model from global settings: ${request.model} (original: ${originalModel})`);
      } else {
        console.log(`[LEGACY SERVICE] Using requested model: ${request.model}`);
      }
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add reCAPTCHA token if available
      if (recaptchaToken) {
        headers['X-ReCaptcha-Token'] = recaptchaToken;
      }
      
      // Add model override header to ensure proxy respects our model choice
      headers['X-Force-Model'] = request.model;
      
      // Use the Netlify function proxy instead of direct API
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        // Add timeout handling
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 3600000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };

      // Handle rate limit exceeded
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Try again after ${rateLimit.reset.toLocaleString()}`);
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      // Parse the response
      const data = await response.json() as ChatCompletionResponse;
      
      return { data, rateLimit };
    } catch (error) {
      console.error("Error in createChatCompletion:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with AI API');
    }
  }

  /**
   * Get a simple text completion from the AI service
   */
  async getCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
    // Get the model from global settings if available, otherwise use the requested model
    const globalSettingsModel = localStorage.getItem('smashingapps_activeModel');
    if (globalSettingsModel) {
      model = globalSettingsModel;
      console.log(`[LEGACY SERVICE] Using model from global settings for getCompletion: ${model}`);
    }
    try {
      const { data } = await this.createChatCompletion({
        model,
        messages: [{ role: 'user', content: prompt }],
      });
      
      return data.choices[0]?.message.content || '';
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  }

  /**
   * Get the current rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    try {
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = Date.now();
      const response = await fetch(`/.netlify/functions/openai-proxy/rate-limit-status?_=${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get rate limit status: ${response.statusText}`);
      }
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 3600000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };
      
      return rateLimit;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      
      // Return default values if we can't get the actual limits
      return {
        limit: 10,
        remaining: 20,
        reset: new Date(Date.now() + 3600000),  // Reset after 1 hour
        used: 0
      };
    }
  }
}

// Export a singleton instance of the legacy service for backward compatibility
export default new LegacyAIService();