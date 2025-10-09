import { processPromptTemplate } from './promptService';
import {
  PromptTemplate,
  KeywordData,
  OutlineItem,
  ArticleContent
} from '../types';

// Import the hook-based implementation
import useArticleAI from '../hooks/useArticleAI';
// Use AI-Core directly for any non-React fallback paths
import AICore from '../../../../core/AICore';

/**
 * This is a facade for the article AI service that maintains the same API
 * but delegates to the hook-based implementation when used in React components.
 *
 * IMPORTANT: This service should NOT be used directly in React components.
 * Instead, use the useArticleAI hook directly in your components.
 * This service is provided only for backward compatibility with existing code.
 *
 * IMPORTANT: This service now fully integrates with the shared AI services
 * from the unified admin interface.
 */
class ArticleAIServiceFacade {
  private static instance: ArticleAIServiceFacade;
  private initialized: boolean = false;
  private hookInstance: ReturnType<typeof useArticleAI> | null = null;
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): ArticleAIServiceFacade {
    if (!ArticleAIServiceFacade.instance) {
      ArticleAIServiceFacade.instance = new ArticleAIServiceFacade();
    }
    return ArticleAIServiceFacade.instance;
  }
  
  /**
   * Set the hook instance - this should be called from a React component
   * that uses the useArticleAI hook
   */
  public setHookInstance(instance: ReturnType<typeof useArticleAI>): void {
    this.hookInstance = instance;
  }
  
  /**
   * Check if the hook instance is available
   */
  private checkHookInstance(): void {
    if (!this.hookInstance) {
      console.warn(
        'ArticleAIService is being used without a hook instance. ' +
        'This may cause React hook rules violations. ' +
        'Please use the useArticleAI hook directly in your React components.'
      );
    }
  }
  
  /**
   * Generate topic ideas based on article type
   */
  public async generateTopics(
    prompt: PromptTemplate,
    articleType: string,
    subject: string = 'digital marketing',
    model: string = 'gpt-4o'
  ): Promise<string[]> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.generateTopics(prompt, articleType, subject, model);
    }
    
    // Fallback implementation for non-React contexts
    throw new Error(
      'ArticleAIService.generateTopics cannot be used outside of React components. ' +
      'Please use the useArticleAI hook directly in your React components.'
    );
  }
  
  /**
   * Generate keywords based on topic
   */
  public async generateKeywords(
    prompt: PromptTemplate,
    title: string,
    model: string = 'gpt-4o'
  ): Promise<KeywordData[]> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.generateKeywords(prompt, title, model);
    }
    
    // Fallback implementation for non-React contexts
    throw new Error(
      'ArticleAIService.generateKeywords cannot be used outside of React components. ' +
      'Please use the useArticleAI hook directly in your React components.'
    );
  }
  
  /**
   * Generate article outline based on topic and keywords
   */
  public async generateOutline(
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    model: string = 'gpt-4o'
  ): Promise<OutlineItem[]> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.generateOutline(prompt, title, keywords, model);
    }
    
    // Fallback implementation for non-React contexts
    throw new Error(
      'ArticleAIService.generateOutline cannot be used outside of React components. ' +
      'Please use the useArticleAI hook directly in your React components.'
    );
  }
  
  /**
   * Generate article content based on outline and keywords
   */
  public async generateContent(
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    outline: OutlineItem[],
    model: string = 'gpt-4o'
  ): Promise<ArticleContent> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.generateContent(prompt, title, keywords, outline, model);
    }
    
    // Fallback implementation for non-React contexts
    throw new Error(
      'ArticleAIService.generateContent cannot be used outside of React components. ' +
      'Please use the useArticleAI hook directly in your React components.'
    );
  }
  
  /**
   * Generate image prompts based on article topic and keywords
   */
  public async generateImagePrompts(
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    model: string = 'gpt-4o'
  ): Promise<string[]> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.generateImagePrompts(prompt, title, keywords, model);
    }
    
    // Fallback implementation for non-React contexts
    throw new Error(
      'ArticleAIService.generateImagePrompts cannot be used outside of React components. ' +
      'Please use the useArticleAI hook directly in your React components.'
    );
  }
  
  /**
   * Test a prompt with variables
   */
  public async testPrompt(
    prompt: PromptTemplate,
    variables: Record<string, string>,
    model: string = 'gpt-4o'
  ): Promise<string> {
    this.checkHookInstance();
    
    if (this.hookInstance) {
      return this.hookInstance.testPrompt(prompt, variables, model);
    }
    
    // Direct integration using AI-Core for non-React contexts
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, variables);

      const aiCore = AICore.getInstance();
      if (!aiCore.isConfigured()) {
        throw new Error('No AI provider configured. Please add your API key in the admin settings.');
      }

      const response = await aiCore.sendTextRequest(
        model,
        [
          { role: 'system', content: prompt.systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        {
          temperature: prompt.temperature ?? 0.7,
          maxTokens: prompt.maxTokens
        },
        'article-smasher'
      );

      return AICore.extractContent(response);
    } catch (err) {
      console.error('Error in AI-Core prompt test:', err);
      throw new Error(
        'Failed to test prompt. Please ensure you have configured the AI provider properly in Admin.'
      );
    }
  }
}

// Export the singleton instance
export default ArticleAIServiceFacade.getInstance();

// Also export the class for type checking
export { ArticleAIServiceFacade as ArticleAIService };