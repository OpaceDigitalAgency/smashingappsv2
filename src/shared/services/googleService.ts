/**
 * Google (Gemini) Service Implementation
 *
 * This file implements the AIService interface for Google's Gemini models.
 * It manages API calls, rate limits, and error handling.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './AIService';

import {
  AIProvider,
  AIModel,
  GoogleModel,
  BaseRequestOptions,
  TextCompletionOptions,
  ChatCompletionOptions,
  TextCompletionResponse,
  ChatCompletionResponse,
  RateLimitInfo,
  AIResponse
} from '../types/aiProviders';

// Default Google Models (fallback if API fetch fails)
const DEFAULT_GOOGLE_MODELS: GoogleModel[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Most capable Gemini model',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.0025, output: 0.0075 },
    category: 'featured'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and efficient',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.0005, output: 0.0015 },
    category: 'cost-optimized'
  }
];

// Model pricing information for models that might not include it in the API response
const MODEL_PRICING_MAP: Record<string, { input: number; output: number }> = {
  'gemini-1.5-pro': { input: 0.0025, output: 0.0075 },
  'gemini-1.5-flash': { input: 0.0005, output: 0.0015 },
  'gemini-1.0-pro': { input: 0.0025, output: 0.0075 },
  'gemini-1.0-ultra': { input: 0.00175, output: 0.0035 }
};

// Cache key for storing fetched models
const MODELS_CACHE_KEY = 'google_models_cache';
// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Google Service Implementation
 */
class GoogleServiceImpl implements AIService {
  provider: AIProvider = 'google';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'google_api_key';
  private rateLimitStorageKey = 'google_rateLimitInfo';
  private apiCallCountKey = 'google_apiCallCount';
  private cachedModels: GoogleModel[] | null = null;
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
    
    // Try to load cached models from localStorage
    this.loadCachedModels();
    
