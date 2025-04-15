/**
 * Fix Usage Tracking Data
 * 
 * This script fixes issues with usage tracking data for both Task Smasher and Article Smasher.
 * It ensures that both applications are properly represented in the usage data and that
 * the data is correctly displayed in the admin dashboard.
 */

// Function to fix usage tracking data
function fixUsageTrackingData() {
  console.log('Fixing usage tracking data...');
  
  try {
    // Get current usage data
    const usageDataKey = 'smashingapps_usage_data';
    const usageDataStr = localStorage.getItem(usageDataKey);
    
    if (!usageDataStr) {
      console.warn('No usage data found to fix');
      return false;
    }
    
    const usageData = JSON.parse(usageDataStr);
    let modified = false;
    
    // Fix missing objects
    if (!usageData.requestsByApp) {
      console.log('Fixing missing requestsByApp');
      usageData.requestsByApp = {};
      modified = true;
    }
    
    if (!usageData.tokensByApp) {
      console.log('Fixing missing tokensByApp');
      usageData.tokensByApp = {};
      modified = true;
    }
    
    if (!usageData.inputTokensByApp) {
      console.log('Fixing missing inputTokensByApp');
      usageData.inputTokensByApp = {};
      modified = true;
    }
    
    if (!usageData.outputTokensByApp) {
      console.log('Fixing missing outputTokensByApp');
      usageData.outputTokensByApp = {};
      modified = true;
    }
    
    if (!usageData.costByApp) {
      console.log('Fixing missing costByApp');
      usageData.costByApp = {};
      modified = true;
    }
    
    // Fix missing app stats by recalculating from history
    if (usageData.usageHistory && usageData.usageHistory.length > 0) {
      console.log('Recalculating app stats from history');
      
      // Reset app stats
      const appStats = {
        requestsByApp: {},
        tokensByApp: {},
        inputTokensByApp: {},
        outputTokensByApp: {},
        costByApp: {}
      };
      
      // Recalculate from history
      usageData.usageHistory.forEach(entry => {
        if (!entry.app) return;
        
        appStats.requestsByApp[entry.app] = (appStats.requestsByApp[entry.app] || 0) + entry.requests;
        appStats.tokensByApp[entry.app] = (appStats.tokensByApp[entry.app] || 0) + entry.tokens;
        appStats.inputTokensByApp[entry.app] = (appStats.inputTokensByApp[entry.app] || 0) + (entry.inputTokens || 0);
        appStats.outputTokensByApp[entry.app] = (appStats.outputTokensByApp[entry.app] || 0) + (entry.outputTokens || 0);
        appStats.costByApp[entry.app] = (appStats.costByApp[entry.app] || 0) + entry.cost;
      });
      
      // Update usage data with recalculated stats
      usageData.requestsByApp = appStats.requestsByApp;
      usageData.tokensByApp = appStats.tokensByApp;
      usageData.inputTokensByApp = appStats.inputTokensByApp;
      usageData.outputTokensByApp = appStats.outputTokensByApp;
      usageData.costByApp = appStats.costByApp;
      
      modified = true;
    }
    
    // Ensure both Article Smasher and Task Smasher exist in the app stats
    if (!usageData.requestsByApp['article-smasher']) {
      console.log('Adding article-smasher to app stats');
      usageData.requestsByApp['article-smasher'] = 0;
      usageData.tokensByApp['article-smasher'] = 0;
      usageData.inputTokensByApp['article-smasher'] = 0;
      usageData.outputTokensByApp['article-smasher'] = 0;
      usageData.costByApp['article-smasher'] = 0;
      modified = true;
    }
    
    if (!usageData.requestsByApp['task-smasher']) {
      console.log('Adding task-smasher to app stats');
      usageData.requestsByApp['task-smasher'] = 0;
      usageData.tokensByApp['task-smasher'] = 0;
      usageData.inputTokensByApp['task-smasher'] = 0;
      usageData.outputTokensByApp['task-smasher'] = 0;
      usageData.costByApp['task-smasher'] = 0;
      modified = true;
    }
    
    // Save fixed data if modified
    if (modified) {
      localStorage.setItem(usageDataKey, JSON.stringify(usageData));
      console.log('Fixed usage tracking data saved');
      
      // Dispatch events to refresh the UI
      window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
      window.dispatchEvent(new CustomEvent('refresh-usage-data'));
      
      return true;
    } else {
      console.log('No fixes needed for usage tracking data');
      return false;
    }
  } catch (error) {
    console.error('Error fixing usage tracking data:', error);
    return false;
  }
}

