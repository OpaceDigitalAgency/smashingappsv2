import React, { createContext, useContext } from 'react';
import { GlobalSettings } from '../../services/globalSettingsService';
import useGlobalSettings from '../../hooks/useGlobalSettings';

// Define the context type
interface GlobalSettingsContextType {
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => GlobalSettings;
}

// Create the context with a default value
const GlobalSettingsContext = createContext<GlobalSettingsContextType | undefined>(undefined);

/**
 * GlobalSettingsContextProvider component
 * 
 * This component provides the global settings context to the application.
 * It uses the useGlobalSettings hook to access and modify the global settings.
 */
export const GlobalSettingsContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { settings, updateSettings } = useGlobalSettings();

  return (
    <GlobalSettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </GlobalSettingsContext.Provider>
  );
};

/**
 * Custom hook to use the global settings context
 * 
 * This hook provides a convenient way to access the global settings context.
 * It throws an error if used outside of a GlobalSettingsContextProvider.
 */
export const useGlobalSettingsContext = (): GlobalSettingsContextType => {
  const context = useContext(GlobalSettingsContext);
  
  if (context === undefined) {
    throw new Error('useGlobalSettingsContext must be used within a GlobalSettingsContextProvider');
  }
  
  return context;
};

export default GlobalSettingsContext;