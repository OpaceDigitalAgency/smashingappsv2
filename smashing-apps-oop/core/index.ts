/**
 * AI-Core Library - Main Export
 * 
 * This file exports all public interfaces and classes from the AI-Core library
 */

// Main factory class
export { default as AICore } from './AICore';

// Interfaces
export type {
  IProvider,
  IImageProvider,
  Message,
  RequestOptions,
  NormalisedResponse,
  Usage,
  Choice,
  ImageOptions,
  ImageResponse,
  ProviderConfig,
  ProviderStatus
} from './interfaces/IProvider';

// Registry
export { default as ModelRegistry } from './registry/ModelRegistry';
export type {
  ModelInfo,
  ModelCapabilities,
  ModelPricing
} from './registry/ModelRegistry';

// Storage
export { default as SettingsStorage } from './storage/SettingsStorage';
export type {
  AISettings,
  UsageStats
} from './storage/SettingsStorage';

// Response normaliser
export { default as ResponseNormaliser } from './response/ResponseNormaliser';

// Providers (for advanced usage)
export { default as OpenAIProvider } from './providers/OpenAIProvider';
export { default as AnthropicProvider } from './providers/AnthropicProvider';
export { default as GeminiProvider } from './providers/GeminiProvider';
export { default as OpenRouterProvider } from './providers/OpenRouterProvider';

