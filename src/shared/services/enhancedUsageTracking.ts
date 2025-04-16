/**
 * Enhanced Usage Tracking Service
 * 
 * This service provides a centralized way to track API usage across all SmashingApps.
 * It integrates with the centralized app registry to ensure accurate attribution
 * of usage to the correct app, regardless of which app was used most recently.
 * 
 * Key features:
 * - Integration with the centralized app registry
 * - Migration from legacy usage data
 * - Accurate attribution of usage to the correct app
 * - Simplified API for tracking and querying usage data
 * - Proper event dispatching to notify the admin panel of usage updates
 */

import { AIProvider, AIModel, MODEL_PRICING } from '../types/aiProviders';
import { aiServiceRegistry } from './AIService';
import { appRegistry, AppId } from './appRegistry';

// Storage key for usage data
const USAGE_DATA_KEY = 'smashingapps_enhanced_usage_data';

// Event name for usage data updates
const USAGE_DATA_UPDATED_EVENT = 'enhancedUsageDataUpdated';

// Legacy storage key for backward compatibility
const LEGACY_USAGE_DATA_KEY = 'smashingapps_usage_data';

/**
 * Interface for usage data
 */
export interface UsageData {
  // Version tracking for migrations
  _version: number;
  
  // Total usage stats
  totalRequests: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  costEstimate: number;
  
  // Provider-specific stats
  requestsByProvider: Record<AIProvider, number>;
  tokensByProvider: Record<AIProvider, number>;
  inputTokensByProvider: Record<AIProvider, number>;
  outputTokensByProvider: Record<AIProvider, number>;
  costByProvider: Record<AIProvider, number>;
  
  // App-specific stats
  requestsByApp: Record<AppId, number>;
  tokensByApp: Record<AppId, number>;
  inputTokensByApp: Record<AppId, number>;
  outputTokensByApp: Record<AppId, number>;
  costByApp: Record<AppId, number>;
  
  // Usage history
  usageHistory: UsageEntry[];
}

/**
 * Interface for a usage history entry
 */
export interface UsageEntry {
  timestamp: number;
  requests: number;
  tokens: number;
  inputTokens: number;
  outputTokens: number;
  cost: number;
  provider: AIProvider;
  app: AppId;
  model: string;
}

/**
 * Helper function to create initialized provider record
 */
const createInitialProviderRecord = (): Record<AIProvider, number> => ({
  openai: 0,
  openrouter: 0,
  anthropic: 0,
  google: 0,
  image: 0
});

/**
 * Helper function to create initialized app record
 */
const createInitialAppRecord = (): Record<AppId, number> => ({
  'task-smasher': 0,
  'article-smasher': 0,
  'admin': 0,
  'unknown-app': 0
});

/**
 * Default usage data
 */
const DEFAULT_USAGE_DATA: UsageData = {
  _version: 1,
  totalRequests: 0,
  totalTokens: 0,
  totalInputTokens: 0,
  totalOutputTokens: 0,
  costEstimate: 0,
  requestsByProvider: createInitialProviderRecord(),
  tokensByProvider: createInitialProviderRecord(),
  inputTokensByProvider: createInitialProviderRecord(),
  outputTokensByProvider: createInitialProviderRecord(),
  costByProvider: createInitialProviderRecord(),
  requestsByApp: createInitialAppRecord(),
  tokensByApp: createInitialAppRecord(),
  inputTokensByApp: createInitialAppRecord(),
  outputTokensByApp: createInitialAppRecord(),
  costByApp: createInitialAppRecord(),
  usageHistory: []
};

/**
 * Enhanced Usage Tracking Service
 *
 * This class provides a centralized way to track API usage across all SmashingApps.
 */
class EnhancedUsageTrackingService {
  private static instance: EnhancedUsageTrackingService;
  private usageData: UsageData;
  private initialized: boolean = false;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.usageData = this.loadUsageData();
    this.setupEventListeners();
    this.initialized = true;
    console.log('[EnhancedUsageTracking] Initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): EnhancedUsageTrackingService {
    if (!EnhancedUsageTrackingService.instance) {
      EnhancedUsageTrackingService.instance = new EnhancedUsageTrackingService();
    }
    return EnhancedUsageTrackingService.instance;
  }
  
