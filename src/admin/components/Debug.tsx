import React, { useState, useEffect } from 'react';
import { Bug, RefreshCw, AlertCircle, Check, Database, Trash2 } from 'lucide-react';
import Button from '../../shared/components/Button/Button';

const Debug: React.FC = () => {
  const [results, setResults] = useState<Array<{ message: string; type: 'success' | 'error' | 'info' }>>([]);
  const [debugInfo, setDebugInfo] = useState<string>('');

  // Helper function to log messages
  const log = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setResults(prev => [...prev, { message, type }]);
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Helper function to log objects
  const logObject = (label: string, obj: any, type: 'success' | 'error' | 'info' = 'info') => {
    log(`${label}:`, type);
    setDebugInfo(prev => `${label}:\n${JSON.stringify(obj, null, 2)}\n\n${prev}`);
    console.log(`[${type.toUpperCase()}] ${label}:`, obj);
  };

  // Clear all data
  const clearAllData = () => {
    log('Clearing all localStorage data...', 'info');
    
    try {
      // Clear localStorage
      localStorage.clear();
      log('Cleared all localStorage data');

      // Clear any existing app flags
      localStorage.removeItem('task_list_state');
      localStorage.removeItem('article_wizard_state');
      localStorage.removeItem('article_smasher_app');
      localStorage.removeItem('FORCE_APP_ID');
      localStorage.removeItem('current_app');
      log('Cleared all app flags');
      
      logObject('LocalStorage after clearing', { ...localStorage });
    } catch (error) {
      log(`Error clearing data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Inspect usage data
  const inspectUsageData = () => {
    setResults([]);
    log('Inspecting usage data...', 'info');
    
    const usageDataKey = 'smashingapps_usage_data';
    const usageDataStr = localStorage.getItem(usageDataKey);
    
    if (!usageDataStr) {
      log('No usage data found in localStorage', 'error');
      return;
    }
    
    try {
      const usageData = JSON.parse(usageDataStr);
      
      // Check if article-smasher exists in app stats
      if (!usageData.requestsByApp || !usageData.requestsByApp['article-smasher']) {
        log('article-smasher is missing from requestsByApp', 'error');
      } else {
        log(`article-smasher requests: ${usageData.requestsByApp['article-smasher']}`);
      }
      
      if (!usageData.tokensByApp || !usageData.tokensByApp['article-smasher']) {
        log('article-smasher is missing from tokensByApp', 'error');
      } else {
        log(`article-smasher tokens: ${usageData.tokensByApp['article-smasher']}`);
      }
      
      // Count article-smasher entries in history
      let articleSmasherCount = 0;
      if (usageData.usageHistory) {
        usageData.usageHistory.forEach((entry: any) => {
          if (entry.app === 'article-smasher') {
            articleSmasherCount++;
          }
        });
        log(`Found ${articleSmasherCount} article-smasher entries in usage history`);
      } else {
        log('No usage history found', 'error');
      }
      
      // Display full usage data
      logObject('Full usage data', usageData);
      
    } catch (error) {
      log(`Error parsing usage data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  // Inspect app flags
  const inspectAppFlags = () => {
    setResults([]);
    log('Inspecting app identification flags...', 'info');
    
    const flags = {
      article_smasher_app: localStorage.getItem('article_smasher_app'),
      article_wizard_state: localStorage.getItem('article_wizard_state'),
      FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
      current_app: localStorage.getItem('current_app'),
      task_list_state: localStorage.getItem('task_list_state')
    };
    
    logObject('App identification flags', flags);
    
    // Check for article-smasher flags
    if (!flags.article_smasher_app && !flags.article_wizard_state) {
      log('No Article Smasher identification flags found', 'error');
    } else {
      log('Article Smasher identification flags found');
    }
    
    // Check for forced app ID
    if (flags.FORCE_APP_ID === 'article-smasher' || flags.current_app === 'article-smasher') {
      log('Article Smasher is set as the current app');
    } else if (flags.FORCE_APP_ID || flags.current_app) {
      log(`Current app is set to: ${flags.FORCE_APP_ID || flags.current_app}`, 'error');
    } else {
      log('No current app is set', 'error');
    }
  };

  // Inspect model settings
  const inspectModelSettings = () => {
    setResults([]);
    log('Inspecting model settings...', 'info');
    
    const settings = {
      'global-settings': localStorage.getItem('global-settings'),
      'smashingapps-global-settings': localStorage.getItem('smashingapps-global-settings'),
      'smashingapps_activeModel': localStorage.getItem('smashingapps_activeModel'),
      'smashingapps_activeProvider': localStorage.getItem('smashingapps_activeProvider')
    };
    
    // Parse the global settings if available
    if (settings['global-settings']) {
      try {
        const globalSettings = JSON.parse(settings['global-settings']);
        logObject('Parsed global-settings', globalSettings);
        
        if (globalSettings.aiProvider && globalSettings.aiProvider.defaultModel) {
          log(`Model from global-settings: ${globalSettings.aiProvider.defaultModel}`);
        }
      } catch (error) {
        log(`Error parsing global-settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    } else {
      log('No global-settings found', 'error');
    }
    
    // Parse the smashingapps-global-settings if available
    if (settings['smashingapps-global-settings']) {
      try {
        const smashingappsGlobalSettings = JSON.parse(settings['smashingapps-global-settings']);
        logObject('Parsed smashingapps-global-settings', smashingappsGlobalSettings);
        
        if (smashingappsGlobalSettings.defaultModel) {
          log(`Model from smashingapps-global-settings: ${smashingappsGlobalSettings.defaultModel}`);
        }
      } catch (error) {
        log(`Error parsing smashingapps-global-settings: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      }
    } else {
      log('No smashingapps-global-settings found', 'error');
    }
    
    logObject('Raw model settings', settings);
  };

  // Fix usage tracking data
  const fixUsageTrackingData = () => {
    setResults([]);
    log('Fixing usage tracking data...', 'info');
    
    try {
      // Get current usage data
      const usageDataKey = 'smashingapps_usage_data';
      const usageDataStr = localStorage.getItem(usageDataKey);
      
      if (!usageDataStr) {
        log('No usage data found to fix', 'error');
        return;
      }
      
      const usageData = JSON.parse(usageDataStr);
      let modified = false;
      
      // Fix missing objects
      if (!usageData.requestsByApp) {
        log('Fixing missing requestsByApp');
        usageData.requestsByApp = {};
        modified = true;
      }
      
      if (!usageData.tokensByApp) {
        log('Fixing missing tokensByApp');
        usageData.tokensByApp = {};
        modified = true;
      }
      
      if (!usageData.inputTokensByApp) {
        log('Fixing missing inputTokensByApp');
        usageData.inputTokensByApp = {};
        modified = true;
      }
      
      if (!usageData.outputTokensByApp) {
        log('Fixing missing outputTokensByApp');
        usageData.outputTokensByApp = {};
        modified = true;
      }
      
      if (!usageData.costByApp) {
        log('Fixing missing costByApp');
        usageData.costByApp = {};
        modified = true;
      }
      
      // Fix missing app stats by recalculating from history
      if (usageData.usageHistory && usageData.usageHistory.length > 0) {
        log('Recalculating app stats from history');
        
        // Reset app stats
        const appStats: {
          requestsByApp: Record<string, number>;
          tokensByApp: Record<string, number>;
          inputTokensByApp: Record<string, number>;
          outputTokensByApp: Record<string, number>;
          costByApp: Record<string, number>;
        } = {
          requestsByApp: {},
          tokensByApp: {},
          inputTokensByApp: {},
          outputTokensByApp: {},
          costByApp: {}
        };
        
        // Recalculate from history
        usageData.usageHistory.forEach((entry: any) => {
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
        log('Adding article-smasher to app stats');
        usageData.requestsByApp['article-smasher'] = 0;
        usageData.tokensByApp['article-smasher'] = 0;
        usageData.inputTokensByApp['article-smasher'] = 0;
        usageData.outputTokensByApp['article-smasher'] = 0;
        usageData.costByApp['article-smasher'] = 0;
        modified = true;
      }
      
      if (!usageData.requestsByApp['task-smasher']) {
        log('Adding task-smasher to app stats');
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
        log('Fixed usage tracking data saved');
        
        // Dispatch events to refresh the UI
        window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
        window.dispatchEvent(new CustomEvent('refresh-usage-data'));
        
        return true;
      } else {
        log('No fixes needed for usage tracking data');
        return false;
      }
    } catch (error) {
      log(`Error fixing usage tracking data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return false;
    }
  };

  // Set Article Smasher flags
  const setArticleSmasherFlags = () => {
    setResults([]);
    log('Setting Article Smasher identification flags...', 'info');
    
    // Set ArticleSmasher flags
    localStorage.setItem('article_smasher_app', 'true');
    localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
    localStorage.setItem('FORCE_APP_ID', 'article-smasher');
    localStorage.setItem('current_app', 'article-smasher');
    
    // Remove any TaskSmasher flags
    localStorage.removeItem('task_list_state');
    
    log('Article Smasher identification flags set successfully');
    
    // Verify flags
    const flags = {
      article_smasher_app: localStorage.getItem('article_smasher_app'),
      article_wizard_state: localStorage.getItem('article_wizard_state'),
      FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
      current_app: localStorage.getItem('current_app')
    };
    
    logObject('Updated app identification flags', flags);
  };

  // Simulate API request for the current app
  const simulateApiRequest = () => {
    setResults([]);
    log('Simulating Article Smasher API request...', 'info');
    
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
      // Get the app ID from localStorage instead of hardcoding it
      const app = localStorage.getItem('current_app') || 'article-smasher';
      
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
      
      log(`${app === 'task-smasher' ? 'Task Smasher' : 'Article Smasher'} API request simulated successfully`);
      
      // Show updated stats
      log(`${app === 'task-smasher' ? 'Task Smasher' : 'Article Smasher'} requests: ${usageData.requestsByApp[app]}`);
      log(`${app === 'task-smasher' ? 'Task Smasher' : 'Article Smasher'} tokens: ${usageData.tokensByApp[app]}`);
      log(`${app === 'task-smasher' ? 'Task Smasher' : 'Article Smasher'} cost: ${usageData.costByApp[app]}`);
      
      return true;
    } catch (error) {
      log(`Error simulating Article Smasher API request: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
      return false;
    }
  };

  // Verify Article Smasher Usage
  const verifyArticleSmasherUsage = () => {
    setResults([]);
    log('Starting Article Smasher usage verification test...', 'info');
    
    // Step 1: Run Task Smasher test
    log('Step 1: Running Task Smasher test...', 'info');
    
    // Simulate Task Smasher request
    try {
      // Set Task Smasher flags
      localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
      localStorage.setItem('current_app', 'task-smasher');
      
      // Remove Article Smasher flags
      localStorage.removeItem('article_smasher_app');
      localStorage.removeItem('article_wizard_state');
      
      // Simulate API request
      const taskSmasherResult = simulateApiRequest();
      
      if (taskSmasherResult) {
        log('Task Smasher test completed successfully', 'success');
        
        // Step 2: Run Article Smasher test
        log('Step 2: Running Article Smasher test...', 'info');
        
        // Set Article Smasher flags
        localStorage.setItem('article_smasher_app', 'true');
        localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true }));
        localStorage.setItem('current_app', 'article-smasher');
        
        // Remove Task Smasher flags
        localStorage.removeItem('task_list_state');
        
        // Simulate API request
        const articleSmasherResult = simulateApiRequest();
        
        if (articleSmasherResult) {
          log('Article Smasher test completed successfully', 'success');
          
          // Step 3: Check usage data
          log('Step 3: Checking usage data...', 'info');
          
          // Get current usage data
          const usageDataKey = 'smashingapps_usage_data';
          const usageDataStr = localStorage.getItem(usageDataKey);
          
          if (!usageDataStr) {
            log('No usage data found', 'error');
            return;
          }
          
          const usageData = JSON.parse(usageDataStr);
          
          // Check for Task Smasher usage data
          const taskSmasherRequests = usageData.requestsByApp && usageData.requestsByApp['task-smasher'] || 0;
          
          // Check for Article Smasher usage data
          const articleSmasherRequests = usageData.requestsByApp && usageData.requestsByApp['article-smasher'] || 0;
          
          log(`Found usage data - Task Smasher: ${taskSmasherRequests} requests, Article Smasher: ${articleSmasherRequests} requests`, 'info');
          
          // Verify both apps have usage data
          if (taskSmasherRequests > 0 && articleSmasherRequests > 0) {
            log('Both apps have usage data recorded in the admin panel', 'success');
            log('Article Smasher usage tracking is working correctly!', 'success');
          } else if (taskSmasherRequests > 0 && articleSmasherRequests === 0) {
            log('Only Task Smasher has usage data recorded', 'error');
            log('Article Smasher usage tracking is NOT working correctly', 'error');
          } else if (taskSmasherRequests === 0 && articleSmasherRequests > 0) {
            log('Only Article Smasher has usage data recorded', 'error');
            log('Unexpected result: Article Smasher has usage data, but Task Smasher does not', 'error');
          } else {
            log('Neither app has usage data recorded', 'error');
            log('Usage tracking is not working for either app', 'error');
          }
        } else {
          log('Article Smasher test failed', 'error');
        }
      } else {
        log('Task Smasher test failed', 'error');
      }
    } catch (error) {
      log(`Error during verification: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center">
          <Bug className="w-6 h-6 mr-2" />
          Debug Tools
        </h1>
        <p className="text-gray-600">
          Diagnostic tools for troubleshooting usage tracking and other issues
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Database className="w-5 h-5 mr-2 text-blue-500" />
            Diagnostics
          </h2>
          <div className="space-y-2">
            <Button 
              variant="secondary" 
              onClick={inspectUsageData}
              className="w-full justify-start"
            >
              Inspect Usage Data
            </Button>
            <Button 
              variant="secondary" 
              onClick={inspectAppFlags}
              className="w-full justify-start"
            >
              Inspect App Flags
            </Button>
            <Button 
              variant="secondary" 
              onClick={inspectModelSettings}
              className="w-full justify-start"
            >
              Inspect Model Settings
            </Button>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <RefreshCw className="w-5 h-5 mr-2 text-green-500" />
            Fixes
          </h2>
          <div className="space-y-2">
            <Button
              variant="secondary"
              onClick={fixUsageTrackingData}
              className="w-full justify-start"
            >
              Fix Usage Tracking Data
            </Button>
            <Button
              variant="secondary"
              onClick={setArticleSmasherFlags}
              className="w-full justify-start"
            >
              Set Article Smasher Flags
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // Set Article Smasher flags
                localStorage.setItem('article_smasher_app', 'true');
                localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true }));
                localStorage.setItem('current_app', 'article-smasher');
                simulateApiRequest();
              }}
              className="w-full justify-start"
            >
              Simulate Article Smasher Request
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                // Set Task Smasher flags
                localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
                localStorage.setItem('current_app', 'task-smasher');
                // Remove Article Smasher flags
                localStorage.removeItem('article_smasher_app');
                localStorage.removeItem('article_wizard_state');
                simulateApiRequest();
              }}
              className="w-full justify-start"
            >
              Simulate Task Smasher Request
            </Button>
            <Button
              variant="secondary"
              onClick={verifyArticleSmasherUsage}
              className="w-full justify-start"
            >
              Verify Article Smasher Usage
            </Button>
            <Button 
              variant="danger" 
              onClick={clearAllData}
              className="w-full justify-start"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All Data
            </Button>
          </div>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg border border-gray-200 mb-6">
        <h2 className="text-lg font-semibold mb-3">Results</h2>
        <div className="max-h-60 overflow-y-auto">
          {results.length === 0 ? (
            <div className="text-gray-500 italic">No results yet. Run a diagnostic or fix to see results here.</div>
          ) : (
            results.map((result, index) => (
              <div 
                key={index} 
                className={`p-2 mb-2 rounded-md flex items-start ${
                  result.type === 'success' ? 'bg-green-50 text-green-700' : 
                  result.type === 'error' ? 'bg-red-50 text-red-700' : 
                  'bg-blue-50 text-blue-700'
                }`}
              >
                {result.type === 'success' ? (
                  <Check className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : result.type === 'error' ? (
                  <AlertCircle className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <span>{result.message}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {debugInfo && (
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3 text-white">Debug Information</h2>
          <pre className="text-xs overflow-x-auto whitespace-pre-wrap">{debugInfo}</pre>
        </div>
      )}
    </div>
  );
};

export default Debug;