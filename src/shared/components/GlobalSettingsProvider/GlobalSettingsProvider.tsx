import React, { useEffect } from 'react';
import { 
  initGlobalSettingsService, 
  applyGlobalSettingsToAllApps 
} from '../../services/globalSettingsService';

interface GlobalSettingsProviderProps {
  children: React.ReactNode;
}

/**
 * GlobalSettingsProvider component
 * 
 * This component initializes the global settings service and ensures
 * that global settings are properly applied to all applications.
 * It should be placed at the root of the application.
 */
const GlobalSettingsProvider: React.FC<GlobalSettingsProviderProps> = ({ children }) => {
  // Initialize global settings on mount
  useEffect(() => {
    console.log('Initializing global settings service...');
    
    // Initialize the global settings service
    initGlobalSettingsService();
    
    // Apply global settings to all apps
    applyGlobalSettingsToAllApps();
    
    // Listen for storage events to sync settings across tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smashingapps_globalSettings' && e.newValue) {
        try {
          console.log('Global settings changed in another tab, applying changes...');
          applyGlobalSettingsToAllApps();
        } catch (error) {
          console.error('Error handling storage event:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return <>{children}</>;
};

export default GlobalSettingsProvider;