/**
 * Image Generation Service Implementation
 *
 * This file implements the AIService interface for image generation models.
 * It's a wrapper around OpenAI's DALL-E models but presented as a separate service.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './AIService';

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

import OpenAIService from './openaiService';

// Image Models
const IMAGE_MODELS: ImageModel[] = [
  {
    id: 'gpt-image-1',
    name: 'GPT Image 1',
    provider: 'image',
    description: 'Advanced image generation with GPT-5 architecture',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  } as any,
  {
    id: 'gpt-image-1-mini',
    name: 'GPT Image 1 Mini',
    provider: 'image',
    description: 'Fast image generation with GPT-5 architecture',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  } as any,
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'image',
    description: 'Advanced image generation',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  } as any,
  {
    id: 'dall-e-2',
    name: 'DALL-E 2',
    provider: 'image',
    description: 'Standard image generation',
    category: 'image',
    supportedSizes: ['256x256', '512x512', '1024x1024'],
    supportedFormats: ['png', 'jpeg']
  } as any
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
    return IMAGE_MODELS.find(model => model.id === 'gpt-image-1') || IMAGE_MODELS[0];
  }
  
  /**
   * Check if image service is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey || !!OpenAIService.getApiKey();
  }
  
  /**
   * Set the API key for image service
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for image service
   */
  getApiKey(): string | null {
    return this.apiKey || OpenAIService.getApiKey();
  }
  
  /**
   * Generate an image
   */
  async createImage(options: ImageGenerationOptions): Promise<AIResponse<ImageGenerationResponse>> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // Determine which API to use based on model
      const isDallE = /^dall-e(-\d)?/i.test(options.model);
      const usesResponsesAPI = options.model.startsWith('gpt-image-') ||
                               options.model.startsWith('gpt-5') ||
                               options.model.startsWith('gpt-4o');
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Call-Count': apiCallCount.toString(),
        'X-Provider': 'openai',
        'X-Request-Type': 'image'
      };
      
      // Add API key if available
      const apiKey = this.getApiKey();
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
      }
      
      let response: Response;
      
      if (isDallE) {
        // For DALL-E models: use Images API
        console.log('[ImageService] Using Images API for', options.model);
        const requestBody = {
          model: options.model,
          prompt: options.prompt,
          size: options.size || '1024x1024',
          quality: options.quality || 'standard',
          n: options.n || 1,
          response_format: options.responseFormat || 'url' // Support both 'url' and 'b64_json'
        };
        
        response = await fetch('/.netlify/functions/openai-proxy/image', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(60000)
        });
      } else if (usesResponsesAPI) {
        // For gpt-image-1, gpt-5*, gpt-4o*: use Responses API
        console.log('[ImageService] Using Responses API for', options.model);
        const requestBody = {
          model: options.model,
          input: options.prompt,
          tools: [{ type: 'image_generation' }],
          image: {
            size: options.size || '1024x1024',
            quality: options.quality || 'standard',
            background: options.background || 'transparent',
            n: options.n || 1
          },
          max_output_tokens: 1
        };
        
        response = await fetch('/.netlify/functions/openai-proxy/responses', {
          method: 'POST',
          headers,
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(60000)
        });
      } else {
        throw new Error(`Unsupported image model: ${options.model}`);
      }
      
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
        console.error('[ImageService] Error response:', errorText);
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
      
      // Format the response - handle both URL and base64 outputs
      let images: string[];
      
      if (isDallE) {
        // DALL-E response format: { data: [{ url?: string, b64_json?: string }] }
        images = responseData.data.map((item: any) => {
          if (item.b64_json) {
            return `data:image/png;base64,${item.b64_json}`;
          }
          return item.url;
        });
      } else if (usesResponsesAPI) {
        // Responses API format: extract images from tool calls
        // Response structure: { choices: [{ message: { tool_calls: [...] } }] }
        const toolCalls = responseData.choices?.[0]?.message?.tool_calls || [];
        const imageToolCall = toolCalls.find((tc: any) => tc.type === 'image_generation');
        
        if (imageToolCall?.image) {
          const imageData = imageToolCall.image;
          if (imageData.b64_json) {
            images = [`data:image/png;base64,${imageData.b64_json}`];
          } else if (imageData.url) {
            images = [imageData.url];
          } else {
            throw new Error('No image data found in response');
          }
        } else {
          throw new Error('No image generation tool call found in response');
        }
      } else {
        throw new Error('Unable to parse response');
      }
      
      const formattedResponse: ImageGenerationResponse = {
        images,
        model: options.model
      };
      
      return {
        data: formattedResponse,
        rateLimit
      };
    } catch (error) {
      console.error('[ImageService] Error in createImage:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to generate image');
    }
  }
  
  /**
   * Chat completion is not supported for image models
   * This is a placeholder implementation that throws an error
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> {
    throw new Error('Chat completion is not supported for image models');
  }
  
  /**
   * Text completion is not supported for image models
   * This is a placeholder implementation that throws an error
   */
  async createTextCompletion(options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>> {
    throw new Error('Text completion is not supported for image models');
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
        'X-Provider': 'openai', // We use OpenAI's DALL-E under the hood
        'X-Request-Type': 'image'
      };
      
      // Add API key if available
      const apiKey = this.getApiKey();
      if (apiKey) {
        headers['X-API-Key'] = apiKey;
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