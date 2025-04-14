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
  maxTokens?: number;
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
  volume: number;
  difficulty: number;
  cpc: number;
}

export interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  isSelected: boolean;
  type?: string;
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
  generateContent: (topic: string, keywords: string[], outline: OutlineItem[]) => Promise<void>;
  generateImages: (topic: string, keywords: string[]) => Promise<void>;
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
  error: Error | null;
}