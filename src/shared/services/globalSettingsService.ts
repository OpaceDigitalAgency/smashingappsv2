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

// Storage keys for settings
const GLOBAL_SETTINGS_KEY = 'smashingapps_globalSettings';
const ARTICLE_SMASHER_SETTINGS_KEY = 'article_smasher_prompt_settings';
const TASK_SMASHER_PROVIDER_KEY = 'smashingapps_activeProvider';

// Custom events for settings changes
const GLOBAL_SETTINGS_CHANGED_EVENT = 'globalSettingsChanged';
const TASK_SMASHER_SETTINGS_CHANGED_EVENT = 'taskSmasherSettingsChanged';
const ARTICLE_SMASHER_SETTINGS_CHANGED_EVENT = 'articleSmasherSettingsChanged';

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
export const setGlobalSettings = (settings: GlobalSettings, skipSync: boolean = false): void => {
  try {
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(settings));
    
    // Dispatch a custom event to notify all components of the change
    window.dispatchEvent(new CustomEvent(GLOBAL_SETTINGS_CHANGED_EVENT, { detail: settings }));
    
    // Sync with apps if not skipped
    if (!skipSync) {
      applyGlobalSettingsToAllApps();
    }
  } catch (error) {
    console.error('Error saving global settings:', error);
  }
};

/**
 * Update global settings
 */
export const updateGlobalSettings = (settings: Partial<GlobalSettings>, skipSync: boolean = false): GlobalSettings => {
  const currentSettings = getGlobalSettings();
  const updatedSettings = {
    ...currentSettings,
    ...settings,
  };
  
  setGlobalSettings(updatedSettings, skipSync);
  
  // Update the default provider in the AI service registry
  if (settings.defaultProvider) {
    aiServiceRegistry.setDefaultProvider(settings.defaultProvider);
  }
  
  return updatedSettings;
};

/**
 * Get ArticleSmasher settings from localStorage
 */
export const getArticleSmasherSettings = () => {
  try {
    const settingsStr = localStorage.getItem(ARTICLE_SMASHER_SETTINGS_KEY);
    if (settingsStr) {
      return JSON.parse(settingsStr);
    }
  } catch (error) {
    console.error('Error loading ArticleSmasher settings:', error);
  }
  
  // Initialize with global settings if no stored settings
  const globalSettings = getGlobalSettings();
  const defaultSettings = {
    defaultModel: globalSettings.defaultModel,
    defaultTemperature: globalSettings.defaultTemperature,
    defaultMaxTokens: globalSettings.defaultMaxTokens,
    enabledCategories: ['topic', 'keyword', 'outline', 'content', 'image']
  };
  
  localStorage.setItem(ARTICLE_SMASHER_SETTINGS_KEY, JSON.stringify(defaultSettings));
  return defaultSettings;
};

/**
 * Get TaskSmasher settings
 */
export const getTaskSmasherSettings = () => {
  try {
    const activeProvider = localStorage.getItem(TASK_SMASHER_PROVIDER_KEY);
    const globalSettings = getGlobalSettings();
    
    return {
      activeProvider: activeProvider || globalSettings.defaultProvider,
      ...globalSettings
    };
  } catch (error) {
    console.error('Error loading TaskSmasher settings:', error);
    return getGlobalSettings();
  }
};

/**
 * Apply global settings to ArticleSmasher
 */
export const applyGlobalSettingsToArticleSmasher = (): void => {
  try {
    const globalSettings = getGlobalSettings();
    const articleSmasherSettings = getArticleSmasherSettings();
    
    // Update ArticleSmasher settings with global settings
    articleSmasherSettings.defaultModel = globalSettings.defaultModel;
    articleSmasherSettings.defaultTemperature = globalSettings.defaultTemperature;
    articleSmasherSettings.defaultMaxTokens = globalSettings.defaultMaxTokens;
    
    // Save updated settings
    localStorage.setItem(ARTICLE_SMASHER_SETTINGS_KEY, JSON.stringify(articleSmasherSettings));
    
    // Dispatch event to notify ArticleSmasher of the change
    window.dispatchEvent(new CustomEvent(ARTICLE_SMASHER_SETTINGS_CHANGED_EVENT, {
      detail: articleSmasherSettings
    }));
  } catch (error) {
    console.error('Error applying global settings to ArticleSmasher:', error);
  }
};

/**
 * Apply global settings to TaskSmasher
 */
export const applyGlobalSettingsToTaskSmasher = (): void => {
  try {
    const globalSettings = getGlobalSettings();
    
    // Update the active provider in localStorage
    localStorage.setItem(TASK_SMASHER_PROVIDER_KEY, globalSettings.defaultProvider);
    
    // Dispatch a custom event to notify TaskSmasher of the change
    window.dispatchEvent(new CustomEvent(TASK_SMASHER_SETTINGS_CHANGED_EVENT, {
      detail: globalSettings
    }));
  } catch (error) {
    console.error('Error applying global settings to TaskSmasher:', error);
  }
};

/**
 * Apply ArticleSmasher settings to global settings
 */
export const applyArticleSmasherSettingsToGlobal = (): void => {
  try {
    const articleSmasherSettings = getArticleSmasherSettings();
    
    // Update global settings with ArticleSmasher settings
    updateGlobalSettings({
      defaultModel: articleSmasherSettings.defaultModel,
      defaultTemperature: articleSmasherSettings.defaultTemperature,
      defaultMaxTokens: articleSmasherSettings.defaultMaxTokens
    }, true); // Skip sync to avoid circular updates
    
    // Apply to TaskSmasher only
    applyGlobalSettingsToTaskSmasher();
  } catch (error) {
    console.error('Error applying ArticleSmasher settings to global:', error);
  }
};

/**
 * Apply TaskSmasher settings to global settings
 */
export const applyTaskSmasherSettingsToGlobal = (): void => {
  try {
    const activeProvider = localStorage.getItem(TASK_SMASHER_PROVIDER_KEY);
    
    if (activeProvider) {
      // Update global settings with TaskSmasher provider
      updateGlobalSettings({
        defaultProvider: activeProvider as AIProvider
      }, true); // Skip sync to avoid circular updates
      
      // Apply to ArticleSmasher only
      applyGlobalSettingsToArticleSmasher();
    }
  } catch (error) {
    console.error('Error applying TaskSmasher settings to global:', error);
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
        applyGlobalSettingsToAllApps();
      } catch (error) {
        console.error('Error handling global settings storage event:', error);
      }
    } else if (e.key === ARTICLE_SMASHER_SETTINGS_KEY && e.newValue) {
      try {
        applyArticleSmasherSettingsToGlobal();
      } catch (error) {
        console.error('Error handling ArticleSmasher settings storage event:', error);
      }
    } else if (e.key === TASK_SMASHER_PROVIDER_KEY && e.newValue) {
      try {
        applyTaskSmasherSettingsToGlobal();
      } catch (error) {
        console.error('Error handling TaskSmasher settings storage event:', error);
      }
    }
  });
  
  // Listen for ArticleSmasher settings changes
  window.addEventListener(ARTICLE_SMASHER_SETTINGS_CHANGED_EVENT, () => {
    applyArticleSmasherSettingsToGlobal();
  });
  
  // Listen for TaskSmasher settings changes
  window.addEventListener(TASK_SMASHER_SETTINGS_CHANGED_EVENT, () => {
    applyTaskSmasherSettingsToGlobal();
  });
};