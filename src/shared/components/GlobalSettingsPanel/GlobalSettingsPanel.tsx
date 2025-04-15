import React from 'react';
import { useGlobalSettingsContext } from '../GlobalSettingsProvider';
import { AIProvider } from '../../types/aiProviders';
import { aiServiceRegistry } from '../../services/aiServices';

interface GlobalSettingsPanelProps {
  className?: string;
}

/**
 * GlobalSettingsPanel component
 * 
 * This component provides a UI for displaying and modifying global settings.
 * It can be used in both TaskSmasher and ArticleSmasher to provide a consistent
 * settings experience across applications.
 */
const GlobalSettingsPanel: React.FC<GlobalSettingsPanelProps> = ({ className = '' }) => {
  const { settings, updateSettings } = useGlobalSettingsContext();
  
  // Get available providers and models
  const availableProviders = Object.keys(aiServiceRegistry.getProviders()) as AIProvider[];
  const availableModels = aiServiceRegistry.getProvider(settings.defaultProvider)?.getAvailableModels() || [];
  
  // Handle provider change
  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newProvider = e.target.value as AIProvider;
    updateSettings({ defaultProvider: newProvider });
  };
  
  // Handle model change
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    updateSettings({ defaultModel: e.target.value });
  };
  
  // Handle temperature change
  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ defaultTemperature: parseFloat(e.target.value) });
  };
  
  // Handle max tokens change
  const handleMaxTokensChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateSettings({ defaultMaxTokens: parseInt(e.target.value, 10) });
  };
  
  return (
    <div className={`global-settings-panel ${className}`}>
      <h3 className="text-lg font-semibold mb-4">Global AI Settings</h3>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">AI Provider</label>
        <select
          value={settings.defaultProvider}
          onChange={handleProviderChange}
          className="w-full p-2 border rounded"
        >
          {availableProviders.map((provider) => (
            <option key={provider} value={provider}>
              {provider.charAt(0).toUpperCase() + provider.slice(1)}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">AI Model</label>
        <select
          value={settings.defaultModel}
          onChange={handleModelChange}
          className="w-full p-2 border rounded"
        >
          {availableModels.map((model) => (
            <option key={model} value={model}>
              {model}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Temperature: {settings.defaultTemperature.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={settings.defaultTemperature}
          onChange={handleTemperatureChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Precise (0.0)</span>
          <span>Creative (1.0)</span>
        </div>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">
          Max Tokens: {settings.defaultMaxTokens}
        </label>
        <input
          type="range"
          min="100"
          max="4000"
          step="100"
          value={settings.defaultMaxTokens}
          onChange={handleMaxTokensChange}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500">
          <span>Short (100)</span>
          <span>Long (4000)</span>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 mt-4">
        <p>These settings are synchronized across all SmashingApps tools.</p>
      </div>
    </div>
  );
};

export default GlobalSettingsPanel;