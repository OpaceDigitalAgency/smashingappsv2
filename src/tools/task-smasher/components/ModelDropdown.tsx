import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Zap, DollarSign, Info, MessageSquare, Settings, Star } from 'lucide-react';
import { getModelsByCategory, getModelsByProvider, aiServiceRegistry, getServiceForModel } from '../../../shared/services/aiServices';
import { AIModel } from '../../../shared/types/aiProviders';

interface ModelDropdownProps {
  selectedModel: string;
  setSelectedModel: (model: string) => void;
  totalCost: number;
  executionCount: number;
  rateLimited: boolean;
  rateLimitInfo: {
    limit: number;
    remaining: number;
    reset: Date;
    used: number;
  };
  onToggleOpenAIExample?: () => void;
  onOpenAPISettings: () => void;
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedModel,
  setSelectedModel,
  totalCost,
  executionCount,
  rateLimited,
  rateLimitInfo,
  onToggleOpenAIExample,
  onOpenAPISettings
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [modelsByCategory, setModelsByCategory] = useState<Record<string, AIModel[]>>({});
  const [activeProvider, setActiveProvider] = useState<string>('openai');

  // Load models and active provider on mount
  useEffect(() => {
    setModelsByCategory(getModelsByCategory());
    
    // Get active provider from localStorage or use default
    const storedProvider = localStorage.getItem('smashingapps_activeProvider');
    if (storedProvider) {
      setActiveProvider(storedProvider);
    } else {
      setActiveProvider(aiServiceRegistry.getDefaultProvider());
    }
  }, []);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-sm border border-gray-200/80 p-4 mb-6 transition-all duration-300 w-full model-dropdown-container">
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-gray-700 hover:text-gray-900"
      >
        <span className="font-medium">Choose your model</span>
        {isExpanded ? 
          <ChevronUp className="w-5 h-5" /> : 
          <ChevronDown className="w-5 h-5" />
        }
      </button>
      
      {isExpanded && (
        <div className="mt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
              <select
                value={selectedModel}
                onChange={(e) => {
                  const newModel = e.target.value;
                  setSelectedModel(newModel);
                  
                  // Get the provider for the selected model
                  const service = getServiceForModel(newModel);
                  if (service) {
                    const provider = service.provider;
                    setActiveProvider(provider);
                    
                    // Save the active provider to localStorage
                    localStorage.setItem('smashingapps_activeProvider', provider);
                    
                    // Set as default provider in the registry
                    aiServiceRegistry.setDefaultProvider(provider);
                    
                    // Check if API key is set for this provider
                    if (!service.isConfigured()) {
                      // Open API settings modal to prompt for API key
                      onOpenAPISettings();
                    }
                  }
                }}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white w-full sm:w-[250px] appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M6%208L0%202h12z%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 0.5rem center", paddingRight: "2rem" }}
              >
                {/* Featured Models */}
                {modelsByCategory['featured'] && modelsByCategory['featured'].length > 0 && (
                  <optgroup label="Featured Models">
                    {modelsByCategory['featured'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Reasoning Models */}
                {modelsByCategory['reasoning'] && modelsByCategory['reasoning'].length > 0 && (
                  <optgroup label="Reasoning Models">
                    {modelsByCategory['reasoning'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Cost-Optimized Models */}
                {modelsByCategory['cost-optimized'] && modelsByCategory['cost-optimized'].length > 0 && (
                  <optgroup label="Cost-Optimized Models">
                    {modelsByCategory['cost-optimized'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Image Models */}
                {modelsByCategory['image'] && modelsByCategory['image'].length > 0 && (
                  <optgroup label="Image Generation">
                    {modelsByCategory['image'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Legacy Models */}
                {modelsByCategory['legacy'] && modelsByCategory['legacy'].length > 0 && (
                  <optgroup label="Legacy Models">
                    {modelsByCategory['legacy'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
                
                {/* Other Models */}
                {modelsByCategory['other'] && modelsByCategory['other'].length > 0 && (
                  <optgroup label="Other Models">
                    {modelsByCategory['other'].map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} - {model.description}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              
              {/* API Settings Button */}
              <button
                onClick={onOpenAPISettings}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>API Settings</span>
              </button>
              
              {/* OpenAI Example Button */}
              {onToggleOpenAIExample && (
                <button
                  onClick={onToggleOpenAIExample}
                  className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 text-indigo-500" />
                  <span>OpenAI Example</span>
                </button>
              )}
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-indigo-500" />
                <span className="text-gray-600">Active Provider: {activeProvider}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="text-gray-600">API Calls: {executionCount}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="w-4 h-4 text-green-500" />
                <span className="text-gray-600">Estimated cost: ${totalCost.toFixed(4)}</span>
              </div>
              {typeof rateLimited !== 'undefined' && rateLimited ? (
                <div className="flex items-center gap-2 text-sm bg-red-50 text-red-600 px-2 py-1 rounded-md">
                  <Info className="w-4 h-4" />
                  <span>API Limit Reached! Reset at {new Date(rateLimitInfo.reset).toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                  <Info className="w-4 h-4" />
                  <span>API Usage: {rateLimitInfo.used} of {rateLimitInfo.limit} (Remaining: {rateLimitInfo.remaining})</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelDropdown;