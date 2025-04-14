import { useState, useCallback } from 'react';
import { AIExecuteOptions, AIExecuteResult, UseAIReturn } from '../types';
import { AIProvider } from '../types/aiProviders';
import useReCaptcha from './useReCaptcha';
import useLocalStorage from './useLocalStorage';
import LegacyAIService from '../services/AIService';
import { aiServiceRegistry, getServiceForModel } from '../services/aiServices';

/**
 * A hook for interacting with AI services
 *
 * @returns An object with the execute function, loading state, and error state
 */
export function useAI(): UseAIReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { getReCaptchaToken } = useReCaptcha();
  
  // Get the active provider from localStorage
  const { value: activeProvider } = useLocalStorage<AIProvider>(
    'smashingapps_activeProvider',
    'openai'
  );
  
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
      
      // Get the appropriate service for the model
      const service = getServiceForModel(options.model);
      
      if (!service) {
        throw new Error(`No service found for model: ${options.model}`);
      }
      
      // Check if the service is configured
      if (!service.isConfigured()) {
        throw new Error(`${service.provider} service is not configured. Please add your API key in the settings.`);
      }
      
      // Execute the AI request using the enhanced service
      const result = await service.createChatCompletion({
        model: options.model,
        messages: [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens,
      });
      
      return {
        content: result.data.content,
        rateLimit: result.rateLimit
      };
    } catch (err) {
      // If the enhanced service fails, fall back to the legacy service
      try {
        console.warn('Enhanced AI service failed, falling back to legacy service:', err);
        
        // Get reCAPTCHA token again if needed
        const recaptchaToken = await getReCaptchaToken('ai_request');
        
        // Execute the AI request using the legacy service
        const result = await LegacyAIService.createChatCompletion({
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
      } catch (fallbackErr) {
        const error = fallbackErr instanceof Error ? fallbackErr : new Error('Unknown error occurred');
        setError(error);
        throw error;
      }
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