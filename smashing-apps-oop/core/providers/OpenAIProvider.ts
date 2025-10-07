/**
 * OpenAI Provider
 * 
 * Implementation of the IProvider interface for OpenAI
 */

import { IProvider, Message, RequestOptions, NormalisedResponse } from '../interfaces/IProvider';
import ResponseNormaliser from '../response/ResponseNormaliser';

class OpenAIProvider implements IProvider {
  public readonly provider = 'openai';
  private apiKey: string = '';
  private baseUrl: string = 'https://api.openai.com/v1';
  
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
      throw new Error('OpenAI API key not configured');
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
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
        throw new Error(error.error?.message || 'OpenAI API request failed');
      }
      
      const data = await response.json();
      return ResponseNormaliser.normaliseOpenAI(data);
    } catch (error) {
      console.error('[OpenAIProvider] Request failed:', error);
      throw error;
    }
  }
  
  public async testApiKey(): Promise<boolean> {
    try {
      const response = await this.sendRequest(
        [{ role: 'user', content: 'Hello' }],
        { model: 'gpt-3.5-turbo', maxTokens: 5 }
      );
      return response.choices.length > 0;
    } catch (error) {
      console.error('[OpenAIProvider] API key test failed:', error);
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

      // Filter for chat models
      return data.data
        .filter((model: any) =>
          model.id.includes('gpt') ||
          model.id.includes('o1') ||
          model.id.includes('o3') ||
          model.id.includes('chatgpt')
        )
        .map((model: any) => model.id)
        .sort((a: string, b: string) => {
          // Sort by model generation (newest first)
          const getModelPriority = (id: string): number => {
            if (id.includes('gpt-5')) return 1;
            if (id.includes('o3')) return 2;
            if (id.includes('gpt-4.1')) return 3;
            if (id.includes('gpt-4o')) return 4;
            if (id.includes('o1')) return 5;
            if (id.includes('gpt-4')) return 6;
            if (id.includes('gpt-3.5')) return 7;
            return 8;
          };

          const priorityA = getModelPriority(a);
          const priorityB = getModelPriority(b);

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          // Within same generation, sort alphabetically
          return a.localeCompare(b);
        });
    } catch (error) {
      console.error('[OpenAIProvider] Failed to fetch models:', error);
      return [
        'gpt-5',
        'gpt-5-pro',
        'gpt-5-mini',
        'o3',
        'o3-mini',
        'gpt-4.1',
        'gpt-4o',
        'gpt-4o-mini',
        'o1',
        'o1-mini',
        'gpt-3.5-turbo'
      ];
    }
  }

  /**
   * Get model metadata from OpenAI API
   */
  public async getModelMetadata(modelId: string): Promise<any> {
    if (!this.isConfigured()) {
      return null;
    }

    try {
      const response = await fetch(`${this.baseUrl}/models/${modelId}`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`
        }
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('[OpenAIProvider] Failed to fetch model metadata:', error);
      return null;
    }
  }
}

export default OpenAIProvider;

