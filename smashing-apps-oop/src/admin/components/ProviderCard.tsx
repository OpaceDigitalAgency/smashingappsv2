import React, { useState } from 'react';
import AICore from '../../../core/AICore';
import { ProviderStatus } from '../../../core/interfaces/IProvider';

interface ProviderCardProps {
  provider: {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    getKeyUrl: string;
  };
  status: ProviderStatus;
  aiCore: AICore;
  onUpdate: () => void;
}

const ProviderCard: React.FC<ProviderCardProps> = ({ provider, status, aiCore, onUpdate }) => {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSaveKey = async () => {
    if (!apiKey.trim()) {
      setTestResult({ success: false, message: 'Please enter an API key' });
      return;
    }

    setTesting(true);
    setTestResult(null);

    try {
      // Set the API key
      aiCore.setApiKey(provider.id, apiKey.trim());

      // Test the key
      const isValid = await aiCore.testApiKey(provider.id);

      if (isValid) {
        setTestResult({ success: true, message: 'API key saved and validated successfully!' });
        setApiKey('');
        onUpdate();
      } else {
        setTestResult({ success: false, message: 'API key is invalid. Please check and try again.' });
      }
    } catch (error: any) {
      setTestResult({ success: false, message: error.message || 'Failed to validate API key' });
    } finally {
      setTesting(false);
    }
  };

  const handleRemoveKey = () => {
    if (confirm(`Are you sure you want to remove the ${provider.name} API key?`)) {
      aiCore.setApiKey(provider.id, '');
      setTestResult(null);
      onUpdate();
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 bg-gradient-to-br ${provider.color} rounded-lg flex items-center justify-center text-2xl`}>
            {provider.icon}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">{provider.name}</h3>
            <p className="text-sm text-gray-600">{provider.description}</p>
          </div>
        </div>
        {status.configured && (
          <div className="flex items-center space-x-2 text-sm text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Active</span>
          </div>
        )}
      </div>

      {/* API Key Input */}
      <div className="space-y-3">
        {status.configured ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center space-x-2">
                <svg
                  className="w-5 h-5 text-green-600"
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
                <span className="text-sm font-medium text-green-900">
                  API Key: {status.apiKey}
                </span>
              </div>
              <button
                onClick={handleRemoveKey}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Enter your API key"
                className="w-full px-4 py-2 pr-24 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                {showKey ? 'Hide' : 'Show'}
              </button>
            </div>

            <div className="flex space-x-2">
              <button
                onClick={handleSaveKey}
                disabled={testing || !apiKey.trim()}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {testing ? 'Testing...' : 'Save & Test Key'}
              </button>
              <a
                href={provider.getKeyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Get Key
              </a>
            </div>
          </div>
        )}

        {/* Test Result */}
        {testResult && (
          <div
            className={`p-3 rounded-lg ${
              testResult.success
                ? 'bg-green-50 text-green-800'
                : 'bg-red-50 text-red-800'
            }`}
          >
            <div className="flex items-start space-x-2">
              {testResult.success ? (
                <svg
                  className="w-5 h-5 text-green-600 mt-0.5"
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
              ) : (
                <svg
                  className="w-5 h-5 text-red-600 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              )}
              <span className="text-sm">{testResult.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProviderCard;

