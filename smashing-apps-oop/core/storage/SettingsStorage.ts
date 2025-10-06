/**
 * Settings Storage
 * 
 * Manages persistent storage of AI-Core settings
 * Uses localStorage for settings and IndexedDB for usage statistics
 */

import { ProviderConfig } from '../interfaces/IProvider';

export interface AISettings {
  version: number;
  providers: {
    [key: string]: ProviderConfig;
  };
  defaultProvider: string;
  defaultModel: string;
  enableStats: boolean;
  enableCaching: boolean;
  cacheDuration: number;
}

export interface UsageStats {
  totalRequests: number;
  totalTokens: number;
  totalCost: number;
  byProvider: {
    [provider: string]: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
  byModel: {
    [model: string]: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
  byApp: {
    [app: string]: {
      requests: number;
      tokens: number;
      cost: number;
    };
  };
  lastReset?: Date;
}

const SETTINGS_KEY = 'smashingapps_ai_core_settings';
const STATS_KEY = 'smashingapps_ai_core_stats';
const SETTINGS_VERSION = 1;

class SettingsStorage {
  private static instance: SettingsStorage;
  
  private constructor() {}
  
  public static getInstance(): SettingsStorage {
    if (!SettingsStorage.instance) {
      SettingsStorage.instance = new SettingsStorage();
    }
    return SettingsStorage.instance;
  }
  
  /**
   * Get default settings
   */
  private getDefaultSettings(): AISettings {
    return {
      version: SETTINGS_VERSION,
      providers: {
        openai: {
          name: 'openai',
          displayName: 'OpenAI',
          enabled: false,
          apiKey: '',
          defaultModel: 'gpt-4o-mini',
          supportsImages: true,
          supportsStreaming: true
        },
        anthropic: {
          name: 'anthropic',
          displayName: 'Anthropic Claude',
          enabled: false,
          apiKey: '',
          defaultModel: 'claude-sonnet-4-20250514',
          supportsImages: true,
          supportsStreaming: true
        },
        gemini: {
          name: 'gemini',
          displayName: 'Google Gemini',
          enabled: false,
          apiKey: '',
          defaultModel: 'gemini-2.0-flash-exp',
          supportsImages: true,
          supportsStreaming: true
        },
        openrouter: {
          name: 'openrouter',
          displayName: 'OpenRouter',
          enabled: false,
          apiKey: '',
          defaultModel: 'openai/gpt-4o-mini',
          supportsImages: true,
          supportsStreaming: true
        }
      },
      defaultProvider: 'openai',
      defaultModel: 'gpt-4o-mini',
      enableStats: true,
      enableCaching: true,
      cacheDuration: 3600
    };
  }
  
  /**
   * Load settings from storage
   */
  public loadSettings(): AISettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) {
        return this.getDefaultSettings();
      }
      
      const settings = JSON.parse(stored) as AISettings;
      
      // Migrate if needed
      if (settings.version !== SETTINGS_VERSION) {
        return this.migrateSettings(settings);
      }
      
      return settings;
    } catch (error) {
      console.error('[SettingsStorage] Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }
  
  /**
   * Save settings to storage
   */
  public saveSettings(settings: AISettings): void {
    try {
      settings.version = SETTINGS_VERSION;
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      
      // Dispatch event for other components
      window.dispatchEvent(new CustomEvent('ai-core-settings-changed', {
        detail: settings
      }));
    } catch (error) {
      console.error('[SettingsStorage] Error saving settings:', error);
      throw new Error('Failed to save settings');
    }
  }
  
  /**
   * Update provider configuration
   */
  public updateProvider(provider: string, config: Partial<ProviderConfig>): void {
    const settings = this.loadSettings();
    
    if (!settings.providers[provider]) {
      throw new Error(`Provider ${provider} not found`);
    }
    
    settings.providers[provider] = {
      ...settings.providers[provider],
      ...config
    };
    
    this.saveSettings(settings);
  }
  
  /**
   * Get provider configuration
   */
  public getProvider(provider: string): ProviderConfig | undefined {
    const settings = this.loadSettings();
    return settings.providers[provider];
  }
  
  /**
   * Get all configured providers
   */
  public getConfiguredProviders(): string[] {
    const settings = this.loadSettings();
    return Object.keys(settings.providers)
      .filter(key => settings.providers[key].enabled && settings.providers[key].apiKey);
  }
  
  /**
   * Load usage statistics
   */
  public loadStats(): UsageStats {
    try {
      const stored = localStorage.getItem(STATS_KEY);
      if (!stored) {
        return this.getDefaultStats();
      }
      
      return JSON.parse(stored) as UsageStats;
    } catch (error) {
      console.error('[SettingsStorage] Error loading stats:', error);
      return this.getDefaultStats();
    }
  }
  
  /**
   * Save usage statistics
   */
  public saveStats(stats: UsageStats): void {
    try {
      localStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('[SettingsStorage] Error saving stats:', error);
    }
  }
  
  /**
   * Update usage statistics
   */
  public updateStats(provider: string, model: string, app: string, tokens: number, cost: number): void {
    const stats = this.loadStats();
    
    // Update totals
    stats.totalRequests++;
    stats.totalTokens += tokens;
    stats.totalCost += cost;
    
    // Update by provider
    if (!stats.byProvider[provider]) {
      stats.byProvider[provider] = { requests: 0, tokens: 0, cost: 0 };
    }
    stats.byProvider[provider].requests++;
    stats.byProvider[provider].tokens += tokens;
    stats.byProvider[provider].cost += cost;
    
    // Update by model
    if (!stats.byModel[model]) {
      stats.byModel[model] = { requests: 0, tokens: 0, cost: 0 };
    }
    stats.byModel[model].requests++;
    stats.byModel[model].tokens += tokens;
    stats.byModel[model].cost += cost;
    
    // Update by app
    if (!stats.byApp[app]) {
      stats.byApp[app] = { requests: 0, tokens: 0, cost: 0 };
    }
    stats.byApp[app].requests++;
    stats.byApp[app].tokens += tokens;
    stats.byApp[app].cost += cost;
    
    this.saveStats(stats);
  }
  
  /**
   * Reset usage statistics
   */
  public resetStats(): void {
    this.saveStats(this.getDefaultStats());
  }
  
  /**
   * Get default statistics
   */
  private getDefaultStats(): UsageStats {
    return {
      totalRequests: 0,
      totalTokens: 0,
      totalCost: 0,
      byProvider: {},
      byModel: {},
      byApp: {},
      lastReset: new Date()
    };
  }
  
  /**
   * Migrate settings from old version
   */
  private migrateSettings(_oldSettings: any): AISettings {
    // For now, just return default settings
    // In the future, implement proper migration logic
    console.warn('[SettingsStorage] Migrating settings from old version');
    return this.getDefaultSettings();
  }
}

export default SettingsStorage;

