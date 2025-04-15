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
  applyTaskSmasherSettingsToGlobal
} from './globalSettingsService';

/**
 * Initialize the global settings service
 * This function should be called when the application starts
 */
export function initializeGlobalSettings() {
  console.log('Initializing global settings service...');
  
  // Initialize the global settings service
  initGlobalSettingsService();
  
  // Apply global settings to all apps
  applyGlobalSettingsToAllApps();
  
  // Check if app-specific settings should override global settings
  // This ensures that if an app has more recent settings, they are used
  const articleSmasherSettings = localStorage.getItem('article_smasher_prompt_settings');
  const taskSmasherProvider = localStorage.getItem('smashingapps_activeProvider');
  
  if (articleSmasherSettings) {
    applyArticleSmasherSettingsToGlobal();
  }
  
  if (taskSmasherProvider) {
    applyTaskSmasherSettingsToGlobal();
  }
  
  console.log('Global settings service initialized successfully with bidirectional synchronization.');
}

// Call the initialization function immediately
initializeGlobalSettings();