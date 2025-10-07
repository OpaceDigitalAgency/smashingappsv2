import React from 'react';
import { Link } from 'react-router-dom';
import AICore from '../../core/AICore';

const HomePage: React.FC = () => {
  const aiCore = AICore.getInstance();
  const isConfigured = aiCore.isConfigured();
  const stats = aiCore.getStats();

  const tools = [
    {
      name: 'Article Smasher',
      description: 'Generate high-quality, SEO-optimised articles with AI assistance',
      path: '/tools/article-smasher',
      icon: '📝',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      name: 'Task Smasher',
      description: 'Manage tasks and projects with AI-powered organisation',
      path: '/tools/task-smasher',
      icon: '✅',
      color: 'from-purple-500 to-pink-500',
    },
    {
      name: 'Graphics Smasher',
      description: 'Professional-grade, non-destructive image editing with GPU acceleration',
      path: '/tools/graphics-smasher',
      icon: '🎨',
      color: 'from-orange-500 to-rose-500',
    },
  ];

  const features = [
    {
      title: 'Centralised AI Management',
      description: 'Configure your AI providers once and use them across all tools',
      icon: '🎯',
    },
    {
      title: 'Multiple Providers',
      description: 'Support for OpenAI, Anthropic, Google Gemini, and OpenRouter',
      icon: '🔌',
    },
    {
      title: 'Usage Tracking',
      description: 'Monitor your AI usage and costs across all tools',
      icon: '📊',
    },
    {
      title: 'Consistent Experience',
      description: 'Same settings and behaviour across all applications',
      icon: '✨',
    },
  ];

  return (
    <div className="py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Welcome to SmashingApps v2
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            AI-powered tools with centralised settings management. Configure once, use everywhere.
          </p>
          {!isConfigured ? (
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Get Started - Configure AI
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
          ) : (
            <div className="inline-flex items-center px-6 py-3 bg-green-50 text-green-700 font-medium rounded-lg">
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              AI Configured - Ready to Use
            </div>
          )}
        </div>

        {/* Stats Section */}
        {isConfigured && stats.totalRequests > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-16">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Requests</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalRequests}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Tokens</div>
              <div className="text-3xl font-bold text-gray-900">{stats.totalTokens.toLocaleString()}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Total Cost</div>
              <div className="text-3xl font-bold text-gray-900">${stats.totalCost.toFixed(2)}</div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="text-sm text-gray-600 mb-1">Providers</div>
              <div className="text-3xl font-bold text-gray-900">{aiCore.getConfiguredProviders().length}</div>
            </div>
          </div>
        )}

        {/* Tools Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Available Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {tools.map((tool) => (
              <Link
                key={tool.path}
                to={tool.path}
                className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all p-8 border border-gray-100"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {tool.name}
                </h3>
                <p className="text-gray-600 mb-4">{tool.description}</p>
                <div className="flex items-center text-indigo-600 font-medium">
                  Launch Tool
                  <svg
                    className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform"
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
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg mb-8 opacity-90">
            {isConfigured
              ? 'Your AI is configured and ready. Choose a tool to begin.'
              : 'Configure your AI providers and start using powerful AI tools.'}
          </p>
          <Link
            to={isConfigured ? '/tools/graphics-smasher' : '/admin'}
            className="inline-flex items-center px-8 py-4 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-50 transition-colors"
          >
            {isConfigured ? 'Launch Graphics Smasher' : 'Configure AI Now'}
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
};

export default HomePage;
