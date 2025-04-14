import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { FileText, FileDown, File, Search, Wand2 } from 'lucide-react';
import { 
  Button, 
  Card, 
  Dropdown, 
  LoadingIndicator, 
  PromptRunner, 
  RateLimitPopup,
  useAI,
  useRateLimit,
  useLocalStorage
} from '../../shared';
import config from './config';
import StructuredData from '../../components/StructuredData';
import SEO from '../../components/SEO';

const ArticleSmasherApp: React.FC = () => {
  // State
  const [title, setTitle] = useState('');
  const [keywords, setKeywords] = useState('');
  const [article, setArticle] = useState('');
  const [selectedModel, setSelectedModel] = useState(config.capabilities.ai.defaultModel);
  const [selectedUseCase, setSelectedUseCase] = useState(config.defaultUseCase);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Hooks
  const location = useLocation();
  const { execute, isLoading, error } = useAI();
  const { 
    rateLimited, 
    rateLimitInfo, 
    showRateLimitPopup, 
    setShowRateLimitPopup, 
    clearRateLimits 
  } = useRateLimit();
  
  // Get current use case from URL
  const getCurrentUseCase = () => {
    const path = location.pathname;
    
    // Check if the path matches a specific use case
    for (const [id, useCase] of Object.entries(config.useCases)) {
      const useCasePath = config.routes.subRoutes?.[id];
      if (useCasePath && path.startsWith(useCasePath)) {
        return { id, useCase };
      }
    }
    
    // Fallback to the selected use case or default
    if (selectedUseCase && config.useCases[selectedUseCase]) {
      return {
        id: selectedUseCase,
        useCase: config.useCases[selectedUseCase]
      };
    }
    
    // Default to blog if no use case is found
    return {
      id: 'blog',
      useCase: config.useCases['blog']
    };
  };

  const currentUseCase = getCurrentUseCase();
  
  // Create SEO overrides based on the current use case
  const seoOverrides = currentUseCase ? {
    title: `${currentUseCase.useCase.label} | AI Content Creator - ArticleSmasher`,
    description: currentUseCase.useCase.description
  } : undefined;
  
  // Generate article
  const generateArticle = async () => {
    if (rateLimited) {
      setShowRateLimitPopup(true);
      return;
    }
    
    if (!title) {
      alert('Please enter a title for your article');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      // Get the current use case
      const useCase = config.useCases[currentUseCase.id];
      if (!useCase) throw new Error('Invalid use case');
      
      // Prepare the prompt
      let prompt = useCase.promptTemplate || '';
      prompt = prompt.replace('{{topic}}', title);
      
      if (keywords && prompt.includes('{{keywords}}')) {
        prompt = prompt.replace('{{keywords}}', keywords);
      }
      
      // Execute the AI request
      const systemPrompt = config.capabilities.ai.systemPromptTemplate
        .replace('{{useCase}}', useCase.description);
      
      const result = await execute({
        model: selectedModel,
        systemPrompt,
        userPrompt: prompt,
        temperature: 0.7,
      });
      
      // Update the article
      setArticle(result.content);
    } catch (error) {
      console.error('Error generating article:', error);
      // Handle error (show error message, etc.)
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Export article
  const exportArticle = (format: 'pdf' | 'json') => {
    if (!article || !title) {
      alert('Please generate an article first');
      return;
    }
    
    if (format === 'pdf') {
      alert('PDF export would be implemented here');
      // In a real implementation, this would use a PDF library
    } else if (format === 'json') {
      const data = {
        title,
        content: article,
        keywords: keywords || '',
        useCase: currentUseCase.id,
        timestamp: new Date().toISOString()
      };
      
      // Create a download link
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  // Sidebar component
  const Sidebar = () => {
    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 p-4 hidden md:block">
        <h2 className="text-lg font-semibold mb-4">Article Types</h2>
        <ul className="space-y-2">
          {Object.entries(config.useCases).map(([id, useCase]) => {
            const Icon = useCase.icon || FileText;
            return (
              <li key={id}>
                <a
                  href={config.routes.subRoutes?.[id] || config.routes.base}
                  className={`flex items-center p-2 rounded-md ${
                    currentUseCase.id === id
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  <span>{useCase.label}</span>
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full flex fade-in-app relative pt-0">
      {/* Apply SEO overrides for the current use case */}
      {seoOverrides && <SEO overrides={seoOverrides} />}
      
      {/* Add structured data */}
      {currentUseCase && (
        <StructuredData
          data={{
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            'name': `${currentUseCase.useCase.label} | AI Content Creator - ArticleSmasher`,
            'description': currentUseCase.useCase.description,
            'applicationCategory': 'BusinessApplication',
            'operatingSystem': 'Web',
            'offers': {
              '@type': 'Offer',
              'price': '0',
              'priceCurrency': 'USD'
            }
          }}
        />
      )}
      
      {/* Global Loading Indicator */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md mx-auto flex flex-col items-center">
            <LoadingIndicator size="lg" />
            <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">AI Processing...</h3>
            <p className="text-gray-600 text-center">
              Generating content with {selectedModel}. This may take a few seconds.
            </p>
          </div>
        </div>
      )}
      
      {/* Sidebar */}
      <Sidebar />
      
      <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50 overflow-auto transition-colors duration-500">
        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Model dropdown and controls */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <Dropdown
              label="AI Model"
              value={selectedModel}
              options={config.capabilities.ai.availableModels.map(model => ({ 
                value: model, 
                label: model === 'gpt-3.5-turbo' ? 'GPT-3.5 Turbo (Fast)' : 'GPT-4 (Advanced)' 
              }))}
              onChange={setSelectedModel}
            />
            
            <div className="flex items-center gap-2">
              <Button 
                variant="secondary" 
                onClick={() => exportArticle('pdf')}
                icon={FileDown}
              >
                Export PDF
              </Button>
              <Button 
                variant="secondary" 
                onClick={() => exportArticle('json')}
                icon={File}
              >
                Export JSON
              </Button>
            </div>
          </div>
          
          {/* Article title input */}
          <div className="mb-6">
            <label htmlFor="article-title" className="block text-sm font-medium text-gray-700 mb-1">
              Article Title
            </label>
            <input
              id="article-title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your article title..."
              className="w-full px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          
          {/* Keywords input (for SEO use case) */}
          {currentUseCase.id === 'seo' && (
            <div className="mb-6">
              <label htmlFor="keywords" className="block text-sm font-medium text-gray-700 mb-1">
                Target Keywords (comma separated)
              </label>
              <input
                id="keywords"
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="Enter target keywords..."
                className="w-full px-4 py-3 rounded-lg border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          )}
          
          {/* Article generation buttons */}
          <div className="mb-6 flex flex-wrap gap-4">
            <Button
              variant="primary"
              onClick={generateArticle}
              disabled={!title || isGenerating}
              icon={FileText}
              isLoading={isGenerating}
            >
              Generate Article
            </Button>
            
            {currentUseCase.id === 'seo' && (
              <Button
                variant="secondary"
                onClick={() => alert('Keyword analysis would be implemented here')}
                disabled={!article || isGenerating}
                icon={Search}
              >
                Analyze Keywords
              </Button>
            )}
            
            <Button
              variant="secondary"
              onClick={() => alert('Article optimization would be implemented here')}
              disabled={!article || isGenerating}
              icon={Wand2}
            >
              Optimize Article
            </Button>
          </div>
          
          {/* Article editor */}
          <Card title="Article Content" className="mb-6">
            {article ? (
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: article.replace(/\n/g, '<br />') }} />
              </div>
            ) : (
              <div className="text-gray-500 italic">
                Your article will appear here after generation...
              </div>
            )}
          </Card>
          
          {/* Rate limit popup */}
          <RateLimitPopup
            show={showRateLimitPopup}
            onClose={() => setShowRateLimitPopup(false)}
            rateLimitInfo={rateLimitInfo}
            onClearLimits={clearRateLimits}
          />
        </div>
      </div>
    </div>
  );
};

export default ArticleSmasherApp;