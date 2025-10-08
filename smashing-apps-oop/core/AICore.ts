/**
 * AI-Core - Main Factory Class
 * 
 * Central factory for creating and managing AI providers
 * Provides a simple interface for all tools and apps
 * 
 * Inspired by the WordPress AI-Core plugin architecture
 */

import { IProvider, Message, RequestOptions, NormalisedResponse, ProviderStatus } from './interfaces/IProvider';
import OpenAIProvider from './providers/OpenAIProvider';
import AnthropicProvider from './providers/AnthropicProvider';
import GeminiProvider from './providers/GeminiProvider';
import OpenRouterProvider from './providers/OpenRouterProvider';
import ModelRegistry from './registry/ModelRegistry';
import SettingsStorage, { AISettings } from './storage/SettingsStorage';
import ResponseNormaliser from './response/ResponseNormaliser';

class AICore {
  private static instance: AICore;
  private providers: Map<string, IProvider> = new Map();
  private storage: SettingsStorage;
  private modelRegistry: ModelRegistry;
  private settings: AISettings;
  
  private constructor() {
    this.storage = SettingsStorage.getInstance();
    this.modelRegistry = ModelRegistry.getInstance();
    this.settings = this.storage.loadSettings();
    this.initializeProviders();
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): AICore {
    if (!AICore.instance) {
      AICore.instance = new AICore();
    }
    return AICore.instance;
  }
  
  /**
   * Initialize providers from settings
   */
  private initializeProviders(): void {
    // Create provider instances
    this.providers.set('openai', new OpenAIProvider(this.settings.providers.openai?.apiKey));
    this.providers.set('anthropic', new AnthropicProvider(this.settings.providers.anthropic?.apiKey));
    this.providers.set('gemini', new GeminiProvider(this.settings.providers.gemini?.apiKey));
    this.providers.set('openrouter', new OpenRouterProvider(this.settings.providers.openrouter?.apiKey));
  }
  
  /**
   * Check if AI-Core is configured with at least one provider
   */
  public isConfigured(): boolean {
    return this.getConfiguredProviders().length > 0;
  }
  
