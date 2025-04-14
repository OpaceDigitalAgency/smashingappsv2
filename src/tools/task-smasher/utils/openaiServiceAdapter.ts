/**
 * OpenAI Service Adapter
 *
 * This file provides backward compatibility with the existing code that uses the old OpenAI service.
 * It adapts the shared AIService interface to the old OpenAI service interface.
 */

import { aiServiceRegistry } from '../../../shared/services/aiServices';
import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Technical definition of an OpenAI request - for backward compatibility
 */
interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Technical definition of an OpenAI response - for backward compatibility
 */
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * API USAGE LIMITS TRACKING - for backward compatibility
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

/**
 * OPENAI SERVICE - MAIN FUNCTIONALITY - for backward compatibility
 */
export const OpenAIServiceAdapter = {
  /**
   * Send a chat completion request to OpenAI through our proxy
   */
  async createChatCompletion(request: ChatCompletionRequest, recaptchaToken?: string | null): Promise<{
    data: ChatCompletionResponse;
    rateLimit: RateLimitInfo;
  }> {
    try {
      // Convert the request to the new format
      const options = {
        model: request.model,
        messages: request.messages,
        temperature: request.temperature,
        maxTokens: request.max_tokens
      };
      
      // Get the appropriate service for the model
      const service = aiServiceRegistry.getServiceForModel(request.model);
      
      if (!service) {
        throw new Error(`No service found for model: ${request.model}`);
      }
      
      // Call the shared service
      // Cast the messages to the expected type to handle compatibility
      const response = await service.createChatCompletion({
        ...options,
        messages: options.messages as any
      });
      
      // Convert the response back to the old format
      const oldFormatResponse: ChatCompletionResponse = {
        id: response.data.id,
        object: 'chat.completion',
        created: Date.now(),
        model: response.data.model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: response.data.content
            },
            finish_reason: 'stop'
          }
        ],
        usage: response.data.usage ? {
          prompt_tokens: response.data.usage.promptTokens,
          completion_tokens: response.data.usage.completionTokens,
          total_tokens: response.data.usage.totalTokens
        } : {
          prompt_tokens: 0,
          completion_tokens: 0,
          total_tokens: 0
        }
      };
      
      return {
        data: oldFormatResponse,
        rateLimit: response.rateLimit
      };
    } catch (error) {
      console.error("Error in createChatCompletion adapter:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with OpenAI API');
    }
  },

  /**
   * Get a simple text completion from OpenAI
   */
  async getCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
    try {
      // Get the appropriate service for the model
      const service = aiServiceRegistry.getServiceForModel(model);
      
      if (!service) {
        throw new Error(`No service found for model: ${model}`);
      }
      
      const response = await service.createTextCompletion({
        model,
        prompt
      });
      
      return response.data.text;
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  },

  /**
   * Get the current rate limit status
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    // Get the default service (usually OpenAI)
    const service = aiServiceRegistry.getDefaultService();
    
    if (!service) {
      throw new Error('No default service available');
    }
    
    return service.getRateLimitStatus();
  }
};

export default OpenAIServiceAdapter;