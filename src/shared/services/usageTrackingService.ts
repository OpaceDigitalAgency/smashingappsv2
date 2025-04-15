import { AIProvider, AIModel, MODEL_PRICING } from '../types/aiProviders';
import { aiServiceRegistry } from './AIService';

// Define the usage data structure
export interface UsageData {
  totalRequests: number;
  totalTokens: number;
  totalInputTokens: number;
  totalOutputTokens: number;
  costEstimate: number;
  requestsByProvider: Record<AIProvider, number>;
  tokensByProvider: Record<AIProvider, number>;
  inputTokensByProvider: Record<AIProvider, number>;
  outputTokensByProvider: Record<AIProvider, number>;
  costByProvider: Record<AIProvider, number>;
  requestsByApp: Record<string, number>;
  tokensByApp: Record<string, number>;
  inputTokensByApp: Record<string, number>;
  outputTokensByApp: Record<string, number>;
  costByApp: Record<string, number>;
  usageHistory: {
    timestamp: number;
    requests: number;
    tokens: number;
    inputTokens: number;
    outputTokens: number;
    cost: number;
    provider: AIProvider;
    app: string;
    model?: string;
  }[];
}

// Helper function to create initialized provider record
export const createInitialProviderRecord = (): Record<AIProvider, number> => ({
  openai: 0,
  openrouter: 0,
  anthropic: 0,
  google: 0,
  image: 0
});

// Initialize with empty usage data that includes both apps
const initialUsageData: UsageData = {
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
  requestsByApp: {
    'article-smasher': 0,
    'task-smasher': 0
  },
  tokensByApp: {
    'article-smasher': 0,
    'task-smasher': 0
  },
  inputTokensByApp: {
    'article-smasher': 0,
    'task-smasher': 0
  },
  outputTokensByApp: {
    'article-smasher': 0,
    'task-smasher': 0
  },
  costByApp: {
    'article-smasher': 0,
    'task-smasher': 0
  },
  usageHistory: []
};

// Local storage key for usage data
const USAGE_DATA_KEY = 'smashingapps_usage_data';

// Get usage data from local storage or initialize if not exists
export const getUsageData = (): UsageData => {
  try {
    const storedData = localStorage.getItem(USAGE_DATA_KEY);
    if (storedData) {
      const parsedData = JSON.parse(storedData);
      let modified = false;
      
      // Ensure all required objects exist
      // Initialize provider-related objects
      if (!parsedData.requestsByProvider) {
        console.warn('[DEBUG] Missing requestsByProvider in stored usage data, initializing it');
        parsedData.requestsByProvider = createInitialProviderRecord();
        modified = true;
      }
      
      if (!parsedData.tokensByProvider) {
        console.warn('[DEBUG] Missing tokensByProvider in stored usage data, initializing it');
        parsedData.tokensByProvider = createInitialProviderRecord();
        modified = true;
      }
      
      if (!parsedData.inputTokensByProvider) {
        console.warn('[DEBUG] Missing inputTokensByProvider in stored usage data, initializing it');
        parsedData.inputTokensByProvider = createInitialProviderRecord();
        modified = true;
      }
      
      if (!parsedData.outputTokensByProvider) {
        console.warn('[DEBUG] Missing outputTokensByProvider in stored usage data, initializing it');
        parsedData.outputTokensByProvider = createInitialProviderRecord();
        modified = true;
      }
      
      if (!parsedData.costByProvider) {
        console.warn('[DEBUG] Missing costByProvider in stored usage data, initializing it');
        parsedData.costByProvider = createInitialProviderRecord();
        modified = true;
      }

      // Initialize app-related objects
      if (!parsedData.requestsByApp) {
        console.warn('[DEBUG] Missing requestsByApp in stored usage data, initializing it');
        parsedData.requestsByApp = {};
        modified = true;
      }
      
      if (!parsedData.tokensByApp) {
        console.warn('[DEBUG] Missing tokensByApp in stored usage data, initializing it');
        parsedData.tokensByApp = {};
        modified = true;
      }
      
      if (!parsedData.inputTokensByApp) {
        console.warn('[DEBUG] Missing inputTokensByApp in stored usage data, initializing it');
        parsedData.inputTokensByApp = {};
        modified = true;
      }
      
      if (!parsedData.outputTokensByApp) {
        console.warn('[DEBUG] Missing outputTokensByApp in stored usage data, initializing it');
        parsedData.outputTokensByApp = {};
        modified = true;
      }
      
      if (!parsedData.costByApp) {
        console.warn('[DEBUG] Missing costByApp in stored usage data, initializing it');
        parsedData.costByApp = {};
        modified = true;
      }
      
      // Ensure both apps exist in all app stats
      const apps = ['article-smasher', 'task-smasher'];
      apps.forEach(app => {
        if (!parsedData.requestsByApp[app]) {
          console.log(`[DEBUG] Adding ${app} to requestsByApp`);
          parsedData.requestsByApp[app] = 0;
          modified = true;
        }
        if (!parsedData.tokensByApp[app]) {
          parsedData.tokensByApp[app] = 0;
          modified = true;
        }
        if (!parsedData.inputTokensByApp[app]) {
          parsedData.inputTokensByApp[app] = 0;
          modified = true;
        }
        if (!parsedData.outputTokensByApp[app]) {
          parsedData.outputTokensByApp[app] = 0;
          modified = true;
        }
        if (!parsedData.costByApp[app]) {
          parsedData.costByApp[app] = 0;
          modified = true;
        }
      });
      
      // Save if modified
      if (modified) {
        localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(parsedData));
        console.log('[DEBUG] Saved updated usage data with fixed app stats');
      }
      
      // Log app-specific and provider-specific stats for debugging
      console.log('[DEBUG] Retrieved usage data with stats:', {
        requestsByApp: parsedData.requestsByApp,
        tokensByApp: parsedData.tokensByApp,
        costByApp: parsedData.costByApp,
        requestsByProvider: parsedData.requestsByProvider,
        tokensByProvider: parsedData.tokensByProvider,
        costByProvider: parsedData.costByProvider
      });
      
      return parsedData;
    }
  } catch (error) {
    console.error('[DEBUG] Failed to load usage data from local storage:', error);
  }
  
  console.log('[DEBUG] No valid usage data found, returning initial data');
  return initialUsageData;
};

