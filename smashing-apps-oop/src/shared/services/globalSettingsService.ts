/**
 * Global Settings Service
 *
 * This service provides a unified settings management system that synchronizes
 * settings between TaskSmasher and ArticleSmasher.
 */

import { useLocalStorage } from '../hooks/useLocalStorage';
import { synchronizeSettings } from '../utils/settingsSynchronizer';

// Define the GlobalSettings interface
export interface GlobalSettings {
  // Version tracking for migrations
  _version: number;
  
  // AI Provider Settings
  defaultProvider: 'openai' | 'anthropic' | 'openrouter';
  defaultModel: string;
  defaultSystemPrompt: string;
  defaultTemperature: number;
  defaultMaxTokens: number;
  
  // UI Settings
  theme: 'light' | 'dark' | 'system';
  sidebarExpanded: boolean;
  fontSize: 'sm' | 'md' | 'lg';
  
  // Rate Limiting
  rateLimitEnabled: boolean;
  maxRequestsPerMinute: number;
  maxTokensPerDay: number;
  
  // Feature Flags
  voiceToTextEnabled: boolean;
  dragAndDropEnabled: boolean;
  autoSaveEnabled: boolean;
}

// Default settings
export const DEFAULT_SETTINGS: GlobalSettings = {
  _version: 1,
  defaultProvider: 'openai',
  defaultModel: 'gpt-3.5-turbo',
  defaultSystemPrompt: '',
  defaultTemperature: 0.7,
  defaultMaxTokens: 2000,
  theme: 'system',
  sidebarExpanded: true,
  fontSize: 'md',
  rateLimitEnabled: true,
  maxRequestsPerMinute: 10,
  maxTokensPerDay: 100000,
  voiceToTextEnabled: false,
  dragAndDropEnabled: true,
  autoSaveEnabled: true
};

// Storage key for global settings
const GLOBAL_SETTINGS_KEY = 'smashingapps-global-settings';

// Event name for settings changes
const SETTINGS_CHANGED_EVENT = 'globalSettingsChanged';

// Get global settings from localStorage
export function getGlobalSettings(): GlobalSettings {
  console.log('[GlobalSettingsService] Getting global settings');
  
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    console.log('[GlobalSettingsService] Not in browser environment, returning defaults');
    return DEFAULT_SETTINGS;
  }

  try {
    // Get settings from localStorage
    const storedSettings = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    
    // If settings exist, parse and return them
    if (storedSettings) {
      console.log('[GlobalSettingsService] Retrieved global settings from localStorage:', storedSettings);
      
      const parsedSettings = JSON.parse(storedSettings);
      
      // Log the model being used
      console.log('[GlobalSettingsService] Using model from localStorage:', parsedSettings.defaultModel);
      
      return parsedSettings;
    }
    
    // Otherwise, return default settings
    console.log('[GlobalSettingsService] No global settings found in localStorage, using defaults');
    
    // Save default settings to localStorage to ensure they're available next time
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
    console.log('[GlobalSettingsService] Default settings saved to localStorage');
    
    return DEFAULT_SETTINGS;
  } catch (error) {
    console.error('[GlobalSettingsService] Error retrieving global settings:', error);
    return DEFAULT_SETTINGS;
  }
}

