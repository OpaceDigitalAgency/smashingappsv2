import React, { useState, useEffect } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { usePrompt } from '../../../contexts/PromptContext';
import { Search, RefreshCw, Info, X, ChevronRight, Download, Check, Plus } from 'lucide-react';
import { KeywordData } from '../../../types';

const KeywordStepImproved: React.FC = () => {
  const { 
    title,
    selectedKeywords, 
    setSelectedKeywords,
    keywords,
    isLoadingKeywords,
    generateKeywords
  } = useArticleWizard();
  
  const { prompts, settings } = usePrompt();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataSource, setShowDataSource] = useState(false);
  const [filteredKeywords, setFilteredKeywords] = useState<KeywordData[]>([]);
  
  // Get the keyword prompt template
  const keywordPrompts = prompts.filter(p => p.category === 'keyword');
  const keywordPrompt = keywordPrompts.length > 0 ? keywordPrompts[0] : null;
  
  // Filter keywords based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredKeywords(keywords);
    } else {
      const filtered = keywords.filter(k => 
        k.keyword.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredKeywords(filtered);
    }
  }, [keywords, searchQuery]);
  
  // Initialize search query with title when component mounts
  useEffect(() => {
    if (title && !searchQuery) {
      setSearchQuery(title);
    }
  }, [title]);
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleGenerateKeywords();
    }
  };
  
  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  const handleGenerateKeywords = async () => {
    const query = searchQuery.trim() || title;
    if (query) {
      await generateKeywords(query);
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 4) return 'text-green-600';
    if (difficulty < 7) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Get difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 4) return 'Low';
    if (difficulty < 7) return 'Medium';
    return 'High';
  };
  
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-800 mb-2">Keyword Research</h2>
      
      <p className="text-gray-600 mb-4">
        Select relevant keywords to target in your content for better SEO performance.
      </p>
      
      {/* Selected Keywords */}
      {selectedKeywords.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-gray-700">Selected Keywords</h3>
            <span className="text-xs text-gray-500">{selectedKeywords.length} selected</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedKeywords.map((keyword, index) => (
              <div
                key={index}
                className="bg-primary-50 text-primary px-3 py-1 rounded-full text-sm flex items-center"
              >
                <span>{keyword}</span>
                <button
                  onClick={() => toggleKeywordSelection(keyword)}
                  className="ml-2 text-red-500 hover:text-red-700 bg-white rounded-full p-0.5"
                  title="Remove keyword"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Keyword Search */}
      <div className="flex items-center mb-4">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for keywords..."
            className="input pl-10 pr-4 w-full"
          />
        </div>
        <button
          onClick={handleGenerateKeywords}
          disabled={isLoadingKeywords || (!searchQuery.trim() && !title)}
          className="ml-2 bg-primary text-white p-2 rounded-md hover:bg-primary-dark h-10 w-10 flex items-center justify-center"
        >
          {isLoadingKeywords ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
        </button>
        <button
          onClick={handleGenerateKeywords}
          disabled={isLoadingKeywords}
          className="ml-2 bg-white border border-gray-300 text-gray-700 p-2 rounded-md hover:bg-gray-50 h-10 flex items-center justify-center"
        >
          <RefreshCw size={18} />
        </button>
      </div>
      
      {/* Keyword Suggestions */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium text-gray-700 flex items-center">
            Keyword Suggestions
          </h3>
          <button
            onClick={() => setShowDataSource(!showDataSource)}
            className="text-xs text-gray-500 flex items-center"
          >
            <Info size={12} className="mr-1" />
            Data Source
          </button>
        </div>
        
        {showDataSource && (
          <div className="bg-gray-50 rounded-lg p-3 mb-3 text-xs text-gray-600">
            <p className="mb-1">
              <span className="font-medium">Data Source Information:</span> Keywords are generated using AI based on your topic.
            </p>
            <p>
              The volume, difficulty, and CPC metrics are estimates generated by the AI to simulate real-world keyword metrics.
            </p>
          </div>
        )}
        
        {isLoadingKeywords ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={24} />
            <p className="text-gray-600">Researching keywords...</p>
          </div>
        ) : filteredKeywords.length > 0 ? (
          <div className="space-y-2">
            {filteredKeywords.map((keyword, index) => (
              <div 
                key={index} 
                className="bg-white rounded-lg border border-gray-200 p-3 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-grow">
                    <div className="flex items-center">
                      <h4 className="text-sm font-medium text-gray-800">{keyword.keyword}</h4>
                      
                      {/* New add/remove controls */}
                      {selectedKeywords.includes(keyword.keyword) ? (
                        <button
                          onClick={() => toggleKeywordSelection(keyword.keyword)}
                          className="ml-2 p-1 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          title="Remove keyword"
                        >
                          <X size={14} />
                        </button>
                      ) : (
                        <button
                          onClick={() => toggleKeywordSelection(keyword.keyword)}
                          className="ml-2 p-1 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                          title="Add keyword"
                        >
                          <Plus size={14} />
                        </button>
                      )}
                    </div>
                    
                    <div className="flex items-center mt-2 text-xs text-gray-500 space-x-4">
                      <div>
                        <span className="font-medium">Volume:</span> {keyword.volume.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-medium">Difficulty:</span> 
                        <span className={`ml-1 ${getDifficultyColor(keyword.difficulty)}`}>
                          {getDifficultyLabel(keyword.difficulty)}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">CPC:</span> ${keyword.cpc.toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  {/* Action button */}
                  {selectedKeywords.includes(keyword.keyword) ? (
                    <button
                      onClick={() => toggleKeywordSelection(keyword.keyword)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                      title="Remove keyword"
                    >
                      <X size={16} />
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleKeywordSelection(keyword.keyword)}
                      className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-600 hover:bg-green-200 transition-colors"
                      title="Add keyword"
                    >
                      <Check size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600 mb-2">No keywords found</p>
            <p className="text-sm text-gray-500">
              Search for keywords or click the refresh button to get keyword suggestions based on your topic.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KeywordStepImproved;