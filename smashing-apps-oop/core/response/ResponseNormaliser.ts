/**
 * Response Normaliser
 * 
 * Normalises responses from different AI providers to a consistent format
 * All responses are normalised to OpenAI's format for consistency
 */

import { NormalisedResponse, Usage } from '../interfaces/IProvider';

class ResponseNormaliser {
  /**
   * Normalise OpenAI response
   */
  public static normaliseOpenAI(response: any): NormalisedResponse {
    return {
      choices: response.choices.map((choice: any, index: number) => ({
        message: {
          role: choice.message.role,
          content: choice.message.content
        },
        finishReason: choice.finish_reason || 'stop',
        index: index
      })),
      usage: {
        promptTokens: response.usage?.prompt_tokens || 0,
        completionTokens: response.usage?.completion_tokens || 0,
        totalTokens: response.usage?.total_tokens || 0
      },
      model: response.model,
      object: response.object || 'chat.completion',
      created: response.created,
      id: response.id
    };
  }
  
  /**
   * Normalise Anthropic response
   */
  public static normaliseAnthropic(response: any): NormalisedResponse {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: response.content[0]?.text || ''
        },
        finishReason: response.stop_reason || 'stop',
        index: 0
      }],
      usage: {
        promptTokens: response.usage?.input_tokens || 0,
        completionTokens: response.usage?.output_tokens || 0,
        totalTokens: (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0)
      },
      model: response.model,
      object: 'chat.completion',
      id: response.id
    };
  }
  
  /**
   * Normalise Google Gemini response
   */
  public static normaliseGemini(response: any): NormalisedResponse {
    const candidate = response.candidates?.[0];
    const content = candidate?.content?.parts?.[0]?.text || '';
    
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: content
        },
        finishReason: candidate?.finishReason?.toLowerCase() || 'stop',
        index: 0
      }],
      usage: {
        promptTokens: response.usageMetadata?.promptTokenCount || 0,
        completionTokens: response.usageMetadata?.candidatesTokenCount || 0,
        totalTokens: response.usageMetadata?.totalTokenCount || 0
      },
      model: response.modelVersion || 'gemini',
      object: 'chat.completion'
    };
  }
  
  /**
   * Normalise OpenRouter response
   */
  public static normaliseOpenRouter(response: any): NormalisedResponse {
    // OpenRouter uses OpenAI format, but may have additional fields
    return this.normaliseOpenAI(response);
  }
  
  /**
   * Extract content from normalised response
   */
  public static extractContent(response: NormalisedResponse): string {
    return response.choices[0]?.message?.content || '';
  }
  
  /**
   * Extract usage information
   */
  public static extractUsage(response: NormalisedResponse): Usage {
    return response.usage;
  }
  
  /**
   * Check if response has error
   */
  public static hasError(response: any): boolean {
    return !!response.error;
  }
  
  /**
   * Extract error message
   */
  public static extractError(response: any): string {
    if (response.error) {
      if (typeof response.error === 'string') {
        return response.error;
      }
      return response.error.message || 'Unknown error';
    }
    return '';
  }
  
  /**
   * Create error response
   */
  public static createErrorResponse(_error: string, model: string = 'unknown'): NormalisedResponse {
    return {
      choices: [{
        message: {
          role: 'assistant',
          content: ''
        },
        finishReason: 'error',
        index: 0
      }],
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0
      },
      model: model,
      object: 'error'
    };
  }
}

export default ResponseNormaliser;

