import { AIProvider } from '../types/aiProviders';

/**
 * App types supported by the registry
 */
export type AppId = 'task-smasher' | 'article-smasher' | 'admin' | 'unknown-app';

/**
 * Interface for app registration options
 */
export interface AppRegistrationOptions {
  /**
   * Whether to persist the registration in localStorage
   * @default true
   */
  persist?: boolean;

  /**
   * Whether to set this app as the active app
   * @default true
   */
  setAsActive?: boolean;

  /**
   * Additional metadata to store with the registration
   */
  metadata?: Record<string, any>;
}

/**
 * Interface for registered app information
 */
export interface RegisteredApp {
  /**
   * The app ID
   */
  id: AppId;

  /**
   * When the app was registered
   */
  registeredAt: number;

  /**
   * When the app was last active
   */
  lastActiveAt: number;

  /**
   * Additional metadata for the app
   */
  metadata?: Record<string, any>;
}

/**
 * Centralized App Registry for SmashingApps
 * 
 * This service provides a single source of truth for app identification,
 * eliminating conflicts between Task Smasher and Article Smasher.
 */
class AppRegistry {
  private static instance: AppRegistry;
  
  // Storage keys
  private readonly REGISTRY_KEY = 'smashingapps_app_registry';
  private readonly ACTIVE_APP_KEY = 'smashingapps_active_app';
  
  // Legacy keys for backward compatibility
  private readonly LEGACY_KEYS = {
    FORCE_APP_ID: 'FORCE_APP_ID',
    CURRENT_APP: 'current_app',
    ARTICLE_SMASHER_APP: 'article_smasher_app',
    ARTICLE_WIZARD_STATE: 'article_wizard_state',
    TASK_LIST_STATE: 'task_list_state'
  };

  // In-memory cache of registered apps
  private registeredApps: Map<AppId, RegisteredApp> = new Map();
  
