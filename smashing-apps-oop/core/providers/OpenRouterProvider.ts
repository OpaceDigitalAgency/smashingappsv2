/**
 * OpenRouter Provider
 * 
 * Implementation of the IProvider interface for OpenRouter
 * OpenRouter provides access to multiple AI models through a single API
 */

import { IProvider, Message, RequestOptions, NormalisedResponse } from '../interfaces/IProvider';
import ResponseNormaliser from '../response/ResponseNormaliser';

class OpenRouterProvider implements IProvider {
  public readonly provider = 'openrouter';
  private apiKey: string = '';
  private baseUrl: string = 'https://openrouter.ai/api/v1';
  
  constructor(apiKey?: string) {
    if (apiKey) {
      this.apiKey = apiKey;
    }
  }
  
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  public getApiKey(): string {
    if (!this.apiKey) return '';
    return `${this.apiKey.substring(0, 7)}...${this.apiKey.substring(this.apiKey.length - 4)}`;
  }
  
  public isConfigured(): boolean {
    return this.apiKey.length > 0;
  }
  
  public async sendRequest(messages: Message[], options: RequestOptions): Promise<NormalisedResponse> {
    if (!this.isConfigured()) {
      throw new Error('OpenRouter API key not configured');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'SmashingApps'
        },
        body: JSON.stringify({
          model: options.model,
          messages: messages,
          max_tokens: options.maxTokens,
          temperature: options.temperature,
          top_p: options.topP,
          frequency_penalty: options.frequencyPenalty,
          presence_penalty: options.presencePenalty,
          stop: options.stop
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenRouter API request failed');
      }
      
      const data = await response.json();
      return ResponseNormaliser.normaliseOpenRouter(data);
    } catch (error) {
      console.error('[OpenRouterProvider] Request failed:', error);
      throw error;
    }
  }
  
  public async testApiKey(): Promise<boolean> {
    try {
      const response = await this.sendRequest(
        [{ role: 'user', content: 'Hello' }],
        { model: 'openai/gpt-3.5-turbo', maxTokens: 5 }
      );
      return response.choices.length > 0;
    } catch (error) {
      console.error('[OpenRouterProvider] API key test failed:', error);
      return false;
    }
  }
  
  public async getAvailableModels(): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      
      // Return model IDs
      return data.data
        .map((model: any) => model.id)
        .sort();
    } catch (error) {
      console.error('[OpenRouterProvider] Failed to fetch models:', error);
      return [
        'openai/gpt-4o',
        'openai/gpt-4o-mini',
        'openai/gpt-3.5-turbo',
        'anthropic/claude-sonnet-4',
        'anthropic/claude-opus-4',
        'google/gemini-2.0-flash-exp',
        'google/gemini-1.5-pro'
      ];
    }
  }
}

export default OpenRouterProvider;

