import { ReactNode } from 'react';

// Prompt Management Types
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  category: 'topic' | 'keyword' | 'outline' | 'content' | 'image';
  temperature: number;
  topP?: number;
  maxTokens?: number;
  /**
   * Optional model override for this specific prompt
   * - If omitted/undefined: Uses global default model from AI-Core settings
   * - If specified: Uses this model (e.g., 'gpt-4o-mini', 'claude-3-5-sonnet-20241022')
   * - Smart fallback: If specified model is from a different provider than configured
   *   (e.g., 'gpt-4o-mini' when only Anthropic is configured), automatically falls back to default model
   * - Best practice: Specify model for optimization (e.g., 'gpt-4o-mini' for simple tasks),
   *   fallback ensures it still works with any provider
   */
  model?: string;
  reasoningEffort?: 'low' | 'medium' | 'high'; // For reasoning models like GPT-5
  verbosity?: 'low' | 'medium' | 'high'; // Text verbosity for GPT-4o and GPT-5+ models
  createdAt: Date;
  updatedAt: Date;
}

export interface PromptSettings {
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  enabledCategories: ('topic' | 'keyword' | 'outline' | 'content' | 'image')[];
}

// Article Wizard Types
export interface KeywordData {
  keyword: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
}

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  isSelected: boolean;
  type?: string;
  prompt?: string;  // The original prompt used to generate the image
  error?: string;   // Error message if image generation failed
}

export interface OutlineItem {
  id: string;
  title: string;
  level: number;
  children: OutlineItem[];
}

export interface ArticleContent {
  html: string;
  text: string;
  sections: {
    heading: string;
    content: string;
  }[];
}

export interface ArticleData {
  id: string;
  title: string;
  type: string;
  keywords: string[];
  outline: OutlineItem[];
  content: ArticleContent;
  images: ImageItem[];
  createdAt: Date;
  updatedAt: Date;
}

// Context Types
export interface ArticleWizardContextType {
  // Step management
  currentStep: number;
  setCurrentStep: (step: number) => void;
  showComplete: boolean;
  setShowComplete: (show: boolean) => void;
  
  // Article type
  selectedArticleType: string;
  setSelectedArticleType: (type: string) => void;
  isArticleTypeLocked: boolean;
  setIsArticleTypeLocked: (locked: boolean) => void;
  
  // Topic
  title: string;
  setTitle: (title: string) => void;
  selectedTopicIndex: number | null;
  setSelectedTopicIndex: (index: number | null) => void;
  topicSuggestions: string[];
  setTopicSuggestions: (suggestions: string[]) => void;
  
  // Keywords
  selectedKeywords: string[];
  setSelectedKeywords: (keywords: string[]) => void;
  keywords: KeywordData[];
  setKeywords: (keywords: KeywordData[]) => void;
  
  // Outline
  outline: OutlineItem[];
  setOutline: (outline: OutlineItem[]) => void;
  
  // Images
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  
  // Content
  htmlOutput: string;
  setHtmlOutput: (html: string) => void;
  articleContent: ArticleContent | null;
  setArticleContent: (content: ArticleContent | null) => void;
  streamingText: string;
  
  // Generation states
  generating: boolean;
  setGenerating: (generating: boolean) => void;
  isGeneratingIdeas: boolean;
  setIsGeneratingIdeas: (generating: boolean) => void;
  isLoadingKeywords: boolean;
  setIsLoadingKeywords: (loading: boolean) => void;
  
  // Navigation
  goToNextStep: () => void;
  goToPreviousStep: () => void;
  handleStepClick: (step: number) => void;
  
  // Generation functions
  generateTopicIdeas: () => Promise<void>;
  generateKeywords: (topic: string) => Promise<void>;
  generateOutline: (topic: string, keywords: string[]) => Promise<void>;
  generateContent: (
    topic: string,
    keywords: string[],
    outline: OutlineItem[],
    contentSettings?: {
      length?: string;
      tone?: string;
      includeStats?: boolean;
      includeExamples?: boolean;
    }
  ) => Promise<void>;
  generateImages: (topic: string, keywords: string[], imageModel?: string) => Promise<void>;
}

export interface PromptContextType {
  prompts: PromptTemplate[];
  settings: PromptSettings;
  activePrompt: PromptTemplate | null;
  setActivePrompt: (prompt: PromptTemplate | null) => void;
  addPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<PromptTemplate>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  getPromptsByCategory: (category: PromptTemplate['category']) => PromptTemplate[];
  updateSettings: (settings: Partial<PromptSettings>) => Promise<void>;
  testPrompt: (promptId: string, variables: Record<string, string>) => Promise<string>;
  isLoading: boolean;
  isInitialized: boolean; // Added to track when prompts are fully loaded
  error: Error | null;
}