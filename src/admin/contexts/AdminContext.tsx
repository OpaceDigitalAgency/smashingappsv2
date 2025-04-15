/**
 * Extend the Window interface for diagnostics
 */
declare global {
  interface Window {
    __ADMIN_CONTEXT_ERROR__?: string;
    __ADMIN_CONTEXT_STATE__?: any;
    __ADMIN_CONTEXT_FATAL__?: any;
  }
}

// Define time range type to match usageTrackingService
export type TimeRange = 'day' | 'week' | 'month' | 'year';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { aiServiceRegistry } from '../../shared/services/aiServices';
import { AIProvider, ProviderConfig, AIModel } from '../../shared/types/aiProviders';
import { getUsageData, getFilteredUsageData, UsageData } from '../../shared/services/usageTrackingService';
import { useGlobalSettings } from '../../shared/contexts/GlobalSettings/context';
import { GlobalSettings, DEFAULT_SETTINGS } from '../../shared/contexts/GlobalSettings/types';
import { PromptTemplate } from '../../tools/article-smasher/src/types';
import {
  TaskSmasherPromptTemplate,
  loadTaskSmasherPrompts,
  saveTaskSmasherPrompts
} from '../../tools/task-smasher/utils/promptTemplates';
import {
  loadPrompts,
  savePrompts,
  loadSettings,
  saveSettings,
} from '../../tools/article-smasher/src/services/promptService';

// Define the context type
interface AdminContextType {
  // Provider management
  providers: Record<AIProvider, ProviderConfig>;
  refreshProviderModels: () => Promise<void>;
  updateProviderConfig: (provider: AIProvider, config: Partial<ProviderConfig>) => void;
  setApiKey: (provider: AIProvider, apiKey: string) => void;
  
  // Prompt management - Article Smasher
  prompts: PromptTemplate[];
  activePrompt: PromptTemplate | null;
  setActivePrompt: (prompt: PromptTemplate | null) => void;
  addPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<PromptTemplate>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  
  // Prompt management - Task Smasher
  taskSmasherPrompts: TaskSmasherPromptTemplate[];
  activeTaskSmasherPrompt: TaskSmasherPromptTemplate | null;
  setActiveTaskSmasherPrompt: (prompt: TaskSmasherPromptTemplate | null) => void;
  addTaskSmasherPrompt: (prompt: Omit<TaskSmasherPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateTaskSmasherPrompt: (id: string, prompt: Partial<TaskSmasherPromptTemplate>) => Promise<void>;
  deleteTaskSmasherPrompt: (id: string) => Promise<void>;
  
  // Settings management
  globalSettings: GlobalSettings;
  appSettings: Record<string, any>;
  updateGlobalSettings: (settings: Partial<GlobalSettings>) => void;
  updateAppSettings: (appId: string, settings: any) => void;
  
  // Usage monitoring
  usageStats: UsageData;
  timeRange: TimeRange;
  setTimeRange: (timeRange: TimeRange) => void;
  
  // UI state
  activeSection: string;
  setActiveSection: (section: string) => void;
  isLoading: boolean;
  error: Error | null;
}

// Create the context
const AdminContext = createContext<AdminContextType | null>(null);

// Provider component
export const AdminProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  // Get global settings from context
  // Get global settings from context
  const { settings: globalSettings, updateSettings: updateGlobalSettingsContext, error: globalSettingsError } = useGlobalSettings();

  // Handle global settings error
  useEffect(() => {
    if (globalSettingsError) {
      setError(globalSettingsError);
    }
  }, [globalSettingsError]);
  
  // Provider management state
  const [providers, setProviders] = useState<Record<AIProvider, ProviderConfig>>({} as Record<AIProvider, ProviderConfig>);
  
  // Prompt management state - Article Smasher
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  
  // Prompt management state - Task Smasher
  const [taskSmasherPrompts, setTaskSmasherPrompts] = useState<TaskSmasherPromptTemplate[]>([]);
  const [activeTaskSmasherPrompt, setActiveTaskSmasherPrompt] = useState<TaskSmasherPromptTemplate | null>(null);
  
