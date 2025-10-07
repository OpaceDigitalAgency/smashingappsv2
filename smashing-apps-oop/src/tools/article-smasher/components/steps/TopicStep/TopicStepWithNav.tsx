import React, { useEffect } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { RefreshCw, Pencil, Sparkles, Zap, ArrowRight } from 'lucide-react';
import PromptRunner from '../../../../../shared/components/PromptRunner/PromptRunner';
import { usePrompt } from '../../../contexts/PromptContext';

interface TopicOptionProps {
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

const TopicOption: React.FC<TopicOptionProps> = ({ text, isSelected, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`p-3 rounded-lg border text-left transition-all w-full ${
        isSelected
          ? 'bg-primary-50 border-primary text-primary'
          : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      <span className="text-sm">{text}</span>
    </button>
  );
};

const TopicStep: React.FC = () => {
  const { 
    title, 
    setTitle, 
    selectedTopicIndex, 
    setSelectedTopicIndex,
    isGeneratingIdeas,
    setIsGeneratingIdeas,
    generateTopicIdeas,
    topicSuggestions,
    selectedArticleType,
    goToNextStep
  } = useArticleWizard();
  
  const { prompts, settings } = usePrompt();
  
  // Get the topic prompt template
  const topicPrompts = prompts.filter(p => p.category === 'topic');
  const topicPrompt = topicPrompts.length > 0 ? topicPrompts[0] : null;
  
  const handleTopicSelection = (suggestion: string, index: number) => {
    setTitle(suggestion);
    setSelectedTopicIndex(index);
  };
  
  const handleGenerateTopics = async () => {
    await generateTopicIdeas();
  };
  
  // Get the article type label
  const getArticleTypeLabel = () => {
    const articleTypes = [
      { value: 'blog-post', label: 'Blog Post' },
      { value: 'seo-article', label: 'SEO Article' },
      { value: 'academic-paper', label: 'Academic Paper' },
      { value: 'news-article', label: 'News Article' },
      { value: 'product-description', label: 'Product Description' }
    ];
    
    const selectedType = articleTypes.find(type => type.value === selectedArticleType);
    return selectedType?.label || selectedArticleType;
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Select Your Topic</h3>
      </div>
      
      <p className="text-gray-600 mb-4">
        Enter the main topic or title for your article. AI Scribe will help you develop it into comprehensive content.
      </p>
      
      <div className="mb-5">
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Article Title or Topic
        </label>
        <div className="relative">
          <Pencil className="absolute left-3 top-3 text-gray-400 pointer-events-none" size={18} />
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E.g., Best WordPress Plugins for SEO"
            className="input pl-10"
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Tip: Be specific about your topic for better results
        </p>
      </div>
      
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Sparkles className="text-primary mr-2" size={18} />
            AI Topic Suggestions
          </h4>
          <div className="flex items-center">
            <button
              onClick={handleGenerateTopics}
              className="btn btn-ghost text-sm py-1 px-3 flex items-center mr-2"
              disabled={isGeneratingIdeas}
            >
              <RefreshCw className={`mr-1 ${isGeneratingIdeas ? 'animate-spin' : ''}`} size={14} />
              {isGeneratingIdeas ? 'Regenerating...' : 'Regenerate'}
            </button>
            <button
              onClick={handleGenerateTopics}
              className="btn btn-primary text-sm py-1 px-3 flex items-center"
              disabled={isGeneratingIdeas}
            >
              {isGeneratingIdeas ? (
                <>
                  <RefreshCw className="mr-1 animate-spin" size={14} />
                  Generating...
                </>
              ) : (
                <>
                  <Zap className="mr-1" size={14} />
                  Generate Ideas
                </>
              )}
            </button>
          </div>
        </div>
        
        {topicPrompt && (
          <div className="mb-4">
            {isGeneratingIdeas ? (
              <div className="flex items-center justify-center p-6">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-gray-600">Generating topic ideas...</span>
              </div>
            ) : (
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
            )}
          </div>
        )}
        
        {!topicPrompt && (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">No topic prompt template found</p>
            <p className="text-sm text-gray-600">
              Please configure a topic prompt template in the admin section.
            </p>
          </div>
        )}
      </div>
      
      {/* No duplicate navigation buttons here - using FixedNavigation component instead */}
    </div>
  );
};

export default TopicStep;