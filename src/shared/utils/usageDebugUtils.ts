/**
 * Usage Tracking Debug Utilities
 * 
 * This file contains utilities for debugging usage tracking issues.
 */

import { UsageData } from '../services/usageTrackingService';

/**
 * Debug utility to log the current state of usage tracking
 */
export const debugUsageTracking = (): void => {
  try {
    console.log('[DEBUG] ===== Usage Tracking Debug Information =====');
    
    // Check app identification flags
    const appFlags = {
      article_smasher_app: localStorage.getItem('article_smasher_app'),
      article_wizard_state: localStorage.getItem('article_wizard_state'),
      task_list_state: localStorage.getItem('task_list_state')
    };
    
    console.log('[DEBUG] App identification flags:', appFlags);
    
    // Check current URL and path
    console.log('[DEBUG] Current URL:', window.location.href);
    console.log('[DEBUG] Current path:', window.location.pathname);
    
    // Check DOM for app containers
    const hasArticleSmasherContainer = !!document.querySelector('.article-smasher-container');
    const hasTaskSmasherContainer = !!document.querySelector('.task-smasher-container');
    
    console.log('[DEBUG] DOM containers:', {
      'article-smasher-container': hasArticleSmasherContainer,
      'task-smasher-container': hasTaskSmasherContainer
    });
    
    // Check usage data in localStorage
    const usageDataStr = localStorage.getItem('smashingapps_usage_data');
    if (usageDataStr) {
      try {
        const usageData = JSON.parse(usageDataStr) as UsageData;
        
        // Log summary of usage data
        console.log('[DEBUG] Usage data summary:', {
          totalRequests: usageData.totalRequests,
          totalTokens: usageData.totalTokens,
          costEstimate: usageData.costEstimate,
          historyEntries: usageData.usageHistory?.length || 0
        });
        
        // Log app-specific stats
        console.log('[DEBUG] App-specific usage stats:', {
          requestsByApp: usageData.requestsByApp,
          tokensByApp: usageData.tokensByApp,
          costByApp: usageData.costByApp
        });
        
        // Check for potential issues
        const issues = [];
        
        if (!usageData.requestsByApp) {
          issues.push('Missing requestsByApp object');
        }
        
        if (!usageData.tokensByApp) {
          issues.push('Missing tokensByApp object');
        }
        
        if (!usageData.costByApp) {
          issues.push('Missing costByApp object');
        }
        
        if (!usageData.usageHistory || usageData.usageHistory.length === 0) {
          issues.push('Empty usage history');
        }
        
        // Check for ArticleSmasher entries
        const hasArticleSmasherEntries = usageData.usageHistory?.some(entry => entry.app === 'article-smasher');
        if (!hasArticleSmasherEntries) {
          issues.push('No ArticleSmasher entries in usage history');
        }
        
        if (issues.length > 0) {
          console.warn('[DEBUG] Potential issues detected:', issues);
        } else {
          console.log('[DEBUG] No issues detected in usage data');
        }
        
        // Log the most recent entries for each app
        const recentArticleSmasherEntry = usageData.usageHistory
          ?.filter(entry => entry.app === 'article-smasher')
          .sort((a, b) => b.timestamp - a.timestamp)[0];
          
        const recentTaskSmasherEntry = usageData.usageHistory
          ?.filter(entry => entry.app === 'task-smasher')
          .sort((a, b) => b.timestamp - a.timestamp)[0];
        
        console.log('[DEBUG] Most recent ArticleSmasher entry:', recentArticleSmasherEntry || 'None');
        console.log('[DEBUG] Most recent TaskSmasher entry:', recentTaskSmasherEntry || 'None');
      } catch (error) {
        console.error('[DEBUG] Error parsing usage data:', error);
      }
    } else {
      console.warn('[DEBUG] No usage data found in localStorage');
    }
    
    console.log('[DEBUG] ===== End of Usage Tracking Debug Information =====');
  } catch (error) {
    console.error('[DEBUG] Error in debugUsageTracking:', error);
  }
};

/**
 * Fix common issues with usage tracking data
 */
export const fixUsageTrackingData = (): void => {
  try {
    console.log('[DEBUG] Attempting to fix usage tracking data...');
    
    // Get current usage data
    const usageDataStr = localStorage.getItem('smashingapps_usage_data');
    if (!usageDataStr) {
      console.warn('[DEBUG] No usage data found to fix');
      return;
    }
    
    const usageData = JSON.parse(usageDataStr) as UsageData;
    let modified = false;
    
    // Fix missing objects
    if (!usageData.requestsByApp) {
      console.log('[DEBUG] Fixing missing requestsByApp');
      usageData.requestsByApp = {};
      modified = true;
    }
    
    if (!usageData.tokensByApp) {
      console.log('[DEBUG] Fixing missing tokensByApp');
      usageData.tokensByApp = {};
      modified = true;
    }
    
    if (!usageData.inputTokensByApp) {
      console.log('[DEBUG] Fixing missing inputTokensByApp');
      usageData.inputTokensByApp = {};
      modified = true;
    }
    
    if (!usageData.outputTokensByApp) {
      console.log('[DEBUG] Fixing missing outputTokensByApp');
      usageData.outputTokensByApp = {};
      modified = true;
    }
    
    if (!usageData.costByApp) {
      console.log('[DEBUG] Fixing missing costByApp');
      usageData.costByApp = {};
      modified = true;
    }
    
    // Fix missing app stats by recalculating from history
    if (usageData.usageHistory && usageData.usageHistory.length > 0) {
      console.log('[DEBUG] Recalculating app stats from history');
      
      // Reset app stats
      const appStats = {
        requestsByApp: {} as Record<string, number>,
        tokensByApp: {} as Record<string, number>,
        inputTokensByApp: {} as Record<string, number>,
        outputTokensByApp: {} as Record<string, number>,
        costByApp: {} as Record<string, number>
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
    
    // Save fixed data if modified
    if (modified) {
      localStorage.setItem('smashingapps_usage_data', JSON.stringify(usageData));
      console.log('[DEBUG] Fixed usage tracking data saved');
      
      // Dispatch event to notify components
      window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
    } else {
      console.log('[DEBUG] No fixes needed for usage tracking data');
    }
  } catch (error) {
    console.error('[DEBUG] Error fixing usage tracking data:', error);
  }
};

/**
 * Force refresh of usage data in the admin dashboard
 */
export const forceRefreshUsageData = (): void => {
  try {
    console.log('[DEBUG] Forcing refresh of usage data...');
    
    // Fix any issues with the data
    fixUsageTrackingData();
    
    // Dispatch event to refresh the UI
    const usageDataStr = localStorage.getItem('smashingapps_usage_data');
    if (usageDataStr) {
      const usageData = JSON.parse(usageDataStr);
      window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
      window.dispatchEvent(new CustomEvent('refresh-usage-data'));
      console.log('[DEBUG] Usage data refresh events dispatched');
    }
  } catch (error) {
    console.error('[DEBUG] Error forcing refresh of usage data:', error);
  }
};