  // Currently active app
  private activeAppId: AppId | null = null;

  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.loadFromStorage();
    this.setupEventListeners();
    console.log('[AppRegistry] Initialized');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): AppRegistry {
    if (!AppRegistry.instance) {
      AppRegistry.instance = new AppRegistry();
    }
    return AppRegistry.instance;
  }

  /**
   * Register an app with the registry
   * 
   * @param appId The app ID to register
   * @param options Registration options
   * @returns The registered app information
   */
  public registerApp(appId: AppId, options: AppRegistrationOptions = {}): RegisteredApp {
    const { persist = true, setAsActive = true, metadata = {} } = options;
    
    console.log(`[AppRegistry] Registering app: ${appId}`);
    
    const now = Date.now();
    const app: RegisteredApp = {
      id: appId,
      registeredAt: now,
      lastActiveAt: now,
      metadata
    };
    
    // Update in-memory cache
    this.registeredApps.set(appId, app);
    
    // Set as active if requested
    if (setAsActive) {
      this.setActiveApp(appId);
    }
    
    // Persist to storage if requested
    if (persist) {
      this.saveToStorage();
    }
    
    // Update legacy flags for backward compatibility
    this.updateLegacyFlags(appId);
    
    return app;
  }

  /**
   * Set the active app
   * 
   * @param appId The app ID to set as active
   */
  public setActiveApp(appId: AppId): void {
    console.log(`[AppRegistry] Setting active app: ${appId}`);
    
    // Update the active app ID
    this.activeAppId = appId;
    
    // Update the last active timestamp
    const app = this.registeredApps.get(appId);
    if (app) {
      app.lastActiveAt = Date.now();
      this.registeredApps.set(appId, app);
    }
    
    // Persist to storage
    localStorage.setItem(this.ACTIVE_APP_KEY, appId);
    this.saveToStorage();
    
    // Update legacy flags for backward compatibility
    this.updateLegacyFlags(appId);
    
    // Dispatch event for other components to react
    this.dispatchAppChangeEvent(appId);
  }

  /**
   * Get the active app ID
   * 
   * @returns The active app ID, or null if no app is active
   */
  public getActiveApp(): AppId | null {
    return this.activeAppId;
  }

  /**
   * Get information about a registered app
   * 
   * @param appId The app ID to get information for
   * @returns The registered app information, or null if not registered
   */
  public getAppInfo(appId: AppId): RegisteredApp | null {
    return this.registeredApps.get(appId) || null;
  }

  /**
   * Get all registered apps
   * 
   * @returns A map of all registered apps
   */
  public getAllApps(): Map<AppId, RegisteredApp> {
    return new Map(this.registeredApps);
  }

  /**
   * Determine the current app ID based on context
   * 
   * This method uses multiple factors to determine the current app:
   * 1. Explicitly registered active app
   * 2. Legacy app identification flags
   * 3. URL path
   * 4. DOM elements
   * 
   * @returns The determined app ID
   */
  public determineCurrentApp(): AppId {
    console.log('[AppRegistry] Determining current app');
    
    // First check if we have an explicitly set active app
    if (this.activeAppId) {
      console.log(`[AppRegistry] Using active app: ${this.activeAppId}`);
      return this.activeAppId;
    }
    
    // Check legacy flags for backward compatibility
    const legacyAppId = this.checkLegacyFlags();
    if (legacyAppId) {
      console.log(`[AppRegistry] Using legacy app ID: ${legacyAppId}`);
      return legacyAppId;
    }
    
    // Check URL path
    const pathAppId = this.checkUrlPath();
    if (pathAppId) {
      console.log(`[AppRegistry] Using path-based app ID: ${pathAppId}`);
      return pathAppId;
    }
    
    // Check DOM elements
    const domAppId = this.checkDomElements();
    if (domAppId) {
      console.log(`[AppRegistry] Using DOM-based app ID: ${domAppId}`);
      return domAppId;
    }
    
    // Default to unknown
    console.log('[AppRegistry] Could not determine app ID, using unknown-app');
    return 'unknown-app';
  }

  /**
   * Get the app ID for a specific AI service provider
   * 
   * This is a replacement for the legacy getAppIdForService function
   * 
   * @param provider The AI provider
   * @returns The determined app ID
   */
  public getAppIdForService(provider: AIProvider): AppId {
    // First try to get the explicitly registered active app
    const activeApp = this.getActiveApp();
    if (activeApp) {
      return activeApp;
    }
    
    // Fall back to context-based determination
    const appId = this.determineCurrentApp();
    
    // Special case for image provider (from legacy code)
    if (provider === 'image' && appId === 'unknown-app') {
      return 'task-smasher';
    }
    
    return appId;
  }

  /**
   * Check if an app is registered
   * 
   * @param appId The app ID to check
   * @returns True if the app is registered, false otherwise
   */
  public isAppRegistered(appId: AppId): boolean {
    return this.registeredApps.has(appId);
  }

  /**
   * Load the registry from localStorage
   */
  private loadFromStorage(): void {
    try {
      // Load registered apps
      const storedRegistry = localStorage.getItem(this.REGISTRY_KEY);
      if (storedRegistry) {
        const parsed = JSON.parse(storedRegistry);
        // Cast string keys to AppId type
        this.registeredApps = new Map(
          Object.entries(parsed).map(([key, value]) => [key as AppId, value as RegisteredApp])
        );
      }
      
      // Load active app
      const storedActiveApp = localStorage.getItem(this.ACTIVE_APP_KEY);
      if (storedActiveApp) {
        this.activeAppId = storedActiveApp as AppId;
      } else {
        // If no active app is stored, try to determine it from context
        this.activeAppId = this.determineCurrentApp();
      }
    } catch (error) {
      console.error('[AppRegistry] Error loading from storage:', error);
    }
  }

  /**
   * Save the registry to localStorage
   */
  private saveToStorage(): void {
    try {
      // Convert Map to object for storage
      const registryObj = Object.fromEntries(Array.from(this.registeredApps.entries()));
      localStorage.setItem(this.REGISTRY_KEY, JSON.stringify(registryObj));
    } catch (error) {
      console.error('[AppRegistry] Error saving to storage:', error);
    }
  }

  /**
   * Check legacy app identification flags
   * 
   * @returns The determined app ID, or null if not found
   */
  private checkLegacyFlags(): AppId | null {
    // Check for forced app ID first (highest priority in legacy system)
    const forcedAppId = localStorage.getItem(this.LEGACY_KEYS.FORCE_APP_ID);
    if (forcedAppId === 'task-smasher' || forcedAppId === 'article-smasher') {
      return forcedAppId;
    }
    
    // Check current_app next
    const currentApp = localStorage.getItem(this.LEGACY_KEYS.CURRENT_APP);
    if (currentApp === 'task-smasher' || currentApp === 'article-smasher') {
      return currentApp as AppId;
    }
    
    // Then check app-specific flags
    const articleSmasherFlag = localStorage.getItem(this.LEGACY_KEYS.ARTICLE_SMASHER_APP);
    const articleState = localStorage.getItem(this.LEGACY_KEYS.ARTICLE_WIZARD_STATE);
    const taskState = localStorage.getItem(this.LEGACY_KEYS.TASK_LIST_STATE);
    
    if (articleSmasherFlag === 'true' || articleState) {
      return 'article-smasher';
    }
    
    if (taskState) {
      return 'task-smasher';
    }
    
    return null;
  }

  /**
   * Check URL path for app identification
   * 
   * @returns The determined app ID, or null if not found
   */
  private checkUrlPath(): AppId | null {
    const path = window.location.pathname;
    
    // Check for tool paths with more specific matching
    if (path.includes('/article-smasher') || path.includes('/tools/article-smasher')) {
      return 'article-smasher';
    }
    
    if (path.includes('/task-smasher') || path.includes('/tools/task-smasher')) {
      return 'task-smasher';
    }
    
    if (path.includes('/admin')) {
      return 'admin';
    }
    
    return null;
  }

  /**
   * Check DOM elements for app identification
   * 
   * @returns The determined app ID, or null if not found
   */
  private checkDomElements(): AppId | null {
    // Only check DOM if document is ready
    if (document.readyState === 'loading') {
      return null;
    }
    
    if (document.querySelector('.article-smasher-container')) {
      return 'article-smasher';
    }
    
    if (document.querySelector('.task-smasher-container')) {
      return 'task-smasher';
    }
    
    if (document.querySelector('.admin-container')) {
      return 'admin';
    }
    
    return null;
  }

  /**
   * Update legacy flags for backward compatibility
   * 
   * @param appId The app ID to update flags for
   */
  private updateLegacyFlags(appId: AppId): void {
    // Don't clear other app's flags, just set our own
    if (appId === 'task-smasher') {
      localStorage.setItem(this.LEGACY_KEYS.FORCE_APP_ID, 'task-smasher');
      localStorage.setItem(this.LEGACY_KEYS.CURRENT_APP, 'task-smasher');
      localStorage.setItem(this.LEGACY_KEYS.TASK_LIST_STATE, JSON.stringify({ initialized: true }));
    } else if (appId === 'article-smasher') {
      localStorage.setItem(this.LEGACY_KEYS.FORCE_APP_ID, 'article-smasher');
      localStorage.setItem(this.LEGACY_KEYS.CURRENT_APP, 'article-smasher');
      localStorage.setItem(this.LEGACY_KEYS.ARTICLE_SMASHER_APP, 'true');
      localStorage.setItem(this.LEGACY_KEYS.ARTICLE_WIZARD_STATE, JSON.stringify({ initialized: true, forceTracking: true }));
    }
  }

  /**
   * Set up event listeners for storage changes
   */
  private setupEventListeners(): void {
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === this.REGISTRY_KEY || event.key === this.ACTIVE_APP_KEY) {
        this.loadFromStorage();
      }
    });
  }

  /**
   * Dispatch an app change event
   * 
   * @param appId The new active app ID
   */
  private dispatchAppChangeEvent(appId: AppId): void {
    const event = new CustomEvent('app-changed', {
      detail: { appId }
    });
    window.dispatchEvent(event);
  }
}

// Export the singleton instance
export const appRegistry = AppRegistry.getInstance();

// Export a function to get the app ID for a service (for backward compatibility)
export function getAppIdForService(provider: AIProvider): AppId {
  return appRegistry.getAppIdForService(provider);
}