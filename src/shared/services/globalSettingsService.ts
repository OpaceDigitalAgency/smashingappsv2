import { AIProvider } from '../types/aiProviders';
import { aiServiceRegistry } from './aiServices';

// Define the global settings type
export interface GlobalSettings {
  defaultProvider: AIProvider;
  defaultModel: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
}

// Default global settings
const DEFAULT_GLOBAL_SETTINGS: GlobalSettings = {
  defaultProvider: 'openai',
  defaultModel: 'gpt-4o',
  defaultTemperature: 0.7,
  defaultMaxTokens: 1000,
};

// Storage key for global settings
const GLOBAL_SETTINGS_KEY = 'smashingapps_globalSettings';

/**
 * Get global settings from localStorage
 */
export const getGlobalSettings = (): GlobalSettings => {
  try {
    const settingsStr = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
  } catch (error) {
    console.error('Error loading global settings:', error);
  }
  
  // Initialize with defaults if no stored settings
  setGlobalSettings(DEFAULT_GLOBAL_SETTINGS);
  return DEFAULT_GLOBAL_SETTINGS;
};

/**
 * Save global settings to localStorage
 */
export const setGlobalSettings = (settings: GlobalSettings): void => {
  try {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    
    // Dispatch a custom event to notify all components of the change
    window.dispatchEvent(new CustomEvent('globalSettingsChanged', { detail: settings }));
  } catch (error) {
    console.error('Error saving global settings:', error);
  }
};

/**
 * Update global settings
 */
export const updateGlobalSettings = (settings: Partial<GlobalSettings>): GlobalSettings => {
  const currentSettings = getGlobalSettings();
  const updatedSettings = {
    ...currentSettings,
    ...settings,
  };
  
  setGlobalSettings(updatedSettings);
  
  // Update the default provider in the AI service registry
  if (settings.defaultProvider) {
    aiServiceRegistry.setDefaultProvider(settings.defaultProvider);
  }
  
  return updatedSettings;
};

/**
 * Apply global settings to ArticleSmasherV2
 */
export const applyGlobalSettingsToArticleSmasher = (): void => {
  try {
    const globalSettings = getGlobalSettings();
    
    // Get ArticleSmasherV2 settings from localStorage
    const ARTICLE_SMASHER_SETTINGS_KEY = 'article_smasher_prompt_settings';
    const settingsStr = localStorage.getItem(ARTICLE_SMASHER_SETTINGS_KEY);
    let articleSmasherSettings;
    
    if (settingsStr) {
      articleSmasherSettings = JSON.parse(settingsStr);
    } else {
      articleSmasherSettings = {
        defaultModel: globalSettings.defaultModel,
        defaultTemperature: globalSettings.defaultTemperature,
        defaultMaxTokens: globalSettings.defaultMaxTokens,
        enabledCategories: ['topic', 'keyword', 'outline', 'content', 'image']
      };
    }
    
    // Update ArticleSmasherV2 settings with global settings
    articleSmasherSettings.defaultModel = globalSettings.defaultModel;
    articleSmasherSettings.defaultTemperature = globalSettings.defaultTemperature;
    articleSmasherSettings.defaultMaxTokens = globalSettings.defaultMaxTokens;
    
    // Save updated settings
    localStorage.setItem(ARTICLE_SMASHER_SETTINGS_KEY, JSON.stringify(articleSmasherSettings));
  } catch (error) {
    console.error('Error applying global settings to ArticleSmasherV2:', error);
  }
};

/**
 * Apply global settings to TaskSmasher
 */
export const applyGlobalSettingsToTaskSmasher = (): void => {
  try {
    const globalSettings = getGlobalSettings();
    
    // Update the active provider and model in localStorage
    localStorage.setItem('smashingapps_activeProvider', globalSettings.defaultProvider);
    
    // Dispatch a custom event to notify TaskSmasher of the change
    window.dispatchEvent(new CustomEvent('taskSmasherSettingsChanged', { detail: globalSettings }));
  } catch (error) {
    console.error('Error applying global settings to TaskSmasher:', error);
  }
};

/**
 * Apply global settings to all apps
 */
export const applyGlobalSettingsToAllApps = (): void => {
  applyGlobalSettingsToArticleSmasher();
  applyGlobalSettingsToTaskSmasher();
};

/**
 * Initialize global settings service
 * This should be called when the application starts
 */
export const initGlobalSettingsService = (): void => {
  // Initialize global settings if they don't exist
  if (!localStorage.getItem(GLOBAL_SETTINGS_KEY)) {
    setGlobalSettings(DEFAULT_GLOBAL_SETTINGS);
  }
  
  // Apply global settings to all apps on initialization
  applyGlobalSettingsToAllApps();
  
  // Listen for storage events to sync settings across tabs
  window.addEventListener('storage', (e) => {
    if (e.key === GLOBAL_SETTINGS_KEY && e.newValue) {
      try {
        const settings = JSON.parse(e.newValue);
        applyGlobalSettingsToAllApps();
      } catch (error) {
        console.error('Error handling storage event:', error);
      }
    }
  });
};