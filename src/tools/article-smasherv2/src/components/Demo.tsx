import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  Sparkles, 
  Pencil, 
  Search, 
  FileText, 
  CheckCircle, 
  Image as ImageIcon, 
  BookOpen, 
  Sliders, 
  ChevronRight, 
  MousePointer, 
  ChevronsRight, 
  Copy, 
  Download, 
  FileText as FileTextIcon, 
  Share2, 
  Settings, 
  RefreshCw, 
  Info, 
  ExternalLink,
  Code,
  MoveVertical,
  X
} from 'lucide-react';
import KeywordService, { KeywordData } from '../services/KeywordService';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { convert } from 'html-to-text';

interface StepProps {
  isActive: boolean;
  isComplete: boolean;
  number: number;
  title: string;
  onClick: () => void;
}

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  caption: string;
  isSelected: boolean;
  type: 'featured' | 'section';
}

interface ContentSection {
  id: string;
  title: string;
  content: string;
  images: ImageItem[];
}

const Step: React.FC<StepProps> = ({ isActive, isComplete, number, title, onClick }) => (
  <div 
    onClick={onClick}
    className={`flex items-center px-3 py-1.5 rounded-lg text-sm cursor-pointer ${
      isActive 
        ? 'bg-primary text-white' 
        : isComplete 
          ? 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100' 
          : 'bg-gray-50 text-gray-400 border border-gray-200 hover:bg-gray-100'
    }`}
  >
    <div 
      className={`flex items-center justify-center w-6 h-6 rounded-full mr-2 ${
        isActive 
          ? 'bg-white text-primary' 
          : isComplete 
            ? 'bg-green-100 text-green-700' 
            : 'bg-gray-100 text-gray-500'
      }`}
    >
      {isComplete ? <CheckCircle size={14} /> : number}
    </div>
    <span className="font-medium">{title}</span>
  </div>
);

const KeywordItem: React.FC<{
  keyword: string, 
  volume: string, 
  competition: string, 
  cpc: string, 
  trend: string, 
  onAdd: () => void,
  isSelected: boolean
}> = ({
  keyword,
  volume,
  competition,
  cpc,
  trend,
  onAdd,
  isSelected
}) => (
  <div className="flex items-center border-b last:border-b-0 border-gray-100 py-3">
    <div className="flex-grow">
      <div className="font-medium text-gray-800">{keyword}</div>
      <div className="flex items-center mt-1 text-xs text-gray-500">
        <span className="inline-flex items-center mr-3">
          <span className="bg-blue-50 text-primary px-2 py-1 rounded mr-1">SEO</span>
          {trend === "up" ? 
            <ChevronsRight className="text-green-500 rotate-45" size={14} /> : 
            trend === "down" ? 
            <ChevronsRight className="text-red-500 -rotate-45" size={14} /> :
            <ChevronsRight className="text-yellow-500" size={14} />
          }
        </span>
      </div>
    </div>
    <div className="text-right">
      <div className="flex items-center space-x-4">
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{volume}</div>
          <div className="text-xs text-gray-500">Volume</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">{competition}</div>
          <div className="text-xs text-gray-500">Comp.</div>
        </div>
        <div className="text-center">
          <div className="text-sm font-medium text-gray-900">${cpc}</div>
          <div className="text-xs text-gray-500">CPC</div>
        </div>
      </div>
    </div>
    <button 
      onClick={onAdd} 
      className={`ml-4 p-1 rounded transition-colors ${
        isSelected 
          ? 'text-green-500 bg-green-50 hover:bg-green-100' 
          : 'text-primary bg-primary-50 hover:bg-primary-100'
      }`}
    >
      {isSelected ? <CheckCircle size={18} /> : <ChevronRight size={18} />}
    </button>
  </div>
);

const TopicOption: React.FC<{
  text: string;
  isSelected: boolean;
  onClick: () => void;
}> = ({ text, isSelected, onClick }) => (
  <button 
    onClick={onClick}
    className={`text-left p-2 border rounded-lg transition-colors text-sm ${
      isSelected 
        ? 'bg-primary-100 border-primary text-primary font-medium' 
        : 'border-gray-200 hover:bg-primary-50 hover:border-primary'
    }`}
  >
    {text}
  </button>
);