// Save usage data to local storage
export const saveUsageData = (data: UsageData): void => {
  try {
    // Validate and ensure both apps exist in the data structure
    const apps = ['article-smasher', 'task-smasher'];
    
    // Initialize app stats if missing
    if (!data.requestsByApp) {
      console.warn('[DEBUG] Missing requestsByApp in data to save, initializing it');
      data.requestsByApp = {
        'article-smasher': 0,
        'task-smasher': 0
      };
    }
    
    if (!data.tokensByApp) {
      console.warn('[DEBUG] Missing tokensByApp in data to save, initializing it');
      data.tokensByApp = {
        'article-smasher': 0,
        'task-smasher': 0
      };
    }
    
    if (!data.inputTokensByApp) {
      console.warn('[DEBUG] Missing inputTokensByApp in data to save, initializing it');
      data.inputTokensByApp = {
        'article-smasher': 0,
        'task-smasher': 0
      };
    }
    
    if (!data.outputTokensByApp) {
      console.warn('[DEBUG] Missing outputTokensByApp in data to save, initializing it');
      data.outputTokensByApp = {
        'article-smasher': 0,
        'task-smasher': 0
      };
    }
    
    if (!data.costByApp) {
      console.warn('[DEBUG] Missing costByApp in data to save, initializing it');
      data.costByApp = {
        'article-smasher': 0,
        'task-smasher': 0
      };
    }
    
    // Ensure both apps exist in all app stats
    apps.forEach(app => {
      if (!data.requestsByApp[app]) data.requestsByApp[app] = 0;
      if (!data.tokensByApp[app]) data.tokensByApp[app] = 0;
      if (!data.inputTokensByApp[app]) data.inputTokensByApp[app] = 0;
      if (!data.outputTokensByApp[app]) data.outputTokensByApp[app] = 0;
      if (!data.costByApp[app]) data.costByApp[app] = 0;
    });
    
    // Log the app usage data being saved
    console.log('[DEBUG] Saving usage data with app stats:', {
      requestsByApp: data.requestsByApp,
      tokensByApp: data.tokensByApp,
      costByApp: data.costByApp,
      appIdentifiers: {
        article_smasher_app: localStorage.getItem('article_smasher_app'),
        article_wizard_state: localStorage.getItem('article_wizard_state'),
        task_list_state: localStorage.getItem('task_list_state')
      }
    });
    
    localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(data));
    console.log('[DEBUG] Usage data saved successfully');
    
    // Dispatch event for real-time updates
    window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: data }));
  } catch (error) {
    console.error('[DEBUG] Failed to save usage data to local storage:', error);
  }
};

