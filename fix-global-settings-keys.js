/**
 * Fix for Global Settings Keys Mismatch
 * 
 * This script addresses the issue where there are two different localStorage keys
 * being used for global settings:
 * 
 * 1. 'global-settings' - Used by the GlobalSettingsProvider
 * 2. 'smashingapps-global-settings' - Used by the globalSettingsService
 * 
 * When the admin settings are updated, they're being saved to 'global-settings',
 * but the Task Smasher app is reading from 'smashingapps-global-settings'.
 * This explains why the changes aren't being reflected immediately.
 */

// Function to synchronize the two storage keys
function synchronizeGlobalSettingsKeys() {
  console.log('Synchronizing global settings keys...');
  
  try {
    // Get settings from both keys
    const globalSettings = localStorage.getItem('global-settings');
    const smashingappsGlobalSettings = localStorage.getItem('smashingapps-global-settings');
    
    console.log('global-settings:', globalSettings);
    console.log('smashingapps-global-settings:', smashingappsGlobalSettings);
    
    if (globalSettings) {
      // Parse the settings
      const parsedSettings = JSON.parse(globalSettings);
      
      // Check if the settings have the expected structure
      if (parsedSettings && parsedSettings.aiProvider) {
        console.log('Found valid global settings:', parsedSettings);
        
        // Get the model from the settings
        const model = parsedSettings.aiProvider.defaultModel;
        console.log('Model from global settings:', model);
        
        // Update the smashingapps-global-settings key
        localStorage.setItem('smashingapps-global-settings', globalSettings);
        console.log('Updated smashingapps-global-settings with global-settings');
        
        // Also update the app-specific model setting
        localStorage.setItem('smashingapps_activeModel', model);
        console.log('Updated smashingapps_activeModel to:', model);
        
        // Dispatch a storage event to trigger the event listeners
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'smashingapps-global-settings',
          newValue: globalSettings
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'smashingapps_activeModel',
          newValue: model
        }));
        
        console.log('Dispatched storage events to trigger updates');
        
        return {
          success: true,
          message: 'Global settings keys synchronized successfully',
          model: model
        };
      } else {
        console.warn('global-settings does not have the expected structure');
        
        // Try the other way around
        if (smashingappsGlobalSettings) {
          console.log('Trying to use smashingapps-global-settings instead');
          
          // Parse the settings
          const parsedSmashingappsSettings = JSON.parse(smashingappsGlobalSettings);
          
          // Check if the settings have the expected structure
          if (parsedSmashingappsSettings && parsedSmashingappsSettings.defaultModel) {
            console.log('Found valid smashingapps global settings:', parsedSmashingappsSettings);
            
            // Get the model from the settings
            const model = parsedSmashingappsSettings.defaultModel;
            console.log('Model from smashingapps global settings:', model);
            
            // Update the global-settings key
            localStorage.setItem('global-settings', smashingappsGlobalSettings);
            console.log('Updated global-settings with smashingapps-global-settings');
            
            // Also update the app-specific model setting
            localStorage.setItem('smashingapps_activeModel', model);
            console.log('Updated smashingapps_activeModel to:', model);
            
            // Dispatch a storage event to trigger the event listeners
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'global-settings',
              newValue: smashingappsGlobalSettings
            }));
            
            window.dispatchEvent(new StorageEvent('storage', {
              key: 'smashingapps_activeModel',
              newValue: model
            }));
            
            console.log('Dispatched storage events to trigger updates');
            
            return {
              success: true,
              message: 'Global settings keys synchronized successfully (reverse direction)',
              model: model
            };
          } else {
            console.warn('smashingapps-global-settings does not have the expected structure');
            return {
              success: false,
              message: 'Neither global settings key has the expected structure'
            };
          }
        } else {
          console.warn('smashingapps-global-settings is not set');
          return {
            success: false,
            message: 'global-settings does not have the expected structure and smashingapps-global-settings is not set'
          };
        }
      }
    } else if (smashingappsGlobalSettings) {
      console.log('global-settings is not set, but smashingapps-global-settings is');
      
      // Parse the settings
      const parsedSettings = JSON.parse(smashingappsGlobalSettings);
      
      // Check if the settings have the expected structure
      if (parsedSettings && parsedSettings.defaultModel) {
        console.log('Found valid smashingapps global settings:', parsedSettings);
        
        // Get the model from the settings
        const model = parsedSettings.defaultModel;
        console.log('Model from smashingapps global settings:', model);
        
        // Update the global-settings key
        localStorage.setItem('global-settings', smashingappsGlobalSettings);
        console.log('Updated global-settings with smashingapps-global-settings');
        
        // Also update the app-specific model setting
        localStorage.setItem('smashingapps_activeModel', model);
        console.log('Updated smashingapps_activeModel to:', model);
        
        // Dispatch a storage event to trigger the event listeners
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'global-settings',
          newValue: smashingappsGlobalSettings
        }));
        
        window.dispatchEvent(new StorageEvent('storage', {
          key: 'smashingapps_activeModel',
          newValue: model
        }));
        
        console.log('Dispatched storage events to trigger updates');
        
        return {
          success: true,
          message: 'Global settings keys synchronized successfully (from smashingapps to global)',
          model: model
        };
      } else {
        console.warn('smashingapps-global-settings does not have the expected structure');
        return {
          success: false,
          message: 'smashingapps-global-settings does not have the expected structure'
        };
      }
    } else {
      console.warn('Neither global-settings nor smashingapps-global-settings is set');
      return {
        success: false,
        message: 'Neither global-settings nor smashingapps-global-settings is set'
      };
    }
  } catch (error) {
    console.error('Error synchronizing global settings keys:', error);
    return {
      success: false,
      message: `Error: ${error.message}`
    };
  }
}

// Execute the synchronization function
const result = synchronizeGlobalSettingsKeys();
console.log('Synchronization result:', result);

// Force a page refresh to ensure the UI is updated
if (result.success) {
  console.log('Refreshing page to apply changes...');
  setTimeout(() => {
    window.location.reload();
  }, 1000);
}