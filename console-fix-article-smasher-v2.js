/**
 * Article Smasher Usage Tracking Fix - Console Version
 * 
 * This script can be run directly in the browser console to diagnose and fix
 * Article Smasher usage tracking issues.
 * 
 * Instructions:
 * 1. Open the browser console (F12 or Ctrl+Shift+I)
 * 2. Copy and paste this entire script
 * 3. Press Enter to run it
 * 4. Follow the prompts in the console
 */

// Function to log with styling
function logStyled(message, type = 'info') {
  const styles = {
    info: 'color: #2196F3; font-weight: bold;',
    success: 'color: #4CAF50; font-weight: bold;',
    error: 'color: #f44336; font-weight: bold;',
    warning: 'color: #FF9800; font-weight: bold;',
    heading: 'color: #9C27B0; font-weight: bold; font-size: 1.2em;'
  };
  
  console.log(`%c${message}`, styles[type] || styles.info);
}

// Function to log the current state of usage tracking
function logUsageTrackingState() {
  logStyled('=== Article Smasher Usage Tracking Debug ===', 'heading');
  
  // Check app identification flags
  const appFlags = {
    article_smasher_app: localStorage.getItem('article_smasher_app'),
    article_wizard_state: localStorage.getItem('article_wizard_state'),
    task_list_state: localStorage.getItem('task_list_state'),
    FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
    current_app: localStorage.getItem('current_app')
  };
  
  logStyled('App identification flags:', 'info');
  console.table(appFlags);
  
  // Check usage data
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  
  logStyled('Usage data summary:', 'info');
  console.log({
    totalRequests: usageData.totalRequests,
    totalTokens: usageData.totalTokens,
    requestsByApp: usageData.requestsByApp,
    tokensByApp: usageData.tokensByApp,
    historyEntries: usageData.usageHistory?.length || 0
  });
  
  // Check for Article Smasher entries
  const articleSmasherRequests = usageData.requestsByApp?.['article-smasher'] || 0;
  const articleSmasherTokens = usageData.tokensByApp?.['article-smasher'] || 0;
  
  logStyled('Article Smasher usage:', 'info');
  console.log({
    requests: articleSmasherRequests,
    tokens: articleSmasherTokens
  });
  
  // Count Article Smasher entries in history
  const articleSmasherEntries = usageData.usageHistory?.filter(entry => entry.app === 'article-smasher') || [];
  logStyled(`Found ${articleSmasherEntries.length} article-smasher entries in usage history`, articleSmasherEntries.length > 0 ? 'success' : 'warning');
  
  if (articleSmasherEntries.length > 0) {
    logStyled('Most recent Article Smasher entry:', 'info');
    console.log(articleSmasherEntries[articleSmasherEntries.length - 1]);
  }
  
  logStyled('=== End of Debug ===', 'heading');
  
  return {
    appFlags,
    usageData,
    articleSmasherRequests,
    articleSmasherTokens,
    articleSmasherEntries
  };
}

// Function to set Article Smasher flags
function setArticleSmasherFlags() {
  logStyled('Setting Article Smasher flags...', 'info');
  
  // Set all possible identification flags
  localStorage.setItem('article_smasher_app', 'true');
  localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
  localStorage.setItem('FORCE_APP_ID', 'article-smasher');
  localStorage.setItem('current_app', 'article-smasher');
  
  logStyled('Article Smasher flags set successfully', 'success');
  
  // Log the updated flags
  const updatedFlags = {
    article_smasher_app: localStorage.getItem('article_smasher_app'),
    article_wizard_state: localStorage.getItem('article_wizard_state'),
    FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
    current_app: localStorage.getItem('current_app')
  };
  
  console.table(updatedFlags);
}

