import React from 'react';
import { useGlobalSettings } from './context';
import { GlobalSettings } from './types';

export function GlobalSettingsTest() {
  const { settings, updateSettings, resetSettings, isLoading, error } = useGlobalSettings();

  const testSettings = async () => {
    try {
      // Test 1: Update theme
      console.log('Test 1: Updating theme to dark');
      updateSettings({
        ui: { ...settings.ui, theme: 'dark' }
      });
      
      // Test 2: Update AI provider
      console.log('Test 2: Updating AI provider');
      updateSettings({
        aiProvider: { ...settings.aiProvider, provider: 'anthropic' }
      });
      
      // Test 3: Toggle feature flag
      console.log('Test 3: Toggling voice-to-text feature');
      updateSettings({
        features: { ...settings.features, voiceToText: !settings.features.voiceToText }
      });
      
      // Test 4: Reset settings
      console.log('Test 4: Resetting settings');
      resetSettings();
      
      console.log('All tests completed successfully');
    } catch (err) {
      console.error('Test failed:', err);
    }
  };

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

  const features: Array<keyof GlobalSettings['features']> = [
    'voiceToText',
    'dragAndDrop',
    'autoSave'
  ];

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Global Settings Test</h2>
      
      <div className="space-y-2">
        <h3 className="font-medium">Current Settings:</h3>
        <pre className="bg-gray-100 dark:bg-gray-700 p-2 rounded overflow-auto">
          {JSON.stringify(settings, null, 2)}
        </pre>
      </div>

      <div className="space-y-2">
        <button
          onClick={testSettings}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Run Tests
        </button>
        
        <button
          onClick={resetSettings}
          className="ml-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Reset Settings
        </button>
      </div>

      <div className="space-y-2">
        <h3 className="font-medium">Quick Actions:</h3>
        
        <div className="flex space-x-2">
          <button
            onClick={() => updateSettings({ ui: { ...settings.ui, theme: 'light' } })}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            Light Theme
          </button>
          <button
            onClick={() => updateSettings({ ui: { ...settings.ui, theme: 'dark' } })}
            className="px-3 py-1 bg-gray-800 text-white rounded hover:bg-gray-700"
          >
            Dark Theme
          </button>
          <button
            onClick={() => updateSettings({ ui: { ...settings.ui, theme: 'system' } })}
            className="px-3 py-1 bg-gray-100 rounded hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            System Theme
          </button>
        </div>

        <div className="flex space-x-2">
          {(['openai', 'anthropic', 'openrouter'] as const).map(provider => (
            <button
              key={provider}
              onClick={() => updateSettings({
                aiProvider: { ...settings.aiProvider, provider }
              })}
              className={`px-3 py-1 rounded ${
                settings.aiProvider.provider === provider
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'
              }`}
            >
              {provider}
            </button>
          ))}
        </div>

        <div>
          {features.map(feature => (
            <label key={feature} className="flex items-center space-x-2 my-1">
              <input
                type="checkbox"
                checked={settings.features[feature]}
                onChange={() => updateSettings({
                  features: {
                    ...settings.features,
                    [feature]: !settings.features[feature]
                  }
                })}
                className="rounded border-gray-300 dark:border-gray-600"
              />
              <span>{feature}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}