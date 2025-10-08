/**
 * Article AI Service Hook - Working AI Integration
 *
 * This hook provides access to the working Article AI implementation
 * using the proven useArticleAI hook that works with the shared AI services.
 */

import { useArticleAI } from './useArticleAI';

/**
 * Hook to access the Article AI service
 *
 * @returns The useArticleAI hook instance
 */
export const useArticleAIService = () => {
  return useArticleAI();
};

export default useArticleAIService;