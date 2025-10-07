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
    if (response.object === 'response' || response.status === 'completed' || response.status === 'incomplete') {
      // The /v1/responses API returns output in a different format
      // Extract text from the response following the Responses API structure
      let content = '';

      // Method 1: Check for output array with message type (most common for GPT-5)
      if (Array.isArray(response.output)) {
        // Find the message node in the output array
        const msgNode = response.output.find((o: any) => o.type === 'message');
        if (msgNode?.content) {
          // Extract text from content array
          if (Array.isArray(msgNode.content)) {
            content = msgNode.content
              .filter((c: any) => c.type === 'text')
              .map((c: any) => c.text)
              .join('');
          } else if (typeof msgNode.content === 'string') {
            content = msgNode.content;
          }
        }

        // Fallback: Look for text type output
        if (!content) {
          const textNode = response.output.find((o: any) => o.type === 'text');
          if (textNode?.text) {
            content = textNode.text;
          }
        }
      }

      // Method 2: Check for output_text field (alternative format)
      if (!content && response.output_text) {
        content = response.output_text;
      }

      // Method 3: Check for reasoning with summary (fallback)
      if (!content && Array.isArray(response.output)) {
        const reasoningNode = response.output.find((o: any) => o.type === 'reasoning');
        if (reasoningNode?.summary) {
          if (Array.isArray(reasoningNode.summary)) {
            content = reasoningNode.summary.join('\n');
          } else if (typeof reasoningNode.summary === 'string') {
            content = reasoningNode.summary;
          }
        }
      }

      // Log the response structure for debugging
      console.log('[ResponseNormaliser] GPT-5/Responses API response:', {
        status: response.status,
        hasOutput: !!response.output,
        outputLength: response.output?.length,
        contentExtracted: !!content,
        contentLength: content.length,
        reasoningTokens: response.usage?.output_tokens_details?.reasoning_tokens
      });

      // IMPORTANT: For GPT-5/O-series, if status is incomplete and no content found,
      // this means the model only produced reasoning tokens without final output
      if (!content && response.status === 'incomplete') {
        console.warn('[ResponseNormaliser] GPT-5/O-series response incomplete - only reasoning tokens generated. Consider increasing max_output_tokens.');
        content = '[Response incomplete: The model generated reasoning but did not produce final output. Please increase max_output_tokens or simplify the request.]';
      }

      // If still no content but status is completed, log error
      if (!content && response.status === 'completed') {
        console.error('[ResponseNormaliser] GPT-5 response completed but no content extracted. Full response:', response);
      }

      return {
        choices: [{
          message: {
            role: 'assistant',
            content: content
          },
          finishReason: response.status === 'completed' ? 'stop' : (response.incomplete_details?.reason || 'length'),
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

