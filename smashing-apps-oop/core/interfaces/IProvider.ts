/**
 * Provider Interface
 * 
 * All AI providers must implement this interface to ensure consistent behaviour
 * across different AI services (OpenAI, Anthropic, Gemini, etc.)
 */

export interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface RequestOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  // Reasoning effort control (GPT-5, o1, o3+ models)
  reasoning?: {
    effort?: 'low' | 'medium' | 'high';
  };
  // Text format and verbosity controls (GPT-4o and GPT-5+ only)
  text?: {
    format?: { type: 'text' };
    verbosity?: 'low' | 'medium' | 'high';
  };
}

export interface Usage {
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
}

export interface Choice {
  message: Message;
  finishReason: string;
  index: number;
}

export interface NormalisedResponse {
  choices: Choice[];
  usage: Usage;
  model: string;
  object: string;
  created?: number;
  id?: string;
}

export interface IProvider {
  /**
   * Provider name (e.g., 'openai', 'anthropic', 'gemini')
   */
  readonly provider: string;
  
  /**
   * Set the API key for this provider
   */
  setApiKey(apiKey: string): void;
  
  /**
   * Get the current API key (masked for security)
   */
  getApiKey(): string;
  
  /**
   * Check if the provider is configured with a valid API key
   */
  isConfigured(): boolean;
  
  /**
   * Send a text generation request
   * 
   * @param messages Array of messages
   * @param options Request options
   * @returns Normalised response
   */
  sendRequest(messages: Message[], options: RequestOptions): Promise<NormalisedResponse>;
  
  /**
   * Test the API key by making a simple request
   * 
   * @returns True if the API key is valid
   */
  testApiKey(): Promise<boolean>;
  
  /**
   * Get available models for this provider
   * 
   * @returns Array of model identifiers
   */
  getAvailableModels(): Promise<string[]>;
}

/**
 * Image Provider Interface
 * 
 * For providers that support image generation
 */
export interface ImageOptions {
  model?: string;
  size?: string;
  quality?: string;
  n?: number;
}

export interface ImageResponse {
  url: string;
  revisedPrompt?: string;
}

export interface IImageProvider extends IProvider {
  /**
   * Generate an image from a text prompt
   * 
   * @param prompt Text description of the image
   * @param options Image generation options
   * @returns Image response with URL
   */
  generateImage(prompt: string, options?: ImageOptions): Promise<ImageResponse>;
}

/**
 * Provider Configuration
 * 
 * Configuration for each provider
 */
export interface ProviderConfig {
  name: string;
  displayName: string;
  enabled: boolean;
  apiKey: string;
  defaultModel: string;
  supportsImages: boolean;
  supportsStreaming: boolean;
}

/**
 * Provider Status
 * 
 * Status information for a provider
 */
export interface ProviderStatus {
  configured: boolean;
  apiKey: string; // Masked
  lastTested?: Date;
  testResult?: boolean;
  errorMessage?: string;
}

