import React, { useState, useEffect } from 'react';
import { Key, Check, AlertCircle, Info } from 'lucide-react';
import Modal from '../Modal/Modal';
import useLocalStorage from '../../hooks/useLocalStorage';
import { aiServiceRegistry } from '../../services/AIService';
import { AIProvider } from '../../types/aiProviders';

interface APISettingsModalProps {
  show: boolean;
  onClose: () => void;
}

const APISettingsModal: React.FC<APISettingsModalProps> = ({ show, onClose }) => {
  // Get all available services
  const services = aiServiceRegistry.getAllServices();
  
  // State for the selected provider tab
  const [selectedProvider, setSelectedProvider] = useState<AIProvider>('openai');
  
  // State for API keys
  const [apiKeys, setApiKeys] = useState<Record<string, string>>({});
  
  // State for validation and feedback
  const [validationStatus, setValidationStatus] = useState<Record<string, { valid: boolean; message: string }>>({});
  
  // Get the default provider
  const defaultProvider = aiServiceRegistry.getDefaultProvider();
  
  // Local storage for API keys
  const { value: storedApiKeys, setValue: setStoredApiKeys } = useLocalStorage<Record<string, string>>(
    'smashingapps_apiKeys',
    {}
  );
  
  // Local storage for active provider
  const { value: activeProvider, setValue: setActiveProvider } = useLocalStorage<AIProvider>(
    'smashingapps_activeProvider',
    defaultProvider
  );
  
  // Load stored API keys on mount
  useEffect(() => {
    setApiKeys(storedApiKeys);
    setSelectedProvider(activeProvider);
  }, [storedApiKeys, activeProvider]);
  
  // Handle API key change
  const handleApiKeyChange = (provider: AIProvider, value: string) => {
    setApiKeys(prev => ({
      ...prev,
      [provider]: value
    }));
    
    // Clear validation status when editing
    setValidationStatus(prev => ({
      ...prev,
      [provider]: { valid: false, message: '' }
    }));
  };
  
  // Save API key
  const saveApiKey = (provider: AIProvider) => {
    const apiKey = apiKeys[provider]?.trim();
    
    if (!apiKey) {
      setValidationStatus(prev => ({
        ...prev,
        [provider]: { valid: false, message: 'API key cannot be empty' }
      }));
      return;
    }
    
    // Save to local storage
    setStoredApiKeys(prev => ({
      ...prev,
      [provider]: apiKey
    }));
    
    // Set the API key in the service
    const service = aiServiceRegistry.getService(provider);
    if (service) {
      service.setApiKey(apiKey);
    }
    
    // Update validation status
    setValidationStatus(prev => ({
      ...prev,
      [provider]: { valid: true, message: 'API key saved successfully' }
    }));
  };
  
  // Remove API key
  const removeApiKey = (provider: AIProvider) => {
    // Remove from local storage
    setStoredApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });
    
    // Remove from state
    setApiKeys(prev => {
      const newKeys = { ...prev };
      delete newKeys[provider];
      return newKeys;
    });
    
    // Clear the API key in the service
    const service = aiServiceRegistry.getService(provider);
    if (service) {
      service.setApiKey('');
    }
    
    // Update validation status
    setValidationStatus(prev => ({
      ...prev,
      [provider]: { valid: false, message: 'API key removed' }
    }));
  };
  
  // Set active provider
  const setProviderAsActive = (provider: AIProvider) => {
    setActiveProvider(provider);
    aiServiceRegistry.setDefaultProvider(provider);
  };
  
  // Get provider display name
  const getProviderDisplayName = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return 'OpenAI';
      case 'openrouter':
        return 'Open Router';
      case 'anthropic':
        return 'Anthropic (Claude)';
      case 'google':
        return 'Google (Gemini)';
      case 'image':
        return 'Image Generation';
      default:
        return provider;
    }
  };
  
  // Get provider API key documentation link
  const getProviderApiKeyLink = (provider: AIProvider): string => {
    switch (provider) {
      case 'openai':
        return 'https://platform.openai.com/api-keys';
      case 'openrouter':
        return 'https://openrouter.ai/keys';
      case 'anthropic':
        return 'https://console.anthropic.com/keys';
      case 'google':
        return 'https://aistudio.google.com/app/apikey';
      case 'image':
        return 'https://platform.openai.com/api-keys';
      default:
        return '#';
    }
  };
  
  return (
    <Modal
      show={show}
      onClose={onClose}
      title="AI Provider Settings"
      size="lg"
      footer={
        <>
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            Close
          </button>
        </>
      }
    >
      <div className="flex flex-col space-y-6">
        <div className="bg-indigo-50 p-4 rounded-md">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-indigo-500 mt-0.5 mr-2" />
            <div>
              <h4 className="text-sm font-medium text-indigo-800">About AI Provider Settings</h4>
              <p className="mt-1 text-sm text-indigo-700">
                You can use your own API keys for each AI provider. The default provider is OpenAI, but you can switch to any provider by setting it as active. Your API keys are stored securely in your browser's local storage and are never sent to our servers.
              </p>
            </div>
          </div>
        </div>
        
        {/* Provider tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-4 overflow-x-auto">
            {services.map(service => (
              <button
                key={service.provider}
                onClick={() => setSelectedProvider(service.provider)}
                className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedProvider === service.provider
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {getProviderDisplayName(service.provider)}
                {service.provider === activeProvider && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                    Active
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
        
        {/* Provider content */}
        <div className="space-y-4">
          {services.map(service => (
            <div
              key={service.provider}
              className={selectedProvider === service.provider ? 'block' : 'hidden'}
            >
              <div className="flex flex-col space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">
                    {getProviderDisplayName(service.provider)} Settings
                  </h3>
                  
                  {service.provider !== activeProvider && (
                    <button
                      onClick={() => setProviderAsActive(service.provider)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Set as Active Provider
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-sm font-medium text-gray-900">Available Models</h4>
                  <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {service.getModels().map(model => (
                      <div key={model.id} className="text-sm text-gray-700 flex items-center">
                        <span className="w-4 h-4 mr-2 bg-indigo-100 rounded-full flex items-center justify-center">
                          <span className="w-2 h-2 bg-indigo-500 rounded-full"></span>
                        </span>
                        {model.name}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <label htmlFor={`api-key-${service.provider}`} className="block text-sm font-medium text-gray-700">
                    API Key
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="password"
                      name={`api-key-${service.provider}`}
                      id={`api-key-${service.provider}`}
                      className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      placeholder={`Enter your ${getProviderDisplayName(service.provider)} API key`}
                      value={apiKeys[service.provider] || ''}
                      onChange={(e) => handleApiKeyChange(service.provider, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => saveApiKey(service.provider)}
                      className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Save
                    </button>
                    {apiKeys[service.provider] && (
                      <button
                        type="button"
                        onClick={() => removeApiKey(service.provider)}
                        className="ml-3 inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  {validationStatus[service.provider] && (
                    <div className={`mt-2 text-sm ${validationStatus[service.provider].valid ? 'text-green-600' : 'text-red-600'}`}>
                      <div className="flex items-center">
                        {validationStatus[service.provider].valid ? (
                          <Check className="h-4 w-4 mr-1" />
                        ) : (
                          <AlertCircle className="h-4 w-4 mr-1" />
                        )}
                        {validationStatus[service.provider].message}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2 text-sm text-gray-500">
                    <a
                      href={getProviderApiKeyLink(service.provider)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-500"
                    >
                      Get your {getProviderDisplayName(service.provider)} API key
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
};

export default APISettingsModal;