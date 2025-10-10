import { useCallback, useState } from 'react';
import AICore from '../../../../core/AICore';
import { processPromptTemplate } from '../services/promptService';
import {
  PromptTemplate,
  KeywordData,
  OutlineItem,
  ArticleContent
} from '../types';
import {
  parseTopicsFromResponse,
  parseKeywordsFromResponse,
  parseOutlineFromResponse,
  cleanAIResponse
} from '../utils/responseFormatter';

/**
 * Hook for generating article content using AI
 * This uses the new AI-Core system like Task Smasher
 */
export const useArticleAI = () => {
  const [aiCore] = useState(() => AICore.getInstance());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Execute an AI request using AI-Core
   */
  const execute = useCallback(async (options: {
    model?: string;
    systemPrompt: string;
    userPrompt: string;
    temperature?: number;
    maxTokens?: number;
    reasoningEffort?: 'low' | 'medium' | 'high';
    verbosity?: 'low' | 'medium' | 'high';
  }): Promise<{ content: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Check if AI-Core is configured
      if (!aiCore.isConfigured()) {
        throw new Error('No AI provider configured. Please add your API key in the admin settings.');
      }

      // Get the model from AI-Core settings if not specified or empty
      const settings = aiCore.getSettings();
      const modelToUse = (options.model && options.model.trim()) ? options.model : settings.defaultModel;

      console.log('[useArticleAI] Using model:', modelToUse, 'from options:', options.model, 'AI-Core default:', settings.defaultModel);

      // Build request options
      const requestOptions: any = {
        temperature: options.temperature ?? 0.7,
        maxTokens: options.maxTokens || 2000
      };

      // Only add reasoning for models that support it (GPT-5, o1, etc.)
      // and only if reasoningEffort is explicitly provided
      if (options.reasoningEffort && modelToUse.match(/^(gpt-5|o1|o3)/i)) {
        requestOptions.reasoning = { effort: options.reasoningEffort };
        console.log('[useArticleAI] Adding reasoning effort:', options.reasoningEffort, 'for model:', modelToUse);
      }

      // Add text format and verbosity for compatible models (GPT-4o and GPT-5+)
      // Only if verbosity is explicitly provided
      if (options.verbosity && modelToUse.match(/^(gpt-4o|gpt-5|o3|o4)/i)) {
        requestOptions.text = {
          format: { type: 'text' },
          verbosity: options.verbosity
        };
        console.log('[useArticleAI] Adding text verbosity:', options.verbosity, 'for model:', modelToUse);
      }

      // Send request using AI-Core
      const response = await aiCore.sendTextRequest(
        modelToUse,
        [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        requestOptions,
        'article-smasher'
      );

      // Extract content from response
      const content = AICore.extractContent(response);

      return { content };
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [aiCore]);

  /**
   * Generate topic ideas based on article type
   */
  const generateTopics = useCallback(async (
    prompt: PromptTemplate,
    articleType: string,
    subject: string = 'digital marketing',
    model?: string
  ): Promise<string[]> => {
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        articleType,
        niche: subject
      });

      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        reasoningEffort: prompt.reasoningEffort,
        verbosity: prompt.verbosity
      });

      // Parse the result using the robust formatter
      // This handles various formats from different models (GPT-5, GPT-4, O-series, etc.)
      const topics = parseTopicsFromResponse(result.content, 5);

      console.log('[useArticleAI] Generated topics:', topics);

      return topics.length > 0 ? topics : ['No topics generated'];
    } catch (error) {
      console.error('Error generating topics:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Generate keywords based on topic
   */
  const generateKeywords = useCallback(async (
    prompt: PromptTemplate,
    title: string,
    model?: string
  ): Promise<KeywordData[]> => {
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        title
      });

      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        reasoningEffort: prompt.reasoningEffort,
        verbosity: prompt.verbosity
      });

      // Parse the result using the robust formatter
      // This handles various formats from different models
      const keywords = parseKeywordsFromResponse(result.content);

      console.log('[useArticleAI] Parsed keywords:', keywords);
      return keywords.length > 0 ? keywords : [
        { keyword: title, volume: 500, difficulty: 5, cpc: 3.0 }
      ];
    } catch (error) {
      console.error('Error generating keywords:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Generate article outline based on topic and keywords
   */
  const generateOutline = useCallback(async (
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    model?: string
  ): Promise<OutlineItem[]> => {
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        title,
        keywords: keywords.join(', ')
      });

      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        reasoningEffort: prompt.reasoningEffort,
        verbosity: prompt.verbosity
      });

      // Parse the result using the robust formatter
      const outline = parseOutlineFromResponse(result.content);

      console.log('[useArticleAI] Parsed outline:', outline);

      return outline.length > 0 ? outline : [
        { id: 'intro', title: 'Introduction', level: 1, children: [] },
        { id: 'main', title: 'Main Content', level: 1, children: [] },
        { id: 'conclusion', title: 'Conclusion', level: 1, children: [] }
      ];
    } catch (error) {
      console.error('Error generating outline:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Generate article content based on outline and keywords
   */
  const generateContent = useCallback(async (
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    outline: OutlineItem[],
    model?: string,
    contentSettings?: {
      length?: string;
      tone?: string;
      includeStats?: boolean;
      includeExamples?: boolean;
    }
  ): Promise<ArticleContent> => {
    try {
      // Convert outline to text format
      const outlineText = outlineToText(outline);

      // Build additional instructions based on content settings
      let additionalInstructions = '';
      if (contentSettings) {
        if (contentSettings.length) {
          const lengthMap: Record<string, string> = {
            'short': 'approximately 500 words',
            'medium': 'approximately 1000 words',
            'long': 'approximately 1500 words',
            'comprehensive': 'approximately 2000+ words'
          };
          additionalInstructions += `The article should be ${lengthMap[contentSettings.length] || 'medium length'}. `;
        }
        if (contentSettings.tone) {
          additionalInstructions += `Write in a ${contentSettings.tone} tone. `;
        }
        if (contentSettings.includeStats) {
          additionalInstructions += 'Include relevant statistics and data points to support your arguments. ';
        }
        if (contentSettings.includeExamples) {
          additionalInstructions += 'Include practical examples and case studies to illustrate key points. ';
        }
      }

      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        title,
        keywords: keywords.join(', '),
        outline: outlineText
      }) + (additionalInstructions ? `\n\nAdditional requirements: ${additionalInstructions}` : '');

      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens,
        reasoningEffort: prompt.reasoningEffort,
        verbosity: prompt.verbosity
      });

      // Clean the response before parsing
      const cleanedContent = cleanAIResponse(result.content);

      // Parse the result into article content
      return parseContentFromText(cleanedContent);
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Generate image prompts based on article topic and keywords
   * Uses a simpler execution without reasoning to avoid token limits
   */
  const generateImagePrompts = useCallback(async (
    prompt: PromptTemplate,
    title: string,
    keywords: string[],
    model?: string
  ): Promise<string[]> => {
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        title,
        keywords: keywords.join(', ')
      });

      // Get the model from AI-Core settings if not specified
      const settings = aiCore.getSettings();
      const modelToUse = (model && model.trim()) ? model : settings.defaultModel;

      // Build request options
      const requestOptions: any = {
        temperature: prompt.temperature ?? 0.8,
        maxTokens: prompt.maxTokens || 1000
        // No reasoning parameter for simple prompt generation
      };

      // Add text verbosity for compatible models if specified
      if (prompt.verbosity && modelToUse.match(/^(gpt-4o|gpt-5|o3|o4)/i)) {
        requestOptions.text = {
          format: { type: 'text' },
          verbosity: prompt.verbosity
        };
      }

      // Execute directly without reasoning to avoid token limits
      const response = await aiCore.sendTextRequest(
        modelToUse,
        [
          { role: 'system', content: prompt.systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        requestOptions,
        'article-smasher-image-prompts'
      );

      const content = AICore.extractContent(response);

      // Parse the result using the robust formatter
      const { parseListFromResponse } = await import('../utils/responseFormatter');
      const prompts = parseListFromResponse(content, {
        maxItems: 3,
        minLength: 10,
        removeFormatting: true
      });

      console.log('[useArticleAI] Parsed image prompts:', prompts);

      return prompts.length > 0 ? prompts : [
        `Professional illustration of ${title}`,
        `Modern graphic representing ${keywords[0] || title}`,
        `High-quality image showcasing ${title}`
      ];
    } catch (error) {
      console.error('Error generating image prompts:', error);
      throw error;
    }
  }, [aiCore]);

  /**
   * Test a prompt with variables
   */
  const testPrompt = useCallback(async (
    prompt: PromptTemplate,
    variables: Record<string, string>,
    model: string = 'gpt-4o'
  ): Promise<string> => {
    try {
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, variables);
      
      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens
      });
      
      return result.content;
    } catch (error) {
      console.error('Error testing prompt:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Convert outline to text format
   */
  const outlineToText = (outline: OutlineItem[], level: number = 0): string => {
    let result = '';

    outline.forEach((item) => {
      // Use clean markdown headings without numbering to avoid outline-style outputs
      const heading = level === 0 ? '##' : '###';
      result += `${heading} ${item.title}\n`;

      // Add children recursively
      if (item.children.length > 0) {
        result += outlineToText(item.children, level + 1);
      }
    });

    return result;
  };

  /**
   * Parse content from text
   * This is a simplified implementation - in a real-world scenario,
   * you would need more robust parsing based on the AI's response format
   */
  const parseContentFromText = (text: string): ArticleContent => {
    // Split the content into sections based on headings
    const sections: { heading: string; content: string }[] = [];
    let currentHeading = '';
    let currentContent = '';
    
    // Simple regex to identify headings (lines starting with # or lines with === or --- underneath)
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if this line is a heading
      const isHeading = line.startsWith('#') || 
                        (i < lines.length - 1 && (lines[i + 1].startsWith('===') || lines[i + 1].startsWith('---')));
      
      if (isHeading) {
        // Save the previous section if it exists
        if (currentHeading) {
          sections.push({
            heading: currentHeading,
            content: currentContent.trim()
          });
        }
        
        // Extract the heading text
        currentHeading = line.replace(/^#+\s+/, '').trim();
        
        // Skip the next line if it's a heading underline
        if (i < lines.length - 1 && (lines[i + 1].startsWith('===') || lines[i + 1].startsWith('---'))) {
          i++;
        }
        
        currentContent = '';
      } else {
        // Add to the current content
        currentContent += line + '\n';
      }
    }
    
    // Add the last section
    if (currentHeading) {
      sections.push({
        heading: currentHeading,
        content: currentContent.trim()
      });
    }
    
    // Convert to HTML
    const html = convertToHtml(text);
    
    return {
      html,
      text,
      sections
    };
  };

  /**
   * Convert markdown text to HTML
   * This is a simplified implementation - in a real-world scenario,
   * you would use a proper markdown parser
   */
  const convertToHtml = (text: string): string => {
    let html = '';
    const lines = text.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Skip empty lines
      if (!line.trim()) {
        html += '<br>\n';
        continue;
      }
      
      // Check for headings
      if (line.startsWith('#')) {
        const headingMatch = line.match(/^#+/);
        const level = headingMatch ? headingMatch[0].length : 1;
        const content = line.replace(/^#+\s+/, '');
        html += `<h${level}>${content}</h${level}>\n`;
        continue;
      }
      
      // Check for underlined headings
      if (i < lines.length - 1) {
        if (lines[i + 1].startsWith('===')) {
          html += `<h1>${line}</h1>\n`;
          i++; // Skip the next line
          continue;
        } else if (lines[i + 1].startsWith('---')) {
          html += `<h2>${line}</h2>\n`;
          i++; // Skip the next line
          continue;
        }
      }
      
      // Check for lists
      if (line.match(/^\s*[-*+]\s/)) {
        const content = line.replace(/^\s*[-*+]\s/, '');
        html += `<li>${content}</li>\n`;
        continue;
      }
      
      // Check for numbered lists
      if (line.match(/^\s*\d+\.\s/)) {
        const content = line.replace(/^\s*\d+\.\s/, '');
        html += `<li>${content}</li>\n`;
        continue;
      }
      
      // Regular paragraph
      html += `<p>${line}</p>\n`;
    }
    
    return html;
  };

  return {
    generateTopics,
    generateKeywords,
    generateOutline,
    generateContent,
    generateImagePrompts,
    testPrompt,
    isLoading,
    error
  };
};

export default useArticleAI;