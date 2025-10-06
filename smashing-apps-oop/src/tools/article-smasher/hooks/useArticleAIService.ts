/**
 * Article AI Service Hook - AI-Core Integration
 *
 * This hook provides access to the Article AI Core Adapter,
 * which bridges the original Article Smasher interface with
 * the new AI-Core system.
 */

import articleAICoreAdapter from '../services/articleAICoreAdapter';

/**
 * Hook to access the Article AI Core Adapter
 *
 * @returns The Article AI Core Adapter instance
 */
export const useArticleAIService = () => {
  return articleAICoreAdapter;
};

export default useArticleAIService;