  /**
   * Determine the current app ID using the app registry
   */
  private determineAppId(): AppId {
    // Use the app registry to determine the current app
    const activeApp = appRegistry.getActiveApp();
    if (activeApp) {
      return activeApp;
    }
    
    // If no active app, use context-based determination
    return appRegistry.determineCurrentApp();
  }
  
  /**
   * Track an API request
   *
   * @param provider The AI provider used
   * @param tokens The total number of tokens used
   * @param appId The app ID (if not provided, will be determined from app registry)
   * @param model The model used
   * @param inputTokens The number of input tokens (if not provided, will be estimated)
   * @param outputTokens The number of output tokens (if not provided, will be estimated)
   * @param timestamp The timestamp of the request (if not provided, will use current time)
   */
  public trackApiRequest(
    provider: AIProvider,
    tokens: number,
    appId?: AppId,
    model: string = 'unknown',
    inputTokens?: number,
    outputTokens?: number,
    timestamp: Date = new Date()
  ): void {
    // Determine the app ID if not provided
    const actualAppId = appId || this.determineAppId();
    
    console.log(`[EnhancedUsageTracking] Tracking API request for provider: ${provider}, app: ${actualAppId}, tokens: ${tokens}, model: ${model}`);
    
    // Get input and output tokens
    const actualInputTokens = inputTokens || Math.floor(tokens * 0.7); // Default to 70% input if not specified
    const actualOutputTokens = outputTokens || (tokens - actualInputTokens); // Default to remaining tokens if not specified
    
    // Get model-specific cost rates
    let inputCostPer1K = MODEL_PRICING.default.input;
    let outputCostPer1K = MODEL_PRICING.default.output;
    
    // First try to get rates from the MODEL_PRICING constants
    const modelKey = model.split('/').pop() || model; // Extract model name from full ID if needed
    if (MODEL_PRICING[modelKey as keyof typeof MODEL_PRICING]) {
      inputCostPer1K = MODEL_PRICING[modelKey as keyof typeof MODEL_PRICING].input;
      outputCostPer1K = MODEL_PRICING[modelKey as keyof typeof MODEL_PRICING].output;
    }
    // If not found in constants, try to get from the model info via service registry
    else {
      const service = aiServiceRegistry.getServiceForModel(model);
      if (service) {
        const modelInfo = service.getModels().find(m => m.id === model);
        if (modelInfo && modelInfo.costPer1KTokens) {
          inputCostPer1K = modelInfo.costPer1KTokens.input;
          outputCostPer1K = modelInfo.costPer1KTokens.output;
        }
      }
    }
    
    // Calculate cost based on input and output token rates
    const inputCost = (actualInputTokens / 1000) * inputCostPer1K;
    const outputCost = (actualOutputTokens / 1000) * outputCostPer1K;
    const cost = inputCost + outputCost;
    
    // Update total stats
    this.usageData.totalRequests += 1;
    this.usageData.totalTokens += tokens;
    this.usageData.totalInputTokens += actualInputTokens;
    this.usageData.totalOutputTokens += actualOutputTokens;
    this.usageData.costEstimate += cost;
    
    // Update provider stats
    this.usageData.requestsByProvider[provider] = (this.usageData.requestsByProvider[provider] || 0) + 1;
    this.usageData.tokensByProvider[provider] = (this.usageData.tokensByProvider[provider] || 0) + tokens;
    this.usageData.inputTokensByProvider[provider] = (this.usageData.inputTokensByProvider[provider] || 0) + actualInputTokens;
    this.usageData.outputTokensByProvider[provider] = (this.usageData.outputTokensByProvider[provider] || 0) + actualOutputTokens;
    this.usageData.costByProvider[provider] = (this.usageData.costByProvider[provider] || 0) + cost;
    
    // Update app stats
    this.usageData.requestsByApp[actualAppId] = (this.usageData.requestsByApp[actualAppId] || 0) + 1;
    this.usageData.tokensByApp[actualAppId] = (this.usageData.tokensByApp[actualAppId] || 0) + tokens;
    this.usageData.inputTokensByApp[actualAppId] = (this.usageData.inputTokensByApp[actualAppId] || 0) + actualInputTokens;
    this.usageData.outputTokensByApp[actualAppId] = (this.usageData.outputTokensByApp[actualAppId] || 0) + actualOutputTokens;
    this.usageData.costByApp[actualAppId] = (this.usageData.costByApp[actualAppId] || 0) + cost;
    
    // Add to history
    this.usageData.usageHistory.push({
      timestamp: timestamp.getTime(),
      requests: 1,
      tokens,
      inputTokens: actualInputTokens,
      outputTokens: actualOutputTokens,
      cost,
      provider,
      app: actualAppId,
      model
    });
    
    // Limit history size (keep last 1000 entries)
    if (this.usageData.usageHistory.length > 1000) {
      this.usageData.usageHistory = this.usageData.usageHistory.slice(-1000);
    }
    
    // Save updated data
    this.saveUsageData();
    
    // Sync to legacy storage for backward compatibility
    this.syncToLegacyStorage();
  }
  