// Track a new API request
export const trackApiRequest = (
  provider: AIProvider,
  tokens: number,
  app: string,
  model: string,
  inputTokens?: number,
  outputTokens?: number,
  timestamp?: Date
): void => {
  console.log(`[DEBUG] Tracking API request for provider: ${provider}, app: ${app}, tokens: ${tokens}, model: ${model}`);
  
  // DIRECT APPROACH: Force app identification with multiple checks
  
  // First check for direct force flag
  const forcedAppId = localStorage.getItem('FORCE_APP_ID');
  if (forcedAppId) {
    console.log(`[DEBUG] Using forced app ID from FORCE_APP_ID: ${forcedAppId}`);
    app = forcedAppId;
  }
  // Then check for current_app
  else if (localStorage.getItem('current_app')) {
    console.log(`[DEBUG] Using app ID from current_app: ${localStorage.getItem('current_app')}`);
    app = localStorage.getItem('current_app') || app;
  }
  // Then check app-specific flags
  else if (!app || app === 'unknown-app') {
    console.warn('[DEBUG] Attempting to track request with invalid app ID:', app);
    
    // Try to determine app ID from localStorage flags with more aggressive checks
    if (localStorage.getItem('article_smasher_app') ||
        localStorage.getItem('article_wizard_state') ||
        window.location.pathname.includes('article-smasher')) {
      console.log('[DEBUG] Found ArticleSmasher indicators, forcing app ID');
      app = 'article-smasher';
    } else if (localStorage.getItem('task_list_state') ||
               window.location.pathname.includes('task-smasher')) {
      console.log('[DEBUG] Found TaskSmasher indicators, forcing app ID');
      app = 'task-smasher';
    }
  }
  
  // Final fallback - if we still don't have a valid app ID, check DOM
  if (!app || app === 'unknown-app') {
    if (document.querySelector('.article-smasher-container')) {
      console.log('[DEBUG] Found article-smasher-container in DOM, forcing app ID');
      app = 'article-smasher';
    } else if (document.querySelector('.task-smasher-container')) {
      console.log('[DEBUG] Found task-smasher-container in DOM, forcing app ID');
      app = 'task-smasher';
    }
  }
  
  console.log('[DEBUG] Final app ID for tracking:', app);
  
  const usageData = getUsageData();
  const timestampMs = timestamp ? timestamp.getTime() : Date.now();
  
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
  usageData.totalRequests += 1;
  usageData.totalTokens += tokens;
  usageData.totalInputTokens += actualInputTokens;
  usageData.totalOutputTokens += actualOutputTokens;
  usageData.costEstimate += cost;
  
  // Update provider stats
  usageData.requestsByProvider[provider] = (usageData.requestsByProvider[provider] || 0) + 1;
  usageData.tokensByProvider[provider] = (usageData.tokensByProvider[provider] || 0) + tokens;
  usageData.inputTokensByProvider[provider] = (usageData.inputTokensByProvider[provider] || 0) + actualInputTokens;
  usageData.outputTokensByProvider[provider] = (usageData.outputTokensByProvider[provider] || 0) + actualOutputTokens;
  usageData.costByProvider[provider] = (usageData.costByProvider[provider] || 0) + cost;
  
  // Update app stats with validation
  if (!usageData.requestsByApp) {
    console.warn('[DEBUG] requestsByApp is undefined, initializing it');
    usageData.requestsByApp = {};
  }
  
  if (!usageData.tokensByApp) {
    console.warn('[DEBUG] tokensByApp is undefined, initializing it');
    usageData.tokensByApp = {};
  }
  
  if (!usageData.inputTokensByApp) {
    console.warn('[DEBUG] inputTokensByApp is undefined, initializing it');
    usageData.inputTokensByApp = {};
  }
  
  if (!usageData.outputTokensByApp) {
    console.warn('[DEBUG] outputTokensByApp is undefined, initializing it');
    usageData.outputTokensByApp = {};
  }
  
  if (!usageData.costByApp) {
    console.warn('[DEBUG] costByApp is undefined, initializing it');
    usageData.costByApp = {};
  }
  
  usageData.requestsByApp[app] = (usageData.requestsByApp[app] || 0) + 1;
  usageData.tokensByApp[app] = (usageData.tokensByApp[app] || 0) + tokens;
  usageData.inputTokensByApp[app] = (usageData.inputTokensByApp[app] || 0) + actualInputTokens;
  usageData.outputTokensByApp[app] = (usageData.outputTokensByApp[app] || 0) + actualOutputTokens;
  usageData.costByApp[app] = (usageData.costByApp[app] || 0) + cost;
  
  console.log(`[DEBUG] Updated app stats for ${app}:`, {
    requests: usageData.requestsByApp[app],
    tokens: usageData.tokensByApp[app],
    cost: usageData.costByApp[app]
  });
  
  // Add to history
  usageData.usageHistory.push({
    timestamp: timestampMs,
    requests: 1,
    tokens,
    inputTokens: actualInputTokens,
    outputTokens: actualOutputTokens,
    cost,
    provider,
    app,
    model
  });
  
  // Limit history size (keep last 1000 entries)
  if (usageData.usageHistory.length > 1000) {
    usageData.usageHistory = usageData.usageHistory.slice(-1000);
  }
  
  // Save updated data
  saveUsageData(usageData);
};

