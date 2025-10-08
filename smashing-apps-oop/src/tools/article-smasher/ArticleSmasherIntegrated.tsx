/**
 * Article Smasher - Integrated Version
 *
 * This component wraps the Article Smasher with necessary providers
 * for integration into the main SmashingApps application.
 */

import React from 'react';
import { Routes, Route, useParams, Navigate } from 'react-router-dom';
import { PromptProvider } from './contexts/PromptContext';
import { ArticleWizardProvider } from './contexts/ArticleWizardContext';
import ArticleWizard from './components/ArticleWizard';
import './styles/article-smasher-v2.css';

// Import the landing page component from the original App
// For now, we'll create a simple landing page that goes straight to the wizard
const ArticleSmasherLanding: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Article Smasher
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI-Powered Content Creation Tool
          </p>
          <a
            href="/tools/article-smasher/wizard"
            className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Start Creating
          </a>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">📝</div>
            <h3 className="text-xl font-semibold mb-2">Smart Topic Generation</h3>
            <p className="text-gray-600">
              AI-powered topic suggestions based on your niche and article type
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Keyword Research</h3>
            <p className="text-gray-600">
              Automatic keyword analysis with volume, difficulty, and CPC data
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-blue-600 text-4xl mb-4">✨</div>
            <h3 className="text-xl font-semibold mb-2">Full Article Generation</h3>
            <p className="text-gray-600">
              Complete articles with outline, content, and images in minutes
            </p>
          </div>
        </div>

        <div className="mt-16 bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works</h2>
          <div className="space-y-6">
            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                1
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Choose Your Topic</h3>
                <p className="text-gray-600">Select an article type and get AI-generated topic suggestions</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                2
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Research Keywords</h3>
                <p className="text-gray-600">Get keyword suggestions with search volume and difficulty metrics</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                3
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Generate Outline</h3>
                <p className="text-gray-600">AI creates a structured outline for your article</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                4
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Create Content</h3>
                <p className="text-gray-600">Full article content generated based on your outline and keywords</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                5
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Add Images</h3>
                <p className="text-gray-600">AI-generated images to complement your content</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 flex-shrink-0">
                6
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1">Publish</h3>
                <p className="text-gray-600">Export your article in multiple formats</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Component that handles article type routing
 * Maps URL paths to article types and redirects to wizard
 */
const ArticleTypeRouter: React.FC = () => {
  const { articleType } = useParams<{ articleType: string }>();

  // Map URL paths to article type values
  const articleTypeMap: Record<string, string> = {
    'blog-post': 'blog-post',
    'seo-article': 'seo-article',
    'academic-paper': 'academic-paper',
    'news-article': 'news-article',
    'product-description': 'product-description',
    'long-form': 'long-form',
    'short-form': 'short-form',
    'social-post': 'social-post',
    'whitepaper': 'whitepaper',
    'press-release': 'press-release',
    'case-study': 'case-study',
    'technical-doc': 'technical-doc',
    'how-to': 'how-to',
    'faq-page': 'faq-page'
  };

  // Check if the article type is valid
  const mappedType = articleType ? articleTypeMap[articleType] : null;

  if (!mappedType) {
    // If invalid article type, redirect to main page
    return <Navigate to="/tools/article-smasher" replace />;
  }

  // Store the article type in localStorage so the wizard can pick it up
  React.useEffect(() => {
    console.log('ArticleTypeRouter: Setting preselected type:', mappedType);
    localStorage.setItem('preselected_article_type', mappedType);
  }, [mappedType]);

  // Redirect to wizard (relative path)
  return <Navigate to="../wizard" replace />;
};

/**
 * Main Article Smasher component with routing
 */
const ArticleSmasherIntegrated: React.FC = () => {
  return (
    <PromptProvider>
      <Routes>
        <Route index element={<ArticleSmasherLanding />} />
        <Route
          path="wizard"
          element={
            <ArticleWizardProvider>
              <ArticleWizard />
            </ArticleWizardProvider>
          }
        />
        {/* Article type specific routes */}
        <Route path=":articleType" element={<ArticleTypeRouter />} />
      </Routes>
    </PromptProvider>
  );
};

export default ArticleSmasherIntegrated;

