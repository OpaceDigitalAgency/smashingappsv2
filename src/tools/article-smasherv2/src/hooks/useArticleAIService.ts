import { useEffect } from 'react';
import useArticleAI from './useArticleAI';
import articleAIService, { ArticleAIService } from '../services/articleAIService';

/**
 * This hook connects the ArticleAIServiceFacade with the useArticleAI hook.
 * It allows components to use the hook directly while also setting the hook instance
 * in the facade for backward compatibility.
 * 
 * @returns The useArticleAI hook instance
 */
export const useArticleAIService = () => {
  const articleAI = useArticleAI();
  
  // Set the hook instance in the facade when the component mounts
  useEffect(() => {
    (articleAIService as ArticleAIService).setHookInstance(articleAI);
    
    // Clean up when the component unmounts
    return () => {
      (articleAIService as ArticleAIService).setHookInstance(null as any);
    };
  }, [articleAI]);
  
  return articleAI;
};

export default useArticleAIService;