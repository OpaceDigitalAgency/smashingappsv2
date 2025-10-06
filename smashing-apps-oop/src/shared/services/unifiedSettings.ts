/**
 * Unified Settings Service
 *
 * This service provides a centralized settings management system that serves as
 * the single source of truth for all settings across SmashingApps.
 * 
 * Key features:
 * - Single localStorage key for all settings
 * - Migration from legacy settings
 * - Synchronization with legacy settings for backward compatibility
 * - Simplified API for accessing and updating settings
 */

import { AIProvider } from '../types/aiProviders';

// Current version of the settings schema
const SETTINGS_VERSION = 1;

// Main storage key for unified settings
const UNIFIED_SETTINGS_KEY = 'smashingapps_unified_settings';

// Event name for settings changes
const SETTINGS_CHANGED_EVENT = 'unifiedSettingsChanged';

// Legacy keys for backward compatibility
const LEGACY_KEYS = {
  // Global settings keys
  GLOBAL_SETTINGS: 'smashingapps-global-settings',
  GLOBAL_SETTINGS_CONTEXT: 'global-settings',
  
  // App identification keys
  FORCE_APP_ID: 'FORCE_APP_ID',
  CURRENT_APP: 'current_app',
  ARTICLE_SMASHER_APP: 'article_smasher_app',
  ARTICLE_WIZARD_STATE: 'article_wizard_state',
  TASK_LIST_STATE: 'task_list_state',
  
  // Model and provider keys
  ACTIVE_MODEL: 'smashingapps_activeModel',
  ACTIVE_PROVIDER: 'smashingapps_activeProvider',
  
  // App-specific settings
  ARTICLE_SMASHER_SETTINGS: 'article_smasher_prompt_settings',
};

/**
 * Interface for unified settings
 */
export interface UnifiedSettings {
  // Version tracking for migrations
  _version: number;
  
  // AI Provider Settings
  ai: {
    provider: AIProvider;
    model: string;
    systemPrompt: string;
    temperature: number;
    maxTokens: number;
    apiKeys: Record<AIProvider, string | null>;
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
  
  // App-specific settings
  appSettings: {
    'task-smasher': Record<string, any>;
    'article-smasher': Record<string, any>;
    'admin': Record<string, any>;
  };
}

/**
 * Default settings
 */
const DEFAULT_SETTINGS: UnifiedSettings = {
  _version: SETTINGS_VERSION,
  ai: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    systemPrompt: '',
    temperature: 0.7,
    maxTokens: 2000,
    apiKeys: {
      openai: null,
      anthropic: null,
      openrouter: null,
      google: null,
      image: null
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
  },
  appSettings: {
    'task-smasher': {},
    'article-smasher': {},
    'admin': {}
  }
};

/**
 * Unified Settings Service
 * 
 * This class provides a centralized way to manage settings across all SmashingApps.
 */
class UnifiedSettingsService {
  private static instance: UnifiedSettingsService;
  private settings: UnifiedSettings;
  private initialized: boolean = false;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.settings = this.loadSettings();
    this.setupEventListeners();
    this.initialized = true;
    console.log('[UnifiedSettings] Initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): UnifiedSettingsService {
    if (!UnifiedSettingsService.instance) {
      UnifiedSettingsService.instance = new UnifiedSettingsService();
    }
    return UnifiedSettingsService.instance;
  }
  
  /**
   * Get all settings
   */
  public getSettings(): UnifiedSettings {
    return { ...this.settings };
  }
  
  /**
   * Get AI settings
   */
  public getAISettings() {
    return { ...this.settings.ai };
  }
  
  /**
   * Get UI settings
   */
  public getUISettings() {
    return { ...this.settings.ui };
  }
  
  /**
   * Get rate limit settings
   */
  public getRateLimitSettings() {
    return { ...this.settings.rateLimit };
  }
  
  /**
   * Get feature settings
   */
  public getFeatureSettings() {
    return { ...this.settings.features };
  }
  
  /**
   * Get app-specific settings
   * 
   * @param appId The app ID to get settings for
   */
  public getAppSettings(appId: 'task-smasher' | 'article-smasher' | 'admin') {
    return { ...this.settings.appSettings[appId] };
  }
  