  // App settings state
  const [appSettings, setAppSettings] = useState<Record<string, any>>({});
  
  // Usage monitoring state
  const [usageStats, setUsageStats] = useState<UsageData>(() => {
    // Initialize with filtered data based on default time range
    const initialData = getFilteredUsageData('month');
    return initialData;
  });
  // timeRange controls filtering of usage data for both summary metrics and detailed tables
  const [timeRange, setTimeRange] = useState<TimeRange>('month');

  // Initialize usage data on mount
  useEffect(() => {
    const initializeUsageData = () => {
      try {
        const filteredData = getFilteredUsageData(timeRange);
        setUsageStats(filteredData);
      } catch (error) {
        console.error('Error initializing usage data:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize usage data'));
      }
    };

    initializeUsageData();
  }, []);
  
  // UI state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize providers on mount
  useEffect(() => {
    console.log('AdminContext: Initializing providers');
    const initializeProviders = () => {
      setIsLoading(true);
      try {
        console.log('AdminContext: Getting registered services');
        // Get all registered services
        const services = aiServiceRegistry.getAllServices();
        const providerConfigs: Record<AIProvider, ProviderConfig> = {} as Record<AIProvider, ProviderConfig>;
        
        // Create provider configs with defensive programming
        services.forEach(service => {
          try {
            if (!service) {
              console.warn('AdminContext: Encountered undefined service, skipping');
              return;
            }
            
            const provider = service.provider;
            if (!provider) {
              console.warn('AdminContext: Service missing provider property, skipping');
              return;
            }
            
            // Safely get models with fallbacks
            let models: AIModel[] = [];
            try {
              models = service.getModels() || [];
            } catch (modelError) {
              console.warn(`AdminContext: Error getting models for ${provider}`, modelError);
              models = []; // Fallback to empty array
            }
            
            // Safely get default model with fallback
            let defaultModel = 'unknown';
            try {
              const defaultModelObj = service.getDefaultModel();
              defaultModel = defaultModelObj && defaultModelObj.id ? defaultModelObj.id : 'unknown';
            } catch (modelError) {
              console.warn(`AdminContext: Error getting default model for ${provider}`, modelError);
            }
            
            providerConfigs[provider] = {
              name: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize first letter
              enabled: Boolean(service.isConfigured()),
              apiKeyRequired: true, // Assume all providers require API keys
              apiKeyName: `${provider}ApiKey`,
              defaultModel,
              models,
            };
          } catch (serviceError) {
            console.error('AdminContext: Error processing service', serviceError);
            // Continue with other services
          }
        });
        
        console.log('AdminContext: Setting providers', Object.keys(providerConfigs));
        setProviders(providerConfigs);
      } catch (err) {
        console.error('AdminContext: Error initializing providers', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize providers'));
        // Set a minimal default provider config to prevent the app from crashing
        setProviders({} as Record<AIProvider, ProviderConfig>);
      } finally {
        console.log('AdminContext: Provider initialization complete');
        setIsLoading(false);
      }
    };
    
    // Wrap in try/catch to ensure the effect doesn't crash the app
    try {
      initializeProviders();
    } catch (err) {
      console.error('AdminContext: Critical error in provider initialization', err);
      setError(err instanceof Error ? err : new Error('Critical error in provider initialization'));
      setIsLoading(false);
    }
  }, []);
  
  // Function to refresh provider models from APIs
  const refreshProviderModels = async (): Promise<void> => {
    console.log('AdminContext: Starting refreshProviderModels');
    setIsLoading(true);
    
    // Create a safe wrapper for async operations
    const safeAsyncOperation = async <T,>(
      operation: () => Promise<T>,
      errorMessage: string,
      fallback: T
    ): Promise<T> => {
      try {
        return await operation();
      } catch (error) {
        console.warn(errorMessage, error);
        return fallback;
      }
    };
    
    try {
      // Get all registered services
      console.log('AdminContext: Getting all services for refreshProviderModels');
      const services = aiServiceRegistry.getAllServices();
      console.log('AdminContext: Found services:', services.map(s => s?.provider || 'unknown').filter(Boolean));
      const updatedProviderConfigs = { ...providers };
      
      // Force refresh models for each service
      for (const service of services) {
        if (!service) {
          console.warn('AdminContext: Encountered undefined service, skipping');
          continue;
        }
        
        try {
          // Get the provider
          const provider = service.provider;
          if (!provider) {
            console.warn('AdminContext: Service missing provider property, skipping');
            continue;
          }
          
          // For services that have implemented dynamic model fetching,
          // this will trigger a fresh API call to get the latest models
          if (service.isConfigured && service.isConfigured()) {
            if (typeof (service as any).fetchModelsFromAPI === 'function') {
              await safeAsyncOperation(
                async () => await (service as any).fetchModelsFromAPI(),
                `Error fetching models for ${provider}:`,
                undefined
              );
              console.log(`Successfully fetched models for ${provider}`);
            }
          } else {
            console.log(`Service ${provider} is not configured, using default models`);
          }
          
          // Get the models (will use defaults if fetch failed)
          let updatedModels: AIModel[] = [];
          try {
            updatedModels = service.getModels ? service.getModels() : [];
          } catch (modelError) {
            console.warn(`Error getting models for ${provider}:`, modelError);
          }
          
          // Update the provider config
          updatedProviderConfigs[provider] = {
            ...updatedProviderConfigs[provider],
            models: updatedModels,
          };
        } catch (serviceError) {
          console.error(`Error processing service:`, serviceError);
          // Continue with other services even if one fails
        }
      }
      
      // Update the providers state
      setProviders(updatedProviderConfigs);
      
      console.log('AdminContext: Provider models refresh completed successfully');
    } catch (err) {
      console.error('AdminContext: Failed to refresh provider models:', err);
      setError(err instanceof Error ? err : new Error('Failed to refresh provider models'));
    } finally {
      setIsLoading(false);
    }
    
    // Always resolve the promise to prevent uncaught promise rejections
    return Promise.resolve();
  };

  // Initialize prompts and settings on mount
  useEffect(() => {
    console.log('AdminContext: Initializing prompts and settings');
    const initializePromptsAndSettings = () => {
      setIsLoading(true);
      try {
        console.log('AdminContext: Loading prompts and settings');
        // Load prompts and settings from Article Smasher V2
        const loadedPrompts = loadPrompts();
        const loadedSettings = loadSettings();
        
        setPrompts(loadedPrompts);
        
        // Load prompts from Task Smasher
        const loadedTaskSmasherPrompts = loadTaskSmasherPrompts();
        setTaskSmasherPrompts(loadedTaskSmasherPrompts);
        
        console.log('AdminContext: Prompts and settings loaded successfully');
      } catch (err) {
        console.error('AdminContext: Error loading prompts and settings', err);
        setError(err instanceof Error ? err : new Error('Failed to initialize prompts and settings'));
      } finally {
        console.log('AdminContext: Prompts and settings initialization complete');
        setIsLoading(false);
      }
    };
    
    initializePromptsAndSettings();
  }, []);
  
  // Initialize usage data and set up event listener for updates
  useEffect(() => {
    // Update usage stats based on time range
    const updateUsageStats = () => {
      const filteredData = getFilteredUsageData(timeRange);
      setUsageStats(filteredData);
    };
    
    // Initial update
    updateUsageStats();
    
    // Listen for usage data updates
    const handleUsageDataUpdated = (event: CustomEvent<UsageData>) => {
      try {
        console.log('[DEBUG] Handling usage-data-updated event');
        const filteredData = getFilteredUsageData(timeRange);
        if (!filteredData) {
          console.warn('[DEBUG] No filtered data returned');
          return;
        }
        setUsageStats(filteredData);
      } catch (error) {
        console.error('[DEBUG] Error handling usage data update:', error);
      }
    };
    
    // Listen for manual refresh requests
    const handleRefreshUsageData = () => {
      try {
        console.log('[DEBUG] Handling refresh-usage-data event');
        const filteredData = getFilteredUsageData(timeRange);
        if (!filteredData) {
          console.warn('[DEBUG] No filtered data returned');
          return;
        }
        setUsageStats(filteredData);
      } catch (error) {
        console.error('[DEBUG] Error refreshing usage data:', error);
      }
    };
    
    window.addEventListener('usage-data-updated', handleUsageDataUpdated as EventListener);
    window.addEventListener('refresh-usage-data', handleRefreshUsageData);
    
    return () => {
      window.removeEventListener('usage-data-updated', handleUsageDataUpdated as EventListener);
      window.removeEventListener('refresh-usage-data', handleRefreshUsageData);
    };
  }, [timeRange]);

  // Provider management functions
  const updateProviderConfig = (provider: AIProvider, config: Partial<ProviderConfig>) => {
    setProviders(prevProviders => ({
      ...prevProviders,
      [provider]: {
        ...prevProviders[provider],
        ...config,
      },
    }));
  };
  
  const setApiKey = (provider: AIProvider, apiKey: string) => {
    try {
      // Get the service for the provider
      const service = aiServiceRegistry.getService(provider);
      if (!service) {
        throw new Error(`Service for provider ${provider} not found`);
      }
      
      // Set the API key
      service.setApiKey(apiKey);
      
      // Update the provider config
      updateProviderConfig(provider, { enabled: true });
    } catch (err) {
      setError(err instanceof Error ? err : new Error(`Failed to set API key for ${provider}`));
    }
  };

  // Prompt management functions
  const addPrompt = async (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      
      // Create a new prompt
      const newPrompt: PromptTemplate = {
        ...promptData,
        id: `prompt-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add the prompt to the state
      setPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      
      // Save the prompts
      savePrompts([...prompts, newPrompt]);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updatePrompt = async (id: string, promptUpdate: Partial<PromptTemplate>) => {
    try {
      setIsLoading(true);
      
      // Update the prompt
      const updatedPrompts = prompts.map(p => 
        p.id === id 
          ? { ...p, ...promptUpdate, updatedAt: new Date() } 
          : p
      );
      
      // Update the state
      setPrompts(updatedPrompts);
      
      // Update activePrompt if it's the one being updated
      if (activePrompt && activePrompt.id === id) {
        setActivePrompt({ ...activePrompt, ...promptUpdate, updatedAt: new Date() });
      }
      
      // Save the prompts
      savePrompts(updatedPrompts);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deletePrompt = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Filter out the prompt
      const filteredPrompts = prompts.filter(p => p.id !== id);
      
      // Update the state
      setPrompts(filteredPrompts);
      
      // Clear activePrompt if it's the one being deleted
      if (activePrompt && activePrompt.id === id) {
        setActivePrompt(null);
      }
      
      // Save the prompts
      savePrompts(filteredPrompts);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Task Smasher prompt management functions
  const addTaskSmasherPrompt = async (promptData: Omit<TaskSmasherPromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      
      // Create a new prompt
      const newPrompt: TaskSmasherPromptTemplate = {
        ...promptData,
        id: `prompt-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      // Add the prompt to the state
      setTaskSmasherPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      
      // Save the prompts
      saveTaskSmasherPrompts([...taskSmasherPrompts, newPrompt]);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add Task Smasher prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateTaskSmasherPrompt = async (id: string, promptUpdate: Partial<TaskSmasherPromptTemplate>) => {
    try {
      setIsLoading(true);
      
      // Update the prompt
      const updatedPrompts = taskSmasherPrompts.map(p =>
        p.id === id
          ? { ...p, ...promptUpdate, updatedAt: new Date() }
          : p
      );
      
      // Update the state
      setTaskSmasherPrompts(updatedPrompts);
      
      // Update activePrompt if it's the one being updated
      if (activeTaskSmasherPrompt && activeTaskSmasherPrompt.id === id) {
        setActiveTaskSmasherPrompt({ ...activeTaskSmasherPrompt, ...promptUpdate, updatedAt: new Date() });
      }
      
      // Save the prompts
      saveTaskSmasherPrompts(updatedPrompts);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update Task Smasher prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const deleteTaskSmasherPrompt = async (id: string) => {
    try {
      setIsLoading(true);
      
      // Filter out the prompt
      const filteredPrompts = taskSmasherPrompts.filter(p => p.id !== id);
      
      // Update the state
      setTaskSmasherPrompts(filteredPrompts);
      
      // Clear activePrompt if it's the one being deleted
      if (activeTaskSmasherPrompt && activeTaskSmasherPrompt.id === id) {
        setActiveTaskSmasherPrompt(null);
      }
      
      // Save the prompts
      saveTaskSmasherPrompts(filteredPrompts);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete Task Smasher prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Settings management functions
  const updateGlobalSettings = (settings: Partial<GlobalSettings>) => {
    try {
      updateGlobalSettingsContext(settings);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update global settings'));
    }
  };
  
  const updateAppSettings = (appId: string, settings: any) => {
    setAppSettings(prevSettings => ({
      ...prevSettings,
      [appId]: {
        ...prevSettings[appId],
        ...settings,
      },
    }));
  };

  // Context value
  const contextValue: AdminContextType = {
    // Provider management
    providers,
    refreshProviderModels,
    updateProviderConfig,
    setApiKey,
    
    // Prompt management - Article Smasher
    prompts,
    activePrompt,
    setActivePrompt,
    addPrompt,
    updatePrompt,
    deletePrompt,
    
    // Prompt management - Task Smasher
    taskSmasherPrompts,
    activeTaskSmasherPrompt,
    setActiveTaskSmasherPrompt,
    addTaskSmasherPrompt,
    updateTaskSmasherPrompt,
    deleteTaskSmasherPrompt,
    
    // Settings management
    globalSettings,
    appSettings,
    updateGlobalSettings,
    updateAppSettings,
    
    // Usage monitoring
    usageStats,
    timeRange,
    setTimeRange,
    
    // UI state
    activeSection,
    setActiveSection,
    isLoading,
    error,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Custom hook to use the admin context
export const useAdmin = () => {
  try {
    const context = useContext(AdminContext);
    if (!context) {
      const err = new Error('useAdmin called outside of AdminProvider - this is a programming error');
      // Log full stack and context
      console.error(err.stack || err.message, { context });
      // Display a visible error in the UI if possible
      if (typeof window !== "undefined") {
        (window as Window).__ADMIN_CONTEXT_ERROR__ = err.stack || err.message;
      }
      // Return fallback context with error
      return {
        // Provider management
        providers: {} as Record<AIProvider, ProviderConfig>,
        refreshProviderModels: async () => {},
        updateProviderConfig: () => {},
        setApiKey: () => {},
        
        // Prompt management - Article Smasher
        prompts: [],
        activePrompt: null,
        setActivePrompt: () => {},
        addPrompt: async () => {},
        updatePrompt: async () => {},
        deletePrompt: async () => {},
        
        // Prompt management - Task Smasher
        taskSmasherPrompts: [],
        activeTaskSmasherPrompt: null,
        setActiveTaskSmasherPrompt: () => {},
        addTaskSmasherPrompt: async () => {},
        updateTaskSmasherPrompt: async () => {},
        deleteTaskSmasherPrompt: async () => {},
        
        // Settings management
        globalSettings: DEFAULT_SETTINGS,
        appSettings: {},
        updateGlobalSettings: () => {},
        updateAppSettings: () => {},
        
        // Usage monitoring
        usageStats: getUsageData(),
        timeRange: 'month' as TimeRange,
        setTimeRange: () => {},
        
        // UI state
        activeSection: 'dashboard',
        setActiveSection: () => {},
        isLoading: false,
        error: err,
      } as AdminContextType;
    }
    return context;
  } catch (err) {
    console.error('Critical error in useAdmin:', err);
    throw err;
  }
};