import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { GlobalSettings, GlobalSettingsContextValue, DEFAULT_SETTINGS } from './types';
import { synchronizeSettings } from '../../utils/settingsSynchronizer';

// Define action types
type GlobalSettingsAction = 
  | { type: 'UPDATE_SETTINGS'; payload: Partial<GlobalSettings> }
  | { type: 'RESET_SETTINGS' }
  | { type: 'SET_ERROR'; payload: Error | null }
  | { type: 'SET_LOADING'; payload: boolean };

// Create reducer
function globalSettingsReducer(
  state: GlobalSettingsContextValue,
  action: GlobalSettingsAction
): GlobalSettingsContextValue {
  switch (action.type) {
    case 'UPDATE_SETTINGS':
      const updatedSettings = {
        ...state.settings,
        ...action.payload,
        aiProvider: {
          ...state.settings.aiProvider,
          ...(action.payload.aiProvider || {})
        },
        _version: DEFAULT_SETTINGS._version
      };
      return {
        ...state,
        settings: updatedSettings,
        error: null
      };
    case 'RESET_SETTINGS':
      return {
        ...state,
        settings: DEFAULT_SETTINGS,
        error: null
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

// Create context
const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null);

// Custom error class
class GlobalSettingsError extends Error {
  constructor(message: string) {
    super(`[GlobalSettings Error] ${message}`);
    this.name = 'GlobalSettingsError';
  }
}

// Validation function
const validateSettings = (settings: GlobalSettings): void => {
  if (!settings || typeof settings !== 'object') {
    throw new GlobalSettingsError('Settings must be an object');
  }

  const requiredKeys = ['aiProvider', 'ui', 'rateLimit', 'features'];
  const missingKeys = requiredKeys.filter(key => !(key in settings));
  
  if (missingKeys.length > 0) {
    throw new GlobalSettingsError(
      `Invalid settings structure. Missing required keys: ${missingKeys.join(', ')}`
    );
  }
};

// Provider component
export function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  // Initialize with localStorage hook
  const {
    value: storedSettings,
    setValue: setStoredSettings,
    remove: removeStoredSettings
  } = useLocalStorage<GlobalSettings>('global-settings', DEFAULT_SETTINGS);

  // Create initial state
  // Ensure stored settings have all required fields
  const initialSettings = {
    ...DEFAULT_SETTINGS,
    ...storedSettings,
    aiProvider: {
      ...DEFAULT_SETTINGS.aiProvider,
      ...(storedSettings?.aiProvider || {})
    }
  };

  const initialState: GlobalSettingsContextValue = {
    settings: initialSettings,
    updateSettings: () => {}, // Will be replaced
    resetSettings: () => {}, // Will be replaced
    isLoading: true,
    error: null
  };

  // Initialize reducer
  const [state, dispatch] = useReducer(globalSettingsReducer, initialState);

  // Create update function
  const updateSettings = (newSettings: Partial<GlobalSettings>) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const updatedSettings = {
        ...state.settings,
        ...newSettings
      };
      validateSettings(updatedSettings);
      setStoredSettings(updatedSettings);
      dispatch({ type: 'UPDATE_SETTINGS', payload: newSettings });
      
      // Synchronize settings across different localStorage keys
      synchronizeSettings();
      
      // Dispatch settings-synchronized event
      const syncEvent = new CustomEvent('settings-synchronized', {
        detail: updatedSettings
      });
      window.dispatchEvent(syncEvent);
      
      // Dispatch globalSettingsChanged event
      const changeEvent = new CustomEvent('globalSettingsChanged', {
        detail: updatedSettings
      });
      window.dispatchEvent(changeEvent);
      
      console.log('[GlobalSettings] Synchronized settings across localStorage keys');
    } catch (error) {
      const settingsError = error instanceof Error ? error : new GlobalSettingsError('Unknown error updating settings');
      dispatch({ type: 'SET_ERROR', payload: settingsError });
      console.error('[GlobalSettings]', settingsError);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Create reset function
  const resetSettings = () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      removeStoredSettings();
      dispatch({ type: 'RESET_SETTINGS' });
    } catch (error) {
      const settingsError = error instanceof Error ? error : new GlobalSettingsError('Unknown error resetting settings');
      dispatch({ type: 'SET_ERROR', payload: settingsError });
      console.error('[GlobalSettings]', settingsError);
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  // Initialize settings
  useEffect(() => {
    try {
      validateSettings(initialSettings);
      dispatch({ type: 'UPDATE_SETTINGS', payload: initialSettings });
    } catch (error) {
      console.error('[GlobalSettings] Invalid stored settings, resetting to defaults:', error);
      resetSettings();
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  }, []);

  const value: GlobalSettingsContextValue = {
    ...state,
    updateSettings,
    resetSettings
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

// Hook for consuming the context
export function useGlobalSettings(): GlobalSettingsContextValue {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new GlobalSettingsError(
      'useGlobalSettings must be used within a GlobalSettingsProvider'
    );
  }
  return context;
}