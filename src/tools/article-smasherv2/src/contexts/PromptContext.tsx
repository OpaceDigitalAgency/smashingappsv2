import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  PromptTemplate,
  PromptSettings,
  PromptContextType
} from '../types';
import {
  initAdminBridge,
  isAdminContextAvailable,
  getPromptsFromAdmin,
  getPromptByIdFromAdmin,
  addPromptToAdmin,
  updatePromptInAdmin,
  deletePromptFromAdmin
} from '../utils/adminBridge';
import { getGlobalSettings } from '../../../../shared/services/globalSettingsService';
import {
  loadPrompts,
  savePrompts,
  loadSettings,
  saveSettings,
  addPrompt as addPromptService,
  updatePrompt as updatePromptService,
  deletePrompt as deletePromptService,
  getPromptsByCategory as getPromptsByCategoryService
} from '../services/promptService';
import articleAIService from '../services/articleAIService';

// Create the context
const PromptContext = createContext<PromptContextType | null>(null);

// Provider component
export const PromptProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [prompts, setPrompts] = useState<PromptTemplate[]>([]);
  const [settings, setSettings] = useState<PromptSettings>(() => {
    // Try to get settings from global settings first
    try {
      const globalSettings = getGlobalSettings();
      return {
        defaultModel: globalSettings.defaultModel,
        defaultTemperature: globalSettings.defaultTemperature,
        defaultMaxTokens: globalSettings.defaultMaxTokens,
        enabledCategories: ['topic', 'keyword', 'outline', 'content', 'image']
      };
    } catch (error) {
      console.error('Error getting global settings:', error);
      // Fall back to default settings
      return {
        defaultModel: 'gpt-4o',
        defaultTemperature: 0.7,
        defaultMaxTokens: 1000,
        enabledCategories: ['topic', 'keyword', 'outline', 'content', 'image']
      };
    }
  });
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading state true
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Track initialization
  const [error, setError] = useState<Error | null>(null);

  // Load prompts and settings on mount
  useEffect(() => {
    // Initialize the admin bridge
    initAdminBridge();
    
    const initializePrompts = async () => {
      setIsLoading(true);
      try {
        // First try to get prompts from the admin interface
        try {
          // Check if we're in the admin interface context
          if (isAdminContextAvailable()) {
            const adminPrompts = getPromptsFromAdmin();
            if (adminPrompts) {
              console.log('Loading prompts from admin interface');
              setPrompts(adminPrompts);
              setIsInitialized(true);
            } else {
              // Fall back to local storage if admin prompts are not available
              console.log('Admin prompts not available, loading prompts from local storage');
              const loadedPrompts = loadPrompts();
              setPrompts(loadedPrompts);
              setIsInitialized(true);
            }
          } else {
            // Fall back to local storage if admin context is not available
            console.log('Admin interface not available, loading prompts from local storage');
            const loadedPrompts = loadPrompts();
            setPrompts(loadedPrompts);
            setIsInitialized(true);
          }
        } catch (adminErr) {
          console.warn('Failed to load prompts from admin interface:', adminErr);
          // Fall back to local storage
          const loadedPrompts = loadPrompts();
          setPrompts(loadedPrompts);
          setIsInitialized(true);
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load prompts'));
        // Still mark as initialized even if there's an error, so we can use fallbacks
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializePrompts();
  }, []);
  
  // Listen for global settings changes
  useEffect(() => {
    // Handler for custom event
    const handleGlobalSettingsChanged = (e: CustomEvent) => {
      const globalSettings = e.detail;
      setSettings(prevSettings => ({
        ...prevSettings,
        defaultModel: globalSettings.defaultModel,
        defaultTemperature: globalSettings.defaultTemperature,
        defaultMaxTokens: globalSettings.defaultMaxTokens,
      }));
    };
    
    // Handler for storage event (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'smashingapps_globalSettings' && e.newValue) {
        try {
          const globalSettings = JSON.parse(e.newValue);
          setSettings(prevSettings => ({
            ...prevSettings,
            defaultModel: globalSettings.defaultModel,
            defaultTemperature: globalSettings.defaultTemperature,
            defaultMaxTokens: globalSettings.defaultMaxTokens,
          }));
        } catch (error) {
          console.error('Error updating settings from storage event:', error);
        }
      }
    };
    
    // Add event listeners
    window.addEventListener('globalSettingsChanged', handleGlobalSettingsChanged as EventListener);
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      // Remove event listeners on cleanup
      window.removeEventListener('globalSettingsChanged', handleGlobalSettingsChanged as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Add a new prompt
  const addPrompt = async (promptData: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setIsLoading(true);
      const newPrompt = addPromptService(promptData);
      setPrompts(prevPrompts => [...prevPrompts, newPrompt]);
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Update an existing prompt
  const updatePrompt = async (id: string, promptUpdate: Partial<PromptTemplate>) => {
    try {
      setIsLoading(true);
      const updatedPrompt = updatePromptService(id, promptUpdate);
      
      if (updatedPrompt) {
        setPrompts(prevPrompts => 
          prevPrompts.map(p => p.id === id ? updatedPrompt : p)
        );
        
        // Update activePrompt if it's the one being updated
        if (activePrompt && activePrompt.id === id) {
          setActivePrompt(updatedPrompt);
        }
      }
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a prompt
  const deletePrompt = async (id: string) => {
    try {
      setIsLoading(true);
      const success = deletePromptService(id);
      
      if (success) {
        setPrompts(prevPrompts => prevPrompts.filter(p => p.id !== id));
        
        // Clear activePrompt if it's the one being deleted
        if (activePrompt && activePrompt.id === id) {
          setActivePrompt(null);
        }
      }
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete prompt'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Get prompts by category with fallback
  const getPromptsByCategory = (category: PromptTemplate['category']) => {
    // First try to get prompts from our current state
    const categoryPrompts = prompts.filter(p => p.category === category);
    
    // If no prompts found for the category, try the service
    if (categoryPrompts.length === 0) {
      console.warn(`No prompts found for category: ${category} in current state. Trying service.`);
      const servicePrompts = getPromptsByCategoryService(category);
      
      if (servicePrompts.length === 0) {
        console.warn(`No prompts found for category: ${category} in service. Using default prompts.`);
        // Return default prompts for the category from promptService
        return loadPrompts().filter(p => p.category === category);
      }
      
      return servicePrompts;
    }
    
    return categoryPrompts;
  };

  // Update settings
  const updateSettings = async (settingsUpdate: Partial<PromptSettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = { ...settings, ...settingsUpdate };
      
      // Save to app-specific settings
      saveSettings(updatedSettings);
      setSettings(updatedSettings);
      
      // Also update global settings if relevant properties are changed
      if (settingsUpdate.defaultModel || settingsUpdate.defaultTemperature || settingsUpdate.defaultMaxTokens) {
        try {
          // Import the updateGlobalSettings function dynamically to avoid circular dependencies
          const { updateGlobalSettings } = await import('../../../../shared/services/globalSettingsService');
          
          // Only update the properties that were changed
          const globalSettingsUpdate: any = {};
          if (settingsUpdate.defaultModel) globalSettingsUpdate.defaultModel = settingsUpdate.defaultModel;
          if (settingsUpdate.defaultTemperature) globalSettingsUpdate.defaultTemperature = settingsUpdate.defaultTemperature;
          if (settingsUpdate.defaultMaxTokens) globalSettingsUpdate.defaultMaxTokens = settingsUpdate.defaultMaxTokens;
          
          // Update global settings
          updateGlobalSettings(globalSettingsUpdate);
        } catch (error) {
          console.error('Error updating global settings:', error);
        }
      }
      
      return Promise.resolve();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update settings'));
      return Promise.reject(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Test a prompt with fallback
  const testPrompt = async (promptId: string, variables: Record<string, string>) => {
    try {
      setIsLoading(true);
      
      // First try to find the prompt in our current state
      let prompt = prompts.find(p => p.id === promptId);
      
      // If not found, try to find it in the admin interface
      if (!prompt && isAdminContextAvailable()) {
        const adminPrompt = getPromptByIdFromAdmin(promptId);
        if (adminPrompt) {
          prompt = adminPrompt;
        }
      }
      
      if (!prompt) {
        console.warn(`Prompt with ID ${promptId} not found. Attempting to find a similar prompt.`);
        // Try to find a similar prompt by category if possible
        const category = promptId.includes('topic') ? 'topic' :
                         promptId.includes('keyword') ? 'keyword' :
                         promptId.includes('outline') ? 'outline' :
                         promptId.includes('content') ? 'content' :
                         promptId.includes('image') ? 'image' : null;
        
        if (category) {
          const fallbackPrompts = getPromptsByCategory(category);
          if (fallbackPrompts.length > 0) {
            console.info(`Using fallback prompt from category: ${category}`);
            prompt = fallbackPrompts[0];
          }
        }
        
        if (!prompt) {
          throw new Error(`No suitable fallback prompt found for ID ${promptId}`);
        }
      }
      
      const result = await articleAIService.testPrompt(
        prompt,
        variables,
        settings.defaultModel
      );
      
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to test prompt'));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const contextValue: PromptContextType = {
    prompts,
    settings,
    activePrompt,
    setActivePrompt,
    addPrompt,
    updatePrompt,
    deletePrompt,
    getPromptsByCategory,
    updateSettings,
    testPrompt,
    isLoading,
    isInitialized,
    error
  };

  return (
    <PromptContext.Provider value={contextValue}>
      {children}
    </PromptContext.Provider>
  );
};

// Custom hook to use the prompt context
export const usePrompt = () => {
  const context = useContext(PromptContext);
  if (!context) {
    throw new Error('usePrompt must be used within a PromptProvider');
  }
  return context;
};