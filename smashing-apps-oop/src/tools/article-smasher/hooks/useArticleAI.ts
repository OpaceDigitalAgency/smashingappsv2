import { useCallback } from 'react';
import { useAI } from '../../../shared/hooks/useAI';
import { processPromptTemplate } from '../services/promptService';
import { 
  PromptTemplate, 
  KeywordData, 
  OutlineItem, 
  ArticleContent
} from '../types';

/**
 * Hook for generating article content using AI
 * This properly integrates with the shared AI services
 */
export const useArticleAI = () => {
  const { execute, isLoading, error } = useAI();

  /**
   * Generate topic ideas based on article type
   */
  const generateTopics = useCallback(async (
    prompt: PromptTemplate,
    articleType: string,
    subject: string = 'digital marketing',
    model: string = 'gpt-4o'
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
    model: string = 'gpt-4o'
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
      const keywordLines = result.content.split('\n').filter(line => line.trim().length > 0);
      
      const keywords: KeywordData[] = keywordLines.map(line => {
        // Extract keyword and metrics using regex
        const keywordMatch = line.match(/^(.*?)(?:\s*-\s*|:\s*)/);
        const volumeMatch = line.match(/volume:\s*(high|medium|low)/i);
        const difficultyMatch = line.match(/difficulty:\s*(\d+)/i);
        const cpcMatch = line.match(/cpc:\s*(\d+\.?\d*)/i);
        
        return {
          keyword: keywordMatch ? keywordMatch[1].trim() : line.trim(),
          volume: volumeMatch ? 
            (volumeMatch[1].toLowerCase() === 'high' ? 1000 : 
             volumeMatch[1].toLowerCase() === 'medium' ? 500 : 100) : 
            Math.floor(Math.random() * 1000),
          difficulty: difficultyMatch ? parseInt(difficultyMatch[1]) : Math.floor(Math.random() * 10) + 1,
          cpc: cpcMatch ? parseFloat(cpcMatch[1]) : Math.random() * 5
        };
      });
      
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
    model: string = 'gpt-4o'
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
    model: string = 'gpt-4o'
  ): Promise<ArticleContent> => {
    try {
      // Convert outline to text format
      const outlineText = outlineToText(outline);
      
      // Process the prompt template
      const userPrompt = processPromptTemplate(prompt.userPromptTemplate, {
        title,
        keywords: keywords.join(', '),
        outline: outlineText
      });
      
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
    model: string = 'gpt-4o'
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
      
      // Extract the title (remove numbering/bullets)
      const title = trimmedLine.replace(/^[I\d]+\.|^[A-Za-z]\.|^•|^-|\s+/g, '').trim();
      
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