  /**
   * Update settings
   * 
   * @param newSettings Partial settings to update
   */
  public updateSettings(newSettings: Partial<UnifiedSettings>): UnifiedSettings {
    console.log('[UnifiedSettings] Updating settings:', newSettings);
    
    try {
      // Merge with current settings
      this.settings = this.mergeSettings(this.settings, newSettings);
      
      // Save to localStorage
      this.saveSettings();
      
      // Synchronize with legacy settings
      this.syncToLegacySettings();
      
      // Dispatch event
      this.dispatchChangeEvent();
      
      return { ...this.settings };
    } catch (error) {
      console.error('[UnifiedSettings] Error updating settings:', error);
      return { ...this.settings };
    }
  }
  
  /**
   * Update AI settings
   * 
   * @param aiSettings Partial AI settings to update
   */
  public updateAISettings(aiSettings: Partial<UnifiedSettings['ai']>): UnifiedSettings {
    return this.updateSettings({ ai: { ...this.settings.ai, ...aiSettings } });
  }
  
  /**
   * Update UI settings
   * 
   * @param uiSettings Partial UI settings to update
   */
  public updateUISettings(uiSettings: Partial<UnifiedSettings['ui']>): UnifiedSettings {
    return this.updateSettings({ ui: { ...this.settings.ui, ...uiSettings } });
  }
  
  /**
   * Update rate limit settings
   * 
   * @param rateLimitSettings Partial rate limit settings to update
   */
  public updateRateLimitSettings(rateLimitSettings: Partial<UnifiedSettings['rateLimit']>): UnifiedSettings {
    return this.updateSettings({ rateLimit: { ...this.settings.rateLimit, ...rateLimitSettings } });
  }
  
  /**
   * Update feature settings
   * 
   * @param featureSettings Partial feature settings to update
   */
  public updateFeatureSettings(featureSettings: Partial<UnifiedSettings['features']>): UnifiedSettings {
    return this.updateSettings({ features: { ...this.settings.features, ...featureSettings } });
  }
  
  /**
   * Update app-specific settings
   * 
   * @param appId The app ID to update settings for
   * @param appSettings Partial app settings to update
   */
  public updateAppSettings(
    appId: 'task-smasher' | 'article-smasher' | 'admin',
    appSettings: Record<string, any>
  ): UnifiedSettings {
    const updatedAppSettings = { ...this.settings.appSettings };
    updatedAppSettings[appId] = { ...updatedAppSettings[appId], ...appSettings };
    
    return this.updateSettings({ appSettings: updatedAppSettings });
  }
  
  /**
   * Reset settings to defaults
   */
  public resetSettings(): UnifiedSettings {
    console.log('[UnifiedSettings] Resetting settings to defaults');
    
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    this.syncToLegacySettings();
    this.dispatchChangeEvent();
    
    return { ...this.settings };
  }
  
  /**
   * Load settings from localStorage or initialize with defaults
   */
  private loadSettings(): UnifiedSettings {
    console.log('[UnifiedSettings] Loading settings');
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('[UnifiedSettings] Not in browser environment, returning defaults');
        return { ...DEFAULT_SETTINGS };
      }
      
      // Get settings from localStorage
      const storedSettings = localStorage.getItem(UNIFIED_SETTINGS_KEY);
      
      // If settings exist, parse and return them
      if (storedSettings) {
        console.log('[UnifiedSettings] Retrieved settings from localStorage');
        
        const parsedSettings = JSON.parse(storedSettings) as UnifiedSettings;
        
        // Check if settings need migration
        if (!parsedSettings._version || parsedSettings._version < SETTINGS_VERSION) {
          console.log('[UnifiedSettings] Migrating settings from version', 
            parsedSettings._version, 'to', SETTINGS_VERSION);
          
          return this.migrateSettings(parsedSettings);
        }
        
        return parsedSettings;
      }
      
      // If no settings exist, try to migrate from legacy settings
      console.log('[UnifiedSettings] No unified settings found, checking legacy settings');
      
      const migratedSettings = this.migrateFromLegacySettings();
      
      // Save the migrated settings
      this.settings = migratedSettings;
      this.saveSettings();
      
