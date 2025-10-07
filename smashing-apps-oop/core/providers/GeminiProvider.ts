/**
 * Google Gemini Provider
 * 
 * Implementation of the IProvider interface for Google Gemini
 */

import { IProvider, Message, RequestOptions, NormalisedResponse } from '../interfaces/IProvider';
import ResponseNormaliser from '../response/ResponseNormaliser';

class GeminiProvider implements IProvider {
  public readonly provider = 'gemini';
  private apiKey: string = '';
  private baseUrl: string = 'https://generativelanguage.googleapis.com/v1beta';
  
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
      throw new Error('Gemini API key not configured');
    }

    // Convert messages to Gemini format
    const contents = this.convertMessagesToGeminiFormat(messages);

    // Extract model name (remove 'models/' prefix if present)
    const modelName = options.model.replace('models/', '');

    try {
      // Build generationConfig with only supported parameters
      const generationConfig: any = {};

      // Only add maxOutputTokens if specified
      if (options.maxTokens) {
        generationConfig.maxOutputTokens = options.maxTokens;
      }

      // Only add temperature if it's not the default value (1.0)
      // Gemini only supports temperature = 1.0 for some models
      if (options.temperature !== undefined && options.temperature !== 1.0) {
        // For Gemini, we'll skip temperature if it's not 1.0 to avoid errors
        // This is because some Gemini models only support the default temperature
        console.log('[GeminiProvider] Skipping temperature parameter (not supported by this model)');
      }

      // Only add topP if specified and not default
      if (options.topP !== undefined && options.topP !== 1.0) {
        generationConfig.topP = options.topP;
      }

      const requestBody: any = {
        contents: contents
      };

      // Only add generationConfig if it has properties
      if (Object.keys(generationConfig).length > 0) {
        requestBody.generationConfig = generationConfig;
      }

      const response = await fetch(
        `${this.baseUrl}/models/${modelName}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Gemini API request failed');
      }

      const data = await response.json();
      return ResponseNormaliser.normaliseGemini(data);
    } catch (error) {
      console.error('[GeminiProvider] Request failed:', error);
      throw error;
    }
  }
  
  /**
   * Convert messages to Gemini format
   */
  private convertMessagesToGeminiFormat(messages: Message[]): any[] {
    const contents: any[] = [];
    let systemInstruction = '';
    
    for (const message of messages) {
      if (message.role === 'system') {
        // Gemini handles system messages differently
        systemInstruction = message.content;
        continue;
      }
      
      contents.push({
        role: message.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: message.content }]
      });
    }
    
    // Prepend system instruction to first user message if present
    if (systemInstruction && contents.length > 0 && contents[0].role === 'user') {
      contents[0].parts[0].text = `${systemInstruction}\n\n${contents[0].parts[0].text}`;
    }
    
    return contents;
  }
  
  public async testApiKey(): Promise<boolean> {
    try {
      const response = await this.sendRequest(
        [{ role: 'user', content: 'Hello' }],
        { model: 'gemini-2.0-flash-exp', maxTokens: 10 }
      );
      return response.choices.length > 0;
    } catch (error) {
      console.error('[GeminiProvider] API key test failed:', error);
      return false;
    }
  }
  
  public async getAvailableModels(): Promise<string[]> {
    if (!this.isConfigured()) {
      return [];
    }
    
    try {
      const response = await fetch(
        `${this.baseUrl}/models?key=${this.apiKey}`,
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      
      // Filter for generative models
      return data.models
        .filter((model: any) => 
          model.supportedGenerationMethods?.includes('generateContent')
        )
        .map((model: any) => model.name.replace('models/', ''))
        .sort();
    } catch (error) {
      console.error('[GeminiProvider] Failed to fetch models:', error);
      return [
        'gemini-2.0-flash-exp',
        'gemini-1.5-pro',
        'gemini-1.5-flash',
        'gemini-1.0-pro'
      ];
    }
  }
}

export default GeminiProvider;