// Update global settings
export function updateGlobalSettings(newSettings: Partial<GlobalSettings>): GlobalSettings {
  console.log('[GlobalSettingsService] Updating global settings with:', newSettings);
  
  try {
    // Get current settings
    const currentSettings = getGlobalSettings();
    
    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...newSettings
    };
    
    // Log the model being updated
    if (newSettings.defaultModel) {
      console.log('[GlobalSettingsService] Updating model to:', newSettings.defaultModel);
    }
    
    // Log the update
    console.log('[GlobalSettingsService] Final updated settings:', updatedSettings);
    
    // Save to localStorage
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(updatedSettings));
    console.log('[GlobalSettingsService] Settings saved to localStorage');
    
    // Also update the app-specific model setting for direct access
    if (updatedSettings.defaultModel) {
      localStorage.setItem('smashingapps_activeModel', updatedSettings.defaultModel);
      console.log('[GlobalSettingsService] Updated app-specific model setting:', updatedSettings.defaultModel);
    }
    
    // Dispatch event to notify other components
    const event = new CustomEvent(SETTINGS_CHANGED_EVENT, { detail: updatedSettings });
    window.dispatchEvent(event);
    console.log('[GlobalSettingsService] Dispatched settings changed event');
    
    // Synchronize settings across different localStorage keys
    synchronizeSettings();
    console.log('[GlobalSettingsService] Synchronized settings across localStorage keys');
    
    return updatedSettings;
  } catch (error) {
    console.error('[GlobalSettingsService] Error updating global settings:', error);
    return getGlobalSettings();
  }
}

// Initialize the global settings service
export function initGlobalSettingsService(): void {
  console.log('[GlobalSettingsService] Initializing global settings service');
  
  // Ensure settings exist in localStorage
  const settings = getGlobalSettings();
  console.log('[GlobalSettingsService] Current settings:', settings);
  
  // Log the current model
  console.log('[GlobalSettingsService] Current model during initialization:', settings.defaultModel);
  
  // If no settings exist, save default settings
  if (!localStorage.getItem(GLOBAL_SETTINGS_KEY)) {
    console.log('[GlobalSettingsService] No settings found, saving defaults');
    localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(DEFAULT_SETTINGS));
  }
  
  // Also set the app-specific model setting for direct access
  localStorage.setItem('smashingapps_activeModel', settings.defaultModel);
  console.log('[GlobalSettingsService] Set app-specific model to', settings.defaultModel);
  
  console.log('[GlobalSettingsService] Initialization complete');
}

// Apply global settings to all apps
export function applyGlobalSettingsToAllApps(): void {
  const globalSettings = getGlobalSettings();
  
  // Apply to TaskSmasher
  localStorage.setItem('smashingapps_activeProvider', globalSettings.defaultProvider);
  localStorage.setItem('smashingapps_activeModel', globalSettings.defaultModel);
  
  // Apply to ArticleSmasher
  const articleSmasherSettings = {
    provider: globalSettings.defaultProvider,
    model: globalSettings.defaultModel,
    temperature: globalSettings.defaultTemperature,
    maxTokens: globalSettings.defaultMaxTokens
  };
  
  localStorage.setItem('article_smasher_prompt_settings', JSON.stringify(articleSmasherSettings));
}

// Apply ArticleSmasher settings to global settings
export function applyArticleSmasherSettingsToGlobal(): void {
  try {
    const articleSmasherSettingsStr = localStorage.getItem('article_smasher_prompt_settings');
    
    if (articleSmasherSettingsStr) {
      const articleSmasherSettings = JSON.parse(articleSmasherSettingsStr);
      
      updateGlobalSettings({
        defaultProvider: articleSmasherSettings.provider,
        defaultModel: articleSmasherSettings.model,
        defaultTemperature: articleSmasherSettings.temperature,
        defaultMaxTokens: articleSmasherSettings.maxTokens
      });
    }
  } catch (error) {
    console.error('Error applying ArticleSmasher settings to global:', error);
  }
}

// Apply TaskSmasher settings to global settings
export function applyTaskSmasherSettingsToGlobal(): void {
  try {
    const provider = localStorage.getItem('smashingapps_activeProvider');
    const model = localStorage.getItem('smashingapps_activeModel');
    
    if (provider) {
      updateGlobalSettings({
        defaultProvider: provider as 'openai' | 'anthropic' | 'openrouter'
      });
    }
    
    if (model) {
      updateGlobalSettings({
        defaultModel: model
      });
    }
  } catch (error) {
    console.error('Error applying TaskSmasher settings to global:', error);
  }
}