      return migratedSettings;
    } catch (error) {
      console.error('[UnifiedSettings] Error loading settings:', error);
      return { ...DEFAULT_SETTINGS };
    }
  }
  
  /**
   * Save settings to localStorage
   */
  private saveSettings(): void {
    try {
      localStorage.setItem(UNIFIED_SETTINGS_KEY, JSON.stringify(this.settings));
      console.log('[UnifiedSettings] Settings saved to localStorage');
    } catch (error) {
      console.error('[UnifiedSettings] Error saving settings:', error);
    }
  }
  
  /**
   * Merge settings objects
   * 
   * @param currentSettings Current settings
   * @param newSettings New settings to merge
   */
  private mergeSettings(
    currentSettings: UnifiedSettings,
    newSettings: Partial<UnifiedSettings>
  ): UnifiedSettings {
    // Create a deep copy of the current settings
    const result = JSON.parse(JSON.stringify(currentSettings)) as UnifiedSettings;
    
    // Helper function to recursively merge objects
    const mergeObjects = (target: any, source: any) => {
      if (!source) return target;
      
      Object.keys(source).forEach(key => {
        if (source[key] !== null && typeof source[key] === 'object' && !Array.isArray(source[key])) {
          // If property doesn't exist on target, create it
          if (!target[key]) {
            target[key] = {};
          }
          
          // Recursively merge objects
          mergeObjects(target[key], source[key]);
        } else {
          // For non-objects, simply assign the value
          target[key] = source[key];
        }
      });
      
      return target;
    };
    
    // Merge the new settings into the result
    return mergeObjects(result, newSettings);
  }
  
  /**
   * Migrate settings from one version to another
   * 
   * @param oldSettings Old settings to migrate
   */
  private migrateSettings(oldSettings: Partial<UnifiedSettings>): UnifiedSettings {
    // Start with current defaults
    const newSettings = { ...DEFAULT_SETTINGS };
    
    // No version means these are first-time settings
    if (!oldSettings._version) {
      return this.mergeSettings(newSettings, this.sanitizeSettings(oldSettings));
    }
    
    // Handle migrations based on version
    switch (oldSettings._version) {
      // Add cases here when breaking changes are made
      // case 0:
      //   // Migrate from version 0 to 1
      //   break;
      default:
        return this.mergeSettings(newSettings, this.sanitizeSettings(oldSettings));
    }
  }
  
  /**
   * Sanitize settings to ensure they match the expected schema
   * 
   * @param settings Settings to sanitize
   */
  private sanitizeSettings(settings: Partial<UnifiedSettings>): Partial<UnifiedSettings> {
    const sanitized: Partial<UnifiedSettings> = { _version: SETTINGS_VERSION };
    
    // Helper function to check if a value is of the expected type
    const isValidType = (value: any, type: string): boolean => {
      if (type === 'string') return typeof value === 'string';
      if (type === 'number') return typeof value === 'number';
      if (type === 'boolean') return typeof value === 'boolean';
      if (type === 'object') return typeof value === 'object' && !Array.isArray(value);
      if (type === 'array') return Array.isArray(value);
      return false;
    };
    
    // AI settings
    if (settings.ai) {
      sanitized.ai = {} as UnifiedSettings['ai'];
      
      if (isValidType(settings.ai.provider, 'string') && 
          ['openai', 'anthropic', 'openrouter'].includes(settings.ai.provider)) {
        sanitized.ai.provider = settings.ai.provider;
      }
      
      if (isValidType(settings.ai.model, 'string')) {
        sanitized.ai.model = settings.ai.model;
      }
      
      if (isValidType(settings.ai.systemPrompt, 'string')) {
        sanitized.ai.systemPrompt = settings.ai.systemPrompt;
      }
      
      if (isValidType(settings.ai.temperature, 'number')) {
        sanitized.ai.temperature = settings.ai.temperature;
      }
      
      if (isValidType(settings.ai.maxTokens, 'number')) {
        sanitized.ai.maxTokens = settings.ai.maxTokens;
      }
      
      if (isValidType(settings.ai.apiKeys, 'object')) {
        sanitized.ai.apiKeys = {} as Record<AIProvider, string | null>;
        
        for (const provider in settings.ai.apiKeys) {
          if (isValidType(settings.ai.apiKeys[provider as AIProvider], 'string') || 
              settings.ai.apiKeys[provider as AIProvider] === null) {
            sanitized.ai.apiKeys[provider as AIProvider] = settings.ai.apiKeys[provider as AIProvider];
          }
        }
      }
    }
    
    // UI settings
    if (settings.ui) {
      sanitized.ui = {} as UnifiedSettings['ui'];
      
      if (isValidType(settings.ui.theme, 'string') && 
          ['light', 'dark', 'system'].includes(settings.ui.theme)) {
        sanitized.ui.theme = settings.ui.theme;
      }
      
      if (isValidType(settings.ui.sidebarExpanded, 'boolean')) {
        sanitized.ui.sidebarExpanded = settings.ui.sidebarExpanded;
      }
      
      if (isValidType(settings.ui.fontSize, 'string') && 
          ['sm', 'md', 'lg'].includes(settings.ui.fontSize)) {
        sanitized.ui.fontSize = settings.ui.fontSize;
      }
    }
    
    // Rate limit settings
    if (settings.rateLimit) {
      sanitized.rateLimit = {} as UnifiedSettings['rateLimit'];
      
      if (isValidType(settings.rateLimit.enabled, 'boolean')) {
        sanitized.rateLimit.enabled = settings.rateLimit.enabled;
      }
      
      if (isValidType(settings.rateLimit.maxRequestsPerMinute, 'number')) {
        sanitized.rateLimit.maxRequestsPerMinute = settings.rateLimit.maxRequestsPerMinute;
      }
      
      if (isValidType(settings.rateLimit.maxTokensPerDay, 'number')) {
        sanitized.rateLimit.maxTokensPerDay = settings.rateLimit.maxTokensPerDay;
      }
    }
    
    // Feature settings
    if (settings.features) {
      sanitized.features = {} as UnifiedSettings['features'];
      
      if (isValidType(settings.features.voiceToText, 'boolean')) {
        sanitized.features.voiceToText = settings.features.voiceToText;
      }
      
      if (isValidType(settings.features.dragAndDrop, 'boolean')) {
        sanitized.features.dragAndDrop = settings.features.dragAndDrop;
      }
      
      if (isValidType(settings.features.autoSave, 'boolean')) {
        sanitized.features.autoSave = settings.features.autoSave;
      }
    }
    
    // App-specific settings
    if (settings.appSettings) {
      sanitized.appSettings = {} as UnifiedSettings['appSettings'];
      
      if (isValidType(settings.appSettings['task-smasher'], 'object')) {
        sanitized.appSettings['task-smasher'] = settings.appSettings['task-smasher'];
      }
      
      if (isValidType(settings.appSettings['article-smasher'], 'object')) {
        sanitized.appSettings['article-smasher'] = settings.appSettings['article-smasher'];
      }
      
      if (isValidType(settings.appSettings['admin'], 'object')) {
        sanitized.appSettings['admin'] = settings.appSettings['admin'];
      }
    }
    
    return sanitized;
  }
  
  /**
   * Migrate from legacy settings
   */
  private migrateFromLegacySettings(): UnifiedSettings {
    console.log('[UnifiedSettings] Migrating from legacy settings');
    
    // Start with default settings
    const newSettings = { ...DEFAULT_SETTINGS };
    
    try {
      // Check for global settings
      const globalSettingsStr = localStorage.getItem(LEGACY_KEYS.GLOBAL_SETTINGS);
      if (globalSettingsStr) {
        console.log('[UnifiedSettings] Found legacy global settings');
        
        const globalSettings = JSON.parse(globalSettingsStr);
        
        // Migrate AI settings
        if (globalSettings.defaultProvider) {
          newSettings.ai.provider = globalSettings.defaultProvider;
        }
        
        if (globalSettings.defaultModel) {
          newSettings.ai.model = globalSettings.defaultModel;
        }
        
        if (globalSettings.defaultSystemPrompt) {
          newSettings.ai.systemPrompt = globalSettings.defaultSystemPrompt;
        }
        
        if (globalSettings.defaultTemperature) {
          newSettings.ai.temperature = globalSettings.defaultTemperature;
        }
        
        if (globalSettings.defaultMaxTokens) {
          newSettings.ai.maxTokens = globalSettings.defaultMaxTokens;
        }
        
        // Migrate UI settings
        if (globalSettings.theme) {
          newSettings.ui.theme = globalSettings.theme;
        }
        
        if (globalSettings.sidebarExpanded !== undefined) {
          newSettings.ui.sidebarExpanded = globalSettings.sidebarExpanded;
        }
        
        if (globalSettings.fontSize) {
          newSettings.ui.fontSize = globalSettings.fontSize;
        }
        
        // Migrate rate limit settings
        if (globalSettings.rateLimitEnabled !== undefined) {
          newSettings.rateLimit.enabled = globalSettings.rateLimitEnabled;
        }
        
        if (globalSettings.maxRequestsPerMinute) {
          newSettings.rateLimit.maxRequestsPerMinute = globalSettings.maxRequestsPerMinute;
        }
        
        if (globalSettings.maxTokensPerDay) {
          newSettings.rateLimit.maxTokensPerDay = globalSettings.maxTokensPerDay;
        }
        
        // Migrate feature settings
        if (globalSettings.voiceToTextEnabled !== undefined) {
          newSettings.features.voiceToText = globalSettings.voiceToTextEnabled;
        }
        
        if (globalSettings.dragAndDropEnabled !== undefined) {
          newSettings.features.dragAndDrop = globalSettings.dragAndDropEnabled;
        }
        
        if (globalSettings.autoSaveEnabled !== undefined) {
          newSettings.features.autoSave = globalSettings.autoSaveEnabled;
        }
      }
      
      // Check for app-specific settings
      
      // Article Smasher settings
      const articleSmasherSettingsStr = localStorage.getItem(LEGACY_KEYS.ARTICLE_SMASHER_SETTINGS);
      if (articleSmasherSettingsStr) {
        console.log('[UnifiedSettings] Found legacy Article Smasher settings');
        
        const articleSmasherSettings = JSON.parse(articleSmasherSettingsStr);
        newSettings.appSettings['article-smasher'] = articleSmasherSettings;
        
        // Also update AI settings if they exist
        if (articleSmasherSettings.provider) {
          newSettings.ai.provider = articleSmasherSettings.provider;
        }
        
        if (articleSmasherSettings.model) {
          newSettings.ai.model = articleSmasherSettings.model;
        }
        
        if (articleSmasherSettings.temperature) {
          newSettings.ai.temperature = articleSmasherSettings.temperature;
        }
        
        if (articleSmasherSettings.maxTokens) {
          newSettings.ai.maxTokens = articleSmasherSettings.maxTokens;
        }
      }
      
      // Check for API keys
      const providers: AIProvider[] = ['openai', 'anthropic', 'openrouter', 'image'];
      
      for (const provider of providers) {
        const apiKeyKey = `${provider}_api_key`;
        const apiKey = localStorage.getItem(apiKeyKey);
        
        if (apiKey) {
          console.log(`[UnifiedSettings] Found legacy API key for ${provider}`);
          newSettings.ai.apiKeys[provider] = apiKey;
        }
      }
      
      // Check for active model and provider
      const activeModel = localStorage.getItem(LEGACY_KEYS.ACTIVE_MODEL);
      if (activeModel) {
        console.log('[UnifiedSettings] Found legacy active model:', activeModel);
        newSettings.ai.model = activeModel;
      }
      
      const activeProvider = localStorage.getItem(LEGACY_KEYS.ACTIVE_PROVIDER);
      if (activeProvider && ['openai', 'anthropic', 'openrouter'].includes(activeProvider)) {
        console.log('[UnifiedSettings] Found legacy active provider:', activeProvider);
        newSettings.ai.provider = activeProvider as AIProvider;
      }
      
      return newSettings;
    } catch (error) {
      console.error('[UnifiedSettings] Error migrating from legacy settings:', error);
      return newSettings;
    }
  }
  
  /**
   * Synchronize with legacy settings for backward compatibility
   */
  private syncToLegacySettings(): void {
    console.log('[UnifiedSettings] Synchronizing to legacy settings');
    
    try {
      // Sync to global settings
      const globalSettings = {
        _version: this.settings._version,
        defaultProvider: this.settings.ai.provider,
        defaultModel: this.settings.ai.model,
        defaultSystemPrompt: this.settings.ai.systemPrompt,
        defaultTemperature: this.settings.ai.temperature,
        defaultMaxTokens: this.settings.ai.maxTokens,
        theme: this.settings.ui.theme,
        sidebarExpanded: this.settings.ui.sidebarExpanded,
        fontSize: this.settings.ui.fontSize,
        rateLimitEnabled: this.settings.rateLimit.enabled,
        maxRequestsPerMinute: this.settings.rateLimit.maxRequestsPerMinute,
        maxTokensPerDay: this.settings.rateLimit.maxTokensPerDay,
        voiceToTextEnabled: this.settings.features.voiceToText,
        dragAndDropEnabled: this.settings.features.dragAndDrop,
        autoSaveEnabled: this.settings.features.autoSave
      };
      
      localStorage.setItem(LEGACY_KEYS.GLOBAL_SETTINGS, JSON.stringify(globalSettings));
      localStorage.setItem(LEGACY_KEYS.GLOBAL_SETTINGS_CONTEXT, JSON.stringify(globalSettings));
      
      // Sync to app-specific settings
      
      // Article Smasher settings
      const articleSmasherSettings = {
        provider: this.settings.ai.provider,
        model: this.settings.ai.model,
        temperature: this.settings.ai.temperature,
        maxTokens: this.settings.ai.maxTokens,
        ...this.settings.appSettings['article-smasher']
      };
      
      localStorage.setItem(LEGACY_KEYS.ARTICLE_SMASHER_SETTINGS, JSON.stringify(articleSmasherSettings));
      
      // Sync to active model and provider
      localStorage.setItem(LEGACY_KEYS.ACTIVE_MODEL, this.settings.ai.model);
      localStorage.setItem(LEGACY_KEYS.ACTIVE_PROVIDER, this.settings.ai.provider);
      
      // Sync API keys
      for (const provider in this.settings.ai.apiKeys) {
        const apiKey = this.settings.ai.apiKeys[provider as AIProvider];
        
        if (apiKey) {
          localStorage.setItem(`${provider}_api_key`, apiKey);
        } else {
          localStorage.removeItem(`${provider}_api_key`);
        }
      }
      
      console.log('[UnifiedSettings] Legacy settings synchronized');
    } catch (error) {
      console.error('[UnifiedSettings] Error synchronizing to legacy settings:', error);
    }
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === UNIFIED_SETTINGS_KEY) {
        console.log('[UnifiedSettings] Settings changed in another tab');
        
        try {
          if (event.newValue) {
            this.settings = JSON.parse(event.newValue);
            
            // Synchronize with legacy settings
            if (this.initialized) {
              this.syncToLegacySettings();
              this.dispatchChangeEvent();
            }
          }
        } catch (error) {
          console.error('[UnifiedSettings] Error handling storage event:', error);
        }
      }
    });
    
    // Listen for legacy settings changes
    window.addEventListener('globalSettingsChanged', () => {
      console.log('[UnifiedSettings] Legacy settings changed event received');
      
      // Only update if we're not the source of the change
      if (this.initialized) {
        const globalSettingsStr = localStorage.getItem(LEGACY_KEYS.GLOBAL_SETTINGS);
        
        if (globalSettingsStr) {
          try {
            const globalSettings = JSON.parse(globalSettingsStr);
            
            // Update our settings from legacy settings
            this.updateSettings({
              ai: {
                provider: globalSettings.defaultProvider,
                model: globalSettings.defaultModel,
                systemPrompt: globalSettings.defaultSystemPrompt,
                temperature: globalSettings.defaultTemperature,
                maxTokens: globalSettings.defaultMaxTokens,
                apiKeys: { ...this.settings.ai.apiKeys } // Preserve existing API keys
              },
              ui: {
                theme: globalSettings.theme,
                sidebarExpanded: globalSettings.sidebarExpanded,
                fontSize: globalSettings.fontSize
              },
              rateLimit: {
                enabled: globalSettings.rateLimitEnabled,
                maxRequestsPerMinute: globalSettings.maxRequestsPerMinute,
                maxTokensPerDay: globalSettings.maxTokensPerDay
              },
              features: {
                voiceToText: globalSettings.voiceToTextEnabled,
                dragAndDrop: globalSettings.dragAndDropEnabled,
                autoSave: globalSettings.autoSaveEnabled
              }
            });
          } catch (error) {
            console.error('[UnifiedSettings] Error updating from legacy settings:', error);
          }
        }
      }
    });
  }
  
  /**
   * Dispatch a settings change event
   */
  private dispatchChangeEvent(): void {
    const event = new CustomEvent(SETTINGS_CHANGED_EVENT, {
      detail: this.settings
    });
    
    window.dispatchEvent(event);
    console.log('[UnifiedSettings] Dispatched settings changed event');
  }
}

// Export the singleton instance
export const unifiedSettings = UnifiedSettingsService.getInstance();

// No need to export the type separately as it's already exported with the interface