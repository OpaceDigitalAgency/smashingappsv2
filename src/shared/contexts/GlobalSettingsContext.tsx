import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { GlobalSettings, GlobalSettingsContextValue, DEFAULT_SETTINGS } from '../types/globalSettings';

const GlobalSettingsContext = createContext<GlobalSettingsContextValue | null>(null);

interface GlobalSettingsProviderProps {
  children: React.ReactNode;
}

class GlobalSettingsError extends Error {
  constructor(message: string) {
    super(`[GlobalSettings Error] ${message}`);
    this.name = 'GlobalSettingsError';
  }
}

export function GlobalSettingsContextProvider({ children }: GlobalSettingsProviderProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { 
    value: settings, 
    setValue: setSettings,
    remove: removeSettings 
  } = useLocalStorage<GlobalSettings>('global-settings', DEFAULT_SETTINGS);

  const updateSettings = useCallback((newSettings: Partial<GlobalSettings>) => {
    try {
      setSettings(current => ({
        ...current,
        ...newSettings
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new GlobalSettingsError('Failed to update settings');
      setError(error);
      console.error('Failed to update global settings:', error);
    }
  }, [setSettings]);

  const resetSettings = useCallback(() => {
    try {
      removeSettings();
    } catch (err) {
      const error = err instanceof Error ? err : new GlobalSettingsError('Failed to reset settings');
      setError(error);
      console.error('Failed to reset global settings:', error);
    }
  }, [removeSettings]);

  // Initialize settings
  useEffect(() => {
    try {
      // Validate settings structure
      const validateSettings = (settings: GlobalSettings) => {
        const requiredKeys = ['aiProvider', 'ui', 'rateLimit', 'features'];
        const missingKeys = requiredKeys.filter(key => !(key in settings));
        
        if (missingKeys.length > 0) {
          throw new GlobalSettingsError(
            `Invalid settings structure. Missing required keys: ${missingKeys.join(', ')}`
          );
        }
      };

      validateSettings(settings);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      const error = err instanceof Error ? err : new GlobalSettingsError('Failed to initialize settings');
      setError(error);
      console.error('Failed to initialize global settings:', error);
      // Reset to defaults if validation fails
      resetSettings();
    }
  }, [settings, resetSettings]);

  const value: GlobalSettingsContextValue = {
    settings,
    updateSettings,
    resetSettings,
    isLoading,
    error
  };

  return (
    <GlobalSettingsContext.Provider value={value}>
      {children}
    </GlobalSettingsContext.Provider>
  );
}

export function useGlobalSettings(): GlobalSettingsContextValue {
  const context = useContext(GlobalSettingsContext);
  if (!context) {
    throw new GlobalSettingsError(
      'useGlobalSettings must be used within a GlobalSettingsProvider'
    );
  }
  return context;
}

// Error Boundary for the Global Settings system
interface GlobalSettingsErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class GlobalSettingsErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  GlobalSettingsErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): GlobalSettingsErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('GlobalSettings Error Boundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-100 border border-red-400 rounded text-red-700">
          <h2 className="text-lg font-semibold mb-2">Settings Error</h2>
          <p className="mb-2">There was an error loading the application settings.</p>
          <p className="text-sm font-mono">{this.state.error?.message}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reload Application
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}