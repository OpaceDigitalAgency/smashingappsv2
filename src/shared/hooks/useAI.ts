import { useState, useCallback } from 'react';
import { AIExecuteOptions, AIExecuteResult, UseAIReturn } from '../types';
import useReCaptcha from './useReCaptcha';
import AIService from '../services/AIService';

/**
 * A hook for interacting with AI services
 * 
 * @returns An object with the execute function, loading state, and error state
 */
export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getReCaptchaToken } = useReCaptcha();
  
  /**
   * Execute an AI request
   * 
   * @param options The options for the AI request
   * @returns A promise that resolves to the AI response
   */
  const execute = useCallback(async (options: AIExecuteOptions): Promise<AIExecuteResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Get reCAPTCHA token
      const recaptchaToken = await getReCaptchaToken('ai_request');
      
      // Execute the AI request
      const result = await AIService.createChatCompletion({
        model: options.model,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens,
      }, recaptchaToken);
      
      return {
        content: result.data.choices[0]?.message.content || '',
        rateLimit: result.rateLimit
      };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [getReCaptchaToken]);
  
  return {
    execute,
    isLoading,
    error
  };
}

export default useAI;