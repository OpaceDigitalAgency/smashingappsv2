/**
 * OpenRouter Service Implementation
 *
 * This file implements the AIService interface for OpenRouter.
 * OpenRouter provides access to multiple AI models from different providers.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './AIService';

import {
  AIProvider,
  AIModel,
  OpenRouterModel,
  BaseRequestOptions,
  TextCompletionOptions,
  ChatCompletionOptions,
  TextCompletionResponse,
  ChatCompletionResponse,
  RateLimitInfo,
  AIResponse
} from '../types/aiProviders';

// OpenRouter Models
const OPENROUTER_MODELS: OpenRouterModel[] = [
  {
    id: 'openrouter/anthropic/claude-3-opus',
    name: 'Claude 3 Opus (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'anthropic/claude-3-opus',
    description: 'Most powerful Claude model',
    maxTokens: 200000,
    costPer1KTokens: { input: 0.015, output: 0.075 },
    category: 'featured'
  },
  {
    id: 'openrouter/anthropic/claude-3-sonnet',
    name: 'Claude 3 Sonnet (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'anthropic/claude-3-sonnet',
    description: 'Balanced Claude model',
    maxTokens: 200000,
    costPer1KTokens: { input: 0.003, output: 0.015 },
    category: 'reasoning'
  },
  {
    id: 'openrouter/meta-llama/llama-3-70b-instruct',
    name: 'Llama 3 70B (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'meta-llama/llama-3-70b-instruct',
    description: 'Meta\'s most capable model',
    maxTokens: 8192,
    costPer1KTokens: { input: 0.0009, output: 0.0009 },
    category: 'featured'
  },
  {
    id: 'openrouter/mistralai/mistral-large',
    name: 'Mistral Large (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'mistralai/mistral-large',
    description: 'Mistral\'s most capable model',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.002, output: 0.006 },
    category: 'reasoning'
  },
  {
    id: 'openrouter/mistralai/mistral-small',
    name: 'Mistral Small (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'mistralai/mistral-small',
    description: 'Efficient Mistral model',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.0002, output: 0.0006 },
    category: 'cost-optimized'
  },
  {
    id: 'openrouter/google/gemini-1.5-pro',
    name: 'Gemini 1.5 Pro (via OpenRouter)',
    provider: 'openrouter',
    routerId: 'google/gemini-1.5-pro',
    description: 'Google\'s most capable model',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.0025, output: 0.0075 },
    category: 'featured'
  }
];

/**
 * OpenRouter Service Implementation
 */
class OpenRouterServiceImpl implements AIService {
  provider: AIProvider = 'openrouter';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'openrouter_api_key';
  private rateLimitStorageKey = 'openrouter_rateLimitInfo';
  private apiCallCountKey = 'openrouter_apiCallCount';
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
    console.log(`OpenRouter service initialized, API key ${this.apiKey ? 'present' : 'not present'}`);
  }
  
  /**
   * Get available models for OpenRouter
   */
  getModels(): AIModel[] {
    return OPENROUTER_MODELS;
  }
  
  /**
   * Get the default model for OpenRouter
   */
  getDefaultModel(): AIModel {
    return OPENROUTER_MODELS.find(model => model.id === 'openrouter/mistralai/mistral-small') || OPENROUTER_MODELS[0];
  }
  
  /**
   * Check if OpenRouter is configured (has API key)
   */
  isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Set the API key for OpenRouter
   */
  setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
    localStorage.setItem(this.apiKeyStorageKey, apiKey);
  }
  
  /**
   * Get the API key for OpenRouter
   */
  getApiKey(): string | null {
    return this.apiKey;
  }
  
  /**
   * Send a chat completion request to OpenRouter through our proxy
   */
  async createChatCompletion(options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem(this.apiCallCountKey) || '0', 10);
      
      // Extract the OpenRouter model ID from our internal ID
      const modelId = options.model;
      const model = OPENROUTER_MODELS.find(m => m.id === modelId);
      
      if (!model) {
        throw new Error(`Model ${modelId} not found in OpenRouter models`);
      }
      
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
      const requestBody = {
        model: model.routerId, // Use the OpenRouter model ID
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
        content: responseData.choices[0]?.message?.content || '',
        model: options.model,
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
      throw new Error('Failed to communicate with OpenRouter API');
    }
  }
  
  /**
   * Generate a text completion from OpenRouter
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
}

// Create and register the OpenRouter service
const OpenRouterService = new OpenRouterServiceImpl();
aiServiceRegistry.registerService(OpenRouterService);

export default OpenRouterService;