import React, { useState, useEffect } from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';
import { usePrompt } from '../../../contexts/PromptContext';
import {
  RefreshCw,
  FileText,
  Sliders,
  ChevronRight,
  Clock,
  Tag,
  Save,
  Copy,
  Sparkles,
  Zap
} from 'lucide-react';

const ContentStep: React.FC = () => {
  const { 
    title, 
    selectedKeywords, 
    outline,
    htmlOutput, 
    setHtmlOutput, 
    generating, 
    setGenerating,
    articleContent,
    setArticleContent,
    generateContent
  } = useArticleWizard();
  
  const { prompts, settings } = usePrompt();
  
  // Get the content prompt template
  const contentPrompts = prompts.filter(p => p.category === 'content');
  const contentPrompt = contentPrompts.length > 0 ? contentPrompts[0] : null;
  
  const [showSettings, setShowSettings] = useState(false);
  const [contentLength, setContentLength] = useState('medium');
  const [contentTone, setContentTone] = useState('informative');
  const [includeStats, setIncludeStats] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [readingTime, setReadingTime] = useState('5 min');
  
  // Calculate reading time based on content length
  useEffect(() => {
    if (articleContent) {
      const wordCount = articleContent.text.split(/\s+/).length;
      const minutes = Math.ceil(wordCount / 200); // Average reading speed is about 200 words per minute
      setReadingTime(`${minutes} min`);
    }
  }, [articleContent]);
  
  const handleGenerateContent = async () => {
    if (title && selectedKeywords.length > 0 && outline.length > 0) {
      await generateContent(title, selectedKeywords, outline);
    }
  };
  
  const copyContent = () => {
    if (articleContent) {
      navigator.clipboard.writeText(articleContent.text)
        .then(() => {
          alert('Content copied to clipboard!');
        })
        .catch(err => {
          console.error('Failed to copy content:', err);
          alert('Failed to copy content. Please try again.');
        });
    }
  };
  
  const saveContent = () => {
    if (articleContent) {
      const blob = new Blob([articleContent.text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title.replace(/\s+/g, '-').toLowerCase()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Content Generation</h3>
          <p className="text-gray-600">
            Generate high-quality content based on your topic, keywords, and outline.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-lg border border-gray-200 transition-colors shadow-sm"
        >
          <Sliders className="text-primary" size={16} />
          <span>{showSettings ? 'Hide Settings' : 'Show Settings'}</span>
        </button>
      </div>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm transition-all duration-300 ease-in-out">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="text-primary" size={18} />
            <h4 className="text-base font-semibold text-gray-800">Content Settings</h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content Length
              </label>
              <select
                value={contentLength}
                onChange={(e) => setContentLength(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary transition-all"
              >
                <option value="short">Short (~500 words)</option>
                <option value="medium">Medium (~1000 words)</option>
                <option value="long">Long (~1500 words)</option>
                <option value="comprehensive">Comprehensive (~2000+ words)</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Content Tone
              </label>
              <select
                value={contentTone}
                onChange={(e) => setContentTone(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-100 focus:border-primary transition-all"
              >
                <option value="informative">Informative</option>
                <option value="conversational">Conversational</option>
                <option value="professional">Professional</option>
                <option value="persuasive">Persuasive</option>
                <option value="technical">Technical</option>
              </select>
            </div>
          </div>
          
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="includeStats"
                  checked={includeStats}
                  onChange={(e) => setIncludeStats(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="includeStats" className="font-medium text-gray-700">
                  Include statistics and data points
                </label>
                <p className="text-gray-500">Add relevant statistics to make your content more authoritative</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  id="includeExamples"
                  checked={includeExamples}
                  onChange={(e) => setIncludeExamples(e.target.checked)}
                  className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="includeExamples" className="font-medium text-gray-700">
                  Include examples and case studies
                </label>
                <p className="text-gray-500">Add practical examples to illustrate key points</p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Content Preview */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 flex flex-col md:flex-row justify-between md:items-center gap-2">
          <div className="flex items-center">
            <FileText className="text-primary mr-2" size={18} />
            <h4 className="text-base font-medium text-gray-800">Article Content</h4>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-1.5">
              <Tag size={14} className="text-primary" />
              <span>Keywords: {selectedKeywords.length}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock size={14} className="text-primary" />
              <span>Reading Time: {readingTime}</span>
            </div>
          </div>
        </div>
        
        {htmlOutput ? (
          <div className="relative">
            <div className="absolute top-4 right-4 flex gap-2">
              <button 
                onClick={copyContent}
                className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors" 
                title="Copy content"
              >
                <Copy size={16} className="text-gray-600" />
              </button>
              <button 
                onClick={saveContent}
                className="p-2 bg-white rounded-lg border border-gray-200 shadow-sm hover:bg-gray-50 transition-colors" 
                title="Save content"
              >
                <Save size={16} className="text-gray-600" />
              </button>
            </div>
            <div className="p-6 prose prose-sm max-w-none">
              <div dangerouslySetInnerHTML={{ __html: htmlOutput }} />
            </div>
          </div>
        ) : generating ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
              <RefreshCw className="animate-spin text-primary" size={28} />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Generating your content...</h4>
            <p className="text-gray-600 max-w-md mx-auto">
              Our AI is crafting high-quality content based on your topic, keywords, and outline.
              This may take a minute or two.
            </p>
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-50 mb-4">
              <Zap className="text-primary" size={28} />
            </div>
            <h4 className="text-lg font-medium text-gray-800 mb-2">Ready to Generate Content</h4>
            <p className="text-gray-600 max-w-md mx-auto mb-6">
              Click the button below to generate high-quality content based on your topic, keywords, and outline.
            </p>
            <button
              onClick={handleGenerateContent}
              disabled={!title || selectedKeywords.length === 0 || outline.length === 0}
              className="inline-flex items-center justify-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold py-2.5 px-5 rounded-lg transition-colors shadow-sm disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed disabled:shadow-none"
            >
              <Sparkles size={16} />
              <span className="font-bold">Generate Content</span>
            </button>
            
            {(!title || selectedKeywords.length === 0 || outline.length === 0) && (
              <p className="text-red-500 text-sm mt-2">
                {!title ? "Please set a title first. " : ""}
                {selectedKeywords.length === 0 ? "Please select keywords. " : ""}
                {outline.length === 0 ? "Please create an outline. " : ""}
              </p>
            )}
          </div>
        )}
      </div>
      
      {/* Action Buttons */}
      {htmlOutput && (
        <div className="flex justify-end">
          <button
            onClick={handleGenerateContent}
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-medium py-2.5 px-5 rounded-lg border border-gray-200 transition-colors shadow-sm"
            disabled={generating}
          >
            {generating ? (
              <>
                <RefreshCw className="animate-spin text-primary" size={16} />
                <span>Regenerating...</span>
              </>
            ) : (
              <>
                <RefreshCw className="text-primary" size={16} />
                <span>Regenerate Content</span>
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ContentStep;