  /**
   * Get all usage data
   */
  public getUsageData(): UsageData {
    return { ...this.usageData };
  }
  
  /**
   * Get filtered usage data for a specific time range
   *
   * @param timeRange The time range to filter by
   */
  public getFilteredUsageData(
    timeRange: 'day' | 'week' | 'month' | 'year'
  ): UsageData {
    const now = Date.now();
    let cutoffTime: number;
    
    // Calculate cutoff time based on time range
    switch (timeRange) {
      case 'day':
        cutoffTime = now - 24 * 60 * 60 * 1000; // 24 hours ago
        break;
      case 'week':
        cutoffTime = now - 7 * 24 * 60 * 60 * 1000; // 7 days ago
        break;
      case 'month':
        cutoffTime = now - 30 * 24 * 60 * 60 * 1000; // 30 days ago
        break;
      case 'year':
        cutoffTime = now - 365 * 24 * 60 * 60 * 1000; // 365 days ago
        break;
    }
    
    // Filter history by time range
    const filteredHistory = this.usageData.usageHistory.filter(entry => entry.timestamp >= cutoffTime);
    
    // Calculate stats for filtered data
    const filteredData: UsageData = {
      _version: this.usageData._version,
      totalRequests: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      costEstimate: 0,
      requestsByProvider: createInitialProviderRecord(),
      tokensByProvider: createInitialProviderRecord(),
      inputTokensByProvider: createInitialProviderRecord(),
      outputTokensByProvider: createInitialProviderRecord(),
      costByProvider: createInitialProviderRecord(),
      requestsByApp: createInitialAppRecord(),
      tokensByApp: createInitialAppRecord(),
      inputTokensByApp: createInitialAppRecord(),
      outputTokensByApp: createInitialAppRecord(),
      costByApp: createInitialAppRecord(),
      usageHistory: filteredHistory
    };
    
    // Aggregate stats from filtered history
    filteredHistory.forEach(entry => {
      filteredData.totalRequests += entry.requests;
      filteredData.totalTokens += entry.tokens;
      filteredData.totalInputTokens += entry.inputTokens;
      filteredData.totalOutputTokens += entry.outputTokens;
      filteredData.costEstimate += entry.cost;
      
      // Update provider stats
      filteredData.requestsByProvider[entry.provider] = (filteredData.requestsByProvider[entry.provider] || 0) + entry.requests;
      filteredData.tokensByProvider[entry.provider] = (filteredData.tokensByProvider[entry.provider] || 0) + entry.tokens;
      filteredData.inputTokensByProvider[entry.provider] = (filteredData.inputTokensByProvider[entry.provider] || 0) + entry.inputTokens;
      filteredData.outputTokensByProvider[entry.provider] = (filteredData.outputTokensByProvider[entry.provider] || 0) + entry.outputTokens;
      filteredData.costByProvider[entry.provider] = (filteredData.costByProvider[entry.provider] || 0) + entry.cost;
      
      // Update app stats
      filteredData.requestsByApp[entry.app] = (filteredData.requestsByApp[entry.app] || 0) + entry.requests;
      filteredData.tokensByApp[entry.app] = (filteredData.tokensByApp[entry.app] || 0) + entry.tokens;
      filteredData.inputTokensByApp[entry.app] = (filteredData.inputTokensByApp[entry.app] || 0) + entry.inputTokens;
      filteredData.outputTokensByApp[entry.app] = (filteredData.outputTokensByApp[entry.app] || 0) + entry.outputTokens;
      filteredData.costByApp[entry.app] = (filteredData.costByApp[entry.app] || 0) + entry.cost;
    });
    
    return filteredData;
  }
  
