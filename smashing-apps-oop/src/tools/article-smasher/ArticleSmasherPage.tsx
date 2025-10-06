import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAICore } from '../../shared/hooks/useAICore';

const ArticleSmasherPage: React.FC = () => {
  const { isConfigured, sendRequest, extractContent, loading } = useAICore();
  const [topic, setTopic] = useState('');
  const [keywords, setKeywords] = useState('');
  const [tone, setTone] = useState('professional');
  const [length, setLength] = useState('medium');
  const [article, setArticle] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      alert('Please enter a topic');
      return;
    }

    setGenerating(true);
    setArticle('');

    try {
      const lengthMap: Record<string, number> = {
        short: 500,
        medium: 1000,
        long: 2000,
      };

      const prompt = `Write a ${tone} ${length} article about: ${topic}

${keywords ? `Include these keywords: ${keywords}` : ''}

Requirements:
- Write in British English
- Include an engaging introduction
- Use clear headings and subheadings
- Provide valuable, well-researched content
- Include a strong conclusion
- Make it SEO-friendly
- Target length: approximately ${lengthMap[length]} words`;

      const response = await sendRequest(
        'gpt-4o-mini',
        [
          {
            role: 'system',
            content: 'You are a professional content writer specialising in creating high-quality, SEO-optimised articles. Always use British English spellings.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          maxTokens: lengthMap[length] * 2,
          temperature: 0.7,
        },
        'article-smasher'
      );

      const content = extractContent(response);
      setArticle(content);
    } catch (error: any) {
      alert(`Failed to generate article: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(article);
    alert('Article copied to clipboard!');
  };

  if (!isConfigured) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Not Configured
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Please configure at least one AI provider to use Article Smasher
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Configure AI
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">📝 Article Smasher</h1>
          <p className="text-lg text-gray-600">
            Generate high-quality, SEO-optimised articles with AI assistance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Input Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Article Settings</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Topic *
                  </label>
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g., The Future of AI in Healthcare"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Keywords (optional)
                  </label>
                  <input
                    type="text"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                    placeholder="e.g., AI, healthcare, technology"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tone
                  </label>
                  <select
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="professional">Professional</option>
                    <option value="casual">Casual</option>
                    <option value="formal">Formal</option>
                    <option value="friendly">Friendly</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Length
                  </label>
                  <select
                    value={length}
                    onChange={(e) => setLength(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  >
                    <option value="short">Short (~500 words)</option>
                    <option value="medium">Medium (~1000 words)</option>
                    <option value="long">Long (~2000 words)</option>
                  </select>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={generating || !topic.trim()}
                  className="w-full px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? 'Generating...' : 'Generate Article'}
                </button>
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Generated Article</h2>
                {article && (
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                )}
              </div>

              {generating ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600">Generating your article...</p>
                </div>
              ) : article ? (
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
                    {article}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Create</h3>
                  <p className="text-gray-600">
                    Enter your article details and click Generate to create your content
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ArticleSmasherPage;

