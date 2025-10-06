import { AIExecuteOptions } from '../../types';

export interface GlobalSettings {
  // Version tracking for migrations
  _version?: number;

  // AI Provider Settings
  aiProvider: {
    provider: 'openai' | 'anthropic' | 'openrouter';
    apiKey: string;
    defaultModel: string;
    defaultSystemPrompt: string;
    defaultOptions: Partial<AIExecuteOptions>;
  };
  
  // UI Settings
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarExpanded: boolean;
    fontSize: 'sm' | 'md' | 'lg';
  };
  
  // Rate Limiting
  rateLimit: {
    enabled: boolean;
    maxRequestsPerMinute: number;
    maxTokensPerDay: number;
  };

  // Feature Flags
  features: {
    voiceToText: boolean;
    dragAndDrop: boolean;
    autoSave: boolean;
  };
}

export interface GlobalSettingsContextValue {
  settings: GlobalSettings;
  updateSettings: (settings: Partial<GlobalSettings>) => void;
  resetSettings: () => void;
  isLoading: boolean;
  error: Error | null;
}

export const DEFAULT_SETTINGS: GlobalSettings = {
  _version: 1,
  aiProvider: {
    provider: 'openai',
    apiKey: '',
    defaultModel: 'gpt-3.5-turbo',
    defaultSystemPrompt: '',
    defaultOptions: {
      temperature: 0.7,
      maxTokens: 2000
    }
  },
  ui: {
    theme: 'system',
    sidebarExpanded: true,
    fontSize: 'md'
  },
  rateLimit: {
    enabled: true,
    maxRequestsPerMinute: 10,
    maxTokensPerDay: 100000
  },
  features: {
    voiceToText: false,
    dragAndDrop: true,
    autoSave: true
  }
};