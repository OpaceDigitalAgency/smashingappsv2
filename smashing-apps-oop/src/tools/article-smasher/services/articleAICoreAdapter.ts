/**
 * Article AI Core Adapter
 *
 * This adapter bridges the original Article Smasher AI service interface
 * with the new AI-Core system, allowing seamless integration without
 * rewriting all the existing code.
 */

import AICore from '../../../../core/AICore';
import { Message } from '../../../../core/interfaces/IProvider';
import { PromptTemplate, KeywordData, OutlineItem, ArticleContent } from '../types';
import {
  parseTopicsFromResponse,
  parseKeywordsFromResponse,
  parseOutlineFromResponse,
  parseListFromResponse,
  cleanAIResponse
} from '../utils/responseFormatter';

class ArticleAICoreAdapter {
  private aiCore: AICore;
  private appId = 'article-smasher';

  constructor() {
    this.aiCore = AICore.getInstance();
  }

  /**
   * Check if AI-Core is configured
   */
  isConfigured(): boolean {
    return this.aiCore.isConfigured();
  }

  /**
   * Generate topic ideas based on article type
   */
  async generateTopics(
    promptTemplate: PromptTemplate,
    articleType: string,
    niche: string,
    model: string
  ): Promise<string[]> {
    try {
      // Build the prompt
      const userPrompt = promptTemplate.userPromptTemplate
        .replace('{articleType}', articleType)
        .replace('{niche}', niche);

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      // Send request to AI-Core
      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 1000
        },
        this.appId
      );

      // Extract content
      const content = AICore.extractContent(response);

      // Parse the response using the robust formatter
      const topics = parseTopicsFromResponse(content, 5);