const ImageCard: React.FC<{
  image: ImageItem;
  onToggleSelect: () => void;
  onRemove?: () => void;
  showRemove?: boolean;
  isDraggable?: boolean;
}> = ({ image, onToggleSelect, onRemove, showRemove = false, isDraggable = false }) => (
  <div className={`bg-white rounded-lg border ${image.isSelected ? 'border-primary' : 'border-gray-200'} overflow-hidden relative`}>
    <img 
      src={image.url} 
      alt={image.alt} 
      className="w-full h-48 object-cover"
    />
    <div className="p-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">{image.type === 'featured' ? 'Featured Image' : 'Section Image'}</span>
        <div className="flex space-x-1">
          {isDraggable && (
            <div className="p-1 text-gray-400 cursor-move">
              <MoveVertical size={16} />
            </div>
          )}
          <button 
            className="p-1 rounded hover:bg-gray-100"
            onClick={onToggleSelect}
          >
            <CheckCircle 
              className={image.isSelected ? "text-green-500" : "text-gray-300 hover:text-green-500"} 
              size={16} 
            />
          </button>
          {showRemove && (
            <button 
              className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-red-500"
              onClick={onRemove}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      {image.caption && (
        <p className="text-xs text-gray-500 mt-1">{image.caption}</p>
      )}
    </div>
  </div>
);

const Demo: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [title, setTitle] = useState('');
  const [generating, setGenerating] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [selectedKeywords, setSelectedKeywords] = useState<string[]>(['wordpress ai content generator', 'gpt for wordpress']);
  const [keywords, setKeywords] = useState<KeywordData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [showDataSource, setShowDataSource] = useState(false);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState<number | null>(null);
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
      caption: 'Modern content generation with AI',
      isSelected: false,
      type: 'section'
    },
    {
      id: 'img3',
      url: 'https://images.unsplash.com/photo-1547658719-da2b51169166?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      alt: 'WordPress Development',
      caption: 'WordPress theme development',
      isSelected: false,
      type: 'section'
    },
    {
      id: 'img4',
      url: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
      alt: 'Content Marketing',
      caption: 'Digital content marketing strategy',
      isSelected: false,
      type: 'section'
    }
  ]);
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    {
      id: 'section-1',
      title: '1. Introduction',
      content: `The landscape of content creation for WordPress has undergone a dramatic transformation in recent years. What once required hours of research, writing, and editing can now be accomplished in minutes with artificial intelligence. This revolution is reshaping how website owners, bloggers, and digital marketers approach content production.
      
      AI-powered content generation matters because it addresses the constant demand for fresh, relevant content while reducing the time and resources required. For WordPress users specifically, integrating these capabilities directly into their familiar content management system creates a seamless workflow that can dramatically increase productivity.`,
      images: []
    },
    {
      id: 'section-2',
      title: '2. Understanding AI Content Generation',
      content: `GPT (Generative Pre-trained Transformer) models work with WordPress through specialized plugins that establish connections with AI providers like OpenAI. These plugins send carefully crafted prompts to the AI service and then format the returned content for WordPress.
      
      The benefits of AI content generation include speed, scalability, and consistency. However, limitations exist – AI may sometimes produce generic content, lack deep subject matter expertise, or require human refinement to match your brand voice perfectly.`,
      images: []
    },
    {
      id: 'section-3',
      title: '3. Top WordPress AI Content Plugins',
      content: `Several WordPress plugins now offer AI-powered content generation capabilities. When comparing solutions, consider factors such as:
      
      - AI model quality and capabilities
      - User interface and workflow design
      - Customization options
      - Pricing structure
      - Support for different content types
      
      Leading solutions in this space include AI Scribe, which provides a step-by-step guided workflow for article creation, along with several competitors that offer varying features and pricing models.`,
      images: []
    },
    {
      id: 'section-4',
      title: '4. Optimizing AI Content for SEO',
      content: `When generating content with AI, implementing effective keyword integration is essential. Best practices include:
      
      - Using primary keywords in titles, headings, and early paragraphs
      - Incorporating secondary keywords naturally throughout the content
      - Maintaining a reasonable keyword density (1-2% for primary keywords)
      - Using latent semantic indexing (LSI) keywords for context
      
      Structure your AI-generated content for search engines by using proper heading hierarchy, including meta descriptions, optimizing URL structures, and creating internal links to related content.`,
      images: []
    },
    {
      id: 'section-5',
      title: '5. Best Practices for AI-Generated Content',
      content: `While AI can produce amazing content, adding a human touch remains important. Techniques for humanizing AI content include:
      
      - Adding personal anecdotes or experiences
      - Incorporating your brand's unique voice and terminology
      - Including industry-specific insights that only experts would know
      - Adding recent examples or case studies not found in AI training data
      
      Legal and ethical considerations are also important. Always disclose AI usage if required by your industry or jurisdiction, avoid generating misleading content, and verify factual claims before publishing.`,
      images: []
    },
    {
      id: 'section-6',
      title: '6. Conclusion',
      content: `AI-powered content generation for WordPress represents a significant leap forward in content creation efficiency. By following best practices and understanding both the capabilities and limitations of these tools, website owners can produce high-quality, SEO-optimized content at scale.
      
      The future of WordPress content creation lies in finding the right balance between AI efficiency and human creativity – leveraging technology while maintaining the authentic voice and expertise that readers value.`,
      images: []
    }
  ]);
  
  const [htmlOutput, setHtmlOutput] = useState('');
  const htmlOutputRef = useRef<HTMLDivElement>(null);
  
  const topicSuggestions = [
    "How to Optimize WordPress for Speed", 
    "Ultimate Guide to WordPress Security", 
    "Top 10 WordPress Themes for Business",
    "WordPress vs Headless CMS Comparison"
  ];
  
  const totalSteps = 6;
  
  // Load initial keyword data
  useEffect(() => {
    fetchKeywords();
  }, []);
  
  // Fetch keywords when search query changes
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchKeywords();
    }, 300);
    
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);
  
  const fetchKeywords = async () => {
    setIsLoadingKeywords(true);
    try {
      let keywordData: KeywordData[];
      if (searchQuery) {
        keywordData = await KeywordService.getKeywordSuggestions(searchQuery);
      } else {
        // Get trending keywords if no search query
        const trending = await KeywordService.getTrendingKeywords();
        const suggestions = await KeywordService.getKeywordSuggestions('');
        keywordData = [...trending, ...suggestions].slice(0, 8);
      }
      setKeywords(keywordData);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      // Fallback to empty array in case of error
      setKeywords([]);
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
      // Simulate generation process
      if (currentStep === 2) {
        setGenerating(true);
        setTimeout(() => setGenerating(false), 1500);
      }
    } else if (currentStep === totalSteps) {
      setShowComplete(true);
      generateHtmlOutput();
    }
  };
  
  const handlePrev = () => {
    if (showComplete) {
      setShowComplete(false);
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStepClick = (step: number) => {
    // Always allow clicking any step
    if (showComplete) {
      setShowComplete(false);
    }
    setCurrentStep(step);
  };
  
  const handleKeywordAdd = (keyword: string) => {
    if (!selectedKeywords.includes(keyword)) {
      setSelectedKeywords([...selectedKeywords, keyword]);
    } else {
      // If already selected, remove it
      handleKeywordRemove(keyword);
    }
  };
  
  const handleKeywordRemove = (keyword: string) => {
    setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
  };
  
  const regenerateKeywords = async () => {
    setIsLoadingKeywords(true);
    try {
      // Reset search query and fetch fresh trending keywords
      setSearchQuery('');
      const trending = await KeywordService.getTrendingKeywords();
      const suggestions = await KeywordService.getKeywordSuggestions('');
      setKeywords([...trending, ...suggestions.slice(0, 5)]);
    } catch (error) {
      console.error("Error regenerating keywords:", error);
    } finally {
      setIsLoadingKeywords(false);
    }
  };
  
  const regenerateTopic = () => {
    // Simulate regenerating topics
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setTitle("Advanced WordPress AI Content Tools for 2025");
      setSelectedTopicIndex(null); // Clear selected topic on regenerate
    }, 1000);
  };

  const handleTopicSelection = (topic: string, index: number) => {
    setTitle(topic);
    setSelectedTopicIndex(index);
  };

  const handleImageSelect = (imageId: string) => {
    setImages(images.map(img => 
      img.id === imageId 
        ? { ...img, isSelected: !img.isSelected } 
        : img
    ));
  };
  
  const getSelectedImages = () => {
    return images.filter(img => img.isSelected);
  };
  
  // Handle drag and drop of images between content sections
  const onDragEnd = (result: any) => {
    const { source, destination, draggableId } = result;
    
    // Dropped outside the list
    if (!destination) {
      return;
    }
    
    // Find the image being dragged
    const draggedImage = images.find(img => img.id === draggableId);
    if (!draggedImage) return;
    
    // Create a copy of the current sections
    const newSections = [...contentSections];
    
    // If source and destination are the same, reorder within the section
    if (source.droppableId === destination.droppableId) {
      const section = newSections.find(s => s.id === destination.droppableId);
      if (!section) return;
      
      const newImages = Array.from(section.images);
      const [removed] = newImages.splice(source.index, 1);
      newImages.splice(destination.index, 0, removed);
      
      section.images = newImages;
    } else {
      // Moving from one section to another
      // First remove from source if it's a section (not the image bank)
      if (source.droppableId !== 'image-bank') {
        const sourceSection = newSections.find(s => s.id === source.droppableId);
        if (sourceSection) {
          sourceSection.images.splice(source.index, 1);
        }
      }
      
      // Then add to destination section
      const destSection = newSections.find(s => s.id === destination.droppableId);
      if (destSection) {
        // Create a new instance of the image to add to the section
        const imageCopy = { ...draggedImage };
        destSection.images.splice(destination.index, 0, imageCopy);
      }
    }
    
    setContentSections(newSections);
  };
  
  const removeImageFromSection = (sectionId: string, imageId: string) => {
    setContentSections(contentSections.map(section => {
      if (section.id === sectionId) {
        return {
          ...section,
          images: section.images.filter(img => img.id !== imageId)
        };
      }
      return section;
    }));
  };
  
  const generateHtmlOutput = () => {
    // Create a full HTML document based on the article content
    const articleTitle = title || "WordPress AI Content Generation: The Ultimate Guide";
    
    let html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${articleTitle}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1 { font-size: 2.5rem; margin-bottom: 1.5rem; color: #111; }
        h2 { font-size: 1.75rem; margin-top: 2rem; margin-bottom: 1rem; color: #333; }
        p { margin-bottom: 1rem; }
        img { max-width: 100%; height: auto; border-radius: 8px; margin: 1rem 0; }
        .image-container { margin: 1.5rem 0; }
        .caption { font-size: 0.875rem; color: #666; margin-top: 0.5rem; font-style: italic; }
        ul, ol { margin-bottom: 1rem; padding-left: 2rem; }
        li { margin-bottom: 0.5rem; }
        .featured-image { margin-bottom: 2rem; }
    </style>
</head>
<body>
    <article>
        <h1>${articleTitle}</h1>`;
    
    // Add featured image if one is selected
    const featuredImage = images.find(img => img.isSelected && img.type === 'featured');
    if (featuredImage) {
      html += `
        <div class="featured-image">
            <img src="${featuredImage.url}" alt="${featuredImage.alt}" />
            ${featuredImage.caption ? `<p class="caption">${featuredImage.caption}</p>` : ''}
        </div>`;
    }
    
    // Add each content section with its images
    contentSections.forEach(section => {
      html += `
        <h2>${section.title}</h2>`;
      
      // Split the content by paragraphs
      const paragraphs = section.content.split('\n\n').filter(p => p.trim());
      
      // Insert images between paragraphs if there are any
      if (section.images.length > 0 && paragraphs.length > 0) {
        // Add first paragraph
        html += `
        <p>${paragraphs[0]}</p>`;
        
        // Add images
        section.images.forEach(image => {
          html += `
        <div class="image-container">
            <img src="${image.url}" alt="${image.alt}" />
            ${image.caption ? `<p class="caption">${image.caption}</p>` : ''}
        </div>`;
        });
        
        // Add remaining paragraphs
        paragraphs.slice(1).forEach(paragraph => {
          // Check if paragraph is a list
          if (paragraph.trim().startsWith('-')) {
            const listItems = paragraph.split('-').filter(item => item.trim()).map(item => item.trim());
            html += `
        <ul>`;
            listItems.forEach(item => {
              html += `
            <li>${item}</li>`;
            });
            html += `
        </ul>`;
          } else {
            html += `
        <p>${paragraph}</p>`;
          }
        });
      } else {
        // No images, just add all paragraphs
        paragraphs.forEach(paragraph => {
          // Check if paragraph is a list
          if (paragraph.trim().startsWith('-')) {
            const listItems = paragraph.split('-').filter(item => item.trim()).map(item => item.trim());
            html += `
        <ul>`;
            listItems.forEach(item => {
              html += `
            <li>${item}</li>`;
            });
            html += `
        </ul>`;
          } else {
            html += `
        <p>${paragraph}</p>`;
          }
        });
      }
    });
    
    html += `
    </article>
</body>
</html>`;
    
    setHtmlOutput(html);
  };
  
  const copyHtmlToClipboard = () => {
    if (htmlOutput) {
      navigator.clipboard.writeText(htmlOutput)
        .then(() => {
          alert('HTML copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy HTML: ', err);
        });
    }
  };
  
  const downloadHtml = () => {
    if (htmlOutput) {
      const element = document.createElement('a');
      const file = new Blob([htmlOutput], {type: 'text/html'});
      element.href = URL.createObjectURL(file);
      element.download = `${title.replace(/\s+/g, '-').toLowerCase() || 'wordpress-ai-content'}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };
  
  const copyTextToClipboard = () => {
    if (htmlOutput) {
      // Use html-to-text to convert HTML to plain text
      const text = convert(htmlOutput, {
        wordwrap: 130,
        selectors: [
          { selector: 'img', format: 'skip' },
          { selector: 'a', options: { hideLinkHrefIfSameAsText: true } }
        ]
      });
      
      navigator.clipboard.writeText(text)
        .then(() => {
          alert('Text copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy text: ', err);
        });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-primary text-white shadow-md sticky top-0 z-50">
        <div className="mobile-container py-3">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center text-white">
              <ArrowLeft className="mr-2" size={20} />
              <span className="font-medium">Back</span>
            </Link>
            <h1 className="text-lg font-bold">AI Scribe Demo</h1>
            <button className="text-white hover:text-primary-50">
              <Settings size={20} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="mobile-container py-4">
        {/* Progress Steps */}
        <div className="bg-white rounded-xl shadow-card p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-lg font-bold text-gray-800">WordPress AI Content Creation</h2>
            <p className="text-gray-600 text-sm">Step {currentStep} of {totalSteps}</p>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            <Step 
              isActive={currentStep === 1}
              isComplete={currentStep > 1}
              number={1}
              title="Topic"
              onClick={() => handleStepClick(1)}
            />
            <Step 
              isActive={currentStep === 2}
              isComplete={currentStep > 2}
              number={2}
              title="Keywords"
              onClick={() => handleStepClick(2)}
            />
            <Step 
              isActive={currentStep === 3}
              isComplete={currentStep > 3}
              number={3}
              title="Outline"
              onClick={() => handleStepClick(3)}
            />
            <Step 
              isActive={currentStep === 4}
              isComplete={currentStep > 4}
              number={4}
              title="Content"
              onClick={() => handleStepClick(4)}
            />
            <Step 
              isActive={currentStep === 5}
              isComplete={currentStep > 5}
              number={5}
              title="Images"
              onClick={() => handleStepClick(5)}
            />
            <Step 
              isActive={currentStep === 6}
              isComplete={currentStep > 6}
              number={6}
              title="Publish"
              onClick={() => handleStepClick(6)}
            />
          </div>
        </div>
        
        {/* Step Content */}
        <div className="bg-white rounded-xl shadow-card p-4 mb-20">
          {!showComplete ? (
            <>
              {currentStep === 1 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Select Your Topic</h3>
                    <button onClick={regenerateTopic} className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Enter the main topic or title for your article. AI Scribe will help you develop it into comprehensive content.</p>
                  
                  <div className="mb-5">
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                      Article Title or Topic
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="E.g., Best WordPress Plugins for SEO"
                        className="input pl-10"
                      />
                      <Pencil className="absolute left-3 top-3 text-gray-400" size={18} />
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Tip: Be specific about your topic for better results
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center">
                      <Sparkles className="text-primary mr-2" size={18} />
                      AI Topic Suggestions
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {topicSuggestions.map((suggestion, i) => (
                        <TopicOption
                          key={i}
                          text={suggestion}
                          isSelected={selectedTopicIndex === i}
                          onClick={() => handleTopicSelection(suggestion, i)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 2 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Keyword Research</h3>
                    <button onClick={regenerateKeywords} className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Select relevant keywords to target in your content for better SEO performance.</p>
                  
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <Search className="text-primary mr-2" size={20} />
                        <h4 className="font-medium text-gray-800">Keyword Suggestions</h4>
                      </div>
                      <button 
                        onClick={() => setShowDataSource(!showDataSource)}
                        className="text-xs text-gray-500 flex items-center hover:text-primary"
                      >
                        <Info size={12} className="mr-1" />
                        Data source
                      </button>
                    </div>
                    
                    {showDataSource && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                        <p className="text-sm text-gray-700 mb-2">
                          <span className="font-medium">Data Source Information:</span> This demo uses sample data formatted according to Wordtracker API's structure.
                        </p>
                        <p className="text-xs text-gray-600">
                          In a production environment, this would connect to an actual SEO keyword API. For demo purposes, we're using a simulation of real-world keyword metrics.
                        </p>
                        <div className="flex items-center mt-2 text-xs text-primary">
                          <a href="https://wordtracker.github.io/docs/" target="_blank" rel="noopener noreferrer" className="flex items-center hover:underline">
                            Wordtracker API Reference
                            <ExternalLink size={10} className="ml-1" />
                          </a>
                        </div>
                      </div>
                    )}
                    
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex mb-3">
                        <input 
                          type="text" 
                          placeholder="Search keywords..." 
                          className="input text-sm mb-0"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      {isLoadingKeywords ? (
                        <div className="py-8 text-center">
                          <div className="inline-block w-8 h-8 border-t-2 border-b-2 border-primary rounded-full animate-spin mb-2"></div>
                          <p className="text-gray-500 text-sm">Loading keyword data...</p>
                        </div>
                      ) : keywords.length === 0 ? (
                        <div className="py-8 text-center">
                          <p className="text-gray-500">No keywords found for this search.</p>
                          <button 
                            onClick={regenerateKeywords}
                            className="text-primary hover:underline mt-2 text-sm"
                          >
                            Show trending keywords
                          </button>
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-100">
                          {keywords.map((item, i) => (
                            <KeywordItem 
                              key={i} 
                              keyword={item.keyword} 
                              volume={item.volume} 
                              competition={item.competition} 
                              cpc={item.cpc}
                              trend={item.trend}
                              onAdd={() => handleKeywordAdd(item.keyword)}
                              isSelected={selectedKeywords.includes(item.keyword)}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="bg-primary-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-800 mb-2">Selected Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedKeywords.map((keyword, index) => (
                          <div key={index} className="bg-white px-3 py-1 rounded-full text-sm font-medium text-gray-700 border border-gray-200 flex items-center">
                            {keyword}
                            <button 
                              onClick={() => handleKeywordRemove(keyword)} 
                              className="ml-2 text-gray-400 hover:text-gray-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        {selectedKeywords.length === 0 && (
                          <p className="text-sm text-gray-500">No keywords selected. Click on a keyword above to add it.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 3 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Article Outline</h3>
                    <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Review and customize the AI-generated outline for your article.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="text-primary mr-2" size={20} />
                        <h4 className="font-medium text-gray-800">Generated Outline</h4>
                      </div>
                      <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                        <Sparkles className="mr-1" size={14} />
                        Regenerate
                      </button>
                    </div>
                    
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                      <h5 className="font-bold text-gray-800 mb-3">WordPress AI Content Generation: The Ultimate Guide</h5>
                      
                      <div className="space-y-3 ml-4">
                        <div>
                          <h6 className="font-semibold text-gray-700">1. Introduction</h6>
                          <ul className="ml-5 text-sm text-gray-600 list-disc">
                            <li>The evolution of content creation in WordPress</li>
                            <li>Why AI-powered content generation matters</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold text-gray-700">2. Understanding AI Content Generation</h6>
                          <ul className="ml-5 text-sm text-gray-600 list-disc">
                            <li>How GPT models work with WordPress</li>
                            <li>Benefits and limitations of AI content</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold text-gray-700">3. Top WordPress AI Content Plugins</h6>
                          <ul className="ml-5 text-sm text-gray-600 list-disc">
                            <li>Feature comparison of leading solutions</li>
                            <li>Installation and configuration guides</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold text-gray-700">4. Optimizing AI Content for SEO</h6>
                          <ul className="ml-5 text-sm text-gray-600 list-disc">
                            <li>Keyword integration strategies</li>
                            <li>Structuring content for search engines</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold text-gray-700">5. Best Practices for AI-Generated Content</h6>
                          <ul className="ml-5 text-sm text-gray-600 list-disc">
                            <li>Humanizing AI content effectively</li>
                            <li>Legal and ethical considerations</li>
                          </ul>
                        </div>
                        
                        <div>
                          <h6 className="font-semibold text-gray-700">6. Conclusion</h6>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-2">Customize Outline</h4>
                    <p className="text-sm text-gray-600 mb-3">Drag and drop sections to reorder, or edit section titles directly.</p>
                    <button className="btn btn-primary text-sm py-2 px-4 flex items-center">
                      <Pencil className="mr-1" size={14} />
                      Edit Outline
                    </button>
                  </div>
                </div>
              )}
              
              {currentStep === 4 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Content Generation</h3>
                    <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Review and edit the AI-generated content for your article.</p>
                  
                  {generating ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
                      <p className="text-gray-600">Generating content with GPT-4o...</p>
                    </div>
                  ) : (
                    <div>
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <BookOpen className="text-primary mr-2" size={20} />
                            <h4 className="font-medium text-gray-800">Generated Content</h4>
                          </div>
                          <div className="flex space-x-2">
                            <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                              <Sparkles className="mr-1" size={14} />
                              Regenerate
                            </button>
                            <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                              <Sliders className="mr-1" size={14} />
                              Settings
                            </button>
                          </div>
                        </div>
                        
                        <div className="bg-white rounded-lg border border-gray-200 p-4">
                          <h5 className="font-bold text-gray-800 text-xl mb-4">WordPress AI Content Generation: The Ultimate Guide</h5>
                          
                          <div className="prose prose-sm max-w-none text-gray-700">
                            <h6 className="font-semibold text-gray-800 text-lg mb-2">1. Introduction</h6>
                            <p>
                              The landscape of content creation for WordPress has undergone a dramatic transformation in recent years. What once required hours of research, writing, and editing can now be accomplished in minutes with artificial intelligence. This revolution is reshaping how website owners, bloggers, and digital marketers approach content production.
                            </p>
                            <p>
                              AI-powered content generation matters because it addresses the constant demand for fresh, relevant content while reducing the time and resources required. For WordPress users specifically, integrating these capabilities directly into their familiar content management system creates a seamless workflow that can dramatically increase productivity.
                            </p>
                            
                            <h6 className="font-semibold text-gray-800 text-lg mb-2 mt-4">2. Understanding AI Content Generation</h6>
                            <p>
                              GPT (Generative Pre-trained Transformer) models work with WordPress through specialized plugins that establish connections with AI providers like OpenAI. These plugins send carefully crafted prompts to the AI service and then format the returned content for WordPress.
                            </p>
                            <p>
                              The benefits of AI content generation include speed, scalability, and consistency. However, limitations exist – AI may sometimes produce generic content, lack deep subject matter expertise, or require human refinement to match your brand voice perfectly.
                            </p>
                            
                            <p className="text-center text-primary cursor-pointer mt-4">Show more content...</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-primary-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-800 mb-2">Content Settings</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Tone
                            </label>
                            <select className="input text-sm">
                              <option>Professional</option>
                              <option>Conversational</option>
                              <option>Academic</option>
                              <option>Entertaining</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Length
                            </label>
                            <select className="input text-sm">
                              <option>Detailed (2000+ words)</option>
                              <option>Standard (1000-1500 words)</option>
                              <option>Concise (500-800 words)</option>
                            </select>
                          </div>
                        </div>
                        <button className="btn btn-primary text-sm py-2 px-4 flex items-center">
                          <Pencil className="mr-1" size={14} />
                          Edit Content
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {currentStep === 5 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Image Generation</h3>
                    <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Generate and select images for your article using DALL-E 3.</p>
                  
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <ImageIcon className="text-primary mr-2" size={20} />
                        <h4 className="font-medium text-gray-800">Generated Images</h4>
                      </div>
                      <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                        <Sparkles className="mr-1" size={14} />
                        Generate More
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {images.map(image => (
                        <ImageCard
                          key={image.id}
                          image={image}
                          onToggleSelect={() => handleImageSelect(image.id)}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Image Generation Settings</h4>
                    <div className="mb-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Image Prompt
                      </label>
                      <input
                        type="text"
                        className="input text-sm"
                        placeholder="Describe the image you want to generate"
                        defaultValue="WordPress website with AI content generation, digital marketing concept"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Style
                        </label>
                        <select className="input text-sm">
                          <option>Photorealistic</option>
                          <option>Illustration</option>
                          <option>3D Rendering</option>
                          <option>Minimalist</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aspect Ratio
                        </label>
                        <select className="input text-sm">
                          <option>16:9 (Landscape)</option>
                          <option>1:1 (Square)</option>
                          <option>4:5 (Portrait)</option>
                          <option>2:3 (Vertical)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {currentStep === 6 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-bold text-gray-800">Publish Your Content</h3>
                    <button className="btn btn-ghost text-sm py-1 px-3 flex items-center">
                      <RefreshCw className="mr-1" size={14} />
                      Regenerate
                    </button>
                  </div>
                  <p className="text-gray-600 mb-4">Review and finalize your article before publishing to WordPress.</p>
                  
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                    <div className="flex items-start">
                      <CheckCircle className="text-green-500 mt-1 mr-3 flex-shrink-0" size={20} />
                      <div>
                        <h4 className="font-medium text-gray-800 mb-1">Article Ready to Publish</h4>
                        <p className="text-sm text-gray-600">
                          Your article "WordPress AI Content Generation: The Ultimate Guide" has been created and is ready to publish.
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white border border-gray-200 rounded-lg mb-4">
                    <div className="border-b border-gray-200 p-3">
                      <h4 className="font-medium text-gray-800">Article Summary</h4>
                    </div>
                    <div className="p-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Title</h5>
                            <p className="text-gray-800">WordPress AI Content Generation: The Ultimate Guide</p>
                          </div>
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Word Count</h5>
                            <p className="text-gray-800">2,123 words</p>
                          </div>
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Keywords</h5>
                            <div className="flex flex-wrap gap-2">
                              {selectedKeywords.map((keyword, index) => (
                                <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs text-gray-700">
                                  {keyword}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div>
                          <div className="mb-3">
                            <h5 className="text-sm font-medium text-gray-500 mb-1">Featured Image</h5>
                            {getSelectedImages().filter(img => img.type === 'featured').length > 0 ? (
                              <img 
                                src={getSelectedImages().find(img => img.type === 'featured')?.url} 
                                alt={getSelectedImages().find(img => img.type === 'featured')?.alt} 
                                className="h-24 object-cover rounded-lg border border-gray-200"
                              />
                            ) : (
                              <p className="text-sm text-gray-500">No featured image selected</p>
                            )}
                          </div>
                          <div>
                            <h5 className="text-sm font-medium text-gray-500 mb-1">SEO Score</h5>
                            <div className="flex items-center">
                              <div className="h-2 w-32 bg-gray-200 rounded-full mr-2">
                                <div className="h-2 w-28 bg-green-500 rounded-full"></div>
                              </div>
                              <span className="text-sm text-green-600 font-medium">Very Good</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-primary-50 rounded-lg p-4">
                    <h4 className="font-medium text-gray-800 mb-3">Publishing Options</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <select className="input text-sm">
                          <option>Publish immediately</option>
                          <option>Save as draft</option>
                          <option>Schedule publication</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Category
                        </label>
                        <select className="input text-sm">
                          <option>WordPress</option>
                          <option>Artificial Intelligence</option>
                          <option>Content Marketing</option>
                          <option>SEO</option>
                        </select>
                      </div>
                    </div>
                    <button className="btn btn-primary text-sm py-2 px-4 w-full md:w-auto flex items-center justify-center">
                      Publish to WordPress
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Complete view with full article and export options with image drag and drop
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-gray-800">Complete Article</h3>
                <div className="flex space-x-2">
                  <button 
                    onClick={copyTextToClipboard}
                    className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
                    title="Copy text"
                  >
                    <Copy size={18} />
                  </button>
                  <button 
                    onClick={copyHtmlToClipboard}
                    className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
                    title="Copy HTML"
                  >
                    <Code size={18} />
                  </button>
                  <button 
                    className="btn bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 p-2 rounded-lg"
                    title="Share"
                  >
                    <Share2 size={18} />
                  </button>
                </div>
              </div>
              
              <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Main content area */}
                  <div className="flex-grow">
                    <div className="bg-white rounded-lg border border-gray-200 p-5 mb-4">
                      <h1 className="text-2xl font-bold text-gray-800 mb-4">
                        {title || "WordPress AI Content Generation: The Ultimate Guide"}
                      </h1>
                      
                      {/* Featured image */}
                      {getSelectedImages().filter(img => img.type === 'featured').length > 0 && (
                        <div className="mb-6">
                          <img 
                            src={getSelectedImages().find(img => img.type === 'featured')?.url}
                            alt={getSelectedImages().find(img => img.type === 'featured')?.alt}
                            className="w-full rounded-lg object-cover max-h-80"
                          />
                          {getSelectedImages().find(img => img.type === 'featured')?.caption && (
                            <p className="text-sm text-gray-500 mt-2 italic">
                              {getSelectedImages().find(img => img.type === 'featured')?.caption}
                            </p>
                          )}
                        </div>
                      )}
                      
                      {/* Content sections with droppable areas */}
                      {contentSections.map((section, index) => (
                        <div key={section.id} className="mb-6">
                          <h2 className="text-xl font-semibold text-gray-800 mb-3 mt-6">{section.title}</h2>
                          
                          <Droppable droppableId={section.id}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={`py-2 ${section.images.length > 0 ? 'bg-blue-50 rounded-lg border border-blue-100' : ''}`}
                              >
                                {section.images.map((image, imgIdx) => (
                                  <Draggable key={image.id} draggableId={image.id} index={imgIdx}>
                                    {(provided) => (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        className="mb-3 px-2"
                                      >
                                        <div className="relative bg-white rounded-lg border border-gray-200 p-2">
                                          <img 
                                            src={image.url}
                                            alt={image.alt}
                                            className="w-full rounded-lg object-cover max-h-48"
                                          />
                                          <button 
                                            onClick={() => removeImageFromSection(section.id, image.id)}
                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-red-500 hover:text-red-700"
                                            title="Remove from section"
                                          >
                                            <X size={16} />
                                          </button>
                                          {image.caption && (
                                            <p className="text-sm text-gray-500 mt-2 italic">
                                              {image.caption}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                    )}
                                  </Draggable>
                                ))}
                                {provided.placeholder}
                                {section.images.length === 0 && (
                                  <div className="border-2 border-dashed border-blue-200 rounded-lg p-3 text-center text-blue-400 text-sm">
                                    Drag images here
                                  </div>
                                )}
                              </div>
                            )}
                          </Droppable>
                          
                          <div className="prose prose-sm max-w-none text-gray-700 mt-3">
                            {section.content.split('\n\n').map((paragraph, pIdx) => {
                              // Check if paragraph is a list
                              if (paragraph.trim().startsWith('-')) {
                                const listItems = paragraph.split('-').filter(item => item.trim()).map(item => item.trim());
                                return (
                                  <ul key={`${section.id}-p${pIdx}`} className="list-disc pl-6 mb-4">
                                    {listItems.map((item, i) => (
                                      <li key={`${section.id}-p${pIdx}-i${i}`}>{item}</li>
                                    ))}
                                  </ul>
                                );
                              } else {
                                return (
                                  <p key={`${section.id}-p${pIdx}`} className="mb-4">
                                    {paragraph}
                                  </p>
                                );
                              }
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Image bank sidebar */}
                  <div className="md:w-64 flex-shrink-0">
                    <div className="bg-gray-50 rounded-lg p-4 sticky top-20">
                      <h4 className="font-medium text-gray-800 mb-3 flex items-center">
                        <ImageIcon className="text-primary mr-2" size={16} />
                        Image Bank
                      </h4>
                      <p className="text-xs text-gray-600 mb-3">
                        Drag images into content sections to position them in your article.
                      </p>
                      
                      <Droppable droppableId="image-bank">
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-3"
                          >
                            {getSelectedImages().map((image, index) => (
                              <Draggable key={image.id} draggableId={image.id} index={index}>
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                      <img 
                                        src={image.url}
                                        alt={image.alt}
                                        className="w-full h-28 object-cover"
                                      />
                                      <div className="p-2">
                                        <span className="text-xs text-gray-500">
                                          {image.type === 'featured' ? 'Featured' : 'Section'} Image
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                            {provided.placeholder}
                            {getSelectedImages().length === 0 && (
                              <div className="text-center text-gray-500 text-sm py-4">
                                No images selected
                              </div>
                            )}
                          </div>
                        )}
                      </Droppable>
                    </div>
                  </div>
                </div>
              </DragDropContext>
              
              {/* Export options */}
              <div className="bg-gray-50 rounded-lg p-4 mt-4">
                <h4 className="font-medium text-gray-800 mb-3">Export Options</h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <button 
                    onClick={copyTextToClipboard}
                    className="btn bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center justify-center"
                  >
                    <Copy className="mr-2 text-primary" size={18} />
                    <span>Copy Text</span>
                  </button>
                  <button 
                    onClick={copyHtmlToClipboard}
                    className="btn bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center justify-center"
                  >
                    <Code className="mr-2 text-primary" size={18} />
                    <span>Copy HTML</span>
                  </button>
                  <button 
                    onClick={downloadHtml}
                    className="btn bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center justify-center"
                  >
                    <FileTextIcon className="mr-2 text-primary" size={18} />
                    <span>Export HTML</span>
                  </button>
                  <button 
                    className="btn bg-white border border-gray-200 hover:bg-gray-50 p-3 rounded-lg flex items-center justify-center"
                  >
                    <FileTextIcon className="mr-2 text-primary" size={18} />
                    <span>Export PDF</span>
                  </button>
                </div>
                
                {/* HTML Preview (hidden) */}
                <div 
                  ref={htmlOutputRef} 
                  className="hidden"
                  dangerouslySetInnerHTML={{ __html: htmlOutput }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Fixed Navigation Buttons */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 flex justify-between z-30">
        <button 
          onClick={handlePrev}
          disabled={currentStep === 1 && !showComplete}
          className={`btn ${currentStep === 1 && !showComplete ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'btn-outline'} px-4 py-2 flex items-center`}
        >
          {showComplete ? "Back to Summary" : "Back"}
        </button>
        <button 
          onClick={handleNext}
          className="btn btn-primary px-6 py-2 flex items-center"
        >
          {currentStep === totalSteps && !showComplete ? 'Complete' : currentStep === totalSteps || showComplete ? 'Publish' : 'Continue'}
        </button>
      </div>
      
      {/* Floating Help Button */}
      <button className="fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-white rounded-full p-3 shadow-lg border border-gray-200 hover:bg-gray-50 transition-colors">
        <MousePointer className="text-primary" size={20} />
      </button>
    </div>
  );
};

export default Demo;