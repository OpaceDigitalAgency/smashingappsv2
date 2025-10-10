import React, { useState, useEffect } from 'react';
import AICore from '../../../core/AICore';
import ModelRegistry from '../../../core/registry/ModelRegistry';

interface ModelSelectorProps {
  aiCore: AICore;
  refreshKey: number;
}

const ModelSelector: React.FC<ModelSelectorProps> = ({ aiCore, refreshKey }) => {
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [models, setModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [defaultModel, setDefaultModel] = useState<string>('');
  const [defaultImageModel, setDefaultImageModel] = useState<string>('');
  const [activeType, setActiveType] = useState<'chat' | 'image'>('chat');
  const modelRegistry = ModelRegistry.getInstance();

  const configuredProviders = aiCore.getConfiguredProviders();
  const settings = aiCore.getSettings();

  useEffect(() => {
    if (configuredProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(configuredProviders[0]);
    }
    // Load current defaults
    setDefaultModel(settings.defaultModel || '');
    setDefaultImageModel(settings.defaultImageModel || '');
  }, [configuredProviders, selectedProvider, settings.defaultModel, settings.defaultImageModel]);

  useEffect(() => {
    if (selectedProvider) {
      loadModels();
    }
  }, [selectedProvider, refreshKey]);

  const loadModels = async () => {
    setLoading(true);
    try {
      // Get models from registry
      const registryModels = modelRegistry.getModelsByProvider(selectedProvider);

      // Try to get live models from provider
      try {
        const liveModels = await aiCore.getAvailableModels(selectedProvider);

        // Combine registry and live models
        const allModelIds = new Set([
          ...registryModels.map(m => m.id),
          ...liveModels
        ]);

        const combinedModels = Array.from(allModelIds).map(id => {
          const registryModel = registryModels.find(m => m.id === id);
          if (registryModel) {
            return registryModel;
          }

          // For unknown models, infer capabilities from model ID
          const inferCapabilities = (modelId: string) => {
            // GPT-5 models
            if (modelId.includes('gpt-5-pro')) {
              return { maxTokens: 32768, contextWindow: 512000, supportsImages: true, supportsFunctions: true, supportsStreaming: true };
            }
            if (modelId.includes('gpt-5')) {
              return { maxTokens: 16384, contextWindow: 256000, supportsImages: true, supportsFunctions: true, supportsStreaming: true };
            }

            // O3 models
            if (modelId.includes('o3-pro')) {
              return { maxTokens: 100000, contextWindow: 200000, supportsImages: false, supportsFunctions: false, supportsStreaming: true };
            }
            if (modelId.includes('o3')) {
              return { maxTokens: 65536, contextWindow: 200000, supportsImages: false, supportsFunctions: false, supportsStreaming: true };
            }

            // GPT-4.1 models
            if (modelId.includes('gpt-4.1')) {
              return { maxTokens: 16384, contextWindow: 256000, supportsImages: true, supportsFunctions: true, supportsStreaming: true };
            }

            // GPT-4o models
            if (modelId.includes('gpt-4o')) {
              return { maxTokens: 16384, contextWindow: 128000, supportsImages: true, supportsFunctions: true, supportsStreaming: true };
            }

            // O1 models
            if (modelId.includes('o1-pro')) {
              return { maxTokens: 100000, contextWindow: 200000, supportsImages: false, supportsFunctions: false, supportsStreaming: true };
            }
            if (modelId.includes('o1')) {
              return { maxTokens: 65536, contextWindow: 128000, supportsImages: false, supportsFunctions: false, supportsStreaming: true };
            }

            // GPT-4 models
            if (modelId.includes('gpt-4-turbo')) {
              return { maxTokens: 4096, contextWindow: 128000, supportsImages: true, supportsFunctions: true, supportsStreaming: true };
            }
            if (modelId.includes('gpt-4')) {
              return { maxTokens: 8192, contextWindow: 8192, supportsImages: false, supportsFunctions: true, supportsStreaming: true };
            }

            // GPT-3.5 models
            if (modelId.includes('gpt-3.5-turbo-16k')) {
              return { maxTokens: 4096, contextWindow: 16384, supportsImages: false, supportsFunctions: true, supportsStreaming: true };
            }
            if (modelId.includes('gpt-3.5')) {
              return { maxTokens: 4096, contextWindow: 16385, supportsImages: false, supportsFunctions: true, supportsStreaming: true };
            }

            // Default fallback
            return { maxTokens: 4096, contextWindow: 8192, supportsImages: false, supportsFunctions: false, supportsStreaming: false };
          };

          const capabilities = inferCapabilities(id);

          return {
            id,
            provider: selectedProvider,
            name: id,
            description: 'Model from provider API',
            type: 'chat' as const,
            capabilities
          };
        });

        setModels(combinedModels);
      } catch (error) {
        // If live fetch fails, use registry models
        setModels(registryModels);
      }
    } catch (error) {
      console.error('Failed to load models:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefaultModel = (modelId: string) => {
    aiCore.updateSettings({ defaultModel: modelId });
    setDefaultModel(modelId);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('ai-core-settings-changed'));
  };

  const handleSetDefaultImageModel = (modelId: string) => {
    aiCore.updateSettings({ defaultImageModel: modelId });
    setDefaultImageModel(modelId);

    // Dispatch event to notify other components
    window.dispatchEvent(new CustomEvent('ai-core-settings-changed'));
  };

  if (configuredProviders.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🎯</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Providers Configured</h3>
        <p className="text-gray-600">
          Configure at least one provider in the Providers tab to view available models
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Provider Selector */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Provider
        </label>
        <select
          value={selectedProvider}
          onChange={(e) => setSelectedProvider(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          {configuredProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </option>
          ))}
        </select>
      {/* Model Type Tabs and Refresh */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 -mt-2">
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveType('chat')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeType === 'chat' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Chat / Text
            </button>
            <button
              onClick={() => setActiveType('image')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${activeType === 'image' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              Image / Vision
            </button>
          </div>
          <button
            onClick={() => loadModels()}
            className="px-3 py-1.5 rounded-lg text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
            title="Refresh models from provider APIs"
          >
            Refresh models
          </button>
        </div>
      </div>

      </div>

      {/* Models List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading models...</p>
        </div>
      ) : models.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Models Found</h3>
          <p className="text-gray-600">
            No models available for this provider
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {models
            .filter((model) => (activeType === 'chat' ? model.type === 'chat' : model.type === 'image'))
            .map((model) => (
            <div
              key={model.id}
              className={`bg-white rounded-lg border-2 p-6 hover:shadow-md transition-all ${
                defaultModel === model.id
                  ? 'border-indigo-500 shadow-md'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{model.name}</h3>
                    {defaultModel === model.id && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-1">{model.description}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded ${
                  model.type === 'chat' ? 'bg-blue-100 text-blue-800' :
                  model.type === 'image' ? 'bg-purple-100 text-purple-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {model.type}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between text-gray-600">
                  <span>Model ID:</span>
                  <code className="text-xs bg-gray-100 px-2 py-1 rounded">{model.id}</code>
                </div>

                {model.capabilities && (
                  <>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Max Tokens:</span>
                      <span className="font-medium">{model.capabilities.maxTokens.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Context Window:</span>
                      <span className="font-medium">{model.capabilities.contextWindow.toLocaleString()}</span>
                    </div>
                  </>
                )}

                {model.pricing && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Input:</span>
                      <span className="font-medium">${model.pricing.inputCostPer1kTokens.toFixed(4)}/1K</span>
                    </div>
                    <div className="flex items-center justify-between text-gray-600">
                      <span>Output:</span>
                      <span className="font-medium">${model.pricing.outputCostPer1kTokens.toFixed(4)}/1K</span>
                    </div>
                  </div>
                )}

                {model.capabilities && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {model.capabilities.supportsImages && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                        Images
                      </span>
                    )}
                    {model.capabilities.supportsFunctions && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                        Functions
                      </span>
                    )}
                    {model.capabilities.supportsStreaming && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                        Streaming
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Set as Default Button */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                {model.type === 'chat' ? (
                  defaultModel === model.id ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-indigo-100 text-indigo-600 font-medium rounded-lg cursor-not-allowed"
                    >
                      ✓ Current Default Chat Model
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultModel(model.id)}
                      className="w-full px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                      Set as Default Chat Model
                    </button>
                  )
                ) : (
                  defaultImageModel === model.id ? (
                    <button
                      disabled
                      className="w-full px-4 py-2 bg-purple-100 text-purple-700 font-medium rounded-lg cursor-not-allowed"
                    >
                      ✓ Current Default Image Model
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSetDefaultImageModel(model.id)}
                      className="w-full px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Set as Default Image Model
                    </button>
                  )
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

