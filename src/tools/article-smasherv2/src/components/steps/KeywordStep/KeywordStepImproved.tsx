import React, { useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { Search, RefreshCw, Info, X, ChevronRight, Download, Check, Plus } from 'lucide-react';

interface KeywordData {
  keyword: string;
  volume: number;
  difficulty: number | string;
  cpc: number;
}

const KeywordStepImproved: React.FC = () => {
  const { 
    title,
    selectedKeywords, 
    setSelectedKeywords
  } = useArticleWizard();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataSource, setShowDataSource] = useState(false);
  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  
  // Sample keyword data
  const [keywords, setKeywords] = useState<KeywordData[]>([
    { keyword: "gpt-4o wordpress plugin", volume: 6200, difficulty: "Medium", cpc: 3.15 },
    { keyword: "ai seo wordpress", volume: 4900, difficulty: "High", cpc: 2.85 },
    { keyword: "wordpress ai writer", volume: 3700, difficulty: "Medium", cpc: 1.95 },
    { keyword: "wordpress ai content generator", volume: 2900, difficulty: "Low", cpc: 1.74 },
    { keyword: "best ai plugin for wordpress", volume: 2400, difficulty: "Medium", cpc: 2.25 },
    { keyword: "wordpress chatgpt integration", volume: 1800, difficulty: "Low", cpc: 1.45 },
    { keyword: "ai powered wordpress themes", volume: 1500, difficulty: "Medium", cpc: 1.85 },
    { keyword: "wordpress ai assistant", volume: 1200, difficulty: "Low", cpc: 1.35 }
  ]);
  
  // Function to simulate keyword search
  const searchKeywords = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoadingKeywords(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample keyword data
      const newKeywords = [
        { keyword: searchQuery, volume: 5400, difficulty: "High", cpc: 1.2 },
        { keyword: `${searchQuery} tutorial`, volume: 2900, difficulty: "Medium", cpc: 0.8 },
        { keyword: `best ${searchQuery}`, volume: 1800, difficulty: "Medium", cpc: 1.5 },
        { keyword: `${searchQuery} for beginners`, volume: 1200, difficulty: "Low", cpc: 0.7 },
        { keyword: `${searchQuery} examples`, volume: 890, difficulty: "Low", cpc: 0.5 },
        { keyword: `advanced ${searchQuery}`, volume: 650, difficulty: "High", cpc: 1.8 },
        { keyword: `${searchQuery} vs alternatives`, volume: 450, difficulty: "Medium", cpc: 1.1 },
        { keyword: `how to use ${searchQuery}`, volume: 1100, difficulty: "Low", cpc: 0.9 }
      ];
      
      setKeywords(newKeywords);
      setIsLoadingKeywords(false);
    }, 1500);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchKeywords();
    }
  };
  
  const toggleKeywordSelection = (keyword: string) => {
    if (selectedKeywords.includes(keyword)) {
      setSelectedKeywords(selectedKeywords.filter(k => k !== keyword));
    } else {
      setSelectedKeywords([...selectedKeywords, keyword]);
    }
  };
  
  const regenerateKeywords = () => {
    if (title) {
      setSearchQuery(title);
      setIsLoadingKeywords(true);
      
      // Simulate API call delay
      setTimeout(() => {
        // Sample keyword data based on title
        const newKeywords = [
          { keyword: title.toLowerCase(), volume: 4800, difficulty: "High", cpc: 1.3 },
          { keyword: `${title.toLowerCase()} guide`, volume: 2600, difficulty: "Medium", cpc: 0.9 },
          { keyword: `best ${title.toLowerCase()}`, volume: 1900, difficulty: "Medium", cpc: 1.6 },
          { keyword: `${title.toLowerCase()} for wordpress`, volume: 1300, difficulty: "Medium", cpc: 0.8 },
          { keyword: `${title.toLowerCase()} tips`, volume: 950, difficulty: "Low", cpc: 0.6 },
          { keyword: `professional ${title.toLowerCase()}`, volume: 700, difficulty: "High", cpc: 1.7 },
          { keyword: `${title.toLowerCase()} alternatives`, volume: 500, difficulty: "Medium", cpc: 1.2 },
          { keyword: `how to improve ${title.toLowerCase()}`, volume: 1200, difficulty: "Low", cpc: 1.0 }
        ];
        
        setKeywords(newKeywords);
        setIsLoadingKeywords(false);
      }, 1500);
    }
  };
  
  // Get difficulty color
  const getDifficultyColor = (difficulty: string | number) => {
    if (typeof difficulty === 'string') {
      if (difficulty === 'Low') return 'text-green-600';
      if (difficulty === 'Medium') return 'text-yellow-600';
      return 'text-red-600';
    } else {
      if (difficulty < 30) return 'text-green-600';
      if (difficulty < 60) return 'text-yellow-600';
      return 'text-red-600';
    }
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
          onClick={searchKeywords}
          disabled={isLoadingKeywords || !searchQuery.trim()}
          className="ml-2 bg-primary text-white p-2 rounded-md hover:bg-primary-dark h-10 w-10 flex items-center justify-center"
        >
          {isLoadingKeywords ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
        </button>
        <button
          onClick={regenerateKeywords}
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
              <span className="font-medium">Data Source Information:</span> This demo uses sample data formatted according to Wordtracker API's structure.
            </p>
            <p>
              In a production environment, this would connect to an actual SEO keyword API. For demo purposes, we're using a simulation of real-world keyword metrics.
            </p>
          </div>
        )}
        
        {isLoadingKeywords ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
            <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={24} />
            <p className="text-gray-600">Researching keywords...</p>
          </div>
        ) : keywords.length > 0 ? (
          <div className="space-y-2">
            {keywords.map((keyword, index) => (
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
                          {keyword.difficulty}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">CPC:</span> ${typeof keyword.cpc === 'number' ? keyword.cpc.toFixed(2) : keyword.cpc}
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