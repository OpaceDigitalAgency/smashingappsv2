/**
 * Model Fetcher Service
 * 
 * Dynamically fetches available models from provider APIs
 * Filters and sorts models for display in the Admin UI
 */

import { IProvider } from '../interfaces/IProvider';

export interface FetchedModel {
  provider: string;
  id: string;
  displayName: string;
  created: number | null;
  type: 'chat' | 'image';
  _score?: number; // For Gemini version scoring
}

class ModelFetcher {
  private static instance: ModelFetcher;
  
  private constructor() {}
  
  public static getInstance(): ModelFetcher {
    if (!ModelFetcher.instance) {
      ModelFetcher.instance = new ModelFetcher();
    }
    return ModelFetcher.instance;
  }
  
  /**
   * Helper: Convert timestamp to milliseconds
   */
  private toTimestamp(value: any): number | null {
    if (!value) return null;
    const ts = typeof value === 'number' ? value * 1000 : new Date(value).getTime();
    return isNaN(ts) ? null : ts;
  }
  
  /**
   * Check if model ID has a date suffix (e.g., "2025-06-03")
   */
  private hasDateSuffix(id: string): boolean {
    return /\b20\d{2}-\d{2}-\d{2}\b/.test(id);
  }
  
  /**
   * Check if model is an alias (preview, latest)
   */
  private isAlias(id: string): boolean {
    return /-(preview|latest)$/i.test(id);
  }
  
  /**
   * Check if model is canonical (not dated, not alias)
   */
  private isCanonical(id: string): boolean {
    return !this.hasDateSuffix(id) && !this.isAlias(id);
  }
  
  /**
   * Calculate Gemini version score for sorting
   */
  private geminiScore(id: string): number {
    const match = id.match(/gemini-(\d+(?:\.\d+)?)/i);
    const version = match ? parseFloat(match[1]) : 0;
    const tier = /pro/i.test(id) ? 3 : /flash/i.test(id) ? 2 : /nano/i.test(id) ? 1 : 0;
    const imageBoost = /image/i.test(id) ? 1000 : 0;
    return version * 100 + tier + imageBoost;
  }
  
  /**
   * Check if OpenAI model is a chat/text model
   */
  private isOpenAIChatModel(id: string): boolean {
    // Exclude: audio, realtime, tts, transcribe, embedding, image-only, whisper
    if (/(audio|realtime|tts|transcribe|embed|embedding|whisper)/i.test(id)) return false;
    if (/^(gpt-image-1|dall-e)/i.test(id)) return false; // image-only models
    return /^(gpt-|o\d|chatgpt-)/i.test(id);
  }
  
  /**
   * Check if OpenAI model is an image generation model
   */
  private isOpenAIImageModel(id: string): boolean {
    if (/(audio|realtime|tts|transcribe|embed|embedding)/i.test(id)) return false;
    return /^(gpt-image-1|dall-e|gpt-4o|chatgpt-4o)/i.test(id);
  }
  
  /**
   * Check if Gemini model is a chat/text model
   */
  private isGeminiChatModel(id: string): boolean {
    if (/(embed|embedding)/i.test(id)) return false;
    if (/image/i.test(id)) return false; // exclude image-specific models
    return /^gemini-/i.test(id);
  }
  
  /**
   * Check if Gemini model is an image generation model
   */
  private isGeminiImageModel(id: string): boolean {
    if (/(embed|embedding)/i.test(id)) return false;
    return /^gemini-/i.test(id) && /image/i.test(id);
  }
  
  /**
   * Fetch models from OpenAI
   */
  public async fetchOpenAIModels(apiKey: string, type: 'chat' | 'image'): Promise<FetchedModel[]> {
    try {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      });
      
      if (!response.ok) {
        console.warn(`[ModelFetcher] OpenAI API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      const filterFn = type === 'chat' ? this.isOpenAIChatModel : this.isOpenAIImageModel;
      
      return data.data
        .map((m: any) => ({
          provider: 'openai',
          id: m.id,
          displayName: m.id,
          created: this.toTimestamp(m.created),
          type
        }))
        .filter((m: FetchedModel) => filterFn.call(this, m.id))
        .filter((m: FetchedModel) => this.isCanonical(m.id));
    } catch (error) {
      console.error('[ModelFetcher] Error fetching OpenAI models:', error);
      return [];
    }
  }
  
  /**
   * Fetch models from Anthropic
   */
  public async fetchAnthropicModels(apiKey: string, type: 'chat' | 'image'): Promise<FetchedModel[]> {
    // Anthropic doesn't support image generation yet
    if (type === 'image') return [];
    
    try {
      const response = await fetch('https://api.anthropic.com/v1/models', {
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        }
      });
      
      if (!response.ok) {
        console.warn(`[ModelFetcher] Anthropic API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      
      return data.data
        .map((m: any) => ({
          provider: 'anthropic',
          id: m.id,
          displayName: m.display_name || m.id,
          created: this.toTimestamp(m.created_at),
          type: 'chat' as const
        }))
        .filter((m: FetchedModel) => this.isCanonical(m.id));
    } catch (error) {
      console.error('[ModelFetcher] Error fetching Anthropic models:', error);
      return [];
    }
  }
  
  /**
   * Fetch models from Gemini
   */
  public async fetchGeminiModels(apiKey: string, type: 'chat' | 'image'): Promise<FetchedModel[]> {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );
      
      if (!response.ok) {
        console.warn(`[ModelFetcher] Gemini API error: ${response.status}`);
        return [];
      }
      
      const data = await response.json();
      const filterFn = type === 'chat' ? this.isGeminiChatModel : this.isGeminiImageModel;
      
      const models = data.models
        .map((m: any) => {
          const id = m.name.replace(/^models\//, '');
          return {
            provider: 'gemini',
            id,
            displayName: m.displayName || id,
            created: null,
            type,
            _score: this.geminiScore(id)
          };
        })
        .filter((m: FetchedModel) => filterFn.call(this, m.id))
        .filter((m: FetchedModel) => this.isCanonical(m.id));
      
      // Sort Gemini models by version score
      return models.sort((a: FetchedModel, b: FetchedModel) => (b._score || 0) - (a._score || 0));
    } catch (error) {
      console.error('[ModelFetcher] Error fetching Gemini models:', error);
      return [];
    }
  }
  
  /**
   * Fetch all models from all providers
   */
  public async fetchAllModels(
    providers: Map<string, { apiKey: string; provider: IProvider }>,
    type: 'chat' | 'image'
  ): Promise<FetchedModel[]> {
    const promises: Promise<FetchedModel[]>[] = [];
    
    for (const [name, config] of providers.entries()) {
      if (!config.apiKey) continue;
      
      switch (name) {
        case 'openai':
          promises.push(this.fetchOpenAIModels(config.apiKey, type));
          break;
        case 'anthropic':
          promises.push(this.fetchAnthropicModels(config.apiKey, type));
          break;
        case 'gemini':
          promises.push(this.fetchGeminiModels(config.apiKey, type));
          break;
      }
    }
    
    const results = await Promise.all(promises);
    const allModels = results.flat();
    
    // Sort by release date (newest first), then by provider order
    return allModels.sort((a, b) => {
      if (a.created && b.created) return b.created - a.created;
      if (a.created && !b.created) return -1;
      if (!a.created && b.created) return 1;
      return 0; // Keep Gemini's internal order
    });
  }
}

export default ModelFetcher;