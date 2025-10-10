import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ARTICLE_TYPES } from '../components/ArticleTypeSidebar';
import { usePrompt } from './PromptContext';
import { KeywordData, ImageItem, OutlineItem, ArticleContent, ArticleWizardContextType } from '../types';
import { useArticleAIService } from '../hooks/useArticleAIService';

// Helper: default topic suggestions per article type
const getDefaultTopicSuggestions = (type: string): string[] => {
  switch (type) {
    case 'seo-article':
      return [
        'eCommerce SEO strategy for 2025',
        'On-page SEO checklist for small businesses',
        'Local SEO tactics for service businesses',
        'Link building ideas that actually work'
      ];
    case 'academic-paper':
      return [
        'The impact of AI on research methodologies',
        'Comparative analysis of qualitative vs quantitative methods',
        'Ethical considerations in data-driven studies',
        'Literature review: advancements in machine learning'
      ];
    case 'news-article':
      return [
        'Tech industry trends to watch this quarter',
        'Policy changes shaping digital privacy',
        'Start-up funding highlights this week',
        'Breakthroughs in renewable energy technology'
      ];
    case 'blog-post':
      return [
        'Productivity tips for remote teams',
        'Beginner’s guide to content planning',
        'How to repurpose long-form content',
        'Building an authentic brand voice'
      ];
    default:
      return [
        'Content strategy ideas for growing brands',
        'How AI tools can streamline workflows',
        'Audience research essentials',
        'Writing engaging introductions that hook readers'
      ];
  }
};

// Read preselected article type from URL routing (if any)
const initialArticleType = (() => {
  const preselected = localStorage.getItem('preselected_article_type');
  return preselected || 'blog-post';
})();
const ArticleWizardContext = createContext<ArticleWizardContextType | null>(null);