// Get filtered usage data for a specific time range
export const getFilteredUsageData = (
  timeRange: 'day' | 'week' | 'month' | 'year'
): UsageData => {
  // Get current usage data or create a new one with default values
  const usageData = getUsageData();
  
  // Ensure all required objects exist
  if (!usageData.requestsByApp) usageData.requestsByApp = { 'article-smasher': 0, 'task-smasher': 0 };
  if (!usageData.tokensByApp) usageData.tokensByApp = { 'article-smasher': 0, 'task-smasher': 0 };
  if (!usageData.inputTokensByApp) usageData.inputTokensByApp = { 'article-smasher': 0, 'task-smasher': 0 };
  if (!usageData.outputTokensByApp) usageData.outputTokensByApp = { 'article-smasher': 0, 'task-smasher': 0 };
  if (!usageData.costByApp) usageData.costByApp = { 'article-smasher': 0, 'task-smasher': 0 };
  if (!usageData.usageHistory) usageData.usageHistory = [];

  // Ensure provider-related objects are initialized in input data
  if (!usageData.requestsByProvider) usageData.requestsByProvider = createInitialProviderRecord();
  if (!usageData.tokensByProvider) usageData.tokensByProvider = createInitialProviderRecord();
  if (!usageData.inputTokensByProvider) usageData.inputTokensByProvider = createInitialProviderRecord();
  if (!usageData.outputTokensByProvider) usageData.outputTokensByProvider = createInitialProviderRecord();
  if (!usageData.costByProvider) usageData.costByProvider = createInitialProviderRecord();
  
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
  const filteredHistory = (usageData.usageHistory || []).filter(entry => entry?.timestamp >= cutoffTime);
  
  // Calculate stats for filtered data with both apps initialized
  const filteredData: UsageData = {
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
    requestsByApp: {
      'article-smasher': 0,
      'task-smasher': 0
    },
    tokensByApp: {
      'article-smasher': 0,
      'task-smasher': 0
    },
    inputTokensByApp: {
      'article-smasher': 0,
      'task-smasher': 0
    },
    outputTokensByApp: {
      'article-smasher': 0,
      'task-smasher': 0
    },
    costByApp: {
      'article-smasher': 0,
      'task-smasher': 0
    },
    usageHistory: filteredHistory
  };
  
  // Aggregate stats from filtered history
  filteredHistory.forEach(entry => {
    filteredData.totalRequests += entry.requests;
    filteredData.totalTokens += entry.tokens;
    filteredData.totalInputTokens += entry.inputTokens || 0;
    filteredData.totalOutputTokens += entry.outputTokens || 0;
    filteredData.costEstimate += entry.cost;
    
    // Update provider stats
    filteredData.requestsByProvider[entry.provider] = (filteredData.requestsByProvider[entry.provider] || 0) + entry.requests;
    filteredData.tokensByProvider[entry.provider] = (filteredData.tokensByProvider[entry.provider] || 0) + entry.tokens;
    filteredData.inputTokensByProvider[entry.provider] = (filteredData.inputTokensByProvider[entry.provider] || 0) + (entry.inputTokens || 0);
    filteredData.outputTokensByProvider[entry.provider] = (filteredData.outputTokensByProvider[entry.provider] || 0) + (entry.outputTokens || 0);
    filteredData.costByProvider[entry.provider] = (filteredData.costByProvider[entry.provider] || 0) + entry.cost;
    
    // Update app stats
    filteredData.requestsByApp[entry.app] = (filteredData.requestsByApp[entry.app] || 0) + entry.requests;
    filteredData.tokensByApp[entry.app] = (filteredData.tokensByApp[entry.app] || 0) + entry.tokens;
    filteredData.inputTokensByApp[entry.app] = (filteredData.inputTokensByApp[entry.app] || 0) + (entry.inputTokens || 0);
    filteredData.outputTokensByApp[entry.app] = (filteredData.outputTokensByApp[entry.app] || 0) + (entry.outputTokens || 0);
    filteredData.costByApp[entry.app] = (filteredData.costByApp[entry.app] || 0) + entry.cost;
  });
  
  // Ensure both apps exist in the filtered data even if they have no usage
  const apps = ['article-smasher', 'task-smasher'];
  apps.forEach(app => {
    if (!filteredData.requestsByApp[app]) filteredData.requestsByApp[app] = 0;
    if (!filteredData.tokensByApp[app]) filteredData.tokensByApp[app] = 0;
    if (!filteredData.inputTokensByApp[app]) filteredData.inputTokensByApp[app] = 0;
    if (!filteredData.outputTokensByApp[app]) filteredData.outputTokensByApp[app] = 0;
    if (!filteredData.costByApp[app]) filteredData.costByApp[app] = 0;
  });

  return filteredData;
};

