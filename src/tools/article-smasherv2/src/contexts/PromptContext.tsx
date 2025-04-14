import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  PromptTemplate, 
  PromptSettings, 
  PromptContextType 
} from '../types';
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
  const [settings, setSettings] = useState<PromptSettings>({
    defaultModel: 'gpt-4o',
    defaultTemperature: 0.7,
    defaultMaxTokens: 1000,
    enabledCategories: ['topic', 'keyword', 'outline', 'content', 'image']
  });
  const [activePrompt, setActivePrompt] = useState<PromptTemplate | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Start with loading state true
  const [isInitialized, setIsInitialized] = useState<boolean>(false); // Track initialization
  const [error, setError] = useState<Error | null>(null);

  // Load prompts and settings on mount
  useEffect(() => {
    const initializePrompts = async () => {
      setIsLoading(true);
      try {
        const loadedPrompts = loadPrompts();
        const loadedSettings = loadSettings();
        setPrompts(loadedPrompts);
        setSettings(loadedSettings);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load prompts and settings'));
        // Still mark as initialized even if there's an error, so we can use fallbacks
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    initializePrompts();
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
    const categoryPrompts = getPromptsByCategoryService(category);
    
    // If no prompts found for the category, return default prompts
    if (categoryPrompts.length === 0) {
      console.warn(`No prompts found for category: ${category}. Using default prompts.`);
      // Return default prompts for the category from promptService
      return loadPrompts().filter(p => p.category === category);
    }
    
    return categoryPrompts;
  };

  // Update settings
  const updateSettings = async (settingsUpdate: Partial<PromptSettings>) => {
    try {
      setIsLoading(true);
      const updatedSettings = { ...settings, ...settingsUpdate };
      saveSettings(updatedSettings);
      setSettings(updatedSettings);
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
      const prompt = prompts.find(p => p.id === promptId);
      
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
            const result = await articleAIService.testPrompt(
              fallbackPrompts[0],
              variables,
              settings.defaultModel
            );
            return result;
          }
        }
        
        throw new Error(`No suitable fallback prompt found for ID ${promptId}`);
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