  /**
   * Get time-based data for charts
   *
   * @param timeRange The time range to get data for
   */
  public getTimeSeriesData(
    timeRange: 'day' | 'week' | 'month' | 'year'
  ): {
    requests: number[],
    tokens: number[],
    inputTokens: number[],
    outputTokens: number[],
    costs: string[]
  } {
    const now = Date.now();
    const labels = this.getTimeLabels(timeRange);
    const requests: number[] = Array(labels.length).fill(0);
    const tokens: number[] = Array(labels.length).fill(0);
    const inputTokens: number[] = Array(labels.length).fill(0);
    const outputTokens: number[] = Array(labels.length).fill(0);
    const costs: string[] = Array(labels.length).fill('0.00');
    
    // Calculate time segments based on time range
    let segmentDuration: number;
    let startTime: number;
    
    switch (timeRange) {
      case 'day':
        segmentDuration = 60 * 60 * 1000; // 1 hour
        startTime = now - 24 * segmentDuration;
        break;
      case 'week':
        segmentDuration = 24 * 60 * 60 * 1000; // 1 day
        startTime = now - 7 * segmentDuration;
        break;
      case 'month':
        segmentDuration = 24 * 60 * 60 * 1000; // 1 day
        startTime = now - 30 * segmentDuration; // 30 days
        break;
      case 'year':
        segmentDuration = 30 * 24 * 60 * 60 * 1000; // ~1 month
        startTime = now - 12 * segmentDuration;
        break;
    }
    
    // Aggregate data into time segments
    this.usageData.usageHistory.forEach(entry => {
      // Ensure timestamp is within range
      if (entry.timestamp >= startTime && entry.timestamp <= now) {
        const segmentIndex = Math.floor((entry.timestamp - startTime) / segmentDuration);
        if (segmentIndex >= 0 && segmentIndex < labels.length) {
          // Add the data to the appropriate segment
          requests[segmentIndex] += entry.requests;
          tokens[segmentIndex] += entry.tokens;
          inputTokens[segmentIndex] += entry.inputTokens;
          outputTokens[segmentIndex] += entry.outputTokens;
          costs[segmentIndex] = (parseFloat(costs[segmentIndex]) + entry.cost).toFixed(2);
        }
      }
    });
    
    return { requests, tokens, inputTokens, outputTokens, costs };
  }
  
