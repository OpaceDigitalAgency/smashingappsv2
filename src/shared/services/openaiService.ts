/**
 * OpenAI Service Implementation
 *
 * This file implements the AIService interface for OpenAI.
 * It manages API calls, rate limits, and error handling.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './AIService';

import {
  AIProvider,
  AIModel,
  OpenAIModel,
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

// Default OpenAI Models (fallback if API fetch fails)
const DEFAULT_OPENAI_MODELS: OpenAIModel[] = [
  {
    id: 'gpt-4o',
    name: 'GPT-4o',
    provider: 'openai',
    description: 'Fast, intelligent, flexible',
    maxTokens: 128000,
    costPer1KTokens: { input: 0.01, output: 0.03 },
    category: 'featured'
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'GPT-3.5 Turbo',
    provider: 'openai',
    description: 'Most affordable',
    maxTokens: 16385,
    costPer1KTokens: { input: 0.0005, output: 0.0015 },
    category: 'cost-optimized'
  },
  {
    id: 'dall-e-3',
    name: 'DALL-E 3',
    provider: 'openai',
    description: 'Advanced image generation',
    category: 'image',
    supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
    supportedFormats: ['png', 'jpeg']
  } as any // Type casting as any to avoid TypeScript error with ImageModel
];

// Model pricing information for models that might not include it in the API response
const MODEL_PRICING_MAP: Record<string, { input: number; output: number }> = {
  'gpt-4o': { input: 0.01, output: 0.03 },
  'gpt-4o-mini': { input: 0.0015, output: 0.006 },
  'gpt-4-turbo': { input: 0.01, output: 0.03 },
  'gpt-4': { input: 0.03, output: 0.06 },
  'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
};

// Cache key for storing fetched models
const MODELS_CACHE_KEY = 'openai_models_cache';
// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * OpenAI Service Implementation
 */
class OpenAIServiceImpl implements AIService {
  provider: AIProvider = 'openai';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'openai_api_key';
  private rateLimitStorageKey = 'rateLimitInfo';
  private apiCallCountKey = 'apiCallCount';
  private cachedModels: OpenAIModel[] | null = null;
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
    
    // Try to load cached models from localStorage
    this.loadCachedModels();
    
