/**
 * Anthropic Provider
 * 
 * Implementation of the IProvider interface for Anthropic Claude
 */

import { IProvider, Message, RequestOptions, NormalisedResponse } from '../interfaces/IProvider';
import ResponseNormaliser from '../response/ResponseNormaliser';

class AnthropicProvider implements IProvider {
  public readonly provider = 'anthropic';
  private apiKey: string = '';
  private baseUrl: string = 'https://api.anthropic.com/v1';
  private apiVersion: string = '2023-06-01';
  
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
      throw new Error('Anthropic API key not configured');
    }
    
    // Separate system message from other messages
    const systemMessage = messages.find(m => m.role === 'system');
    const conversationMessages = messages.filter(m => m.role !== 'system');
    
    try {
      const requestBody: any = {
        model: options.model,
        messages: conversationMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
        max_tokens: options.maxTokens || 4096,
        temperature: options.temperature,
        top_p: options.topP
      };
      
      // Add system message if present
      if (systemMessage) {
        requestBody.system = systemMessage.content;
      }
      
      const response = await fetch(`${this.baseUrl}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion
        },
        body: JSON.stringify(requestBody)
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Anthropic API request failed');
      }
      
      const data = await response.json();
      return ResponseNormaliser.normaliseAnthropic(data);
    } catch (error) {
      console.error('[AnthropicProvider] Request failed:', error);
      throw error;
    }
  }
  
  public async testApiKey(): Promise<boolean> {
    try {
      const response = await this.sendRequest(
        [{ role: 'user', content: 'Hello' }],
        { model: 'claude-sonnet-4-20250514', maxTokens: 10 }
      );
      return response.choices.length > 0;
    } catch (error) {
      console.error('[AnthropicProvider] API key test failed:', error);
      return false;
    }
  }
  
  public async getAvailableModels(): Promise<string[]> {
    // Anthropic doesn't have a models endpoint, return known models
    return [
      'claude-sonnet-4-20250514',
      'claude-opus-4-20250514',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307'
    ];
  }
}

export default AnthropicProvider;