      return topics.length > 0 ? topics : [
        `${articleType} about ${niche}`,
        `Complete Guide to ${niche}`,
        `${niche}: Best Practices and Tips`,
        `How to Master ${niche}`
      ];
    } catch (error) {
      console.error('Error generating topics:', error);
      throw error;
    }
  }

  /**
   * Generate keywords for a topic
   */
  async generateKeywords(
    promptTemplate: PromptTemplate,
    topic: string,
    model: string
  ): Promise<KeywordData[]> {
    try {
      const userPrompt = promptTemplate.userPromptTemplate
        .replace('{topic}', topic);

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 1000
        },
        this.appId
      );

      const content = AICore.extractContent(response);

      // Try to parse JSON response first
      try {
        const parsed = JSON.parse(content);
        if (Array.isArray(parsed)) {
          return parsed.map((item: any) => ({
            keyword: item.keyword || item.term || item,
            volume: item.volume || Math.floor(Math.random() * 1000) + 100,
            difficulty: item.difficulty || Math.floor(Math.random() * 10) + 1,
            cpc: item.cpc || (Math.random() * 3).toFixed(2)
          }));
        }
      } catch (e) {
        // If not JSON, parse using the robust formatter
        const keywords = parseKeywordsFromResponse(content);
        if (keywords.length > 0) {
          return keywords;
        }
      }

      // Fallback
      return [
        { keyword: topic, volume: 1000, difficulty: 5, cpc: 2.0 }
      ];
    } catch (error) {
      console.error('Error generating keywords:', error);
      throw error;
    }
  }

  /**
   * Generate article outline
   */
  async generateOutline(
    promptTemplate: PromptTemplate,
    topic: string,
    keywords: string[],
    model: string
  ): Promise<OutlineItem[]> {
    try {
      const userPrompt = promptTemplate.userPromptTemplate
        .replace('{topic}', topic)
        .replace('{keywords}', keywords.join(', '));

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 2000
        },
        this.appId
      );

      const content = AICore.extractContent(response);

      // Parse outline using the robust formatter
      const outline = parseOutlineFromResponse(content);

      return outline.length > 0 ? outline : [
        { id: 'intro', title: 'Introduction', level: 1, children: [] },
        { id: 'main', title: 'Main Content', level: 1, children: [] },
        { id: 'conclusion', title: 'Conclusion', level: 1, children: [] }
      ];
    } catch (error) {
      console.error('Error generating outline:', error);
      throw error;
    }
  }

  /**
   * Generate article content
   */
  async generateContent(
    promptTemplate: PromptTemplate,
    topic: string,
    keywords: string[],
    outline: OutlineItem[],
    model: string
  ): Promise<ArticleContent> {
    try {
      const outlineText = this.outlineToText(outline);
      
      const userPrompt = promptTemplate.userPromptTemplate
        .replace('{topic}', topic)
        .replace('{keywords}', keywords.join(', '))
        .replace('{outline}', outlineText);

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 4000
        },
        this.appId
      );

      const rawContent = AICore.extractContent(response);

      // Clean the response before processing
      const html = cleanAIResponse(rawContent);
      const text = html.replace(/<[^>]*>/g, '');

      // Extract sections
      const sections = this.extractSections(html);

      return {
        html,
        text,
        sections
      };
    } catch (error) {
      console.error('Error generating content:', error);
      throw error;
    }
  }

  /**
   * Generate image prompts
   */
  async generateImagePrompts(
    promptTemplate: PromptTemplate,
    topic: string,
    keywords: string[],
    model: string
  ): Promise<string[]> {
    try {
      const userPrompt = promptTemplate.userPromptTemplate
        .replace('{topic}', topic)
        .replace('{keywords}', keywords.join(', '));

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 1000
        },
        this.appId
      );

      const content = AICore.extractContent(response);

      // Parse image prompts using the robust formatter
      const prompts = parseListFromResponse(content, {
        maxItems: 3,
        minLength: 10,
        removeFormatting: true
      });

      return prompts.length > 0 ? prompts : [
        `Professional illustration of ${topic}`,
        `Modern graphic representing ${keywords[0] || topic}`,
        `High-quality image showcasing ${topic}`
      ];
    } catch (error) {
      console.error('Error generating image prompts:', error);
      throw error;
    }
  }

  /**
   * Test a prompt with variables
   */
  async testPrompt(
    promptTemplate: PromptTemplate,
    variables: Record<string, string>,
    model: string
  ): Promise<string> {
    try {
      let userPrompt = promptTemplate.userPromptTemplate;
      
      // Replace all variables
      Object.keys(variables).forEach(key => {
        userPrompt = userPrompt.replace(`{${key}}`, variables[key]);
      });

      const messages: Message[] = [
        {
          role: 'system',
          content: promptTemplate.systemPrompt
        },
        {
          role: 'user',
          content: userPrompt
        }
      ];

      const response = await this.aiCore.sendTextRequest(
        model,
        messages,
        {
          temperature: promptTemplate.temperature,
          max_tokens: promptTemplate.maxTokens || 1000
        },
        this.appId
      );

      return AICore.extractContent(response);
    } catch (error) {
      console.error('Error testing prompt:', error);
      throw error;
    }
  }

  // Helper methods

  private outlineToText(outline: OutlineItem[]): string {
    let text = '';
    outline.forEach(item => {
      text += `${'#'.repeat(item.level)} ${item.title}\n`;
      if (item.children.length > 0) {
        item.children.forEach(child => {
          text += `${'#'.repeat(child.level)} ${child.title}\n`;
        });
      }
    });
    return text;
  }

  private extractSections(html: string): Array<{ heading: string; content: string }> {
    const sections: Array<{ heading: string; content: string }> = [];
    const headingRegex = /<h[1-3]>(.*?)<\/h[1-3]>/gi;
    const matches = html.match(headingRegex);

    if (matches) {
      matches.forEach(match => {
        const heading = match.replace(/<\/?h[1-3]>/gi, '');
        sections.push({ heading, content: '' });
      });
    }

    return sections;
  }
}

// Export singleton instance
export default new ArticleAICoreAdapter();

