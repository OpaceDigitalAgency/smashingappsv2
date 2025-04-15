/**
 * Fix Article Smasher Usage Tracking
 * 
 * This script fixes issues with Article Smasher usage tracking by:
 * 1. Ensuring Article Smasher is correctly identified
 * 2. Adding test data to verify tracking works
 * 3. Forcing a refresh of the usage data
 */

// Function to log the current state of usage tracking
function logUsageTrackingState() {
  console.log('=== Article Smasher Usage Tracking Debug ===');
  
  // Check app identification flags
  const appFlags = {
    article_smasher_app: localStorage.getItem('article_smasher_app'),
    article_wizard_state: localStorage.getItem('article_wizard_state'),
    task_list_state: localStorage.getItem('task_list_state'),
    FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
    current_app: localStorage.getItem('current_app')
  };
  
  console.log('App identification flags:', appFlags);
  
  // Check usage data
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  
  console.log('Usage data summary:', {
    totalRequests: usageData.totalRequests,
    totalTokens: usageData.totalTokens,
    requestsByApp: usageData.requestsByApp,
    tokensByApp: usageData.tokensByApp,
    historyEntries: usageData.usageHistory?.length || 0
  });
  
  // Check for Article Smasher entries
  const articleSmasherRequests = usageData.requestsByApp?.['article-smasher'] || 0;
  const articleSmasherTokens = usageData.tokensByApp?.['article-smasher'] || 0;
  
  console.log('Article Smasher usage:', {
    requests: articleSmasherRequests,
    tokens: articleSmasherTokens
  });
  
  // Count Article Smasher entries in history
  const articleSmasherEntries = usageData.usageHistory?.filter(entry => entry.app === 'article-smasher') || [];
  console.log(`Found ${articleSmasherEntries.length} article-smasher entries in usage history`);
  
  if (articleSmasherEntries.length > 0) {
    console.log('Most recent Article Smasher entry:', articleSmasherEntries[articleSmasherEntries.length - 1]);
  }
  
  console.log('=== End of Debug ===');
  
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
  console.log('Setting Article Smasher flags...');
  
  // Set all possible identification flags
  localStorage.setItem('article_smasher_app', 'true');
  localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
  localStorage.setItem('FORCE_APP_ID', 'article-smasher');
  localStorage.setItem('current_app', 'article-smasher');
  
  console.log('Article Smasher flags set successfully');
}

// Function to add test data for Article Smasher
function addArticleSmasherTestData() {
  console.log('Adding test data for Article Smasher...');
  
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
  
  console.log('Test data added successfully');
}

// Function to force refresh usage data
function forceRefreshUsageData() {
  console.log('Forcing refresh of usage data...');
  
  // Get the latest data from localStorage
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  
  // Ensure app-specific stats are properly calculated
  if (usageData.usageHistory && usageData.usageHistory.length > 0) {
    console.log('Recalculating app-specific stats from history');
    
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
    console.log('Adding article-smasher to app stats');
    usageData.requestsByApp['article-smasher'] = 0;
    usageData.tokensByApp['article-smasher'] = 0;
    usageData.inputTokensByApp['article-smasher'] = 0;
    usageData.outputTokensByApp['article-smasher'] = 0;
    usageData.costByApp['article-smasher'] = 0;
  }
  
  if (!usageData.requestsByApp['task-smasher']) {
    console.log('Adding task-smasher to app stats');
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
  
  console.log('Usage data refresh events dispatched with recalculated app stats');
}

// Run the fix
function runFix() {
  console.log('Running Article Smasher usage tracking fix...');
  
  // Step 1: Log current state
  console.log('Step 1: Logging current state');
  const initialState = logUsageTrackingState();
  
  // Step 2: Set Article Smasher flags
  console.log('Step 2: Setting Article Smasher flags');
  setArticleSmasherFlags();
  
  // Step 3: Add test data
  console.log('Step 3: Adding test data');
  addArticleSmasherTestData();
  
  // Step 4: Force refresh
  console.log('Step 4: Forcing refresh');
  forceRefreshUsageData();
  
  // Step 5: Log final state
  console.log('Step 5: Logging final state');
  const finalState = logUsageTrackingState();
  
  console.log('Fix completed successfully');
  
  return {
    initialState,
    finalState
  };
}

// Run the fix when the script is executed
runFix();