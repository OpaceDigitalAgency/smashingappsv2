import React, { useEffect } from 'react';
import {
  initGlobalSettingsService,
  applyGlobalSettingsToAllApps
} from '../../services/globalSettingsService';
import { GlobalSettingsContextProvider } from './GlobalSettingsContext';

interface GlobalSettingsProviderProps {
  children: React.ReactNode;
}

/**
 * GlobalSettingsProvider component
 *
 * This component initializes the global settings service and ensures
 * that global settings are properly applied to all applications.
 * It provides bidirectional synchronization between TaskSmasher and ArticleSmasher.
 *
 * It also provides the GlobalSettingsContext to the application, making
 * global settings available throughout the component tree.
 *
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
      const globalSettingsKey = 'smashingapps_globalSettings';
      const articleSmasherKey = 'article_smasher_prompt_settings';
      const taskSmasherKey = 'smashingapps_activeProvider';
      
      if (e.key === globalSettingsKey || e.key === articleSmasherKey || e.key === taskSmasherKey) {
        console.log(`${e.key} changed in another tab, synchronization will be handled by service...`);
        // The actual synchronization is handled by the globalSettingsService
      }
    };
    
    // Add event listener
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // Remove event listener on cleanup
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Wrap children with the GlobalSettingsContextProvider
  return (
    <GlobalSettingsContextProvider>
      {children}
    </GlobalSettingsContextProvider>
  );
};

export default GlobalSettingsProvider;