  /**
   * Get list of configured providers
   */
  public getConfiguredProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([_, provider]) => provider.isConfigured())
      .map(([name, _]) => name);
  }
  
  /**
   * Get provider for a specific model
   */
  public getProviderForModel(model: string): IProvider {
    // Check if model exists in registry
    if (this.modelRegistry.modelExists(model)) {
      const providerName = this.modelRegistry.getProvider(model);
      if (!providerName) {
        throw new Error(`Provider not found for model: ${model}`);
      }
      
      const provider = this.providers.get(providerName);
      if (!provider) {
        throw new Error(`Provider ${providerName} not initialized`);
      }
      
      if (!provider.isConfigured()) {
        throw new Error(`Provider ${providerName} not configured. Please add API key in settings.`);
      }
      
      return provider;
    }
    
    // Try to infer provider from model name
    const providerName = this.inferProviderFromModel(model);
    if (!providerName) {
      throw new Error(`Unknown model: ${model}. Unable to determine provider.`);
    }
    
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Provider ${providerName} not initialized`);
    }
    
    if (!provider.isConfigured()) {
      throw new Error(`Provider ${providerName} not configured. Please add API key in settings.`);
    }
    
    return provider;
  }
  
  /**
   * Infer provider from model name
   */
  private inferProviderFromModel(model: string): string | null {
    if (model.startsWith('gpt-') || model.startsWith('o1') || model.startsWith('o3')) {
      return 'openai';
    }
    if (model.startsWith('claude-')) {
      return 'anthropic';
    }
    if (model.startsWith('gemini-') || model.startsWith('models/gemini-')) {
      return 'gemini';
    }
    // OpenRouter models typically have provider prefix
    if (model.includes('/')) {
      return 'openrouter';
    }
    return null;
  }
  
  /**
   * Send text generation request
   * Automatically selects the right provider based on model
   */
  public async sendTextRequest(
    model: string,
    messages: Message[],
    options: Partial<RequestOptions> = {},
    appId: string = 'unknown'
  ): Promise<NormalisedResponse> {
    const provider = this.getProviderForModel(model);

    const fullOptions: RequestOptions = {
      model,
      maxTokens: options.maxTokens || 2000,
      temperature: options.temperature ?? 0.7,
      topP: options.topP,
      frequencyPenalty: options.frequencyPenalty,
      presencePenalty: options.presencePenalty,
      stop: options.stop
    };

    try {
      const response = await provider.sendRequest(messages, fullOptions);

      // Track usage if enabled
      if (this.settings.enableStats) {
        const cost = this.modelRegistry.calculateCost(
          model,
          response.usage.promptTokens,
          response.usage.completionTokens
        );

        this.storage.updateStats(
          provider.provider,
          model,
          appId,
          response.usage.totalTokens,
          cost
        );
      }

      return response;
    } catch (error) {
      console.error('[AICore] Request failed:', error);
      throw error;
    }
  }

  /**
   * Simple chat method - uses current settings model
   * This is a convenience method for quick chat interactions
   */
  public async chat(
    messages: Message[],
    options: Partial<RequestOptions> = {}
  ): Promise<NormalisedResponse> {
    const model = this.settings.defaultModel || 'gpt-3.5-turbo';
    return this.sendTextRequest(model, messages, options);
  }
  
  /**
   * Get available models for a provider
   */
  public async getAvailableModels(provider: string): Promise<string[]> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    if (!providerInstance.isConfigured()) {
      return [];
    }
    
    return await providerInstance.getAvailableModels();
  }
  
  /**
   * Get all models from registry
   */
  public getAllModels(): string[] {
    return this.modelRegistry.getAllModels().map(m => m.id);
  }
  
  /**
   * Get models by provider from registry
   */
  public getModelsByProvider(provider: string): string[] {
    return this.modelRegistry.getModelsByProvider(provider).map(m => m.id);
  }
  
  /**
   * Test API key for a provider
   */
  public async testApiKey(provider: string): Promise<boolean> {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    return await providerInstance.testApiKey();
  }
  
  /**
   * Set API key for a provider
   */
  public setApiKey(provider: string, apiKey: string): void {
    const providerInstance = this.providers.get(provider);
    if (!providerInstance) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    providerInstance.setApiKey(apiKey);
    
    // Update settings
    this.storage.updateProvider(provider, {
      ...this.settings.providers[provider],
      apiKey: apiKey,
      enabled: apiKey.length > 0
    });
    
    // Reload settings
    this.settings = this.storage.loadSettings();
  }
  
  /**
   * Get provider status
   */
  public getProviderStatus(): Record<string, ProviderStatus> {
    const status: Record<string, ProviderStatus> = {};
    
    this.providers.forEach((provider, name) => {
      status[name] = {
        configured: provider.isConfigured(),
        apiKey: provider.getApiKey()
      };
    });
    
    return status;
  }
  
  /**
   * Get current settings
   */
  public getSettings(): AISettings {
    return this.settings;
  }
  
  /**
   * Update settings
   */
  public updateSettings(settings: Partial<AISettings>): void {
    this.settings = {
      ...this.settings,
      ...settings
    };
    this.storage.saveSettings(this.settings);
  }
  
  /**
   * Get usage statistics
   */
  public getStats() {
    return this.storage.loadStats();
  }
  
  /**
   * Reset usage statistics
   */
  public resetStats(): void {
    this.storage.resetStats();
  }
  
  /**
   * Extract content from response
   */
  public static extractContent(response: NormalisedResponse): string {
    return ResponseNormaliser.extractContent(response);
  }
  
  /**
   * Extract usage from response
   */
  public static extractUsage(response: NormalisedResponse) {
    return ResponseNormaliser.extractUsage(response);
  }
}

export default AICore;

