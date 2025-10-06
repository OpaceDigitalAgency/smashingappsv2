/**
 * AI Provider Types
 * 
 * This file defines types and interfaces for multiple AI model providers:
 * - OpenAI
 * - Open Router
 * - Claude (Anthropic)
 * - Gemini (Google)
 * - Image generation models
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