// Function to clear all usage data and rate limits
function clearAllLimitsAndUsage() {
  console.log('Clearing all rate limits and usage data...');
  
  try {
    // Clear usage data
    const initialUsageData = {
      totalRequests: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      costEstimate: 0,
      requestsByProvider: {},
      tokensByProvider: {},
      inputTokensByProvider: {},
      outputTokensByProvider: {},
      costByProvider: {},
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
    
    localStorage.setItem('smashingapps_usage_data', JSON.stringify(initialUsageData));
    
    // Clear rate limit data
    const resetTime = new Date(Date.now() + 3600000); // 1 hour from now
    const defaultRateLimitInfo = {
      limit: 10,
      remaining: 10,
      used: 0,
      reset: resetTime
    };
    
    localStorage.setItem('rateLimitInfo', JSON.stringify(defaultRateLimitInfo));
    localStorage.setItem('rateLimited', JSON.stringify(false));
    
    // Dispatch events to refresh the UI
    window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: initialUsageData }));
    window.dispatchEvent(new CustomEvent('refresh-usage-data'));
    window.dispatchEvent(new CustomEvent('rate-limits-cleared'));
    
    console.log('All rate limits and usage data cleared successfully');
    return true;
  } catch (error) {
    console.error('Error clearing rate limits and usage data:', error);
    return false;
  }
}

// Function to simulate a Task Smasher API request
function simulateTaskSmasherRequest() {
  console.log('Simulating Task Smasher API request...');
  
  try {
    // Set app identification flags
    localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
    localStorage.setItem('current_app', 'task-smasher');
    
    // Get current usage data
    const usageDataKey = 'smashingapps_usage_data';
    const usageDataStr = localStorage.getItem(usageDataKey);
    const usageData = usageDataStr ? JSON.parse(usageDataStr) : {
      totalRequests: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      costEstimate: 0,
      requestsByProvider: {},
      tokensByProvider: {},
      inputTokensByProvider: {},
      outputTokensByProvider: {},
      costByProvider: {},
      requestsByApp: {},
      tokensByApp: {},
      inputTokensByApp: {},
      outputTokensByApp: {},
      costByApp: {},
      usageHistory: []
    };
    
    // Add a new request to the history
    const timestamp = Date.now();
    const provider = 'openai';
    const model = 'gpt-3.5-turbo';
    const tokens = 500;
    const inputTokens = 150;
    const outputTokens = 350;
    const cost = 0.002;
    const app = 'task-smasher';
    
    // Update total stats
    usageData.totalRequests += 1;
    usageData.totalTokens += tokens;
    usageData.totalInputTokens += inputTokens;
    usageData.totalOutputTokens += outputTokens;
    usageData.costEstimate += cost;
    
    // Update provider stats
    usageData.requestsByProvider[provider] = (usageData.requestsByProvider[provider] || 0) + 1;
    usageData.tokensByProvider[provider] = (usageData.tokensByProvider[provider] || 0) + tokens;
    usageData.inputTokensByProvider[provider] = (usageData.inputTokensByProvider[provider] || 0) + inputTokens;
    usageData.outputTokensByProvider[provider] = (usageData.outputTokensByProvider[provider] || 0) + outputTokens;
    usageData.costByProvider[provider] = (usageData.costByProvider[provider] || 0) + cost;
    
    // Update app stats
    if (!usageData.requestsByApp) usageData.requestsByApp = {};
    if (!usageData.tokensByApp) usageData.tokensByApp = {};
    if (!usageData.inputTokensByApp) usageData.inputTokensByApp = {};
    if (!usageData.outputTokensByApp) usageData.outputTokensByApp = {};
    if (!usageData.costByApp) usageData.costByApp = {};
    
    usageData.requestsByApp[app] = (usageData.requestsByApp[app] || 0) + 1;
    usageData.tokensByApp[app] = (usageData.tokensByApp[app] || 0) + tokens;
    usageData.inputTokensByApp[app] = (usageData.inputTokensByApp[app] || 0) + inputTokens;
    usageData.outputTokensByApp[app] = (usageData.outputTokensByApp[app] || 0) + outputTokens;
    usageData.costByApp[app] = (usageData.costByApp[app] || 0) + cost;
    
    // Add to history
    usageData.usageHistory.push({
      timestamp,
      requests: 1,
      tokens,
      inputTokens,
      outputTokens,
      cost,
      provider,
      app,
      model
    });
    
    // Save updated data
    localStorage.setItem(usageDataKey, JSON.stringify(usageData));
    
    // Dispatch events to refresh the UI
    window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
    window.dispatchEvent(new CustomEvent('refresh-usage-data'));
    
    console.log('Task Smasher API request simulated successfully');
    return true;
  } catch (error) {
    console.error('Error simulating Task Smasher API request:', error);
    return false;
  }
}

// Function to simulate an Article Smasher API request
function simulateArticleSmasherRequest() {
  console.log('Simulating Article Smasher API request...');
  
  try {
    // Set app identification flags
    localStorage.setItem('article_smasher_app', 'true');
    localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true }));
    localStorage.setItem('current_app', 'article-smasher');
    
    // Get current usage data
    const usageDataKey = 'smashingapps_usage_data';
    const usageDataStr = localStorage.getItem(usageDataKey);
    const usageData = usageDataStr ? JSON.parse(usageDataStr) : {
      totalRequests: 0,
      totalTokens: 0,
      totalInputTokens: 0,
      totalOutputTokens: 0,
      costEstimate: 0,
      requestsByProvider: {},
      tokensByProvider: {},
      inputTokensByProvider: {},
      outputTokensByProvider: {},
      costByProvider: {},
      requestsByApp: {},
      tokensByApp: {},
      inputTokensByApp: {},
      outputTokensByApp: {},
      costByApp: {},
      usageHistory: []
    };
    
    // Add a new request to the history
    const timestamp = Date.now();
    const provider = 'openai';
    const model = 'gpt-3.5-turbo';
    const tokens = 800;
    const inputTokens = 200;
    const outputTokens = 600;
    const cost = 0.003;
    const app = 'article-smasher';
    
    // Update total stats
    usageData.totalRequests += 1;
    usageData.totalTokens += tokens;
    usageData.totalInputTokens += inputTokens;
    usageData.totalOutputTokens += outputTokens;
    usageData.costEstimate += cost;
    
    // Update provider stats
    usageData.requestsByProvider[provider] = (usageData.requestsByProvider[provider] || 0) + 1;
    usageData.tokensByProvider[provider] = (usageData.tokensByProvider[provider] || 0) + tokens;
    usageData.inputTokensByProvider[provider] = (usageData.inputTokensByProvider[provider] || 0) + inputTokens;
    usageData.outputTokensByProvider[provider] = (usageData.outputTokensByProvider[provider] || 0) + outputTokens;
    usageData.costByProvider[provider] = (usageData.costByProvider[provider] || 0) + cost;
    
    // Update app stats
    if (!usageData.requestsByApp) usageData.requestsByApp = {};
    if (!usageData.tokensByApp) usageData.tokensByApp = {};
    if (!usageData.inputTokensByApp) usageData.inputTokensByApp = {};
    if (!usageData.outputTokensByApp) usageData.outputTokensByApp = {};
    if (!usageData.costByApp) usageData.costByApp = {};
    
    usageData.requestsByApp[app] = (usageData.requestsByApp[app] || 0) + 1;
    usageData.tokensByApp[app] = (usageData.tokensByApp[app] || 0) + tokens;
    usageData.inputTokensByApp[app] = (usageData.inputTokensByApp[app] || 0) + inputTokens;
    usageData.outputTokensByApp[app] = (usageData.outputTokensByApp[app] || 0) + outputTokens;
    usageData.costByApp[app] = (usageData.costByApp[app] || 0) + cost;
    
    // Add to history
    usageData.usageHistory.push({
      timestamp,
      requests: 1,
      tokens,
      inputTokens,
      outputTokens,
      cost,
      provider,
      app,
      model
    });
    
    // Save updated data
    localStorage.setItem(usageDataKey, JSON.stringify(usageData));
    
    // Dispatch events to refresh the UI
    window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
    window.dispatchEvent(new CustomEvent('refresh-usage-data'));
    
    console.log('Article Smasher API request simulated successfully');
    return true;
  } catch (error) {
    console.error('Error simulating Article Smasher API request:', error);
    return false;
  }
}

// Function to inspect localStorage for model settings
function inspectModelSettings() {
  console.log('Inspecting model settings in localStorage...');
  
  try {
    const settings = {
      'global-settings': localStorage.getItem('global-settings'),
      'smashingapps-global-settings': localStorage.getItem('smashingapps-global-settings'),
      'smashingapps_activeModel': localStorage.getItem('smashingapps_activeModel'),
      'smashingapps_activeProvider': localStorage.getItem('smashingapps_activeProvider')
    };
    
    console.log('Model settings in localStorage:', settings);
    
    // Parse the global settings if available
    if (settings['global-settings']) {
      try {
        const globalSettings = JSON.parse(settings['global-settings']);
        console.log('Parsed global-settings:', globalSettings);
        
        if (globalSettings.aiProvider && globalSettings.aiProvider.defaultModel) {
          console.log('Model from global-settings:', globalSettings.aiProvider.defaultModel);
        }
      } catch (error) {
        console.error('Error parsing global-settings:', error);
      }
    }
    
    // Parse the smashingapps-global-settings if available
    if (settings['smashingapps-global-settings']) {
      try {
        const smashingappsGlobalSettings = JSON.parse(settings['smashingapps-global-settings']);
        console.log('Parsed smashingapps-global-settings:', smashingappsGlobalSettings);
        
        if (smashingappsGlobalSettings.defaultModel) {
          console.log('Model from smashingapps-global-settings:', smashingappsGlobalSettings.defaultModel);
        }
      } catch (error) {
        console.error('Error parsing smashingapps-global-settings:', error);
      }
    }
    
    return settings;
  } catch (error) {
    console.error('Error inspecting model settings:', error);
    return null;
  }
}

// Run the fix
fixUsageTrackingData();