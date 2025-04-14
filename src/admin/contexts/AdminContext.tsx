import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { aiServiceRegistry, getModelsByProvider } from '../../shared/services/aiServices';
import { AIProvider, ProviderConfig, AIModel } from '../../shared/types/aiProviders';
import { PromptTemplate, PromptSettings } from '../../tools/article-smasherv2/src/types';
import {
  loadPrompts,
  savePrompts,
  loadSettings,
  saveSettings,
} from '../../tools/article-smasherv2/src/services/promptService';

// Define the context type
interface AdminContextType {
  // Provider management
  providers: Record<AIProvider, ProviderConfig>;
  updateProviderConfig: (provider: AIProvider, config: Partial<ProviderConfig>) => void;
  setApiKey: (provider: AIProvider, apiKey: string) => void;
  
  // Prompt management
  prompts: PromptTemplate[];
  activePrompt: PromptTemplate | null;
  setActivePrompt: (prompt: PromptTemplate | null) => void;
  addPrompt: (prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updatePrompt: (id: string, prompt: Partial<PromptTemplate>) => Promise<void>;
  deletePrompt: (id: string) => Promise<void>;
  
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
  usageStats: {
    totalRequests: number;
    totalTokens: number;
    costEstimate: number;
    requestsByProvider: Record<AIProvider, number>;
    tokensByProvider: Record<AIProvider, number>;
    costByProvider: Record<AIProvider, number>;
  };
  
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
  
  // Prompt management state
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  
  // Settings management state
  const [globalSettings, setGlobalSettings] = useState({
    defaultProvider: 'openai' as AIProvider,
    defaultModel: 'gpt-4o',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
  });
  const [appSettings, setAppSettings] = useState<Record<string, any>>({});
  
  // Usage monitoring state
  const [usageStats, setUsageStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    costEstimate: 0,
    requestsByProvider: {} as Record<AIProvider, number>,
    tokensByProvider: {} as Record<AIProvider, number>,
    costByProvider: {} as Record<AIProvider, number>,
  });
  
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

  // Initialize prompts and settings on mount
  useEffect(() => {
    const initializePromptsAndSettings = () => {
      setIsLoading(true);
      try {
        // Load prompts and settings from Article Smasher V2
        const loadedPrompts = loadPrompts();
        const loadedSettings = loadSettings();
        
        setPrompts(loadedPrompts);
        
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

  // Settings management functions
  const updateGlobalSettings = (settings: Partial<typeof globalSettings>) => {
    setGlobalSettings(prevSettings => ({
      ...prevSettings,
      ...settings,
    }));
    
    // Update the default provider in the AI service registry
    if (settings.defaultProvider) {
      aiServiceRegistry.setDefaultProvider(settings.defaultProvider);
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
    updateProviderConfig,
    setApiKey,
    
    // Prompt management
    prompts,
    activePrompt,
    setActivePrompt,
    addPrompt,
    updatePrompt,
    deletePrompt,
    
    // Settings management
    globalSettings,
    appSettings,
    updateGlobalSettings,
    updateAppSettings,
    
    // Usage monitoring
    usageStats,
    
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