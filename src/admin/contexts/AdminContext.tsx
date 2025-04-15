import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { aiServiceRegistry, getModelsByProvider } from '../../shared/services/aiServices';
import { AIProvider, ProviderConfig, AIModel } from '../../shared/types/aiProviders';
import { getUsageData, getFilteredUsageData, UsageData } from '../../shared/services/usageTrackingService';
import {
  getGlobalSettings,
  updateGlobalSettings as updateGlobalSettingsService,
  applyGlobalSettingsToAllApps,
  initGlobalSettingsService
} from '../../shared/services/globalSettingsService';
import { PromptTemplate, PromptSettings } from '../../tools/article-smasher/src/types';
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
  globalSettings: {
    defaultProvider: AIProvider;
    defaultModel: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
  };
  appSettings: Record<string, any>;
  updateGlobalSettings: (settings: Partial<{
    defaultProvider: AIProvider;
    defaultModel: string;
    defaultTemperature: number;
    defaultMaxTokens: number;
  }>) => void;
  updateAppSettings: (appId: string, settings: any) => void;
  
  // Usage monitoring
  usageStats: UsageData;
  timeRange: 'day' | 'week' | 'month' | 'year';
  setTimeRange: (timeRange: 'day' | 'week' | 'month' | 'year') => void;
  
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
  // Provider management state
  const [providers, setProviders] = useState<Record<AIProvider, ProviderConfig>>({} as Record<AIProvider, ProviderConfig>);
  
  // Prompt management state - Article Smasher
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  
  // Prompt management state - Task Smasher
  const [taskSmasherPrompts, setTaskSmasherPrompts] = useState<TaskSmasherPromptTemplate[]>([]);
  const [activeTaskSmasherPrompt, setActiveTaskSmasherPrompt] = useState<TaskSmasherPromptTemplate | null>(null);
  
  // Settings management state
  const [globalSettings, setGlobalSettings] = useState(() => {
    // Initialize global settings service
    initGlobalSettingsService();
    
    // Get global settings from the service
    return getGlobalSettings();
  });
  const [appSettings, setAppSettings] = useState<Record<string, any>>({});
  
  // Usage monitoring state
  const [usageStats, setUsageStats] = useState<UsageData>(getUsageData());
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  
  // UI state
  const [activeSection, setActiveSection] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Initialize providers on mount
  useEffect(() => {
    const initializeProviders = () => {
      setIsLoading(true);
      try {
        // Get all registered services
        const services = aiServiceRegistry.getAllServices();
        const providerConfigs: Record<AIProvider, ProviderConfig> = {} as Record<AIProvider, ProviderConfig>;
        
        // Create provider configs
        services.forEach(service => {
          const provider = service.provider;
          const models = service.getModels();
          const defaultModel = service.getDefaultModel().id;
          
          providerConfigs[provider] = {
            name: provider.charAt(0).toUpperCase() + provider.slice(1), // Capitalize first letter
            enabled: service.isConfigured(),
            apiKeyRequired: true, // Assume all providers require API keys
            apiKeyName: `${provider}ApiKey`,
            defaultModel,
            models,
          };
        });
        
        setProviders(providerConfigs);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize providers'));
      } finally {
        setIsLoading(false);
      }
    };
    
    initializeProviders();
  }, []);
  
  // Function to refresh provider models from APIs
  const refreshProviderModels = async (): Promise<void> => {
    setIsLoading(true);
    try {
      // Get all registered services
      const services = aiServiceRegistry.getAllServices();
      const updatedProviderConfigs = { ...providers };
      
      // Force refresh models for each service
      for (const service of services) {
        if (service.isConfigured()) {
          // For services that have implemented dynamic model fetching,
          // this will trigger a fresh API call to get the latest models
          if (typeof (service as any).fetchModelsFromAPI === 'function') {
            await (service as any).fetchModelsFromAPI();
          }
          
          // Get the updated models
          const updatedModels = service.getModels();
          const provider = service.provider;
          
          // Update the provider config
          updatedProviderConfigs[provider] = {
            ...updatedProviderConfigs[provider],
            models: updatedModels,
          };
        }
      }
      
      // Update the providers state
      setProviders(updatedProviderConfigs);
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to refresh provider models'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize prompts and settings on mount
  useEffect(() => {
    const initializePromptsAndSettings = () => {
      setIsLoading(true);
      try {
        // Load prompts and settings from Article Smasher V2
        const loadedPrompts = loadPrompts();
        const loadedSettings = loadSettings();
        
        setPrompts(loadedPrompts);
        
        // Load prompts from Task Smasher
        const loadedTaskSmasherPrompts = loadTaskSmasherPrompts();
        setTaskSmasherPrompts(loadedTaskSmasherPrompts);
        
        // Update global settings with loaded settings
        setGlobalSettings(prevSettings => ({
          ...prevSettings,
          defaultModel: loadedSettings.defaultModel,
          defaultTemperature: loadedSettings.defaultTemperature,
          defaultMaxTokens: loadedSettings.defaultMaxTokens,
        }));
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize prompts and settings'));
      } finally {
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
      const filteredData = getFilteredUsageData(timeRange);
      setUsageStats(filteredData);
    };
    
    window.addEventListener('usage-data-updated', handleUsageDataUpdated as EventListener);
    
    return () => {
      window.removeEventListener('usage-data-updated', handleUsageDataUpdated as EventListener);
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
      
      // Update activeTaskSmasherPrompt if it's the one being updated
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
      
      // Clear activeTaskSmasherPrompt if it's the one being deleted
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
  const updateGlobalSettings = (settings: Partial<typeof globalSettings>) => {
    // Update local state
    setGlobalSettings(prevSettings => ({
      ...prevSettings,
      ...settings,
    }));
    
    // Update global settings using the service
    updateGlobalSettingsService(settings);
    
    // Apply the updated settings to all apps
    applyGlobalSettingsToAllApps();
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
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};