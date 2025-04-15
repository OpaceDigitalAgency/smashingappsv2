/**
 * Settings Synchronizer
 * 
 * This utility synchronizes settings between different localStorage keys
 * to ensure consistent settings across the application.
 * 
 * It specifically handles synchronization between:
 * - 'global-settings' (used by GlobalSettings context)
 * - 'smashingapps-global-settings' (used by globalSettingsService)
 * - 'smashingapps_activeModel' (used directly by some components)
 */

// Define the keys we want to synchronize
const GLOBAL_SETTINGS_KEY = 'global-settings';
const SMASHINGAPPS_GLOBAL_SETTINGS_KEY = 'smashingapps-global-settings';
const ACTIVE_MODEL_KEY = 'smashingapps_activeModel';

/**
 * Initialize the settings synchronizer
 * This should be called as early as possible in the application lifecycle
 */
export function initializeSettingsSynchronizer() {
  console.log('[SettingsSynchronizer] Initializing settings synchronizer');
  
  // Perform initial synchronization
  synchronizeSettings();
  
  // Add event listeners for storage changes
  window.addEventListener('storage', handleStorageChange);
  
  // Add event listener for global settings changes
  window.addEventListener('globalSettingsChanged', handleGlobalSettingsChanged as EventListener);
  
  console.log('[SettingsSynchronizer] Settings synchronizer initialized');
}

/**
 * Handle storage changes
 * This is triggered when localStorage is modified in any tab
 */
function handleStorageChange(event: StorageEvent) {
  console.log('[SettingsSynchronizer] Storage change detected:', event.key);
  
  // Only handle changes to the keys we care about
  if (event.key === GLOBAL_SETTINGS_KEY || 
      event.key === SMASHINGAPPS_GLOBAL_SETTINGS_KEY || 
      event.key === ACTIVE_MODEL_KEY) {
    synchronizeSettings();
  }
}

/**
 * Handle global settings changes
 * This is triggered by the GlobalSettings context when settings are updated
 */
function handleGlobalSettingsChanged(event: CustomEvent) {
  console.log('[SettingsSynchronizer] Global settings changed event received');
  synchronizeSettings();
}

/**
 * Synchronize settings between different localStorage keys
 */
export function synchronizeSettings() {
  console.log('[SettingsSynchronizer] Synchronizing settings');
  
  try {
    // Get settings from both keys
    const globalSettings = localStorage.getItem(GLOBAL_SETTINGS_KEY);
    const smashingappsGlobalSettings = localStorage.getItem(SMASHINGAPPS_GLOBAL_SETTINGS_KEY);
    
    // Determine which settings to use (prefer global-settings if both exist)
    let settingsToUse = globalSettings;
    let sourceKey = GLOBAL_SETTINGS_KEY;
    
    if (!globalSettings && smashingappsGlobalSettings) {
      settingsToUse = smashingappsGlobalSettings;
      sourceKey = SMASHINGAPPS_GLOBAL_SETTINGS_KEY;
    }
    
    if (!settingsToUse) {
      console.log('[SettingsSynchronizer] No settings found, nothing to synchronize');
      return;
    }
    
    // Parse the settings
    const parsedSettings = JSON.parse(settingsToUse);
    
    // Update both keys with the same settings
    if (sourceKey !== GLOBAL_SETTINGS_KEY) {
      localStorage.setItem(GLOBAL_SETTINGS_KEY, settingsToUse);
      console.log('[SettingsSynchronizer] Updated global-settings');
    }
    
    if (sourceKey !== SMASHINGAPPS_GLOBAL_SETTINGS_KEY) {
      localStorage.setItem(SMASHINGAPPS_GLOBAL_SETTINGS_KEY, settingsToUse);
      console.log('[SettingsSynchronizer] Updated smashingapps-global-settings');
    }
    
    // Also update the app-specific model setting if available
    if (parsedSettings && parsedSettings.aiProvider && parsedSettings.aiProvider.defaultModel) {
      localStorage.setItem(ACTIVE_MODEL_KEY, parsedSettings.aiProvider.defaultModel);
      console.log('[SettingsSynchronizer] Updated smashingapps_activeModel to:', parsedSettings.aiProvider.defaultModel);
    }
    
    console.log('[SettingsSynchronizer] Settings synchronized successfully');
  } catch (error) {
    console.error('[SettingsSynchronizer] Error synchronizing settings:', error);
  }
}

/**
 * Clean up the settings synchronizer
 * This should be called when the application is unmounted
 */
export function cleanupSettingsSynchronizer() {
  console.log('[SettingsSynchronizer] Cleaning up settings synchronizer');
  
  // Remove event listeners
  window.removeEventListener('storage', handleStorageChange);
  window.removeEventListener('globalSettingsChanged', handleGlobalSettingsChanged as EventListener);
  
  console.log('[SettingsSynchronizer] Settings synchronizer cleaned up');
}

export default {
  initializeSettingsSynchronizer,
  synchronizeSettings,
  cleanupSettingsSynchronizer
};