  /**
   * Get time-based labels for charts
   *
   * @param timeRange The time range to get labels for
   */
  public getTimeLabels(timeRange: 'day' | 'week' | 'month' | 'year'): string[] {
    const now = new Date();
    const labels: string[] = [];
    
    switch (timeRange) {
      case 'day':
        // Generate hourly labels for the past 24 hours
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
        }
        break;
      case 'week':
        // Generate daily labels for the past 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case 'month':
        // Generate daily labels for the past 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' }));
        }
        break;
      case 'year':
        // Generate monthly labels for the past 12 months
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (11 - i));
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
    }
    
    return labels;
  }
  
  /**
   * Clear all usage data
   */
  public clearUsageData(): void {
    this.usageData = { ...DEFAULT_USAGE_DATA };
    this.saveUsageData();
    this.syncToLegacyStorage();
    this.dispatchChangeEvent();
  }
  
  /**
   * Clear all rate limits and usage data
   */
  public clearAllLimitsAndUsage(): void {
    // Clear usage data
    this.clearUsageData();
    
    // Clear rate limit data
    const resetTime = new Date(Date.now() + 3600000); // 1 hour from now
    const defaultRateLimitInfo = {
      limit: 10,
      remaining: 10,
      used: 0,
      reset: resetTime
    };
    
    // Reset rate limit info in localStorage
    localStorage.setItem('rateLimitInfo', JSON.stringify(defaultRateLimitInfo));
    localStorage.setItem('rateLimited', JSON.stringify(false));
    
    // Dispatch an event to notify components that rate limits have been cleared
    window.dispatchEvent(new CustomEvent('rate-limits-cleared'));
    console.log('[EnhancedUsageTracking] All rate limits and usage data cleared successfully');
  }
  
  /**
   * Load usage data from localStorage or initialize with defaults
   */
  private loadUsageData(): UsageData {
    console.log('[EnhancedUsageTracking] Loading usage data');
    
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        console.log('[EnhancedUsageTracking] Not in browser environment, returning defaults');
        return { ...DEFAULT_USAGE_DATA };
      }
      
      // Get usage data from localStorage
      const storedData = localStorage.getItem(USAGE_DATA_KEY);
      
      // If usage data exists, parse and return it
      if (storedData) {
        console.log('[EnhancedUsageTracking] Retrieved usage data from localStorage');
        
        const parsedData = JSON.parse(storedData) as UsageData;
        
        // Check if data needs migration
        if (!parsedData._version || parsedData._version < DEFAULT_USAGE_DATA._version) {
          console.log('[EnhancedUsageTracking] Migrating usage data from version',
            parsedData._version, 'to', DEFAULT_USAGE_DATA._version);
          
          return this.migrateUsageData(parsedData);
        }
        
        return parsedData;
      }
      
      // If no usage data exists, try to migrate from legacy usage data
      console.log('[EnhancedUsageTracking] No enhanced usage data found, checking legacy data');
      
      const migratedData = this.migrateFromLegacyData();
      
      return migratedData;
    } catch (error) {
      console.error('[EnhancedUsageTracking] Error loading usage data:', error);
      return { ...DEFAULT_USAGE_DATA };
    }
  }
  
  /**
   * Save usage data to localStorage
   */
  private saveUsageData(): void {
    try {
      localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(this.usageData));
      console.log('[EnhancedUsageTracking] Usage data saved to localStorage');
      
      // Dispatch event for real-time updates
      this.dispatchChangeEvent();
    } catch (error) {
      console.error('[EnhancedUsageTracking] Error saving usage data:', error);
    }
  }
  
  /**
   * Migrate usage data from one version to another
   *
   * @param oldData Old usage data to migrate
   */
  private migrateUsageData(oldData: Partial<UsageData>): UsageData {
    // Start with current defaults
    const newData = { ...DEFAULT_USAGE_DATA };
    
    // No version means these are first-time settings
    if (!oldData._version) {
      return this.mergeUsageData(newData, oldData);
    }
    
    // Handle migrations based on version
    switch (oldData._version) {
      // Add cases here when breaking changes are made
      // case 0:
      //   // Migrate from version 0 to 1
      //   break;
      default:
        return this.mergeUsageData(newData, oldData);
    }
  }
  
  /**
   * Merge usage data objects
   *
   * @param currentData Current usage data
   * @param newData New usage data to merge
   */
  private mergeUsageData(
    currentData: UsageData,
    newData: Partial<UsageData>
  ): UsageData {
    // Create a deep copy of the current data
    const result = JSON.parse(JSON.stringify(currentData)) as UsageData;
    
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
    
    // Merge the new data into the result
    return mergeObjects(result, newData);
  }
  
  /**
   * Migrate from legacy usage data
   */
  private migrateFromLegacyData(): UsageData {
    console.log('[EnhancedUsageTracking] Migrating from legacy usage data');
    
    // Start with default data
    const newData = { ...DEFAULT_USAGE_DATA };
    
    try {
      // Check for legacy usage data
      const legacyDataStr = localStorage.getItem(LEGACY_USAGE_DATA_KEY);
      if (!legacyDataStr) {
        console.log('[EnhancedUsageTracking] No legacy usage data found');
        return newData;
      }
      
      const legacyData = JSON.parse(legacyDataStr);
      console.log('[EnhancedUsageTracking] Found legacy usage data');
      
      // Migrate total stats
      newData.totalRequests = legacyData.totalRequests || 0;
      newData.totalTokens = legacyData.totalTokens || 0;
      newData.totalInputTokens = legacyData.totalInputTokens || 0;
      newData.totalOutputTokens = legacyData.totalOutputTokens || 0;
      newData.costEstimate = legacyData.costEstimate || 0;
      
      // Migrate provider stats
      if (legacyData.requestsByProvider) {
        Object.keys(legacyData.requestsByProvider).forEach(provider => {
          if (newData.requestsByProvider[provider as AIProvider] !== undefined) {
            newData.requestsByProvider[provider as AIProvider] = legacyData.requestsByProvider[provider] || 0;
          }
        });
      }
      
      if (legacyData.tokensByProvider) {
        Object.keys(legacyData.tokensByProvider).forEach(provider => {
          if (newData.tokensByProvider[provider as AIProvider] !== undefined) {
            newData.tokensByProvider[provider as AIProvider] = legacyData.tokensByProvider[provider] || 0;
          }
        });
      }
      
      if (legacyData.inputTokensByProvider) {
        Object.keys(legacyData.inputTokensByProvider).forEach(provider => {
          if (newData.inputTokensByProvider[provider as AIProvider] !== undefined) {
            newData.inputTokensByProvider[provider as AIProvider] = legacyData.inputTokensByProvider[provider] || 0;
          }
        });
      }
      
      if (legacyData.outputTokensByProvider) {
        Object.keys(legacyData.outputTokensByProvider).forEach(provider => {
          if (newData.outputTokensByProvider[provider as AIProvider] !== undefined) {
            newData.outputTokensByProvider[provider as AIProvider] = legacyData.outputTokensByProvider[provider] || 0;
          }
        });
      }
      
      if (legacyData.costByProvider) {
        Object.keys(legacyData.costByProvider).forEach(provider => {
          if (newData.costByProvider[provider as AIProvider] !== undefined) {
            newData.costByProvider[provider as AIProvider] = legacyData.costByProvider[provider] || 0;
          }
        });
      }
      
      // Migrate app stats
      if (legacyData.requestsByApp) {
        Object.keys(legacyData.requestsByApp).forEach(app => {
          if (newData.requestsByApp[app as AppId] !== undefined) {
            newData.requestsByApp[app as AppId] = legacyData.requestsByApp[app] || 0;
          }
        });
      }
      
      if (legacyData.tokensByApp) {
        Object.keys(legacyData.tokensByApp).forEach(app => {
          if (newData.tokensByApp[app as AppId] !== undefined) {
            newData.tokensByApp[app as AppId] = legacyData.tokensByApp[app] || 0;
          }
        });
      }
      
      if (legacyData.inputTokensByApp) {
        Object.keys(legacyData.inputTokensByApp).forEach(app => {
          if (newData.inputTokensByApp[app as AppId] !== undefined) {
            newData.inputTokensByApp[app as AppId] = legacyData.inputTokensByApp[app] || 0;
          }
        });
      }
      
      if (legacyData.outputTokensByApp) {
        Object.keys(legacyData.outputTokensByApp).forEach(app => {
          if (newData.outputTokensByApp[app as AppId] !== undefined) {
            newData.outputTokensByApp[app as AppId] = legacyData.outputTokensByApp[app] || 0;
          }
        });
      }
      
      if (legacyData.costByApp) {
        Object.keys(legacyData.costByApp).forEach(app => {
          if (newData.costByApp[app as AppId] !== undefined) {
            newData.costByApp[app as AppId] = legacyData.costByApp[app] || 0;
          }
        });
      }
      
      // Migrate usage history
      if (legacyData.usageHistory && Array.isArray(legacyData.usageHistory)) {
        // Convert legacy history entries to new format
        newData.usageHistory = legacyData.usageHistory.map((entry: any) => ({
          timestamp: entry.timestamp || Date.now(),
          requests: entry.requests || 1,
          tokens: entry.tokens || 0,
          inputTokens: entry.inputTokens || 0,
          outputTokens: entry.outputTokens || 0,
          cost: entry.cost || 0,
          provider: entry.provider || 'openai',
          app: (entry.app as AppId) || 'unknown-app',
          model: entry.model || 'unknown'
        }));
      }
      
      console.log('[EnhancedUsageTracking] Legacy usage data migrated successfully');
      return newData;
    } catch (error) {
      console.error('[EnhancedUsageTracking] Error migrating from legacy usage data:', error);
      return newData;
    }
  }
  
  /**
   * Synchronize with legacy usage data for backward compatibility
   */
  private syncToLegacyStorage(): void {
    console.log('[EnhancedUsageTracking] Synchronizing to legacy storage');
    
    try {
      // Convert enhanced usage data to legacy format
      const legacyData = {
        totalRequests: this.usageData.totalRequests,
        totalTokens: this.usageData.totalTokens,
        totalInputTokens: this.usageData.totalInputTokens,
        totalOutputTokens: this.usageData.totalOutputTokens,
        costEstimate: this.usageData.costEstimate,
        requestsByProvider: { ...this.usageData.requestsByProvider },
        tokensByProvider: { ...this.usageData.tokensByProvider },
        inputTokensByProvider: { ...this.usageData.inputTokensByProvider },
        outputTokensByProvider: { ...this.usageData.outputTokensByProvider },
        costByProvider: { ...this.usageData.costByProvider },
        requestsByApp: { ...this.usageData.requestsByApp },
        tokensByApp: { ...this.usageData.tokensByApp },
        inputTokensByApp: { ...this.usageData.inputTokensByApp },
        outputTokensByApp: { ...this.usageData.outputTokensByApp },
        costByApp: { ...this.usageData.costByApp },
        usageHistory: [...this.usageData.usageHistory]
      };
      
      // Save to legacy storage
      localStorage.setItem(LEGACY_USAGE_DATA_KEY, JSON.stringify(legacyData));
      console.log('[EnhancedUsageTracking] Data synchronized to legacy storage');
    } catch (error) {
      console.error('[EnhancedUsageTracking] Error synchronizing to legacy storage:', error);
    }
  }
  
  /**
   * Set up event listeners
   */
  private setupEventListeners(): void {
    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', (event) => {
      if (event.key === USAGE_DATA_KEY) {
        console.log('[EnhancedUsageTracking] Usage data changed in another tab');
        
        try {
          if (event.newValue) {
            this.usageData = JSON.parse(event.newValue);
            
            // Synchronize with legacy storage
            if (this.initialized) {
              this.syncToLegacyStorage();
              this.dispatchChangeEvent();
            }
          }
        } catch (error) {
          console.error('[EnhancedUsageTracking] Error handling storage event:', error);
        }
      }
    });
    
    // Listen for app changes
    window.addEventListener('app-changed', (event: any) => {
      if (!event.detail || !event.detail.appId) return;
      
      console.log(`[EnhancedUsageTracking] App changed to ${event.detail.appId}`);
    });
  }
  
  /**
   * Dispatch a change event
   */
  private dispatchChangeEvent(): void {
    const event = new CustomEvent(USAGE_DATA_UPDATED_EVENT, {
      detail: this.usageData
    });
    
    window.dispatchEvent(event);
    console.log('[EnhancedUsageTracking] Dispatched usage data updated event');
  }
}

// Export the singleton instance
export const enhancedUsageTracking = EnhancedUsageTrackingService.getInstance();
