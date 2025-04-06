import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Zap, DollarSign, Info } from 'lucide-react';

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
}

const ModelDropdown: React.FC<ModelDropdownProps> = ({
  selectedModel,
  setSelectedModel,
  totalCost,
  executionCount,
  rateLimited,
  rateLimitInfo
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

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
                onChange={(e) => setSelectedModel(e.target.value)}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white w-full sm:w-[250px] appearance-none bg-no-repeat bg-right"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2212%22%20height%3D%2212%22%20viewBox%3D%220%200%2012%2012%22%3E%3Cpath%20fill%3D%22%23555%22%20d%3D%22M6%208L0%202h12z%22%2F%3E%3C%2Fsvg%3E')", backgroundPosition: "right 0.5rem center", paddingRight: "2rem" }}
              >
                <optgroup label="Featured models">
                  <option value="gpt-4.5-preview">GPT-4.5 Preview - Largest and most capable</option>
                  <option value="o3-mini">o3-mini - Fast, flexible reasoning</option>
                  <option value="gpt-4o">GPT-4o - Fast, intelligent, flexible</option>
                </optgroup>
                <optgroup label="Reasoning models">
                  <option value="o1">o1 - High-intelligence reasoning</option>
                  <option value="o1-mini">o1-mini - Fast, affordable reasoning</option>
                  <option value="o1-pro">o1-pro - Enhanced compute version</option>
                </optgroup>
                <optgroup label="Cost-optimized models">
                  <option value="gpt-4o-mini">GPT-4o mini - Fast, affordable</option>
                </optgroup>
                <optgroup label="Legacy models">
                  <option value="gpt-4-turbo">GPT-4 Turbo - Previous generation</option>
                  <option value="gpt-4">GPT-4 - Standard version</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo - Most affordable</option>
                </optgroup>
              </select>
            </div>
            <div className="flex items-center gap-6">
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