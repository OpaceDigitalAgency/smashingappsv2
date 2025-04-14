/**
 * Image Generation Service Implementation
 *
 * This file implements the AIService interface for image generation models.
 * It manages API calls, rate limits, and error handling.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './aiService';

import {
  AIProvider,
  AIModel,
  ImageModel,
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

// Image Generation Models
const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'image',
    description: 'OpenAI\'s advanced image generation',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  },
  {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    provider: 'image',
    description: 'OpenAI\'s standard image generation',
    category: 'image',
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    supportedFormats: ['png', 'jpeg']
  },
  {
    id: 'stable-diffusion-3',
    name: 'Stable Diffusion 3',
    provider: 'image',
    description: 'Stability AI\'s latest image model',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  },
  {
    id: 'midjourney',
    name: 'Midjourney',
    provider: 'image',
    description: 'High-quality artistic images',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  }
];

/**
 * Image Service Implementation
 */
class ImageServiceImpl implements AIService {
  provider: AIProvider = 'image';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'image_api_key';
  private rateLimitStorageKey = 'image_rateLimitInfo';
  private apiCallCountKey = 'image_apiCallCount';
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
  }
  
  /**
   * Get available models for image generation
   */
  getModels(): AIModel[] {
    return IMAGE_MODELS;
  }
  
  /**
   * Get the default model for image generation
   */
  getDefaultModel(): AIModel {
    return IMAGE_MODELS.find(model => model.id === 'dall-e-3') || IMAGE_MODELS[0];
  }
  
  /**
   * Check if image generation is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Set the API key for image generation
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for image generation
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Generate an image
   */
  async createImage(options: ImageGenerationOptions): Promise<AIResponse<ImageGenerationResponse>> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Call-Count': apiCallCount.toString(),
        'X-Provider': this.provider,
        'X-Request-Type': 'image'
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Prepare request body based on the model
      let requestBody: any = {
        model: options.model,
        prompt: options.prompt,
        size: options.size || '1024x1024',
        n: options.n || 1,
        response_format: 'url'
      };
      
      // Adjust request body based on the model
      if (options.model === 'stable-diffusion-3') {
        requestBody = {
          ...requestBody,
          engine: 'stable-diffusion-3',
          width: parseInt(options.size?.split('x')[0] || '1024'),
          height: parseInt(options.size?.split('x')[1] || '1024'),
          samples: options.n || 1
        };
      } else if (options.model === 'midjourney') {
        requestBody = {
          ...requestBody,
          engine: 'midjourney',
          width: parseInt(options.size?.split('x')[0] || '1024'),
          height: parseInt(options.size?.split('x')[1] || '1024'),
          quality: 'standard'
        };
      }
      
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(requestBody));
      
      // Use the Netlify function proxy
      const response = await fetch('/.netlify/functions/openai-proxy/image', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(60000)
      });
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '10', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 86400000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };
      
      // Handle errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }
      
      // Parse the response
      const responseData = await response.json();
      
      // Increment the API call count
      const newApiCallCount = apiCallCount + 1;
      localStorage.setItem(this.apiCallCountKey, newApiCallCount.toString());
      
      // Update rate limit info
      localStorage.setItem(this.rateLimitStorageKey, JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: newApiCallCount,
        timestamp: new Date().toISOString()
      }));
      
      // Format the response
      const formattedResponse: ImageGenerationResponse = {
        images: responseData.data.map((item: any) => item.url || item.image_url || item),
        model: options.model
      };
      
      return {
        data: formattedResponse,
        rateLimit
      };
    } catch (error) {
      console.error("Error in createImage:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate image');
    }
  }
  
  /**
   * Send a chat completion request (not supported for image models)
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> {
    throw new Error('Chat completion not supported for image models');
  }
  
  /**
   * Generate a text completion (not supported for image models)
   */
  async createTextCompletion(options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>> {
    throw new Error('Text completion not supported for image models');
  }
  
  /**
   * Get the current rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    try {
      // First, check if we have rate limit info in localStorage
      const storedRateLimitInfo = localStorage.getItem(this.rateLimitStorageKey);
      
      if (storedRateLimitInfo) {
        try {
          console.log('Found stored rate limit info in localStorage');
          const parsedInfo = JSON.parse(storedRateLimitInfo);
          
          // Check if the stored info is still valid (not expired)
          const resetTime = new Date(parsedInfo.reset);
          if (resetTime > new Date()) {
            // The stored info is still valid
            return {
              limit: parsedInfo.limit,
              remaining: parsedInfo.remaining,
              reset: resetTime,
              used: parsedInfo.used
            };
          }
        } catch (e) {
          console.error('Error parsing stored rate limit info:', e);
        }
      }
      
      // If we don't have valid stored info, fetch it from the server
      console.log('Fetching rate limit status from dedicated endpoint');
      
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = Date.now();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'X-Provider': this.provider
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      const response = await fetch(`/.netlify/functions/openai-proxy/rate-limit-status?_=${cacheBuster}`, {
        method: 'GET',
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get rate limit status: ${response.statusText}`);
      }
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '10', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 86400000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };
      
      // Get the API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // If our local count is higher, use that instead
      if (apiCallCount > rateLimit.used) {
        console.log(`Using local API call count (${apiCallCount}) instead of server count (${rateLimit.used})`);
        rateLimit.used = apiCallCount;
        rateLimit.remaining = Math.max(0, rateLimit.limit - apiCallCount);
      }
      
      // Store the updated rate limit info in localStorage
      localStorage.setItem(this.rateLimitStorageKey, JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: rateLimit.used,
        timestamp: new Date().toISOString()
      }));
      
      return rateLimit;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      
      // FALLBACK SETTINGS
      return {
        limit: 10,
        remaining: 10,
        reset: new Date(Date.now() + 86400000),
        used: 0
      };
    }
  }
}

// Create and register the Image service
const ImageService = new ImageServiceImpl();
aiServiceRegistry.registerService(ImageService);

export default ImageService;