import React, { useState } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { Search, RefreshCw, Info, X } from 'lucide-react';

const KeywordStep: React.FC = () => {
  const { 
    title,
    selectedKeywords, 
    setSelectedKeywords,
    keywords,
    setKeywords,
    isLoadingKeywords,
    setIsLoadingKeywords
  } = useArticleWizard();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showDataSource, setShowDataSource] = useState(false);
  
  // Function to simulate keyword search
  const searchKeywords = () => {
    if (!searchQuery.trim()) return;
    
    setIsLoadingKeywords(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Sample keyword data
      const newKeywords = [
        { keyword: searchQuery, volume: 5400, difficulty: 67, cpc: 1.2 },
        { keyword: `${searchQuery} tutorial`, volume: 2900, difficulty: 42, cpc: 0.8 },
        { keyword: `best ${searchQuery}`, volume: 1800, difficulty: 51, cpc: 1.5 },
        { keyword: `${searchQuery} for beginners`, volume: 1200, difficulty: 38, cpc: 0.7 },
        { keyword: `${searchQuery} examples`, volume: 890, difficulty: 29, cpc: 0.5 },
        { keyword: `advanced ${searchQuery}`, volume: 650, difficulty: 72, cpc: 1.8 },
        { keyword: `${searchQuery} vs alternatives`, volume: 450, difficulty: 45, cpc: 1.1 },
        { keyword: `how to use ${searchQuery}`, volume: 1100, difficulty: 35, cpc: 0.9 }
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
          { keyword: title.toLowerCase(), volume: 4800, difficulty: 62, cpc: 1.3 },
          { keyword: `${title.toLowerCase()} guide`, volume: 2600, difficulty: 45, cpc: 0.9 },
          { keyword: `best ${title.toLowerCase()}`, volume: 1900, difficulty: 53, cpc: 1.6 },
          { keyword: `${title.toLowerCase()} for wordpress`, volume: 1300, difficulty: 40, cpc: 0.8 },
          { keyword: `${title.toLowerCase()} tips`, volume: 950, difficulty: 32, cpc: 0.6 },
          { keyword: `professional ${title.toLowerCase()}`, volume: 700, difficulty: 68, cpc: 1.7 },
          { keyword: `${title.toLowerCase()} alternatives`, volume: 500, difficulty: 47, cpc: 1.2 },
          { keyword: `how to improve ${title.toLowerCase()}`, volume: 1200, difficulty: 38, cpc: 1.0 }
        ];
        
        setKeywords(newKeywords);
        setIsLoadingKeywords(false);
      }, 1500);
    }
  };
  
  // Calculate difficulty color
  const getDifficultyColor = (difficulty: number) => {
    if (difficulty < 30) return 'text-green-600';
    if (difficulty < 60) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  // Calculate difficulty label
  const getDifficultyLabel = (difficulty: number) => {
    if (difficulty < 30) return 'Easy';
    if (difficulty < 60) return 'Medium';
    return 'Hard';
  };
  
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-bold text-gray-800">Keyword Research</h3>
        <button onClick={regenerateKeywords} className="btn btn-ghost text-sm py-1 px-3 flex items-center">
          <RefreshCw className="mr-1" size={14} />
          Regenerate
        </button>
      </div>
      
      <p className="text-gray-600 mb-4">
        Research and select keywords to optimize your content for search engines.
      </p>
      
      {/* Search Bar */}
      <div className="mb-5">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search for keywords..."
            className="input pl-10 pr-4"
          />
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <button
            onClick={searchKeywords}
            disabled={isLoadingKeywords}
            className="absolute right-2 top-2 bg-primary text-white p-1 rounded-md hover:bg-primary-dark"
          >
            {isLoadingKeywords ? <RefreshCw className="animate-spin" size={18} /> : <Search size={18} />}
          </button>
        </div>
      </div>
      
      {/* Selected Keywords */}
      {selectedKeywords.length > 0 && (
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Selected Keywords</h4>
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
                  className="ml-2 text-primary hover:text-primary-dark"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Keyword Results */}
      {isLoadingKeywords ? (
        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
          <RefreshCw className="animate-spin mx-auto mb-3 text-primary" size={24} />
          <p className="text-gray-600">Researching keywords...</p>
        </div>
      ) : keywords.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-gray-700">Keyword Results</h4>
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
          
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keyword
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Volume
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Difficulty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CPC ($)
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {keywords.map((keyword, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{keyword.keyword}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{keyword.volume.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <div className="flex items-center">
                        <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              keyword.difficulty < 30
                                ? 'bg-green-500'
                                : keyword.difficulty < 60
                                ? 'bg-yellow-500'
                                : 'bg-red-500'
                            }`}
                            style={{ width: `${keyword.difficulty}%` }}
                          ></div>
                        </div>
                        <span className={`text-xs font-medium ${getDifficultyColor(keyword.difficulty)}`}>
                          {getDifficultyLabel(keyword.difficulty)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">${keyword.cpc.toFixed(2)}</td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => toggleKeywordSelection(keyword.keyword)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          selectedKeywords.includes(keyword.keyword)
                            ? 'bg-primary-50 text-primary hover:bg-primary-100'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {selectedKeywords.includes(keyword.keyword) ? 'Selected' : 'Select'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-2">No keywords found</p>
          <p className="text-sm text-gray-500">
            Search for keywords or click "Regenerate" to get keyword suggestions based on your topic.
          </p>
        </div>
      )}
    </div>
  );
};

export default KeywordStep;