    // Fetch models in the background, but only if we have an API key
    if (this.apiKey) {
      this.fetchModelsFromAPI().catch(err => {
        console.warn('Failed to fetch models during initialization:', err);
        // Ensure we have at least the default models
        if (!this.cachedModels) {
          this.cachedModels = DEFAULT_GOOGLE_MODELS;
        }
      });
    } else {
      console.log('No Google API key available, using default models');
      this.cachedModels = DEFAULT_GOOGLE_MODELS;
    }
  }
  
  /**
   * Get available models for Google
   */
  getModels(): AIModel[] {
    return this.cachedModels || DEFAULT_GOOGLE_MODELS;
  }
  
  /**
   * Get the default model for Google
   */
  getDefaultModel(): AIModel {
    return this.cachedModels?.find(model => model.id === 'gemini-1.5-flash') || DEFAULT_GOOGLE_MODELS[0];
  }
  
  /**
   * Check if Google is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Set the API key for Google
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for Google
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Send a chat completion request to Google through our proxy
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Call-Count': apiCallCount.toString(),
        'X-Provider': this.provider
      };
      
      // Add API key if available
      if (this.apiKey) {
        headers['X-API-Key'] = this.apiKey;
      }
      
      // Prepare request body
      // Google Gemini expects a different format than OpenAI
      const requestBody = {
        model: options.model,
        contents: options.messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : msg.role,
          parts: [{ text: msg.content }]
        })),
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens
        }
      };
      
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(requestBody));
      
      // Use the Netlify function proxy
      const response = await fetch('/.netlify/functions/openai-proxy', {
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
      
      // Update the rate limit info in localStorage
      localStorage.setItem(this.rateLimitStorageKey, JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: newApiCallCount,
        timestamp: new Date().toISOString()
      }));
      
      // Override the used count with our local counter for consistency
      rateLimit.used = newApiCallCount;
      
      // Format the response to match our ChatCompletionResponse interface
      const formattedResponse: ChatCompletionResponse = {
        id: responseData.id || `gemini-${Date.now()}`,
        content: responseData.candidates?.[0]?.content?.parts?.[0]?.text || '',
        model: options.model,
        usage: responseData.usageMetadata ? {
          promptTokens: responseData.usageMetadata.promptTokenCount,
          completionTokens: responseData.usageMetadata.candidatesTokenCount,
          totalTokens: responseData.usageMetadata.promptTokenCount + responseData.usageMetadata.candidatesTokenCount
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
      throw new Error('Failed to communicate with Google API');
    }
  }
  
  /**
   * Generate a text completion from Google
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
   * Fetch available models from Google API
   * This method is public so it can be called from the AdminContext
   */
  async fetchModelsFromAPI(): Promise<void> {
    // Skip if no API key is available
    if (!this.apiKey) {
      console.log('No Google API key available, skipping model fetch');
      this.cachedModels = DEFAULT_GOOGLE_MODELS;
      return Promise.resolve();
    }
    
    try {
      // Check if we have valid cached models
      const cachedData = localStorage.getItem(MODELS_CACHE_KEY);
      if (cachedData) {
        const { models, timestamp } = JSON.parse(cachedData);
        const cacheAge = Date.now() - timestamp;
        
        // If cache is still valid, use it
        if (cacheAge < CACHE_EXPIRATION && models.length > 0) {
          console.log('Using cached Google models');
          this.cachedModels = models;
          return;
        }
      }
      
      console.log('Fetching Google models from API...');
      
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
      const fetchedModels: GoogleModel[] = [];
      
      // Google API response format might be different, adjust as needed
      const modelsList = data.models || data.data || [];
      
      modelsList.forEach((model: any) => {
        const modelId = model.id || model.name;
        const pricing = MODEL_PRICING_MAP[modelId] || { input: 0.001, output: 0.002 };
        let category = 'legacy';
        
        // Categorize models
        let modelCategory: 'featured' | 'reasoning' | 'cost-optimized' | 'legacy' | 'image' = 'legacy';
        
        if (modelId.includes('gemini-1.5-pro')) {
          modelCategory = 'featured';
        } else if (modelId.includes('gemini-1.5-flash')) {
          modelCategory = 'cost-optimized';
        } else if (modelId.includes('gemini-1.0-ultra')) {
          modelCategory = 'featured';
        } else if (modelId.includes('gemini-1.0')) {
          modelCategory = 'legacy';
        }
        
        fetchedModels.push({
          id: modelId,
          name: this.formatModelName(modelId),
          provider: 'google',
          description: this.getModelDescription(modelId),
          maxTokens: this.getModelMaxTokens(modelId),
          costPer1KTokens: pricing,
          category: modelCategory
        });
      });
      
      // If no models were returned, use the default models
      if (fetchedModels.length === 0) {
        console.log('No Google models returned from API, using defaults');
        fetchedModels.push(...DEFAULT_GOOGLE_MODELS);
      }
      
      // Update cached models
      this.cachedModels = fetchedModels;
      
      // Save to localStorage with timestamp
      localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({
        models: fetchedModels,
        timestamp: Date.now()
      }));
      
      console.log(`Fetched ${fetchedModels.length} Google models`);
    } catch (error) {
      console.error('Error fetching Google models:', error);
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
          console.log('Loaded cached Google models');
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
    let name = modelId.replace('google/', '');
    
    // Split by hyphens and dots
    const parts = name.split(/[-\.]/);
    return parts.map(part => {
      // Handle special cases
      if (part === 'gemini') return 'Gemini';
      if (part === '1') return '1';
      if (part === '0') return '0';
      if (part === '5') return '5';
      
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  }
  
  /**
   * Get model description based on model ID
   */
  private getModelDescription(modelId: string): string {
    if (modelId.includes('gemini-1.5-pro')) {
      return 'Most capable Gemini model';
    } else if (modelId.includes('gemini-1.5-flash')) {
      return 'Fast and efficient';
    } else if (modelId.includes('gemini-1.0-pro')) {
      return 'Previous generation';
    } else if (modelId.includes('gemini-1.0-ultra')) {
      return 'High performance model';
    }
    return 'Google language model';
  }
  
  /**
   * Get model max tokens based on model ID
   */
  private getModelMaxTokens(modelId: string): number {
    if (modelId.includes('gemini-1.5')) {
      return 32768;
    } else if (modelId.includes('gemini-1.0')) {
      return 32768;
    }
    return 32768; // Default
  }
}

// Create and register the Google service
const GoogleService = new GoogleServiceImpl();
aiServiceRegistry.registerService(GoogleService);

export default GoogleService;