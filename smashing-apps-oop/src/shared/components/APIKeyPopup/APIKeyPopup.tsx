import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { unifiedSettings } from '../../services';
import { AIProvider } from '../../types/aiProviders';

// Add type declaration for the globalSettingsContext property on Window
declare global {
  interface Window {
    globalSettingsContext?: any;
  }
}

interface APIKeyPopupProps {
  onClose: () => void;
}

const APIKeyPopup: React.FC<APIKeyPopupProps> = ({ onClose }) => {
  const [provider, setProvider] = useState<AIProvider>('openai');
  const [apiKey, setApiKey] = useState<string>('');
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    if (!apiKey.trim()) {
      setError('API key cannot be empty');
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // Update the API key in unified settings
      const aiSettings = unifiedSettings.getAISettings();
      const updatedApiKeys = { ...aiSettings.apiKeys, [provider]: apiKey };
      
      // Update using the correct structure for UnifiedSettings
      unifiedSettings.updateAISettings({
        provider,
        apiKeys: updatedApiKeys
      });
      
      // Also update the GlobalSettings system
      try {
        // First try to use the GlobalSettings context if available
        try {
          const { useGlobalSettings } = require('../../contexts/GlobalSettings/context');
          const globalSettingsContext = window.globalSettingsContext;
          
          if (globalSettingsContext && globalSettingsContext.updateSettings) {
            globalSettingsContext.updateSettings({
              aiProvider: {
                provider,
                apiKey
              }
            });
            console.log('[APIKeyPopup] Global settings updated with API key using context');
          } else {
            throw new Error('Global settings context not available');
          }
        } catch (contextError) {
          // Fallback to direct localStorage manipulation
          console.log('[APIKeyPopup] Falling back to localStorage for global settings:', contextError);
          
          const globalSettingsStr = localStorage.getItem('global-settings');
          if (globalSettingsStr) {
            const globalSettings = JSON.parse(globalSettingsStr);
            
            // Update the API key
            if (globalSettings.aiProvider) {
              globalSettings.aiProvider.apiKey = apiKey;
              globalSettings.aiProvider.provider = provider;
              
              // Save back to localStorage
              localStorage.setItem('global-settings', JSON.stringify(globalSettings));
              console.log('[APIKeyPopup] Global settings updated with API key via localStorage');
            }
          }
        }
      } catch (error) {
        console.error('[APIKeyPopup] Error updating global settings:', error);
      }
      
      console.log('[APIKeyPopup] API key updated for provider:', provider);

      // Close the popup after saving
      setTimeout(() => {
        setSaving(false);
        onClose();
      }, 500);
    } catch (err) {
      setSaving(false);
      setError('Failed to save API key. Please try again.');
      console.error('Error saving API key:', err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">API Key Required</h2>
        
        <p className="mb-4">
          To use this application, you need to provide an API key for the selected AI provider.
          You can get an API key from the provider's website.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Provider
          </label>
          <select
            value={provider}
            onChange={(e) => setProvider(e.target.value as AIProvider)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="openai">OpenAI</option>
            <option value="anthropic">Anthropic</option>
            <option value="openrouter">OpenRouter</option>
            <option value="google">Google</option>
          </select>
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your API key"
          />
        </div>
        
        {error && (
          <div className="mb-4 text-red-500 text-sm">
            {error}
          </div>
        )}
        
        <div className="flex justify-between">
          <Link
            to="/admin/settings"
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Go to Settings
          </Link>
          
          <div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors mr-2"
            >
              Cancel
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeyPopup;