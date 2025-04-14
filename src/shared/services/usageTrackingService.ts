import { AIProvider } from '../types/aiProviders';

// Define the usage data structure
export interface UsageData {
  totalRequests: number;
  totalTokens: number;
  costEstimate: number;
  requestsByProvider: Record<AIProvider, number>;
  tokensByProvider: Record<AIProvider, number>;
  costByProvider: Record<AIProvider, number>;
  requestsByApp: Record<string, number>;
  tokensByApp: Record<string, number>;
  costByApp: Record<string, number>;
  usageHistory: {
    timestamp: number;
    requests: number;
    tokens: number;
    cost: number;
    provider: AIProvider;
    app: string;
  }[];
}

// Initialize with empty usage data
const initialUsageData: UsageData = {
  totalRequests: 0,
  totalTokens: 0,
  costEstimate: 0,
  requestsByProvider: {} as Record<AIProvider, number>,
  tokensByProvider: {} as Record<AIProvider, number>,
  costByProvider: {} as Record<AIProvider, number>,
  requestsByApp: {},
  tokensByApp: {},
  costByApp: {},
  usageHistory: []
};

// Local storage key for usage data
const USAGE_DATA_KEY = 'smashingapps_usage_data';

// Get usage data from local storage or initialize if not exists
export const getUsageData = (): UsageData => {
  try {
    const storedData = localStorage.getItem(USAGE_DATA_KEY);
    if (storedData) {
      return JSON.parse(storedData);
    }
  } catch (error) {
    console.error('Failed to load usage data from local storage:', error);
  }
  
  return initialUsageData;
};

// Save usage data to local storage
export const saveUsageData = (data: UsageData): void => {
  try {
    // Log the app usage data being saved
    console.log('Saving usage data with app stats:', {
      requestsByApp: data.requestsByApp,
      tokensByApp: data.tokensByApp,
      costByApp: data.costByApp
    });
    
    localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(data));
    console.log('Usage data saved successfully');
  } catch (error) {
    console.error('Failed to save usage data to local storage:', error);
  }
};

// Track a new API request
export const trackApiRequest = (
  provider: AIProvider,
  tokens: number,
  app: string,
  model: string,
  timestamp?: Date
): void => {
  console.log(`Tracking API request for provider: ${provider}, app: ${app}, tokens: ${tokens}, model: ${model}`);
  
  const usageData = getUsageData();
  const timestampMs = timestamp ? timestamp.getTime() : Date.now();
  
  // Calculate cost (simplified - in a real app you'd use different rates per model)
  const costPerToken = 0.002; // Example rate
  const cost = tokens * costPerToken;
  
  // Update total stats
  usageData.totalRequests += 1;
  usageData.totalTokens += tokens;
  usageData.costEstimate += cost;
  
  // Update provider stats
  usageData.requestsByProvider[provider] = (usageData.requestsByProvider[provider] || 0) + 1;
  usageData.tokensByProvider[provider] = (usageData.tokensByProvider[provider] || 0) + tokens;
  usageData.costByProvider[provider] = (usageData.costByProvider[provider] || 0) + cost;
  
  // Update app stats
  usageData.requestsByApp[app] = (usageData.requestsByApp[app] || 0) + 1;
  usageData.tokensByApp[app] = (usageData.tokensByApp[app] || 0) + tokens;
  usageData.costByApp[app] = (usageData.costByApp[app] || 0) + cost;
  
  // Add to history
  usageData.usageHistory.push({
    timestamp: timestampMs,
    requests: 1,
    tokens,
    cost,
    provider,
    app
  });
  
  // Limit history size (keep last 1000 entries)
  if (usageData.usageHistory.length > 1000) {
    usageData.usageHistory = usageData.usageHistory.slice(-1000);
  }
  
  // Save updated data
  saveUsageData(usageData);
  
  // Broadcast event for real-time updates
  window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
};

// Get filtered usage data for a specific time range
export const getFilteredUsageData = (
  timeRange: 'day' | 'week' | 'month' | 'year'
): UsageData => {
  const usageData = getUsageData();
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
  const filteredHistory = usageData.usageHistory.filter(entry => entry.timestamp >= cutoffTime);
  
  // Calculate stats for filtered data
  const filteredData: UsageData = {
    totalRequests: 0,
    totalTokens: 0,
    costEstimate: 0,
    requestsByProvider: {} as Record<AIProvider, number>,
    tokensByProvider: {} as Record<AIProvider, number>,
    costByProvider: {} as Record<AIProvider, number>,
    requestsByApp: {},
    tokensByApp: {},
    costByApp: {},
    usageHistory: filteredHistory
  };
  
  // Aggregate stats from filtered history
  filteredHistory.forEach(entry => {
    filteredData.totalRequests += entry.requests;
    filteredData.totalTokens += entry.tokens;
    filteredData.costEstimate += entry.cost;
    
    // Update provider stats
    filteredData.requestsByProvider[entry.provider] = (filteredData.requestsByProvider[entry.provider] || 0) + entry.requests;
    filteredData.tokensByProvider[entry.provider] = (filteredData.tokensByProvider[entry.provider] || 0) + entry.tokens;
    filteredData.costByProvider[entry.provider] = (filteredData.costByProvider[entry.provider] || 0) + entry.cost;
    
    // Update app stats
    filteredData.requestsByApp[entry.app] = (filteredData.requestsByApp[entry.app] || 0) + entry.requests;
    filteredData.tokensByApp[entry.app] = (filteredData.tokensByApp[entry.app] || 0) + entry.tokens;
    filteredData.costByApp[entry.app] = (filteredData.costByApp[entry.app] || 0) + entry.cost;
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
): { requests: number[], tokens: number[], costs: string[] } => {
  const usageData = getUsageData();
  const now = Date.now();
  const labels = getTimeLabels(timeRange);
  const requests: number[] = Array(labels.length).fill(0);
  const tokens: number[] = Array(labels.length).fill(0);
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
        costs[segmentIndex] = (parseFloat(costs[segmentIndex]) + entry.cost).toFixed(2);
      }
    }
  });
  
  return { requests, tokens, costs };
};