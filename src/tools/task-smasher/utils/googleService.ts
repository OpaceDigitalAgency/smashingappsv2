/**
 * Google (Gemini) Service Implementation
 *
 * This file implements the AIService interface for Google's Gemini models.
 * It manages API calls, rate limits, and error handling.
 */

import { 
  AIService, 
  aiServiceRegistry 
} from './aiService';

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

// Google Models
const GOOGLE_MODELS: GoogleModel[] = [
  {
    id: 'gemini-1.5-pro',
    name: 'Gemini 1.5 Pro',
    provider: 'google',
    description: 'Most capable Gemini model',
    maxTokens: 1048576, // 1M tokens
    costPer1KTokens: { input: 0.0025, output: 0.0075 },
    category: 'featured'
  },
  {
    id: 'gemini-1.5-flash',
    name: 'Gemini 1.5 Flash',
    provider: 'google',
    description: 'Fast and cost-effective',
    maxTokens: 1048576, // 1M tokens
    costPer1KTokens: { input: 0.0005, output: 0.0015 },
    category: 'cost-optimized'
  },
  {
    id: 'gemini-1.0-pro',
    name: 'Gemini 1.0 Pro',
    provider: 'google',
    description: 'Previous generation model',
    maxTokens: 32768,
    costPer1KTokens: { input: 0.00125, output: 0.00375 },
    category: 'legacy'
  }
];

/**
 * Google Service Implementation
 */
class GoogleServiceImpl implements AIService {
  provider: AIProvider = 'google';
  private apiKey: string | null = null;
  private apiKeyStorageKey = 'google_api_key';
  private rateLimitStorageKey = 'google_rateLimitInfo';
  private apiCallCountKey = 'google_apiCallCount';
  
  constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem(this.apiKeyStorageKey);
  }
  
  /**
   * Get available models for Google
   */
  getModels(): AIModel[] {
    return GOOGLE_MODELS;
  }
  
  /**
   * Get the default model for Google
   */
  getDefaultModel(): AIModel {
    return GOOGLE_MODELS.find(model => model.id === 'gemini-1.5-flash') || GOOGLE_MODELS[0];
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
      
      // Convert OpenAI-style messages to Google format
      // Google expects a different format with system prompt handled differently
      let systemPrompt = '';
      const formattedMessages = options.messages.map(msg => {
        if (msg.role === 'system') {
          systemPrompt = msg.content;
          return { role: 'user', parts: [{ text: msg.content }] };
        } else if (msg.role === 'user') {
          return { role: 'user', parts: [{ text: msg.content }] };
        } else {
          return { role: 'model', parts: [{ text: msg.content }] };
        }
      });
      
      // Prepare request body
      const requestBody = {
        model: options.model,
        contents: formattedMessages,
        systemInstruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
        generationConfig: {
          temperature: options.temperature,
          maxOutputTokens: options.maxTokens,
          topP: 0.95,
          topK: 40
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
        content: responseData.candidates && responseData.candidates[0] ? 
                responseData.candidates[0].content.parts[0].text : '',
        model: options.model,
        usage: responseData.usageMetadata ? {
          promptTokens: responseData.usageMetadata.promptTokenCount,
          completionTokens: responseData.usageMetadata.candidatesTokenCount,
          totalTokens: responseData.usageMetadata.totalTokenCount
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
}

// Create and register the Google service
const GoogleService = new GoogleServiceImpl();
aiServiceRegistry.registerService(GoogleService);

export default GoogleService;