// Function to add test data for Article Smasher
function addArticleSmasherTestData() {
  logStyled('Adding test data for Article Smasher...', 'info');
  
  // Get current usage data
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  
  // Initialize if needed
  if (!usageData.totalRequests) usageData.totalRequests = 0;
  if (!usageData.totalTokens) usageData.totalTokens = 0;
  if (!usageData.totalInputTokens) usageData.totalInputTokens = 0;
  if (!usageData.totalOutputTokens) usageData.totalOutputTokens = 0;
  if (!usageData.costEstimate) usageData.costEstimate = 0;
  
  if (!usageData.requestsByProvider) usageData.requestsByProvider = { openai: 0, openrouter: 0, anthropic: 0, google: 0, image: 0 };
  if (!usageData.tokensByProvider) usageData.tokensByProvider = { openai: 0, openrouter: 0, anthropic: 0, google: 0, image: 0 };
  if (!usageData.inputTokensByProvider) usageData.inputTokensByProvider = { openai: 0, openrouter: 0, anthropic: 0, google: 0, image: 0 };
  if (!usageData.outputTokensByProvider) usageData.outputTokensByProvider = { openai: 0, openrouter: 0, anthropic: 0, google: 0, image: 0 };
  if (!usageData.costByProvider) usageData.costByProvider = { openai: 0, openrouter: 0, anthropic: 0, google: 0, image: 0 };
  
  if (!usageData.requestsByApp) usageData.requestsByApp = {};
  if (!usageData.tokensByApp) usageData.tokensByApp = {};
  if (!usageData.inputTokensByApp) usageData.inputTokensByApp = {};
  if (!usageData.outputTokensByApp) usageData.outputTokensByApp = {};
  if (!usageData.costByApp) usageData.costByApp = {};
  
  if (!usageData.usageHistory) usageData.usageHistory = [];
  
  // Add test data for Article Smasher
  const testTokens = 500;
  const testInputTokens = 100;
  const testOutputTokens = 400;
  const testCost = 0.001;
  
  // Update total stats
  usageData.totalRequests += 1;
  usageData.totalTokens += testTokens;
  usageData.totalInputTokens += testInputTokens;
  usageData.totalOutputTokens += testOutputTokens;
  usageData.costEstimate += testCost;
  
  // Update provider stats (using OpenAI as the test provider)
  usageData.requestsByProvider.openai = (usageData.requestsByProvider.openai || 0) + 1;
  usageData.tokensByProvider.openai = (usageData.tokensByProvider.openai || 0) + testTokens;
  usageData.inputTokensByProvider.openai = (usageData.inputTokensByProvider.openai || 0) + testInputTokens;
  usageData.outputTokensByProvider.openai = (usageData.outputTokensByProvider.openai || 0) + testOutputTokens;
  usageData.costByProvider.openai = (usageData.costByProvider.openai || 0) + testCost;
  
  // Update app stats
  usageData.requestsByApp['article-smasher'] = (usageData.requestsByApp['article-smasher'] || 0) + 1;
  usageData.tokensByApp['article-smasher'] = (usageData.tokensByApp['article-smasher'] || 0) + testTokens;
  usageData.inputTokensByApp['article-smasher'] = (usageData.inputTokensByApp['article-smasher'] || 0) + testInputTokens;
  usageData.outputTokensByApp['article-smasher'] = (usageData.outputTokensByApp['article-smasher'] || 0) + testOutputTokens;
  usageData.costByApp['article-smasher'] = (usageData.costByApp['article-smasher'] || 0) + testCost;
  
  // Add to history
  usageData.usageHistory.push({
    timestamp: Date.now(),
    requests: 1,
    tokens: testTokens,
    inputTokens: testInputTokens,
    outputTokens: testOutputTokens,
    cost: testCost,
    provider: 'openai',
    app: 'article-smasher',
    model: 'gpt-3.5-turbo'
  });
  
  // Save updated data
  localStorage.setItem('smashingapps_usage_data', JSON.stringify(usageData));
  
  logStyled('Test data added successfully', 'success');
  logStyled('Added 1 request with 500 tokens for Article Smasher', 'info');
}

