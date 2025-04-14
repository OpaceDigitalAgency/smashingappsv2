import React from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { RefreshCw, Pencil, Sparkles, Zap } from 'lucide-react';

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
    generateTopicIdeas
  } = useArticleWizard();
  
  // Sample topic suggestions
  const topicSuggestions = [
    "How to Optimize WordPress for Speed", 
    "Ultimate Guide to WordPress Security", 
    "Top 10 WordPress Themes for Business",
    "WordPress vs Headless CMS Comparison"
  ];
  
  const handleTopicSelection = (suggestion: string, index: number) => {
    setTitle(suggestion);
    setSelectedTopicIndex(index);
  };
  
  const regenerateTopic = () => {
    // This would typically call an API to generate new topics
    // For now, we'll just use the existing generateTopicIdeas function
    generateTopicIdeas();
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Select Your Topic</h3>
        <button 
          onClick={regenerateTopic} 
          className="btn btn-ghost text-sm py-1 px-3 flex items-center"
          disabled={isGeneratingIdeas}
        >
          <RefreshCw className={`mr-1 ${isGeneratingIdeas ? 'animate-spin' : ''}`} size={14} />
          {isGeneratingIdeas ? 'Regenerating...' : 'Regenerate'}
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Enter the main topic or title for your article. AI Scribe will help you develop it into comprehensive content.
      </p>
      
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
        <div className="flex justify-between items-center mb-2">
          <h4 className="font-medium text-gray-800 flex items-center">
            <Sparkles className="text-primary mr-2" size={18} />
            AI Topic Suggestions
          </h4>
          <button 
            onClick={generateTopicIdeas}
            className="btn btn-ghost text-sm py-1 px-3 flex items-center"
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
  );
};

export default TopicStep;