    // Fetch models in the background
    this.fetchModelsFromAPI();
  }
  
  /**
   * Get available models for OpenAI
   */
  getModels(): AIModel[] {
    return this.cachedModels || DEFAULT_OPENAI_MODELS;
  }
  
  /**
   * Get the default model for OpenAI
   */
  getDefaultModel(): AIModel {
    return this.cachedModels?.find(model => model.id === 'gpt-3.5-turbo') || DEFAULT_OPENAI_MODELS[0];
  }
  
  /**
   * Check if OpenAI is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Set the API key for OpenAI
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for OpenAI
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Send a chat completion request to OpenAI through our proxy
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Call-Count': apiCallCount.toString(), // Send the current count to the server
        'X-Provider': this.provider // Add provider information
      };
      
      // Add API key if available (for custom API key support)
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Prepare request body
      const requestBody = {
        model: options.model,
        messages: options.messages,
        temperature: options.temperature,
        max_tokens: options.maxTokens
      };
      
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(requestBody));
      
      // Use the Netlify function proxy
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
        // Add timeout handling
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });
      
      // Log the response headers for debugging
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', {
        'X-RateLimit-Used': response.headers.get('X-RateLimit-Used'),
        'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining')
      });

      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '10', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '10', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 86400000), // 24 hours from now
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };

      // Handle rate limit exceeded
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Try again after ${rateLimit.reset.toLocaleString()}`);
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response text:", errorText);
        
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch (jsonError) {
          console.error("Failed to parse error response as JSON:", jsonError);
          errorData = {
            error: "Parse error",
            message: errorText
          };
        }
        
        throw new Error(`${response.status} ${response.statusText}: ${errorData.message || 'Unknown error occurred'}`);
      }

      // Parse the response
      const responseData = await response.json();
      
      // Increment the API call count in localStorage
      const newApiCallCount = apiCallCount + 1;
      localStorage.setItem(this.apiCallCountKey, newApiCallCount.toString());
      console.log(`API call count updated: ${newApiCallCount}`);
      
      // Update the rate limit info in localStorage
      localStorage.setItem(this.rateLimitStorageKey, JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: newApiCallCount, // Use our local counter for consistency
        timestamp: new Date().toISOString()
      }));
      
      // Override the used count with our local counter for consistency
      rateLimit.used = newApiCallCount;
      
      // Format the response to match our ChatCompletionResponse interface
      const formattedResponse: ChatCompletionResponse = {
        id: responseData.id,
        content: responseData.choices[0]?.message.content || '',
        model: responseData.model,
        usage: responseData.usage ? {
          promptTokens: responseData.usage.prompt_tokens,
          completionTokens: responseData.usage.completion_tokens,
          totalTokens: responseData.usage.total_tokens
        } : undefined
      };
      
      return { 
        data: formattedResponse, 
        rateLimit 
      };
    } catch (error) {
      console.error("Error in createChatCompletion:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with OpenAI API');
    }
  }
  
  /**
   * Generate a text completion from OpenAI
   */
  async createTextCompletion(options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>> {
    // Convert text completion request to chat completion request
    const chatResponse = await this.createChatCompletion({
      model: options.model,
      messages: [{ role: 'user', content: options.prompt }],
      temperature: options.temperature,
      maxTokens: options.maxTokens
    });
    
    // Convert chat completion response to text completion response
    const textResponse: TextCompletionResponse = {
      text: chatResponse.data.content,
      usage: chatResponse.data.usage
    };
    
    return {
      data: textResponse,
      rateLimit: chatResponse.rateLimit
    };
  }
  
  /**
   * Generate an image using DALL-E
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
        'X-Request-Type': 'image' // Indicate this is an image generation request
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Prepare request body
      const requestBody = {
        model: options.model,
        prompt: options.prompt,
        size: options.size || '1024x1024',
        n: options.n || 1,
        response_format: 'url' // Get URLs instead of base64
      };
      
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
        images: responseData.data.map((item: any) => item.url),
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
      throw new Error('Failed to generate image with DALL-E');
    }
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
  
  /**
   * Fetch available models from OpenAI API
   * This method is public so it can be called from the AdminContext
   */
  async fetchModelsFromAPI(): Promise<void> {
    // Skip if no API key is available
    if (!this.apiKey) {
      console.log('No OpenAI API key available, skipping model fetch');
      return;
    }
    
    try {
      // Check if we have valid cached models
      const cachedData = localStorage.getItem(MODELS_CACHE_KEY);
      if (cachedData) {
        const { models, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // If cache is still valid, use it
        if (cacheAge < CACHE_EXPIRATION && models.length > 0) {
          console.log('Using cached OpenAI models');
          this.cachedModels = models;
          return;
        }
      }
      
      console.log('Fetching OpenAI models from API...');
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-Provider': this.provider,
        'X-Request-Type': 'models'
      };
      
      // Add API key
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Use the Netlify function proxy to fetch models
      const response = await fetch('/.netlify/functions/openai-proxy/models', {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Process the models data
      const fetchedModels: OpenAIModel[] = [];
      
      // Process chat models
      const chatModels = data.data.filter((model: any) =>
        model.id.includes('gpt') && !model.id.includes('instruct')
      );
      
      chatModels.forEach((model: any) => {
        const modelId = model.id;
        const pricing = MODEL_PRICING_MAP[modelId] || { input: 0.001, output: 0.002 };
        let category = 'legacy';
        
        // Categorize models
        let modelCategory: 'featured' | 'reasoning' | 'cost-optimized' | 'legacy' | 'image' = 'legacy';
        
        if (modelId.includes('gpt-4o')) {
          modelCategory = 'featured';
        } else if (modelId.includes('gpt-4')) {
          modelCategory = 'featured';
        } else if (modelId.includes('gpt-3.5')) {
          modelCategory = 'cost-optimized';
        }
        
        fetchedModels.push({
          id: modelId,
          name: this.formatModelName(modelId),
          provider: 'openai',
          description: this.getModelDescription(modelId),
          maxTokens: this.getModelMaxTokens(modelId),
          costPer1KTokens: pricing,
          category: modelCategory
        });
      });
      
      // Add DALL-E models (these are not returned by the models API)
      fetchedModels.push({
        id: 'dall-e-3',
        name: 'DALL-E 3',
        provider: 'openai',
        description: 'Advanced image generation',
        category: 'image',
        supportedSizes: ['1024x1024', '1024x1792', '1792x1024'],
        supportedFormats: ['png', 'jpeg']
      } as any);
      
      fetchedModels.push({
        id: 'dall-e-2',
        name: 'DALL-E 2',
        provider: 'openai',
        description: 'Standard image generation',
        category: 'image',
        supportedSizes: ['256x256', '512x512', '1024x1024'],
        supportedFormats: ['png', 'jpeg']
      } as any);
      
      // Update cached models
      this.cachedModels = fetchedModels;
      
      // Save to localStorage with timestamp
      localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({
        models: fetchedModels,
        timestamp: Date.now()
      }));
      
      console.log(`Fetched ${fetchedModels.length} OpenAI models`);
    } catch (error) {
      console.error('Error fetching OpenAI models:', error);
      // If fetch fails, load from cache if available
      this.loadCachedModels();
    }
  }
  
  /**
   * Load cached models from localStorage
   */
  private loadCachedModels(): void {
    try {
      const cachedData = localStorage.getItem(MODELS_CACHE_KEY);
      if (cachedData) {
        const { models, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // Use cached models even if expired (better than nothing)
        if (models && Array.isArray(models) && models.length > 0) {
          console.log('Loaded cached OpenAI models');
          this.cachedModels = models;
        }
      }
    } catch (error) {
      console.error('Error loading cached models:', error);
    }
  }
  
  /**
   * Format model name for display
   */
  private formatModelName(modelId: string): string {
    // Remove provider prefix if present
    let name = modelId.replace('openai/', '');
    
    // Split by hyphens and capitalize each part
    const parts = name.split('-');
    return parts.map(part => {
      // Handle special cases
      if (part === 'gpt') return 'GPT';
      if (part === '3.5') return '3.5';
      if (part === '4o') return '4o';
      if (part === '4') return '4';
      
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  }
  
  /**
   * Get model description based on model ID
   */
  private getModelDescription(modelId: string): string {
    if (modelId.includes('gpt-4o')) {
      return 'Fast, intelligent, flexible';
    } else if (modelId.includes('gpt-4')) {
      return 'Most capable GPT model';
    } else if (modelId.includes('gpt-3.5')) {
      return 'Fast and cost-effective';
    }
    return 'OpenAI language model';
  }
  
  /**
   * Get model max tokens based on model ID
   */
  private getModelMaxTokens(modelId: string): number {
    if (modelId.includes('gpt-4o')) {
      return 128000;
    } else if (modelId.includes('gpt-4-32k')) {
      return 32768;
    } else if (modelId.includes('gpt-4')) {
      return 8192;
    } else if (modelId.includes('gpt-3.5-16k')) {
      return 16385;
    } else if (modelId.includes('gpt-3.5')) {
      return 4096;
    }
    return 4096; // Default
  }
}

// Create and register the OpenAI service
const OpenAIService = new OpenAIServiceImpl();
aiServiceRegistry.registerService(OpenAIService);

export default OpenAIService;