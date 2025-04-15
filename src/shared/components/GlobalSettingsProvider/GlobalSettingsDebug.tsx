import React from 'react';
import { useGlobalSettings } from '../../contexts/GlobalSettingsContext';

export function GlobalSettingsDebug() {
  const { settings, updateSettings, resetSettings, isLoading, error } = useGlobalSettings();

  if (isLoading) {
    return <div>Loading settings...</div>;
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-700 rounded">
        <h3 className="font-bold">Settings Error</h3>
        <p>{error.message}</p>
      </div>
    );
  }

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({
      ui: {
        ...settings.ui,
        theme
      }
    });
  };

  const handleProviderChange = (provider: 'openai' | 'anthropic' | 'openrouter') => {
    updateSettings({
      aiProvider: {
        ...settings.aiProvider,
        provider
      }
    });
  };

  return (
    <div className="p-4 border rounded shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Global Settings Debug</h2>
      
      <div className="space-y-4">
        <div>
          <h3 className="font-medium mb-2">Theme</h3>
          <div className="flex space-x-2">
            {(['light', 'dark', 'system'] as const).map(theme => (
              <button
                key={theme}
                onClick={() => handleThemeChange(theme)}
                className={`px-3 py-1 rounded ${
                  settings.ui.theme === theme
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {theme}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">AI Provider</h3>
          <div className="flex space-x-2">
            {(['openai', 'anthropic', 'openrouter'] as const).map(provider => (
              <button
                key={provider}
                onClick={() => handleProviderChange(provider)}
                className={`px-3 py-1 rounded ${
                  settings.aiProvider.provider === provider
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {provider}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Feature Flags</h3>
          <div className="space-y-2">
            {Object.entries(settings.features).map(([feature, enabled]) => (
              <div key={feature} className="flex items-center">
                <input
                  type="checkbox"
                  id={feature}
                  checked={enabled}
                  onChange={() => updateSettings({
                    features: {
                      ...settings.features,
                      [feature]: !enabled
                    }
                  })}
                  className="mr-2"
                />
                <label htmlFor={feature}>{feature}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t">
          <button
            onClick={resetSettings}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Reset All Settings
          </button>
        </div>

        <div className="mt-4 pt-4 border-t">
          <h3 className="font-medium mb-2">Current Settings</h3>
          <pre className="bg-gray-50 p-4 rounded overflow-auto max-h-96">
            {JSON.stringify(settings, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}