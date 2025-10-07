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
   * Handles both /v1/chat/completions and /v1/responses formats
   */
  public static normaliseOpenAI(response: any): NormalisedResponse {
    // Check if this is a /v1/responses format (GPT-5, O-series)
    if (response.object === 'response') {
      // The /v1/responses API returns output in a different format
      // According to OpenAI docs, we need to look for the actual response text
      let content = '';

      // Check for output array with message type
      if (Array.isArray(response.output)) {
        for (const item of response.output) {
          // Look for message type output
          if (item.type === 'message' && item.content) {
            // Extract text from message content
            if (Array.isArray(item.content)) {
              const textPart = item.content.find((part: any) => part.type === 'text');
              if (textPart?.text) {
                content = textPart.text;
                break;
              }
            } else if (typeof item.content === 'string') {
              content = item.content;
              break;
            }
          }
          // Look for text type output
          else if (item.type === 'text' && item.text) {
            content = item.text;
            break;
          }
          // Look for reasoning type with summary
          else if (item.type === 'reasoning' && item.summary) {
            if (Array.isArray(item.summary)) {
              content = item.summary.join('\n');
            } else if (typeof item.summary === 'string') {
              content = item.summary;
            }
          }
        }
      }

      // IMPORTANT: For GPT-5/O-series, if status is incomplete and no content found,
      // this means the model only produced reasoning tokens without final output
      // We need to make another request or increase max_output_tokens
      if (!content && response.status === 'incomplete') {
        console.warn('[ResponseNormaliser] GPT-5/O-series response incomplete - only reasoning tokens generated. Consider increasing max_output_tokens.');
        content = '[Response incomplete: The model generated reasoning but did not produce final output. Please increase max_output_tokens or simplify the request.]';
      }

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: content
          },
          finishReason: response.status === 'complete' ? 'stop' : (response.incomplete_details?.reason || 'length'),
          index: 0
        }],
        usage: {
          promptTokens: response.usage?.input_tokens || 0,
          completionTokens: response.usage?.output_tokens || 0,
          totalTokens: response.usage?.total_tokens || 0
        },
        model: response.model,
        object: 'chat.completion',
        created: response.created_at || response.created,
        id: response.id
      };
    }

    // Standard /v1/chat/completions format
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

