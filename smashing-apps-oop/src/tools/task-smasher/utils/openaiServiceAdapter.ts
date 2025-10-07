/**
 * OpenAI Service Adapter
 *
 * This file provides backward compatibility with the existing code that uses the old OpenAI service.
 * It adapts AI-Core to the old OpenAI service interface.
 */

import AICore from '../../../../core/AICore';
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
   * Send a chat completion request using AI-Core
   */
  async createChatCompletion(request: ChatCompletionRequest, recaptchaToken?: string | null): Promise<{
    data: ChatCompletionResponse;
    rateLimit: RateLimitInfo;
  }> {
    try {
      // Get AI-Core instance
      const aiCore = AICore.getInstance();

      // Convert messages to AI-Core format
      const messages = request.messages.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      }));

      // Call AI-Core
      const response = await aiCore.sendTextRequest(
        request.model,
        messages,
        {
          temperature: request.temperature,
          maxTokens: request.max_tokens,
          topP: request.top_p,
          frequencyPenalty: request.frequency_penalty,
          presencePenalty: request.presence_penalty
        },
        'task-smasher'
      );

      // Convert the response back to the old format
      const oldFormatResponse: ChatCompletionResponse = {
        id: response.id || `chatcmpl-${Date.now()}`,
        object: 'chat.completion',
        created: response.created || Date.now(),
        model: response.model,
        choices: response.choices.map(choice => ({
          index: choice.index,
          message: {
            role: choice.message.role,
            content: choice.message.content
          },
          finish_reason: choice.finishReason
        })),
        usage: {
          prompt_tokens: response.usage.promptTokens,
          completion_tokens: response.usage.completionTokens,
          total_tokens: response.usage.totalTokens
        }
      };

      // Return with mock rate limit info (AI-Core doesn't track rate limits the same way)
      return {
        data: oldFormatResponse,
        rateLimit: {
          limit: 10,
          remaining: 10,
          reset: new Date(Date.now() + 86400000),
          used: 0
        }
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
   * Get a simple text completion using AI-Core
   */
  async getCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
    try {
      // Get AI-Core instance
      const aiCore = AICore.getInstance();

      // Call AI-Core with a simple user message
      const response = await aiCore.sendTextRequest(
        model,
        [{ role: 'user', content: prompt }],
        {},
        'task-smasher'
      );

      return response.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  },

  /**
   * Get the current rate limit status (mock implementation for AI-Core)
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    // AI-Core doesn't track rate limits the same way, return mock data
    return {
      limit: 10,
      remaining: 10,
      reset: new Date(Date.now() + 86400000),
      used: 0
    };
  }
};

export default OpenAIServiceAdapter;