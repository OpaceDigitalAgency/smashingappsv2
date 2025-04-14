import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ARTICLE_TYPES } from '../components/ArticleTypeSidebar';

// Define types
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

interface ArticleWizardContextType {
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
  
  // Keywords
  selectedKeywords: string[];
  setSelectedKeywords: (keywords: string[]) => void;
  keywords: KeywordData[];
  setKeywords: (keywords: KeywordData[]) => void;
  
  // Images
  images: ImageItem[];
  setImages: (images: ImageItem[]) => void;
  
  // Content
  htmlOutput: string;
  setHtmlOutput: (html: string) => void;
  
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
  generateTopicIdeas: () => void;
}

const ArticleWizardContext = createContext<ArticleWizardContextType | null>(null);

export const ArticleWizardProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  
  // Article type
  const [selectedArticleType, setSelectedArticleType] = useState('blog-post');
  const [isArticleTypeLocked, setIsArticleTypeLocked] = useState(false);
  
  // Topic
  const [title, setTitle] = useState('');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  
  // Keywords
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['wordpress ai content generator', 'gpt for wordpress']);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  
  // Images
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: 'img1',
      url: 'https://images.unsplash.com/photo-1559028012-481c04fa702d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      alt: 'WordPress with AI',
      caption: 'AI-powered WordPress content creation',
      isSelected: true,
      type: 'featured'
    },
    {
      id: 'img2',
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=500&q=80',
      alt: 'AI Content Generation',
      caption: 'Next-generation content creation with AI',
      isSelected: false,
      type: 'section'
    }
  ]);
  
  // Content
  const [htmlOutput, setHtmlOutput] = useState('');
  
  // Generation states
  const [generating, setGenerating] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  
  // Topic suggestions
  const [topicSuggestions, setTopicSuggestions] = useState([
    "How to Optimize WordPress for Speed", 
    "Ultimate Guide to WordPress Security", 
    "Top 10 WordPress Themes for Business",
    "WordPress vs Headless CMS Comparison"
  ]);
  
  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowComplete(true);
    }
  };
  
  const goToPreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };
  
  const handleStepClick = (step: number) => {
    // Allow navigation to any step
    setCurrentStep(step);
  };
  
  // Generate topic ideas based on the selected article type
  const generateTopicIdeas = () => {
    setIsGeneratingIdeas(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Get the selected article type label
      const selectedType = ARTICLE_TYPES.find(type => type.value === selectedArticleType);
      
      // Generate topic suggestions based on the article type
      let newSuggestions: string[] = [];
      
      switch (selectedArticleType) {
        case 'blog-post':
          newSuggestions = [
            "10 Essential WordPress Plugins for Bloggers in 2025",
            "How to Increase Blog Traffic Using AI Tools",
            "The Ultimate Guide to WordPress Blog Monetization",
            "7 Blog Writing Tips to Engage Your Audience"
          ];
          break;
        case 'seo-article':
          newSuggestions = [
            "SEO Best Practices for WordPress Websites in 2025",
            "How to Optimize WordPress Content for Featured Snippets",
            "Local SEO Strategies for Small Business Websites",
            "Technical SEO Checklist for WordPress Sites"
          ];
          break;
        case 'academic-paper':
          newSuggestions = [
            "The Impact of AI on Content Creation: A Systematic Review",
            "Analyzing User Engagement Metrics in Digital Publishing",
            "Comparative Study of Content Management Systems in Higher Education",
            "Ethical Considerations in AI-Generated Academic Content"
          ];
          break;
        case 'news-article':
          newSuggestions = [
            "Breaking: WordPress Releases Major Security Update",
            "New AI Content Tools Revolutionize Digital Publishing",
            "WordPress Market Share Reaches Record High in 2025",
            "Google Algorithm Update Impacts WordPress Sites: What to Know"
          ];
          break;
        default:
          newSuggestions = [
            `${selectedType?.label} about WordPress and AI Integration`,
            `${selectedType?.label} on Content Creation Best Practices`,
            `${selectedType?.label} for Digital Marketing Strategy`,
            `${selectedType?.label} on SEO Optimization Techniques`
          ];
      }
      
      // Update the topic suggestions
      setTopicSuggestions(newSuggestions);
      
      // Reset states
      setIsGeneratingIdeas(false);
      setSelectedTopicIndex(null);
      setTitle('');
    }, 1500);
  };
  
  return (
    <ArticleWizardContext.Provider value={{
      // Step management
      currentStep, setCurrentStep,
      showComplete, setShowComplete,
      
      // Article type
      selectedArticleType, setSelectedArticleType,
      isArticleTypeLocked, setIsArticleTypeLocked,
      
      // Topic
      title, setTitle,
      selectedTopicIndex, setSelectedTopicIndex,
      
      // Keywords
      selectedKeywords, setSelectedKeywords,
      keywords, setKeywords,
      
      // Images
      images, setImages,
      
      // Content
      htmlOutput, setHtmlOutput,
      
      // Generation states
      generating, setGenerating,
      isGeneratingIdeas, setIsGeneratingIdeas,
      isLoadingKeywords, setIsLoadingKeywords,
      
      // Navigation
      goToNextStep,
      goToPreviousStep,
      handleStepClick,
      
      // Generation functions
      generateTopicIdeas
    }}>
      {children}
    </ArticleWizardContext.Provider>
  );
};

export const useArticleWizard = () => {
  const context = useContext(ArticleWizardContext);
  if (!context) {
    throw new Error('useArticleWizard must be used within an ArticleWizardProvider');
  }
  return context;
};