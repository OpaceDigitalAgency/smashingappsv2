/**
 * This file is responsible for initializing the global settings service
 * and ensuring it's properly integrated with the application.
 */

import { initGlobalSettingsService, applyGlobalSettingsToAllApps } from './globalSettingsService';

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
  
  console.log('Global settings service initialized successfully.');
}

// Call the initialization function immediately
initializeGlobalSettings();