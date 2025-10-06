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
  const modelRegistry = ModelRegistry.getInstance();

  const configuredProviders = aiCore.getConfiguredProviders();

  useEffect(() => {
    if (configuredProviders.length > 0 && !selectedProvider) {
      setSelectedProvider(configuredProviders[0]);
    }
  }, [configuredProviders, selectedProvider]);

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
          return registryModel || {
            id,
            provider: selectedProvider,
            name: id,
            description: 'Model from provider API',
            type: 'chat' as const,
            capabilities: {
              maxTokens: 4096,
              supportsImages: false,
              supportsFunctions: false,
              supportsStreaming: false,
              contextWindow: 4096
            }
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
          {models.map((model) => (
            <div
              key={model.id}
              className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold text-gray-900">{model.name}</h3>
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ModelSelector;

