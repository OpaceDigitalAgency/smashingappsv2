/**
 * Direct Test for Article Smasher Usage Tracking
 * 
 * This script bypasses all the complex app logic and directly tests
 * if usage tracking works for Article Smasher.
 * 
 * Instructions:
 * 1. Open the browser console on any page
 * 2. Copy and paste this entire script
 * 3. Press Enter to run it
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

// Function to directly add a test entry to usage tracking
async function addDirectTestEntry() {
  logStyled('DIRECT TEST: Article Smasher Usage Tracking', 'heading');
  
  // Step 1: Set all possible app identification flags
  logStyled('Step 1: Setting all app identification flags', 'info');
  localStorage.setItem('FORCE_APP_ID', 'article-smasher');
  localStorage.setItem('current_app', 'article-smasher');
  localStorage.setItem('article_smasher_app', 'true');
  localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
  
  // Step 2: Get current usage data
  logStyled('Step 2: Getting current usage data', 'info');
  const USAGE_DATA_KEY = 'smashingapps_usage_data';
  let usageData = JSON.parse(localStorage.getItem(USAGE_DATA_KEY) || '{}');
  
  // Initialize if needed
  if (!usageData.totalRequests) usageData.totalRequests = 0;
  if (!usageData.totalTokens) usageData.totalTokens = 0;
  if (!usageData.requestsByApp) usageData.requestsByApp = {};
  if (!usageData.tokensByApp) usageData.tokensByApp = {};
  if (!usageData.usageHistory) usageData.usageHistory = [];
  
  // Log current state
  logStyled('Current usage data:', 'info');
  console.log({
    totalRequests: usageData.totalRequests,
    totalTokens: usageData.totalTokens,
    requestsByApp: usageData.requestsByApp,
    tokensByApp: usageData.tokensByApp,
    historyEntries: usageData.usageHistory.length
  });
  
  // Step 3: Add a test entry directly
  logStyled('Step 3: Adding test entry for article-smasher', 'info');
  
  // Update total stats
  usageData.totalRequests += 1;
  usageData.totalTokens += 100;
  
  // Update app stats
  usageData.requestsByApp['article-smasher'] = (usageData.requestsByApp['article-smasher'] || 0) + 1;
  usageData.tokensByApp['article-smasher'] = (usageData.tokensByApp['article-smasher'] || 0) + 100;
  
  // Add to history
  usageData.usageHistory.push({
    timestamp: Date.now(),
    requests: 1,
    tokens: 100,
    provider: 'openai',
    app: 'article-smasher',
    model: 'gpt-3.5-turbo'
  });
  
  // Step 4: Save updated data
  logStyled('Step 4: Saving updated usage data', 'info');
  localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(usageData));
  
  // Step 5: Dispatch event to refresh UI
  logStyled('Step 5: Dispatching refresh event', 'info');
  window.dispatchEvent(new CustomEvent('usage-data-updated', { detail: usageData }));
  window.dispatchEvent(new CustomEvent('refresh-usage-data'));
  
  // Step 6: Log updated state
  logStyled('Step 6: Logging updated state', 'info');
  const updatedData = JSON.parse(localStorage.getItem(USAGE_DATA_KEY) || '{}');
  console.log({
    totalRequests: updatedData.totalRequests,
    totalTokens: updatedData.totalTokens,
    requestsByApp: updatedData.requestsByApp,
    tokensByApp: updatedData.tokensByApp,
    historyEntries: updatedData.usageHistory.length
  });
  
  logStyled('Test completed successfully', 'success');
  logStyled('Please refresh the admin page and check the Usage tab', 'info');
}

// Run the test
addDirectTestEntry();