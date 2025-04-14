import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  Server, 
  Key, 
  Check, 
  X, 
  Edit, 
  Save, 
  AlertCircle, 
  Info, 
  ChevronDown, 
  ChevronUp 
} from 'lucide-react';
import Button from '../../shared/components/Button/Button';
import { AIProvider } from '../../shared/types/aiProviders';

const ProviderManagement: React.FC = () => {
  const { providers, updateProviderConfig, setApiKey } = useAdmin();
  const [editingProvider, setEditingProvider] = useState<AIProvider | null>(null);
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({} as Record<AIProvider, string>);
  const [expandedProvider, setExpandedProvider] = useState<AIProvider | null>(null);
  const [testResults, setTestResults] = useState<Record<AIProvider, { success: boolean; message: string } | null>>({} as Record<AIProvider, { success: boolean; message: string } | null>);

  // Handle API key change
  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
  };

  // Handle save API key
  const handleSaveApiKey = (provider: AIProvider) => {
    const apiKey = apiKeys[provider];
    if (apiKey) {
      setApiKey(provider, apiKey);
      setEditingProvider(null);
      
      // Show success message
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: true, message: 'API key saved successfully' }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResults(prev => ({
          ...prev,
          [provider]: null
        }));
      }, 3000);
    }
  };

  // Handle test API key
  const handleTestApiKey = async (provider: AIProvider) => {
    try {
      // In a real implementation, we would test the API key here
      // For now, we'll just simulate a successful test
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: true, message: 'API key is valid' }
      }));
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setTestResults(prev => ({
          ...prev,
          [provider]: null
        }));
      }, 3000);
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [provider]: { success: false, message: 'API key is invalid' }
      }));
    }
  };

  // Toggle provider expansion
  const toggleProviderExpansion = (provider: AIProvider) => {
    setExpandedProvider(prev => prev === provider ? null : provider);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Provider Management</h1>
        <p className="text-gray-600">
          Configure AI providers and API keys for your applications
        </p>
      </div>

      <div className="space-y-6">
        {Object.entries(providers).map(([key, provider]) => {
          const providerKey = key as AIProvider;
          const isExpanded = expandedProvider === providerKey;
          const isEditing = editingProvider === providerKey;
          const testResult = testResults[providerKey];

          return (
            <div 
              key={key} 
              className="bg-white rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Provider header */}
              <div className="flex items-center justify-between p-4 border-b border-gray-100">
                <div className="flex items-center">
                  <div className={`p-2 rounded-lg mr-3 ${provider.enabled ? 'bg-green-50' : 'bg-gray-50'}`}>
                    <Server className={`w-5 h-5 ${provider.enabled ? 'text-green-500' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <h2 className="font-medium text-gray-800">{provider.name}</h2>
                    <p className="text-sm text-gray-500">
                      {provider.enabled ? 'Active' : 'Not configured'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    provider.enabled 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-gray-50 text-gray-500'
                  }`}>
                    {provider.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button
                    onClick={() => toggleProviderExpansion(providerKey)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    )}
                  </button>
                </div>
              </div>

              {/* Provider details (expanded) */}
              {isExpanded && (
                <div className="p-4 bg-gray-50">
                  {/* API Key section */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">API Key</h3>
                    <div className="bg-white p-3 rounded-md border border-gray-200">
                      {isEditing ? (
                        <div className="space-y-3">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 text-gray-400 mr-2" />
                            <input
                              type="password"
                              value={apiKeys[providerKey] || ''}
                              onChange={(e) => handleApiKeyChange(providerKey, e.target.value)}
                              placeholder="Enter API key"
                              className="flex-1 border-none focus:ring-0 text-sm"
                            />
                          </div>
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => setEditingProvider(null)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleSaveApiKey(providerKey)}
                            >
                              <Save className="w-4 h-4 mr-1" />
                              Save
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Key className="w-4 h-4 text-gray-400 mr-2" />
                            <span className="text-sm text-gray-700">
                              {provider.enabled ? '••••••••••••••••' : 'No API key set'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {provider.enabled && (
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleTestApiKey(providerKey)}
                              >
                                Test
                              </Button>
                            )}
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => setEditingProvider(providerKey)}
                            >
                              <Edit className="w-4 h-4 mr-1" />
                              {provider.enabled ? 'Update' : 'Add Key'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                    {testResult && (
                      <div className={`mt-2 p-2 rounded-md text-sm flex items-center ${
                        testResult.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                      }`}>
                        {testResult.success ? (
                          <Check className="w-4 h-4 mr-1" />
                        ) : (
                          <AlertCircle className="w-4 h-4 mr-1" />
                        )}
                        {testResult.message}
                      </div>
                    )}
                  </div>

                  {/* Models section */}
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Available Models</h3>
                    <div className="bg-white rounded-md border border-gray-200 overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Model
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Description
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Max Tokens
                            </th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Default
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {provider.models.map((model) => (
                            <tr key={model.id}>
                              <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                                {model.name}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {model.description}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {model.maxTokens || 'N/A'}
                              </td>
                              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                                {model.id === provider.defaultModel ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <button
                                    className="text-blue-500 hover:text-blue-700 text-xs"
                                    onClick={() => updateProviderConfig(providerKey, { defaultModel: model.id })}
                                  >
                                    Set as default
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProviderManagement;