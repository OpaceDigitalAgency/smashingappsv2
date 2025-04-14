import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ARTICLE_TYPES } from '../components/ArticleTypeSidebar';
import { usePrompt } from './PromptContext';
import articleAIService from '../services/articleAIService';
import { KeywordData, ImageItem, OutlineItem, ArticleContent, ArticleWizardContextType } from '../types';

const ArticleWizardContext = createContext<ArticleWizardContextType | null>(null);

export const ArticleWizardProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { prompts, settings } = usePrompt();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showComplete, setShowComplete] = useState(false);
  
  // Article type
  const [selectedArticleType, setSelectedArticleType] = useState('blog-post');
  const [isArticleTypeLocked, setIsArticleTypeLocked] = useState(false);
  
  // Topic
  const [title, setTitle] = useState('');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>([
    "How to Optimize WordPress for Speed", 
    "Ultimate Guide to WordPress Security", 
    "Top 10 WordPress Themes for Business",
    "WordPress vs Headless CMS Comparison"
  ]);
  
  // Keywords
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  
  // Outline
  const [outline, setOutline] = useState<OutlineItem[]>([]);
  
  // Images
  const [images, setImages] = useState<ImageItem[]>([]);
  
  // Content
  const [htmlOutput, setHtmlOutput] = useState('');
  const [articleContent, setArticleContent] = useState<ArticleContent | null>(null);
  
  // Generation states
  const [generating, setGenerating] = useState(false);
  const [isGeneratingIdeas, setIsGeneratingIdeas] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  
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
    // Reset showComplete when navigating to any step
    if (showComplete) {
      setShowComplete(false);
    }
  };
  
  // Generate topic ideas based on the selected article type
  const generateTopicIdeas = async () => {
    try {
      setIsGeneratingIdeas(true);
      
      // Get the topic prompt template
      const topicPrompts = prompts.filter(p => p.category === 'topic');
      
      if (topicPrompts.length === 0) {
        throw new Error('No topic prompt templates found');
      }
      
      // Get the selected article type label
      const selectedType = ARTICLE_TYPES.find(type => type.value === selectedArticleType);
      
      // Generate topics using AI
      const topics = await articleAIService.generateTopics(
        topicPrompts[0],
        selectedType?.label || selectedArticleType,
        'digital marketing',
        settings.defaultModel
      );
      
      // Update the topic suggestions
      setTopicSuggestions(topics);
      
      // Reset states
      setSelectedTopicIndex(null);
      setTitle('');
    } catch (error) {
      console.error('Error generating topic ideas:', error);
      // Fallback to default topics if AI generation fails
      setTopicSuggestions([
        `${selectedArticleType} about WordPress and AI Integration`,
        `${selectedArticleType} on Content Creation Best Practices`,
        `${selectedArticleType} for Digital Marketing Strategy`,
        `${selectedArticleType} on SEO Optimization Techniques`
      ]);
    } finally {
      setIsGeneratingIdeas(false);
    }
  };
  
  // Generate keywords based on the selected topic
  const generateKeywords = async (topic: string) => {
    try {
      setIsLoadingKeywords(true);
      
      // Get the keyword prompt template
      const keywordPrompts = prompts.filter(p => p.category === 'keyword');
      
      if (keywordPrompts.length === 0) {
        throw new Error('No keyword prompt templates found');
      }
      
      // Generate keywords using AI
      const generatedKeywords = await articleAIService.generateKeywords(
        keywordPrompts[0],
        topic,
        settings.defaultModel
      );
      
      // Update the keywords
      setKeywords(generatedKeywords);
      
      // Select the top 3 keywords by default
      setSelectedKeywords(generatedKeywords.slice(0, 3).map(k => k.keyword));
    } catch (error) {
      console.error('Error generating keywords:', error);
      // Fallback to default keywords if AI generation fails
      setKeywords([
        { keyword: 'wordpress', volume: 1000, difficulty: 8, cpc: 2.5 },
        { keyword: 'content creation', volume: 800, difficulty: 6, cpc: 1.8 },
        { keyword: 'ai tools', volume: 600, difficulty: 5, cpc: 1.2 },
        { keyword: 'digital marketing', volume: 900, difficulty: 7, cpc: 2.0 }
      ]);
      setSelectedKeywords(['wordpress', 'content creation', 'ai tools']);
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  // Generate outline based on topic and keywords
  const generateOutline = async (topic: string, keywords: string[]) => {
    try {
      setGenerating(true);
      
      // Get the outline prompt template
      const outlinePrompts = prompts.filter(p => p.category === 'outline');
      
      if (outlinePrompts.length === 0) {
        throw new Error('No outline prompt templates found');
      }
      
      // Generate outline using AI
      const generatedOutline = await articleAIService.generateOutline(
        outlinePrompts[0],
        topic,
        keywords,
        settings.defaultModel
      );
      
      // Update the outline
      setOutline(generatedOutline);
    } catch (error) {
      console.error('Error generating outline:', error);
      // Fallback to default outline if AI generation fails
      setOutline([
        {
          id: 'intro',
          title: 'Introduction',
          level: 1,
          children: []
        },
        {
          id: 'section1',
          title: 'Understanding the Basics',
          level: 1,
          children: [
            {
              id: 'section1-1',
              title: 'Key Concepts',
              level: 2,
              children: []
            },
            {
              id: 'section1-2',
              title: 'Benefits and Advantages',
              level: 2,
              children: []
            }
          ]
        },
        {
          id: 'section2',
          title: 'Implementation Strategies',
          level: 1,
          children: []
        },
        {
          id: 'conclusion',
          title: 'Conclusion',
          level: 1,
          children: []
        }
      ]);
    } finally {
      setGenerating(false);
    }
  };
  
  // Generate content based on outline and keywords
  const generateContent = async (topic: string, keywords: string[], outline: OutlineItem[]) => {
    try {
      setGenerating(true);
      
      // Get the content prompt template
      const contentPrompts = prompts.filter(p => p.category === 'content');
      
      if (contentPrompts.length === 0) {
        throw new Error('No content prompt templates found');
      }
      
      // Generate content using AI
      const generatedContent = await articleAIService.generateContent(
        contentPrompts[0],
        topic,
        keywords,
        outline,
        settings.defaultModel
      );
      
      // Update the content
      setArticleContent(generatedContent);
      setHtmlOutput(generatedContent.html);
    } catch (error) {
      console.error('Error generating content:', error);
      // Fallback to default content if AI generation fails
      const defaultContent = `
        <h1>${topic}</h1>
        <p>This is a placeholder article about ${topic}. It would normally include information about ${keywords.join(', ')}.</p>
        <h2>Introduction</h2>
        <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, nisl eget ultricies tincidunt.</p>
        <h2>Main Content</h2>
        <p>Detailed information would go here, covering all the key points from the outline.</p>
        <h2>Conclusion</h2>
        <p>In conclusion, this article has covered the important aspects of ${topic}.</p>
      `;
      
      setHtmlOutput(defaultContent);
      setArticleContent({
        html: defaultContent,
        text: defaultContent.replace(/<[^>]*>/g, ''),
        sections: [
          { heading: 'Introduction', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.' },
          { heading: 'Main Content', content: 'Detailed information would go here, covering all the key points from the outline.' },
          { heading: 'Conclusion', content: `In conclusion, this article has covered the important aspects of ${topic}.` }
        ]
      });
    } finally {
      setGenerating(false);
    }
  };
  
  // Generate image prompts based on topic and keywords
  const generateImages = async (topic: string, keywords: string[]) => {
    try {
      setGenerating(true);
      
      // Get the image prompt template
      const imagePrompts = prompts.filter(p => p.category === 'image');
      
      if (imagePrompts.length === 0) {
        throw new Error('No image prompt templates found');
      }
      
      // Generate image prompts using AI
      const imagePromptTexts = await articleAIService.generateImagePrompts(
        imagePrompts[0],
        topic,
        keywords,
        settings.defaultModel
      );
      
      // For now, we'll just use placeholder images
      // In a real implementation, you would use these prompts to generate images with an image generation API
      const newImages: ImageItem[] = imagePromptTexts.map((prompt, index) => ({
        id: `img-${Date.now()}-${index}`,
        url: `https://images.unsplash.com/photo-${1550000000 + index}?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`,
        alt: prompt.substring(0, 30),
        caption: prompt.substring(0, 50),
        isSelected: index === 0,
        type: index === 0 ? 'featured' : 'section'
      }));
      
      // Update the images
      setImages(newImages);
    } catch (error) {
      console.error('Error generating images:', error);
      // Fallback to default images if AI generation fails
      setImages([
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
    } finally {
      setGenerating(false);
    }
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
      topicSuggestions, setTopicSuggestions,
      
      // Keywords
      selectedKeywords, setSelectedKeywords,
      keywords, setKeywords,
      
      // Outline
      outline, setOutline,
      
      // Images
      images, setImages,
      
      // Content
      htmlOutput, setHtmlOutput,
      articleContent, setArticleContent,
      
      // Generation states
      generating, setGenerating,
      isGeneratingIdeas, setIsGeneratingIdeas,
      isLoadingKeywords, setIsLoadingKeywords,
      
      // Navigation
      goToNextStep,
      goToPreviousStep,
      handleStepClick,
      
      // Generation functions
      generateTopicIdeas,
      generateKeywords,
      generateOutline,
      generateContent,
      generateImages
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