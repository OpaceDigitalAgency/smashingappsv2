/**
 * Fix for Model Synchronization Issue
 * 
 * This script addresses the issue where changes to the model in admin settings
 * are not immediately reflected in the Task Smasher UI.
 */

// Function to manually trigger model sync
function syncModelWithGlobalSettings() {
  try {
    console.log('Manually syncing model with global settings...');
    
    // Get global settings from localStorage
    const globalSettingsStr = localStorage.getItem('smashingapps_global_settings');
    if (!globalSettingsStr) {
      console.log('No global settings found in localStorage');
      return;
    }
    
    const globalSettings = JSON.parse(globalSettingsStr);
    if (!globalSettings.defaultModel) {
      console.log('No default model found in global settings');
      return;
    }
    
    console.log('Global settings model:', globalSettings.defaultModel);
    
    // Update the app-specific model setting
    localStorage.setItem('smashingapps_activeModel', globalSettings.defaultModel);
    console.log('Updated smashingapps_activeModel to:', globalSettings.defaultModel);
    
    // Dispatch a storage event to trigger the event listeners in useTasks.ts
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'smashingapps_activeModel',
      newValue: globalSettings.defaultModel
    }));
    
    console.log('Dispatched storage event to trigger model update');
    
    // Force a page refresh to ensure the UI is updated
    console.log('Refreshing page to apply changes...');
    window.location.reload();
  } catch (error) {
    console.error('Error syncing model with global settings:', error);
  }
}

// Execute the sync function
syncModelWithGlobalSettings();