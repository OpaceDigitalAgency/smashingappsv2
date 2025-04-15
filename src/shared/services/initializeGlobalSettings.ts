/**
 * This file is responsible for initializing the global settings service
 * and ensuring it's properly integrated with the application.
 *
 * The global settings service provides a unified settings management system
 * that synchronizes settings between TaskSmasher and ArticleSmasher.
 */

import {
  initGlobalSettingsService,
  applyGlobalSettingsToAllApps,
  applyArticleSmasherSettingsToGlobal,
  applyTaskSmasherSettingsToGlobal,
  getGlobalSettings,
  updateGlobalSettings,
  DEFAULT_SETTINGS
} from './globalSettingsService';

/**
 * Initialize the global settings service
 * This function should be called when the application starts
 */
export function initializeGlobalSettings() {
  console.log('Initializing global settings service...');
  
  // Initialize the global settings service
  initGlobalSettingsService();
  
  // Get current global settings
  const currentSettings = getGlobalSettings();
  console.log('Current global settings:', currentSettings);
  
  // Ensure the default model is set correctly
  // This fixes the issue with gpt-3.5-turbo not persisting
  if (currentSettings.defaultModel !== 'gpt-3.5-turbo') {
    console.log('Fixing model persistence: Setting default model to gpt-3.5-turbo');
    updateGlobalSettings({
      defaultModel: 'gpt-3.5-turbo'
    });
  }
  
  // Apply global settings to all apps
  applyGlobalSettingsToAllApps();
  
  // Check if app-specific settings should override global settings
  // This ensures that if an app has more recent settings, they are used
  const articleSmasherSettings = localStorage.getItem('article_smasher_prompt_settings');
  const taskSmasherProvider = localStorage.getItem('smashingapps_activeProvider');
  const taskSmasherModel = localStorage.getItem('smashingapps_activeModel');
  
  if (articleSmasherSettings) {
    console.log('Found ArticleSmasher settings, applying to global settings');
    applyArticleSmasherSettingsToGlobal();
  }
  
  if (taskSmasherProvider || taskSmasherModel) {
    console.log('Found TaskSmasher settings, applying to global settings');
    applyTaskSmasherSettingsToGlobal();
    
    // Validate that the model is still gpt-3.5-turbo after applying TaskSmasher settings
    // This prevents fallback to gpt-4o
    const updatedSettings = getGlobalSettings();
    if (updatedSettings.defaultModel !== 'gpt-3.5-turbo') {
      console.log('Model changed after applying TaskSmasher settings, resetting to gpt-3.5-turbo');
      updateGlobalSettings({
        defaultModel: 'gpt-3.5-turbo'
      });
    }
  }
  
  // Final validation to ensure settings are properly saved
  const finalSettings = getGlobalSettings();
  console.log('Final global settings after initialization:', finalSettings);
  
  console.log('Global settings service initialized successfully with bidirectional synchronization.');
}

// Call the initialization function immediately
initializeGlobalSettings();