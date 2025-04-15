/**
 * AI Provider Types
 *
 * This file defines types and interfaces for multiple AI model providers:
 * - OpenAI
 * - Open Router
 * - Claude (Anthropic)
 * - Gemini (Google)
 * - Image generation models
 *
 * Each model includes cost information for accurate usage tracking and billing.
 */

// Provider identifiers
export type AIProvider = 'openai' | 'openrouter' | 'anthropic' | 'google' | 'image';

// Base model interface
export interface AIModel {
  id: string;
  name: string;
  provider: AIProvider;
  description: string;
  maxTokens?: number;
  costPer1KTokens?: {
    input: number;
    output: number;
  };
  capabilities?: string[];
  category?: 'featured' | 'reasoning' | 'cost-optimized' | 'legacy' | 'image';
}

// Provider-specific model interfaces
export interface OpenAIModel extends AIModel {
  provider: 'openai';
}

export interface OpenRouterModel extends AIModel {
  provider: 'openrouter';
  routerId: string; // The model ID used by Open Router
}

export interface AnthropicModel extends AIModel {
  provider: 'anthropic';
}

export interface GoogleModel extends AIModel {
  provider: 'google';
}

export interface ImageModel extends AIModel {
  provider: 'image';
  supportedSizes?: string[]; // e.g., ["1024x1024", "512x512"]
  supportedFormats?: string[]; // e.g., ["png", "jpeg"]
}

// Provider configuration
export interface ProviderConfig {
  name: string;
  enabled: boolean;
  apiKeyRequired: boolean;
  apiKeyName: string; // localStorage key for the API key
  defaultApiKeyEnvVar?: string; // Environment variable name for default API key
  defaultModel: string; // Default model ID
  models: AIModel[];
}

// Provider API request types
export interface BaseRequestOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
}

export interface TextCompletionOptions extends BaseRequestOptions {
  prompt: string;
}

export interface ChatCompletionOptions extends BaseRequestOptions {
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string;
  }[];
}

export interface ImageGenerationOptions extends BaseRequestOptions {
  prompt: string;
  size?: string;
  format?: string;
  n?: number; // Number of images to generate
}

// Provider API response types
export interface TextCompletionResponse {
  text: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatCompletionResponse {
  id: string;
  content: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ImageGenerationResponse {
  images: string[]; // Base64 encoded or URLs
  model: string;
}

// Rate limit information
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  used: number;
  reset: Date;
}

// Combined response type with rate limit info
export interface AIResponse<T> {
  data: T;
  rateLimit: RateLimitInfo;
}

/**
 * Model-specific pricing constants
 * These rates are based on OpenAI's pricing as of April 2025
 * https://openai.com/pricing
 */
export const MODEL_PRICING = {
  // GPT-4 models
  'gpt-4': {
    input: 0.03,    // $0.03 per 1K input tokens
    output: 0.06    // $0.06 per 1K output tokens
  },
  'gpt-4-32k': {
    input: 0.06,    // $0.06 per 1K input tokens
    output: 0.12    // $0.12 per 1K output tokens
  },
  'gpt-4-turbo': {
    input: 0.01,    // $0.01 per 1K input tokens
    output: 0.03    // $0.03 per 1K output tokens
  },
  'gpt-4-vision': {
    input: 0.01,    // $0.01 per 1K input tokens
    output: 0.03    // $0.03 per 1K output tokens
  },
  
  // GPT-3.5 models
  'gpt-3.5-turbo': {
    input: 0.0005,  // $0.0005 per 1K input tokens
    output: 0.0015  // $0.0015 per 1K output tokens
  },
  'gpt-3.5-turbo-16k': {
    input: 0.001,   // $0.001 per 1K input tokens
    output: 0.002   // $0.002 per 1K output tokens
  },
  
  // Claude models
  'claude-3-opus': {
    input: 0.015,   // $0.015 per 1K input tokens
    output: 0.075   // $0.075 per 1K output tokens
  },
  'claude-3-sonnet': {
    input: 0.003,   // $0.003 per 1K input tokens
    output: 0.015   // $0.015 per 1K output tokens
  },
  'claude-3-haiku': {
    input: 0.00025, // $0.00025 per 1K input tokens
    output: 0.00125 // $0.00125 per 1K output tokens
  },
  
  // Gemini models
  'gemini-pro': {
    input: 0.00025, // $0.00025 per 1K input tokens
    output: 0.0005  // $0.0005 per 1K output tokens
  },
  'gemini-ultra': {
    input: 0.00175, // $0.00175 per 1K input tokens
    output: 0.0035  // $0.0035 per 1K output tokens
  },
  
  // Default fallback rates
  'default': {
    input: 0.001,   // $0.001 per 1K input tokens
    output: 0.002   // $0.002 per 1K output tokens
  }
};