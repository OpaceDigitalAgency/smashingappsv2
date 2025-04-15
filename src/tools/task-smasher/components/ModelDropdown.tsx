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
              {/* Model dropdown removed - model selection should only happen in /admin */}
              
              {/* Settings Button */}
              <button
                onClick={onOpenAPISettings}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white hover:bg-gray-50 flex items-center gap-2"
              >
                <Settings className="w-4 h-4 text-indigo-500" />
                <span>Settings</span>
              </button>
            </div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-indigo-500" />
                <span className="text-gray-600">
                  Active Provider: {activeProvider.charAt(0).toUpperCase() + activeProvider.slice(1)} 
                  {selectedModel && ` (${selectedModel.includes('/') ? selectedModel.split('/')[1] : selectedModel})`}
                </span>
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
                  <span>Rate Limited - Reset at {new Date(rateLimitInfo.reset).toLocaleTimeString()}</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-600 px-2 py-1 rounded-md">
                  <Info className="w-4 h-4" />
                  <span>Requests: {rateLimitInfo.used}/{rateLimitInfo.limit}</span>
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