export const ArticleWizardProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const { prompts, settings, isInitialized } = usePrompt();
  const articleAI = useArticleAIService();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const [showComplete, setShowComplete] = useState(false);

  // Article type - check for preselected type from URL routing
  const [selectedArticleType, setSelectedArticleType] = useState(() => {
    const preselected = localStorage.getItem('preselected_article_type');
    return preselected || 'blog-post';
  });
  const [isArticleTypeLocked, setIsArticleTypeLocked] = useState(() => {
    return !!localStorage.getItem('preselected_article_type');
  });

  // Topic
  const [title, setTitle] = useState('');
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
  const [topicSuggestions, setTopicSuggestions] = useState<string[]>(() => getDefaultTopicSuggestions(initialArticleType));

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

  // Clear preselected article type on unmount
  useEffect(() => {
    return () => {
      localStorage.removeItem('preselected_article_type');
    };
  }, []);

  // Navigation functions
  const goToNextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      setShowComplete(true);
    }
  };
  // Update default suggestions when the selected article type changes
  useEffect(() => {
    setTopicSuggestions(getDefaultTopicSuggestions(selectedArticleType));
  }, [selectedArticleType]);

  // Clear prior keywords when the title/topic changes so step 2 regenerates fresh
  useEffect(() => {
    setKeywords([]);
    setSelectedKeywords([]);
  }, [title]);

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

  // Auto-generate keywords when moving to step 2
  useEffect(() => {
    if (currentStep === 2 && title && keywords.length === 0 && !isLoadingKeywords) {
      generateKeywords(title);
    }
  }, [currentStep, title]);

  // Auto-generate outline when moving to step 3
  useEffect(() => {
    if (currentStep === 3 && title && selectedKeywords.length > 0 && outline.length === 0 && !generating) {
      generateOutline(title, selectedKeywords);
    }
  }, [currentStep, title, selectedKeywords]);

  // Auto-generate images when moving to step 4
  useEffect(() => {
    if (currentStep === 4 && title && selectedKeywords.length > 0 && images.length === 0 && !generating) {
      generateImages(title, selectedKeywords);
    }
  }, [currentStep, title, selectedKeywords]);

  // Auto-generate content when moving to step 5
  useEffect(() => {
    if (currentStep === 5 && title && selectedKeywords.length > 0 && outline.length > 0 && !htmlOutput && !generating) {
      generateContent(title, selectedKeywords, outline);
    }
  }, [currentStep, title, selectedKeywords, outline]);

  // Generate topic ideas based on the selected article type
  const generateTopicIdeas = async () => {
    try {
      // Check if prompts are initialized
      if (!isInitialized) {
        throw new Error('Prompts are not yet initialized');
      }

      setIsGeneratingIdeas(true);

      // Get the topic prompt template
      const topicPrompts = prompts.filter(p => p.category === 'topic');

      if (topicPrompts.length === 0) {
        throw new Error('No topic prompt templates found');
      }

      // Get the selected article type label
      const selectedType = ARTICLE_TYPES.find(type => type.value === selectedArticleType);

      // Generate topics using AI
      const topics = await articleAI.generateTopics(
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
      setTopicSuggestions(getDefaultTopicSuggestions(selectedArticleType));
    } finally {
      setIsGeneratingIdeas(false);
    }
  };

  // Generate keywords based on the selected topic
  const generateKeywords = async (topic: string) => {
    try {
      // Check if prompts are initialized
      if (!isInitialized) {
        throw new Error('Prompts are not yet initialized');
      }

      setIsLoadingKeywords(true);

      // Get the keyword prompt template
      const keywordPrompts = prompts.filter(p => p.category === 'keyword');

      if (keywordPrompts.length === 0) {
        throw new Error('No keyword prompt templates found');
      }

      // Generate keywords using AI
      const generatedKeywords = await articleAI.generateKeywords(
        keywordPrompts[0],
        topic,
        settings.defaultModel
      );

      // Sanitise and de-duplicate keywords
      const sanitise = (s: string) => s
        .replace(/^[\s\-\*•]*\d+\.\s*/, '') // remove leading numbering like "1. "
        .replace(/^[\s\-\*•]+/, '') // remove leading bullets/dashes
        .trim();

      const cleaned = generatedKeywords
        .map(k => ({ ...k, keyword: sanitise(k.keyword) }))
        .filter(k => k.keyword.length > 0);

      const uniqueMap = new Map<string, typeof cleaned[number]>();
      cleaned.forEach(k => uniqueMap.set(k.keyword.toLowerCase(), k));
      const unique = Array.from(uniqueMap.values());

      // Update the keywords
      setKeywords(unique);

      // Select the top 3 keywords by default
      setSelectedKeywords(unique.slice(0, 3).map(k => k.keyword));
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
      // Check if prompts are initialized
      if (!isInitialized) {
        throw new Error('Prompts are not yet initialized');
      }

      setGenerating(true);

      // Get the outline prompt template
      const outlinePrompts = prompts.filter(p => p.category === 'outline');

      if (outlinePrompts.length === 0) {
        throw new Error('No outline prompt templates found');
      }

      // Generate outline using AI
      const generatedOutline = await articleAI.generateOutline(
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
  const generateContent = async (
    topic: string,
    keywords: string[],
    outline: OutlineItem[],
    contentSettings?: {
      length?: string;
      tone?: string;
      includeStats?: boolean;
      includeExamples?: boolean;
    }
  ) => {
    try {
      // Check if prompts are initialized
      if (!isInitialized) {
        throw new Error('Prompts are not yet initialized');
      }

      setGenerating(true);

      // Get the content prompt template
      const contentPrompts = prompts.filter(p => p.category === 'content');

      if (contentPrompts.length === 0) {
        throw new Error('No content prompt templates found');
      }

      // Generate content using AI
      const generatedContent = await articleAI.generateContent(
        contentPrompts[0],
        topic,
        keywords,
        outline,
        settings.defaultModel,
        contentSettings
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
  const generateImages = async (topic: string, keywords: string[], imageModel: string = 'dall-e-3') => {
    try {
      // Check if prompts are initialized
      if (!isInitialized) {
        throw new Error('Prompts are not yet initialized');
      }

      setGenerating(true);

      // Get the image prompt template
      const imagePrompts = prompts.filter(p => p.category === 'image');

      if (imagePrompts.length === 0) {
        throw new Error('No image prompt templates found');
      }

      // Generate image prompts using AI
      const imagePromptTexts = await articleAI.generateImagePrompts(
        imagePrompts[0],
        topic,
        keywords,
        settings.defaultModel
      );

      // Import the ImageService
      const ImageService = (await import('../../../shared/services/imageService')).default;

      // Check if ImageService is configured
      if (!ImageService.isConfigured()) {
        throw new Error('Image service is not configured. Please add your API key in the settings.');
      }

      // Generate actual images using the ImageService
      const newImages: ImageItem[] = [];

      // Process each prompt and generate an image
      for (let i = 0; i < imagePromptTexts.length; i++) {
        const prompt = imagePromptTexts[i];
        try {
          // Generate the image using DALL-E
          const result = await ImageService.createImage({
            model: imageModel,
            prompt: prompt,
            size: '1024x1024',
            n: 1
          });

          // Add the generated image to the list
          if (result.data.images.length > 0) {
            newImages.push({
              id: `img-${Date.now()}-${i}`,
              url: result.data.images[0],
              alt: prompt.substring(0, 30),
              caption: prompt.substring(0, 50),
              isSelected: i === 0,
              type: i === 0 ? 'featured' : 'section',
              prompt: prompt // Store the original prompt for reference
            });
          }
        } catch (error) {
          console.error(`Error generating image for prompt: ${prompt}`, error);
          // Add a placeholder for failed image generation
          newImages.push({
            id: `img-${Date.now()}-${i}`,
            url: '', // Empty URL to indicate failure
            alt: prompt.substring(0, 30),
            caption: prompt.substring(0, 50) + ' (Generation failed)',
            isSelected: false,
            type: 'section',
            prompt: prompt,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
        }
      }

      // Update the images
      setImages(newImages);
    } catch (error) {
      console.error('Error generating images:', error);
      // Fallback to default images if AI generation fails
      setImages([
        {
          id: 'img1',
          url: 'https://via.placeholder.com/1024x1024?text=Image+Generation+Failed',
          alt: 'Image generation failed',
          caption: 'Image generation failed. Please try again.',
          isSelected: true,
          type: 'featured',
          error: error instanceof Error ? error.message : 'Unknown error'
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