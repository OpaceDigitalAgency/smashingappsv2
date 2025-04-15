import { useState, useEffect } from 'react';
import { 
  getGlobalSettings, 
  updateGlobalSettings, 
  GlobalSettings 
} from '../services/globalSettingsService';

/**
 * Custom hook for accessing and modifying global settings
 * 
 * This hook provides a consistent interface for applications to interact with
 * the global settings system. It ensures that any changes made to settings
 * are properly synchronized across all applications.
 * 
 * @returns An object with the current settings and functions to update them
 */
export function useGlobalSettings() {
  const [settings, setSettings] = useState<GlobalSettings>(getGlobalSettings());

  // Listen for global settings changes
  useEffect(() => {
    const handleSettingsChange = (e: CustomEvent<GlobalSettings>) => {
      setSettings(e.detail);
    };

    // Add event listener
    window.addEventListener('globalSettingsChanged', handleSettingsChange as EventListener);

    // Remove event listener on cleanup
    return () => {
      window.removeEventListener('globalSettingsChanged', handleSettingsChange as EventListener);
    };
  }, []);

  /**
   * Update global settings
   * @param newSettings Partial settings to update
   */
  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    const updatedSettings = updateGlobalSettings(newSettings);
    setSettings(updatedSettings);
    return updatedSettings;
  };

  return {
    settings,
    updateSettings
  };
}

export default useGlobalSettings;