// Clear usage data (for testing or resetting)
export const clearUsageData = (): void => {
  saveUsageData(initialUsageData);
  window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: initialUsageData }));
};

// Clear all rate limits and usage data
export const clearAllLimitsAndUsage = (): void => {
  // Clear usage data
  clearUsageData();
  
  // Clear rate limit data for both Task Smasher and Article Smasher
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
  console.log('All rate limits and usage data cleared successfully!');
  console.log('All rate limits and usage data cleared successfully');
};

// Export a function to get time-based labels for charts
export const getTimeLabels = (timeRange: 'day' | 'week' | 'month' | 'year'): string[] => {
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
      // Generate weekly labels for the past 4 weeks
      for (let i = 4; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - (i * 7));
        labels.push(`Week ${4 - i}`);
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
};

// Get time-based data for charts
export const getTimeSeriesData = (
  timeRange: 'day' | 'week' | 'month' | 'year'
): {
  requests: number[],
  tokens: number[],
  inputTokens: number[],
  outputTokens: number[],
  costs: string[]
} => {
  const usageData = getUsageData();
  const now = Date.now();
  const labels = getTimeLabels(timeRange);
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
      segmentDuration = 7 * 24 * 60 * 60 * 1000; // 1 week
      startTime = now - 5 * segmentDuration;
      break;
    case 'year':
      segmentDuration = 30 * 24 * 60 * 60 * 1000; // ~1 month
      startTime = now - 12 * segmentDuration;
      break;
  }
  
  // Aggregate data into time segments
  usageData.usageHistory.forEach(entry => {
    if (entry.timestamp >= startTime) {
      const segmentIndex = Math.floor((entry.timestamp - startTime) / segmentDuration);
      if (segmentIndex >= 0 && segmentIndex < labels.length) {
        requests[segmentIndex] += entry.requests;
        tokens[segmentIndex] += entry.tokens;
        inputTokens[segmentIndex] += entry.inputTokens || 0;
        outputTokens[segmentIndex] += entry.outputTokens || 0;
        costs[segmentIndex] = (parseFloat(costs[segmentIndex]) + entry.cost).toFixed(2);
      }
    }
  });
  return { requests, tokens, inputTokens, outputTokens, costs };
};