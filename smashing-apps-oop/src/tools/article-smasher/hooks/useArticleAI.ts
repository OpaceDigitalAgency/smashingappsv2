import { useCallback, useState } from 'react';
import AICore from '../../../../core/AICore';
import { processPromptTemplate } from '../services/promptService';
import {
  PromptTemplate,
  KeywordData,
  OutlineItem,
  ArticleContent
} from '../types';

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

      // Send request using AI-Core
      const response = await aiCore.sendTextRequest(
        modelToUse,
        [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: options.userPrompt }
        ],
        {
          temperature: options.temperature ?? 0.7,
          maxTokens: options.maxTokens || 2000
        },
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
        maxTokens: prompt.maxTokens
      });
      
      // Parse the result into an array of topics
      const topics = result.content
        .split(/\d+\./)
        .map(topic => topic.trim())
        .filter(topic => topic.length > 0);
      
      return topics;
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
        maxTokens: prompt.maxTokens
      });

      // Parse the result into keyword data
      // The AI returns keywords in a numbered list format like:
      // 1. **AI SEO Tools**
      //    - **Search Volume**: Medium
      //    - **Difficulty Score**: 6
      //    - **CPC Value**: $5.50

      const keywords: KeywordData[] = [];
      const lines = result.content.split('\n');

      let currentKeyword: Partial<KeywordData> | null = null;

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Check if this is a numbered keyword line (e.g., "1. **AI SEO Tools**" or "1. AI SEO Tools")
        const keywordMatch = trimmed.match(/^\d+\.\s+\*?\*?(.+?)\*?\*?$/);
        if (keywordMatch) {
          // Save previous keyword if exists
          if (currentKeyword && currentKeyword.keyword) {
            keywords.push({
              keyword: currentKeyword.keyword,
              volume: currentKeyword.volume ?? 500,
              difficulty: currentKeyword.difficulty ?? 5,
              cpc: currentKeyword.cpc ?? 3.0
            });
          }

          // Start new keyword
          currentKeyword = {
            keyword: keywordMatch[1].trim(),
            volume: 500,
            difficulty: 5,
            cpc: 3.0
          };
          continue;
        }

        // Check for metadata lines (Search Volume, Difficulty Score, CPC Value)
        if (currentKeyword) {
          const volumeMatch = trimmed.match(/Search Volume[:\s]+(\w+)/i);
          if (volumeMatch) {
            const vol = volumeMatch[1].toLowerCase();
            currentKeyword.volume = vol === 'high' ? 1000 : vol === 'medium' ? 500 : 100;
            continue;
          }

          const difficultyMatch = trimmed.match(/Difficulty Score[:\s]+(\d+)/i);
          if (difficultyMatch) {
            currentKeyword.difficulty = parseInt(difficultyMatch[1]);
            continue;
          }

          const cpcMatch = trimmed.match(/CPC Value[:\s]+\$?(\d+\.?\d*)/i);
          if (cpcMatch) {
            currentKeyword.cpc = parseFloat(cpcMatch[1]);
            continue;
          }
        }
      }

      // Don't forget the last keyword
      if (currentKeyword && currentKeyword.keyword) {
        keywords.push({
          keyword: currentKeyword.keyword,
          volume: currentKeyword.volume ?? 500,
          difficulty: currentKeyword.difficulty ?? 5,
          cpc: currentKeyword.cpc ?? 3.0
        });
      }

      console.log('[useArticleAI] Parsed keywords:', keywords);
      return keywords;
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
        maxTokens: prompt.maxTokens
      });
      
      // Parse the result into outline items
      return parseOutlineFromText(result.content);
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
        maxTokens: prompt.maxTokens
      });

      // Parse the result into article content
      return parseContentFromText(result.content);
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }, [execute]);

  /**
   * Generate image prompts based on article topic and keywords
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
      
      // Execute the AI request
      const result = await execute({
        model,
        systemPrompt: prompt.systemPrompt,
        userPrompt,
        temperature: prompt.temperature,
        maxTokens: prompt.maxTokens
      });
      
      // Parse the result into image prompts
      const promptLines = result.content.split(/\d+\./)
        .map(line => line.trim())
        .filter(line => line.length > 0);
      
      return promptLines;
    } catch (error) {
      console.error('Error generating image prompts:', error);
      throw error;
    }
  }, [execute]);

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
   * Parse outline from text
   * This is a simplified implementation - in a real-world scenario,
   * you would need more robust parsing based on the AI's response format
   */
  const parseOutlineFromText = (text: string): OutlineItem[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const outline: OutlineItem[] = [];
    const stack: OutlineItem[] = [];
    
    lines.forEach(line => {
      const trimmedLine = line.trim();
      
      // Skip lines that don't look like outline items
      if (!trimmedLine.match(/^[I\d]+\.|^[A-Z]\.|^•|^-|^Introduction|^Conclusion/i)) {
        return;
      }
      
      // Determine the level based on indentation or numbering
      let level = 1;
      if (trimmedLine.match(/^\s+/)) {
        level = Math.ceil(trimmedLine.match(/^\s+/)![0].length / 2);
      } else if (trimmedLine.match(/^[A-Z]\./)) {
        level = 2;
      } else if (trimmedLine.match(/^[a-z]\./)) {
        level = 3;
      } else if (trimmedLine.match(/^•|^-/)) {
        level = stack.length > 0 ? stack[stack.length - 1].level + 1 : 2;
      }
      
      // Extract the title (remove numbering/bullets but preserve internal spaces)
      const title = trimmedLine
        .replace(/^[I\d]+\.\s*/, '')  // Remove Roman/Arabic numerals with dot
        .replace(/^[A-Za-z]\.\s*/, '') // Remove letter with dot
        .replace(/^[•\-\*]\s*/, '')    // Remove bullets/dashes
        .trim();
      
      const item: OutlineItem = {
        id: `outline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        level,
        children: []
      };
      
      // Add to the appropriate parent based on level
      if (level === 1) {
        outline.push(item);
        stack.length = 0;
        stack.push(item);
      } else {
        // Find the appropriate parent
        while (stack.length > 0 && stack[stack.length - 1].level >= level) {
          stack.pop();
        }
        
        if (stack.length === 0) {
          outline.push(item);
        } else {
          stack[stack.length - 1].children.push(item);
        }
        
        stack.push(item);
      }
    });
    
    return outline;
  };

  /**
   * Convert outline to text format
   */
  const outlineToText = (outline: OutlineItem[], level: number = 0): string => {
    let result = '';
    
    outline.forEach((item, index) => {
      // Add indentation based on level
      const indent = '  '.repeat(level);
      
      // Add numbering based on level
      let prefix = '';
      if (level === 0) {
        prefix = `${index + 1}. `;
      } else if (level === 1) {
        prefix = `${String.fromCharCode(97 + index)}. `;
      } else {
        prefix = '• ';
      }
      
      // Add the item title
      result += `${indent}${prefix}${item.title}\n`;
      
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