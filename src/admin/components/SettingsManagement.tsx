import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import {
  Settings,
  Save,
  RefreshCw,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Globe,
  Layers,
  RefreshCcw
} from 'lucide-react';
import Button from '../../shared/components/Button/Button';
import { AIProvider } from '../../shared/types/aiProviders';
import { aiServiceRegistry } from '../../shared/services/aiServices';

const SettingsManagement: React.FC = () => {
  const {
    globalSettings,
    updateGlobalSettings,
    appSettings,
    updateAppSettings,
    providers,
    refreshProviderModels
  } = useAdmin();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [expandedSection, setExpandedSection] = useState<'global' | 'app' | null>('global');
  const [saveStatus, setSaveStatus] = useState<{ success: boolean; message: string } | null>(null);
  
  // Toggle section expansion
  const toggleSection = (section: 'global' | 'app') => {
    setExpandedSection(prev => prev === section ? null : section);
  };
  
  // Handle global settings change
  const handleGlobalSettingsChange = (field: string, value: any) => {
    if (field === 'aiProvider') {
      updateGlobalSettings({
        aiProvider: {
          ...globalSettings.aiProvider,
          ...value
        }
      });
      
      // If provider changed, refresh the models list
      if (value.provider !== globalSettings.aiProvider.provider) {
        refreshProviderModels();
      }
    } else {
      updateGlobalSettings({ [field]: value });
    }
  };
  
  // Handle app settings change
  const handleAppSettingsChange = (appId: string, field: string, value: any) => {
    updateAppSettings(appId, { [field]: value });
  };
  
  // Save settings
  const handleSaveSettings = () => {
    try {
      // Update global settings
      updateGlobalSettings(globalSettings);
      
      // If API key is set, also update it through the service to ensure proper synchronization
      if (globalSettings.aiProvider.apiKey) {
        const { provider, apiKey } = globalSettings.aiProvider;
        const service = aiServiceRegistry.getService(provider);
        if (service) {
          service.setApiKey(apiKey);
        }
      }
      
      // Update app-specific settings
      Object.entries(appSettings).forEach(([appId, settings]) => {
        updateAppSettings(appId, settings);
      });
      
      // Save app-specific settings to localStorage for persistence
      localStorage.setItem('smashingapps_appSettings', JSON.stringify(appSettings));
      
      setSaveStatus({ success: true, message: 'Settings saved successfully and applied to all apps' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      setSaveStatus({ success: false, message: 'Failed to save settings' });
      console.error('Error saving settings:', error);
    }
  };
  
  // Reset settings to defaults
  const handleResetSettings = () => {
    // Reset global settings to defaults
    updateGlobalSettings({
      aiProvider: {
        provider: 'openai',
        apiKey: '',
        defaultModel: 'gpt-3.5-turbo',
        defaultSystemPrompt: '',
        defaultOptions: {
          temperature: 0.7,
          maxTokens: 2000
        }
      }
    });
    
    // Show success message
    setSaveStatus({ success: true, message: 'Settings reset to defaults' });
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      setSaveStatus(null);
    }, 3000);
  };
  
  // Handle refreshing models
  const handleRefreshModels = async () => {
    setIsRefreshing(true);
    try {
      await refreshProviderModels();
      setSaveStatus({ success: true, message: 'Models refreshed successfully' });
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    } catch (error) {
      setSaveStatus({ success: false, message: 'Failed to refresh models' });
      console.error('Error refreshing models:', error);
    } finally {
      setIsRefreshing(false);
    }
  };
  
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings Management</h1>
        <p className="text-gray-600">
          Configure global and app-specific settings for SmashingApps.ai
        </p>
      </div>
      
      {/* Global Settings */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            className="w-full p-4 text-left flex items-center justify-between border-b border-gray-100"
            onClick={() => toggleSection('global')}
          >
            <div className="flex items-center">
              <Globe className="w-5 h-5 text-blue-500 mr-2" />
              <h2 className="font-medium text-gray-800">Global Settings</h2>
            </div>
            {expandedSection === 'global' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'global' && (
            <div className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* API Key input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key
                  </label>
                  <input
                    type="password"
                    value={globalSettings.aiProvider.apiKey || ''}
                    onChange={(e) => handleGlobalSettingsChange('aiProvider', {
                      apiKey: e.target.value
                    })}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Provider
                  </label>
                  <select
                    value={globalSettings.aiProvider.provider}
                    onChange={(e) => handleGlobalSettingsChange('aiProvider', { ...globalSettings.aiProvider, provider: e.target.value as AIProvider })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  >
                    {Object.entries(providers).map(([key, provider]) => (
                      <option key={key} value={key}>
                        {provider.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Model
                  </label>
                  <div className="flex items-center">
                    <select
                      value={globalSettings.aiProvider.defaultModel}
                      onChange={(e) => handleGlobalSettingsChange('aiProvider', { ...globalSettings.aiProvider, defaultModel: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    >
                      {providers[globalSettings.aiProvider.provider]?.models.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleRefreshModels}
                      className="ml-2 p-2 text-blue-500 hover:text-blue-700 rounded-md hover:bg-gray-100"
                      title="Refresh models from API"
                      disabled={isRefreshing}
                    >
                      <RefreshCcw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Temperature
                  </label>
                  <div className="flex items-center">
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={globalSettings.aiProvider.defaultOptions.temperature}
                      onChange={(e) => handleGlobalSettingsChange('aiProvider', {
                        ...globalSettings.aiProvider,
                        defaultOptions: {
                          ...globalSettings.aiProvider.defaultOptions,
                          temperature: parseFloat(e.target.value)
                        }
                      })}
                      className="flex-1 mr-2"
                    />
                    <span className="text-sm font-medium w-10 text-center">
                      {globalSettings.aiProvider.defaultOptions.temperature}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Max Tokens
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="32000"
                    value={globalSettings.aiProvider.defaultOptions.maxTokens}
                    onChange={(e) => handleGlobalSettingsChange('aiProvider', {
                      ...globalSettings.aiProvider,
                      defaultOptions: {
                        ...globalSettings.aiProvider.defaultOptions,
                        maxTokens: parseInt(e.target.value)
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* App-Specific Settings */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <button
            className="w-full p-4 text-left flex items-center justify-between border-b border-gray-100"
            onClick={() => toggleSection('app')}
          >
            <div className="flex items-center">
              <Layers className="w-5 h-5 text-purple-500 mr-2" />
              <h2 className="font-medium text-gray-800">App-Specific Settings</h2>
            </div>
            {expandedSection === 'app' ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </button>
          
          {expandedSection === 'app' && (
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Task Smasher</h3>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Default Board Layout
                      </label>
                      <select
                        value={(appSettings['task-smasher']?.defaultBoardLayout as string) || 'kanban'}
                        onChange={(e) => handleAppSettingsChange('task-smasher', 'defaultBoardLayout', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      >
                        <option value="kanban">Kanban</option>
                        <option value="list">List</option>
                        <option value="calendar">Calendar</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Default Use Case
                      </label>
                      <select
                        value={(appSettings['task-smasher']?.defaultUseCase as string) || 'daily'}
                        onChange={(e) => handleAppSettingsChange('task-smasher', 'defaultUseCase', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      >
                        <option value="daily">Daily Tasks</option>
                        <option value="project">Project Management</option>
                        <option value="content">Content Creation</option>
                        <option value="marketing">Marketing</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Article Smasher</h3>
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Default Article Type
                      </label>
                      <select
                        value={(appSettings['article-smasher']?.defaultArticleType as string) || 'blog'}
                        onChange={(e) => handleAppSettingsChange('article-smasher', 'defaultArticleType', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                      >
                        <option value="blog">Blog Post</option>
                        <option value="article">Article</option>
                        <option value="product">Product Description</option>
                        <option value="landing">Landing Page</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Enable Image Generation
                      </label>
                      <div className="flex items-center mt-2">
                        <input
                          type="checkbox"
                          checked={(appSettings['article-smasher']?.enableImageGeneration as boolean) || false}
                          onChange={(e) => handleAppSettingsChange('article-smasher', 'enableImageGeneration', e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700">
                          Enable image generation for articles
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end space-x-3">
        <Button
          variant="secondary"
          onClick={handleResetSettings}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Reset to Defaults
        </Button>
        <Button
          variant="primary"
          onClick={handleSaveSettings}
        >
          <Save className="w-4 h-4 mr-1" />
          Save Settings
        </Button>
      </div>
      
      {/* Save status message */}
      {saveStatus && (
        <div className={`mt-4 p-3 rounded-md flex items-center ${
          saveStatus.success ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {saveStatus.success ? (
            <Check className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          {saveStatus.message}
        </div>
      )}
    </div>
  );
};

export default SettingsManagement;