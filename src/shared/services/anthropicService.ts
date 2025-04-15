/**
 * Anthropic (Claude) Service Implementation
 *
 * This file implements the AIService interface for Anthropic's Claude models.
 * It manages API calls, rate limits, and error handling.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './AIService';

import {
  AIProvider,
  AIModel,
  AnthropicModel,
  BaseRequestOptions,
  TextCompletionOptions,
  ChatCompletionOptions,
  TextCompletionResponse,
  ChatCompletionResponse,
  RateLimitInfo,
  AIResponse
} from '../types/aiProviders';

// Default Anthropic Models (fallback if API fetch fails)
const DEFAULT_ANTHROPIC_MODELS: AnthropicModel[] = [
  {
    id: 'claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'anthropic',
    description: 'Most powerful Claude model',
    maxTokens: 200000,
    costPer1KTokens: { input: 0.015, output: 0.075 },
    category: 'featured'
  },
  {
    id: 'claude-3-sonnet',
    name: 'Claude 3 Sonnet',
    provider: 'anthropic',
    description: 'Balanced performance and speed',
    maxTokens: 200000,
    costPer1KTokens: { input: 0.003, output: 0.015 },
    category: 'reasoning'
  },
  {
    id: 'claude-3-haiku',
    name: 'Claude 3 Haiku',
    provider: 'anthropic',
    description: 'Fast and cost-effective',
    maxTokens: 200000,
    costPer1KTokens: { input: 0.00025, output: 0.00125 },
    category: 'cost-optimized'
  }
];

// Model pricing information for models that might not include it in the API response
const MODEL_PRICING_MAP: Record<string, { input: number; output: number }> = {
  'claude-3-opus': { input: 0.015, output: 0.075 },
  'claude-3-sonnet': { input: 0.003, output: 0.015 },
  'claude-3-haiku': { input: 0.00025, output: 0.00125 },
  'claude-2.1': { input: 0.008, output: 0.024 },
  'claude-2.0': { input: 0.008, output: 0.024 },
  'claude-instant-1': { input: 0.0008, output: 0.0024 }
};

// Cache key for storing fetched models
const MODELS_CACHE_KEY = 'anthropic_models_cache';
// Cache expiration time (24 hours in milliseconds)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

/**
 * Anthropic Service Implementation
 */
class AnthropicServiceImpl implements AIService {
  provider: AIProvider = 'anthropic';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'anthropic_api_key';
  private rateLimitStorageKey = 'anthropic_rateLimitInfo';
  private apiCallCountKey = 'anthropic_apiCallCount';
  private cachedModels: AnthropicModel[] | null = null;
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
    
    // Try to load cached models from localStorage
    this.loadCachedModels();
    
    // Fetch models in the background
    this.fetchModelsFromAPI();
  }
  
  /**
   * Get available models for Anthropic
   */
  getModels(): AIModel[] {
    return this.cachedModels || DEFAULT_ANTHROPIC_MODELS;
  }
  
  /**
   * Get the default model for Anthropic
   */
  getDefaultModel(): AIModel {
    return this.cachedModels?.find(model => model.id === 'claude-3-haiku') || DEFAULT_ANTHROPIC_MODELS[0];
  }
  
  /**
   * Check if Anthropic is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Set the API key for Anthropic
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for Anthropic
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Send a chat completion request to Anthropic through our proxy
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
      
      // Convert OpenAI-style messages to Anthropic format
      // Anthropic expects a specific format with system prompt handled differently
      let systemPrompt = '';
      const messages = options.messages.filter(msg => {
        if (msg.role === 'system') {
          systemPrompt = msg.content;
          return false;
        }
        return true;
      });
      
      // Prepare request body
      const requestBody = {
        model: options.model,
        messages: messages,
        system: systemPrompt || undefined,
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
        id: responseData.id,
        content: responseData.content && responseData.content[0] ? responseData.content[0].text : '',
        model: options.model,
        usage: responseData.usage ? {
          promptTokens: responseData.usage.input_tokens,
          completionTokens: responseData.usage.output_tokens,
          totalTokens: responseData.usage.input_tokens + responseData.usage.output_tokens
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
      throw new Error('Failed to communicate with Anthropic API');
    }
  }
  
  /**
   * Generate a text completion from Anthropic
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
   * Fetch available models from Anthropic API
   * This method is public so it can be called from the AdminContext
   */
  async fetchModelsFromAPI(): Promise<void> {
    // Skip if no API key is available
    if (!this.apiKey) {
      console.log('No Anthropic API key available, skipping model fetch');
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
          console.log('Using cached Anthropic models');
          this.cachedModels = models;
          return;
        }
      }
      
      console.log('Fetching Anthropic models from API...');
      
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
      const fetchedModels: AnthropicModel[] = [];
      
      // Anthropic API response format might be different, adjust as needed
      const modelsList = data.models || data.data || [];
      
      modelsList.forEach((model: any) => {
        const modelId = model.id || model.name;
        const pricing = MODEL_PRICING_MAP[modelId] || { input: 0.001, output: 0.002 };
        let category = 'legacy';
        
        // Categorize models
        let modelCategory: 'featured' | 'reasoning' | 'cost-optimized' | 'legacy' | 'image' = 'legacy';
        
        if (modelId.includes('opus')) {
          modelCategory = 'featured';
        } else if (modelId.includes('sonnet')) {
          modelCategory = 'reasoning';
        } else if (modelId.includes('haiku')) {
          modelCategory = 'cost-optimized';
        }
        
        fetchedModels.push({
          id: modelId,
          name: this.formatModelName(modelId),
          provider: 'anthropic',
          description: this.getModelDescription(modelId),
          maxTokens: this.getModelMaxTokens(modelId),
          costPer1KTokens: pricing,
          category: modelCategory
        });
      });
      
      // If no models were returned, use the default models
      if (fetchedModels.length === 0) {
        console.log('No Anthropic models returned from API, using defaults');
        fetchedModels.push(...DEFAULT_ANTHROPIC_MODELS);
      }
      
      // Update cached models
      this.cachedModels = fetchedModels;
      
      // Save to localStorage with timestamp
      localStorage.setItem(MODELS_CACHE_KEY, JSON.stringify({
        models: fetchedModels,
        timestamp: Date.now()
      }));
      
      console.log(`Fetched ${fetchedModels.length} Anthropic models`);
    } catch (error) {
      console.error('Error fetching Anthropic models:', error);
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
          console.log('Loaded cached Anthropic models');
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
    let name = modelId.replace('anthropic/', '');
    
    // Split by hyphens and dots
    const parts = name.split(/[-\.]/);
    return parts.map(part => {
      // Handle special cases
      if (part === 'claude') return 'Claude';
      if (part === '3') return '3';
      if (part === '2') return '2';
      if (part === '1') return '1';
      
      // Capitalize first letter
      return part.charAt(0).toUpperCase() + part.slice(1);
    }).join(' ');
  }
  
  /**
   * Get model description based on model ID
   */
  private getModelDescription(modelId: string): string {
    if (modelId.includes('opus')) {
      return 'Most powerful Claude model';
    } else if (modelId.includes('sonnet')) {
      return 'Balanced performance and speed';
    } else if (modelId.includes('haiku')) {
      return 'Fast and cost-effective';
    } else if (modelId.includes('claude-2')) {
      return 'Previous generation model';
    } else if (modelId.includes('instant')) {
      return 'Fastest response time';
    }
    return 'Anthropic language model';
  }
  
  /**
   * Get model max tokens based on model ID
   */
  private getModelMaxTokens(modelId: string): number {
    if (modelId.includes('claude-3')) {
      return 200000;
    } else if (modelId.includes('claude-2')) {
      return 100000;
    } else if (modelId.includes('instant')) {
      return 100000;
    }
    return 100000; // Default
  }
}

// Create and register the Anthropic service
const AnthropicService = new AnthropicServiceImpl();
aiServiceRegistry.registerService(AnthropicService);

export default AnthropicService;