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
      // Determine which endpoint and parameters to use based on model
      // GPT-5, O3, O4, and O1 models use /v1/responses endpoint (or have restrictions)
      // Older models (gpt-4.1, gpt-4o, gpt-3.5-turbo) use /v1/chat/completions
      const usesResponsesAPI = options.model.startsWith('gpt-5') ||
                               options.model.startsWith('o3') ||
                               options.model.startsWith('o4') ||
                               options.model.startsWith('o1');

      // GPT-5 and O-series models only support default temperature (1.0)
      const supportsCustomTemperature = !usesResponsesAPI;

      if (usesResponsesAPI) {
        // Use /v1/responses endpoint for GPT-5, O3, O4, O1
        const requestBody: any = {
          model: options.model,
          input: this.convertMessagesToInput(messages)
        };

        // IMPORTANT: Responses API uses max_output_tokens, NOT max_completion_tokens
        if (options.maxTokens) {
          requestBody.max_output_tokens = options.maxTokens;
        }

        // Note: temperature is not supported for these models (only default 1.0)
        console.log('[OpenAIProvider] Using /v1/responses endpoint for', options.model);

        const response = await fetch(`${this.baseUrl}/responses`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return ResponseNormaliser.normaliseOpenAI(data);
      } else {
        // Use /v1/chat/completions endpoint for older models
        const requestBody: any = {
          model: options.model,
          messages: messages
        };

        // Add temperature only if supported
        if (supportsCustomTemperature && options.temperature !== undefined) {
          requestBody.temperature = options.temperature;
        }

        // Add other parameters
        if (options.topP !== undefined) {
          requestBody.top_p = options.topP;
        }
        if (options.frequencyPenalty !== undefined) {
          requestBody.frequency_penalty = options.frequencyPenalty;
        }
        if (options.presencePenalty !== undefined) {
          requestBody.presence_penalty = options.presencePenalty;
        }
        if (options.stop) {
          requestBody.stop = options.stop;
        }

        // Add max_tokens for older models
        if (options.maxTokens) {
          requestBody.max_tokens = options.maxTokens;
        }

        console.log('[OpenAIProvider] Using /v1/chat/completions endpoint for', options.model);

        const response = await fetch(`${this.baseUrl}/chat/completions`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error?.message || 'OpenAI API request failed');
        }

        const data = await response.json();
        return ResponseNormaliser.normaliseOpenAI(data);
      }
    } catch (error) {
      console.error('[OpenAIProvider] Request failed:', error);
      throw error;
    }
  }

  /**
   * Convert messages array to input format for /v1/responses endpoint
   */
  private convertMessagesToInput(messages: Message[]): string | any[] {
    // For simple cases, concatenate messages into a single string
    // For complex cases with images, return array of content parts
    const hasComplexContent = messages.some(m =>
      typeof m.content !== 'string'
    );

    if (hasComplexContent) {
      // Return array of content parts
      return messages.map(m => ({
        role: m.role,
        content: m.content
      }));
    } else {
      // Concatenate into a single string
      return messages.map(m => {
        if (m.role === 'system') {
          return `System: ${m.content}`;
        } else if (m.role === 'user') {
          return `User: ${m.content}`;
        } else {
          return `Assistant: ${m.content}`;
        }
      }).join('\n\n');
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
        'gpt-5-nano',
        'o3',
        'o3-pro',
        'o3-mini',
        'o4-mini',
        'gpt-4.1',
        'gpt-4.1-mini',
        'gpt-4o',
        'chatgpt-4o-latest',
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

