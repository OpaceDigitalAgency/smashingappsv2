import React, { useState, useEffect } from 'react';
import AICore from '../../core/AICore';
import ProviderCard from './components/ProviderCard';
import UsageStats from './components/UsageStats';
import ModelSelector from './components/ModelSelector';

const AdminPage: React.FC = () => {
  const [aiCore] = useState(() => AICore.getInstance());
  const [activeTab, setActiveTab] = useState<'providers' | 'models' | 'usage' | 'settings'>('providers');
  const [providerStatus, setProviderStatus] = useState(aiCore.getProviderStatus());
  const [settings, setSettings] = useState(aiCore.getSettings());
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const handleSettingsChange = () => {
      setProviderStatus(aiCore.getProviderStatus());
      setSettings(aiCore.getSettings());
      setRefreshKey(prev => prev + 1);
    };

    window.addEventListener('ai-core-settings-changed', handleSettingsChange);
    return () => {
      window.removeEventListener('ai-core-settings-changed', handleSettingsChange);
    };
  }, [aiCore]);

  const providers = [
    {
      id: 'openai',
      name: 'OpenAI',
      description: 'GPT-4o, GPT-4o-mini, and other OpenAI models',
      icon: '🤖',
      color: 'from-green-500 to-emerald-500',
      getKeyUrl: 'https://platform.openai.com/api-keys',
    },
    {
      id: 'anthropic',
      name: 'Anthropic Claude',
      description: 'Claude Sonnet 4, Claude Opus 4, and other Claude models',
      icon: '🧠',
      color: 'from-orange-500 to-red-500',
      getKeyUrl: 'https://console.anthropic.com/',
    },
    {
      id: 'gemini',
      name: 'Google Gemini',
      description: 'Gemini 2.0 Flash, Gemini 1.5 Pro, and other Gemini models',
      icon: '✨',
      color: 'from-blue-500 to-cyan-500',
      getKeyUrl: 'https://makersuite.google.com/app/apikey',
    },
    {
      id: 'openrouter',
      name: 'OpenRouter',
      description: 'Access multiple AI providers through a single API',
      icon: '🔀',
      color: 'from-purple-500 to-pink-500',
      getKeyUrl: 'https://openrouter.ai/keys',
    },
  ];

  const tabs = [
    { id: 'providers', name: 'Providers', icon: '🔌' },
    { id: 'models', name: 'Models', icon: '🎯' },
    { id: 'usage', name: 'Usage', icon: '📊' },
    { id: 'settings', name: 'Settings', icon: '⚙️' },
  ];

  const handleResetStats = () => {
    if (confirm('Are you sure you want to reset all usage statistics? This cannot be undone.')) {
      aiCore.resetStats();
      setRefreshKey(prev => prev + 1);
    }
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI-Core Admin</h1>
          <p className="text-lg text-gray-600">
            Manage your AI providers, models, and settings
          </p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-1 p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {/* Providers Tab */}
            {activeTab === 'providers' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Configure AI Providers</h2>
                  <p className="text-gray-600">
                    Add your API keys to enable AI providers. Your keys are stored securely in your browser.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {providers.map((provider) => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      status={providerStatus[provider.id]}
                      aiCore={aiCore}
                      onUpdate={() => setRefreshKey(prev => prev + 1)}
                    />
                  ))}
                </div>

                <div className="mt-8 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <h3 className="font-medium text-blue-900 mb-1">About API Keys</h3>
                      <p className="text-sm text-blue-800">
                        Your API keys are stored locally in your browser and never sent to our servers.
                        You need at least one configured provider to use the AI tools.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Models Tab */}
            {activeTab === 'models' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Available Models</h2>
                  <p className="text-gray-600">
                    View and select models from your configured providers
                  </p>
                </div>

                <ModelSelector aiCore={aiCore} refreshKey={refreshKey} />
              </div>
            )}

            {/* Usage Tab */}
            {activeTab === 'usage' && (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Usage Statistics</h2>
                    <p className="text-gray-600">
                      Monitor your AI usage and costs across all tools
                    </p>
                  </div>
                  <button
                    onClick={handleResetStats}
                    className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Reset Statistics
                  </button>
                </div>

                <UsageStats aiCore={aiCore} refreshKey={refreshKey} />
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div>
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Global Settings</h2>
                  <p className="text-gray-600">
                    Configure global AI-Core settings
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Default Provider</h3>
                    <select
                      value={settings.defaultProvider}
                      onChange={(e) => {
                        aiCore.updateSettings({ defaultProvider: e.target.value });
                        setSettings(aiCore.getSettings());
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    >
                      {aiCore.getConfiguredProviders().map((provider) => (
                        <option key={provider} value={provider}>
                          {provider.charAt(0).toUpperCase() + provider.slice(1)}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-4">Features</h3>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableStats}
                          onChange={(e) => {
                            aiCore.updateSettings({ enableStats: e.target.checked });
                            setSettings(aiCore.getSettings());
                          }}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">Enable usage statistics tracking</span>
                      </label>
                      <label className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={settings.enableCaching}
                          onChange={(e) => {
                            aiCore.updateSettings({ enableCaching: e.target.checked });
                            setSettings(aiCore.getSettings());
                          }}
                          className="w-4 h-4 text-indigo-600 rounded focus:ring-indigo-500"
                        />
                        <span className="text-gray-700">Enable model caching</span>
                      </label>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-medium text-gray-900 mb-2">About AI-Core</h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p>Version: 1.0.0</p>
                      <p>Configured Providers: {aiCore.getConfiguredProviders().length}</p>
                      <p>Available Models: {aiCore.getAllModels().length}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