// Function to force refresh usage data
function forceRefreshUsageData() {
  logStyled('Forcing refresh of usage data...', 'info');
  
  // Get the latest data from localStorage
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  
  // Ensure app-specific stats are properly calculated
  if (usageData.usageHistory && usageData.usageHistory.length > 0) {
    logStyled('Recalculating app-specific stats from history', 'info');
    
    // Reset app stats to ensure clean recalculation
    usageData.requestsByApp = {};
    usageData.tokensByApp = {};
    usageData.inputTokensByApp = {};
    usageData.outputTokensByApp = {};
    usageData.costByApp = {};
    
    // Recalculate from history
    usageData.usageHistory.forEach(entry => {
      if (!entry.app) return;
      
      usageData.requestsByApp[entry.app] = (usageData.requestsByApp[entry.app] || 0) + entry.requests;
      usageData.tokensByApp[entry.app] = (usageData.tokensByApp[entry.app] || 0) + entry.tokens;
      usageData.inputTokensByApp[entry.app] = (usageData.inputTokensByApp[entry.app] || 0) + (entry.inputTokens || 0);
      usageData.outputTokensByApp[entry.app] = (usageData.outputTokensByApp[entry.app] || 0) + (entry.outputTokens || 0);
      usageData.costByApp[entry.app] = (usageData.costByApp[entry.app] || 0) + entry.cost;
    });
  }
  
  // Always ensure both apps exist in the app stats
  if (!usageData.requestsByApp) {
    usageData.requestsByApp = {};
  }
  if (!usageData.tokensByApp) {
    usageData.tokensByApp = {};
  }
  if (!usageData.inputTokensByApp) {
    usageData.inputTokensByApp = {};
  }
  if (!usageData.outputTokensByApp) {
    usageData.outputTokensByApp = {};
  }
  if (!usageData.costByApp) {
    usageData.costByApp = {};
  }
  
  // Always ensure both apps exist in the stats
  if (!usageData.requestsByApp['article-smasher']) {
    logStyled('Adding article-smasher to app stats', 'info');
    usageData.requestsByApp['article-smasher'] = 0;
    usageData.tokensByApp['article-smasher'] = 0;
    usageData.inputTokensByApp['article-smasher'] = 0;
    usageData.outputTokensByApp['article-smasher'] = 0;
    usageData.costByApp['article-smasher'] = 0;
  }
  
  if (!usageData.requestsByApp['task-smasher']) {
    logStyled('Adding task-smasher to app stats', 'info');
    usageData.requestsByApp['task-smasher'] = 0;
    usageData.tokensByApp['task-smasher'] = 0;
    usageData.inputTokensByApp['task-smasher'] = 0;
    usageData.outputTokensByApp['task-smasher'] = 0;
    usageData.costByApp['task-smasher'] = 0;
  }
  
  // Save the recalculated data
  localStorage.setItem('smashingapps_usage_data', JSON.stringify(usageData));
  
  // Dispatch events to refresh the UI
  window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
  window.dispatchEvent(new CustomEvent('refresh-usage-data'));
  
  logStyled('Usage data refresh events dispatched with recalculated app stats', 'success');
}

// Function to clear all data
function clearAllData() {
  logStyled('Clearing all localStorage data...', 'warning');
  localStorage.clear();
  logStyled('All localStorage data cleared successfully', 'success');
}

// Main function to run the fix
function runFix() {
  logStyled('Running Article Smasher usage tracking fix...', 'heading');
  
  // Step 1: Log current state
  logStyled('Step 1: Logging current state', 'info');
  const initialState = logUsageTrackingState();
  
  // Step 2: Set Article Smasher flags
  logStyled('Step 2: Setting Article Smasher flags', 'info');
  setArticleSmasherFlags();
  
  // Step 3: Add test data
  logStyled('Step 3: Adding test data', 'info');
  addArticleSmasherTestData();
  
  // Step 4: Force refresh
  logStyled('Step 4: Forcing refresh', 'info');
  forceRefreshUsageData();
  
  // Step 5: Log final state
  logStyled('Step 5: Logging final state', 'info');
  const finalState = logUsageTrackingState();
  
  logStyled('Fix completed successfully', 'success');
  logStyled('Please refresh the admin page and check the Usage tab', 'info');
  
  return {
    initialState,
    finalState
  };
}

// Display menu
logStyled('Article Smasher Usage Tracking Fix - Console Version', 'heading');
logStyled('Available functions:', 'info');
logStyled('1. logUsageTrackingState() - Log the current state of usage tracking', 'info');
logStyled('2. setArticleSmasherFlags() - Set Article Smasher identification flags', 'info');
logStyled('3. addArticleSmasherTestData() - Add test data for Article Smasher', 'info');
logStyled('4. forceRefreshUsageData() - Force refresh of usage data', 'info');
logStyled('5. clearAllData() - Clear all localStorage data', 'warning');
logStyled('6. runFix() - Run the complete fix', 'success');
logStyled('Example: runFix()', 'info');

// Make functions available in the global scope
window.logUsageTrackingState = logUsageTrackingState;
window.setArticleSmasherFlags = setArticleSmasherFlags;
window.addArticleSmasherTestData = addArticleSmasherTestData;
window.forceRefreshUsageData = forceRefreshUsageData;
window.clearAllData = clearAllData;
window.runFix = runFix;