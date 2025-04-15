/**
 * SmashingApps Verification Script
 * 
 * This script verifies that all fixes for the SmashingApps application are working correctly:
 * 1. Article Smasher usage data tracking and display
 * 2. Task Smasher usage data tracking and display
 * 3. Correct model name display for Task Smasher
 * 4. Admin settings persistence
 */

// Import required modules
const { trackApiRequest, getUsageData, clearAllLimitsAndUsage } = require('./src/shared/services/usageTrackingService');
const { AIProvider } = require('./src/shared/types/aiProviders');

// Clear existing usage data to start with a clean slate
console.log('Clearing existing usage data...');
clearAllLimitsAndUsage();

// Simulate API requests for both applications
async function simulateRequests() {
  console.log('\n=== SIMULATING API REQUESTS ===');
  
  // Simulate Article Smasher requests
  console.log('\nSimulating Article Smasher requests...');
  const articleSmasherModels = ['gpt-4o', 'gpt-3.5-turbo', 'claude-3-opus'];
  const articleSmasherProviders = ['openai', 'anthropic'];
  
  for (let i = 0; i < 3; i++) {
    const provider = articleSmasherProviders[i % articleSmasherProviders.length];
    const model = articleSmasherModels[i % articleSmasherModels.length];
    const tokens = 1000 + (i * 500);
    const inputTokens = Math.floor(tokens * 0.7);
    const outputTokens = tokens - inputTokens;
    
    console.log(`Request ${i+1}: Provider: ${provider}, Model: ${model}, Tokens: ${tokens}`);
    trackApiRequest(
      provider,
      tokens,
      'article-smasher',
      model,
      inputTokens,
      outputTokens
    );
  }
  
  // Simulate Task Smasher requests
  console.log('\nSimulating Task Smasher requests...');
  const taskSmasherModels = ['gpt-4o', 'gpt-4-turbo', 'claude-3-sonnet'];
  const taskSmasherProviders = ['openai', 'anthropic'];
  
  for (let i = 0; i < 3; i++) {
    const provider = taskSmasherProviders[i % taskSmasherProviders.length];
    const model = taskSmasherModels[i % taskSmasherModels.length];
    const tokens = 800 + (i * 400);
    const inputTokens = Math.floor(tokens * 0.6);
    const outputTokens = tokens - inputTokens;
    
    console.log(`Request ${i+1}: Provider: ${provider}, Model: ${model}, Tokens: ${tokens}`);
    trackApiRequest(
      provider,
      tokens,
      'task-smasher',
      model,
      inputTokens,
      outputTokens
    );
  }
}

// Verify usage data is correctly tracked and displayed
function verifyUsageData() {
  console.log('\n=== VERIFYING USAGE DATA ===');
  
  const usageData = getUsageData();
  
  // Verify total usage data
  console.log('\nTotal Usage Data:');
  console.log(`Total Requests: ${usageData.totalRequests}`);
  console.log(`Total Tokens: ${usageData.totalTokens}`);
  console.log(`Total Input Tokens: ${usageData.totalInputTokens}`);
  console.log(`Total Output Tokens: ${usageData.totalOutputTokens}`);
  console.log(`Total Cost Estimate: $${usageData.costEstimate.toFixed(4)}`);
  
  // Verify usage data by provider
  console.log('\nUsage by Provider:');
  Object.entries(usageData.requestsByProvider).forEach(([provider, requests]) => {
    console.log(`Provider: ${provider}`);
    console.log(`  Requests: ${requests}`);
    console.log(`  Tokens: ${usageData.tokensByProvider[provider]}`);
    console.log(`  Input Tokens: ${usageData.inputTokensByProvider[provider]}`);
    console.log(`  Output Tokens: ${usageData.outputTokensByProvider[provider]}`);
    console.log(`  Cost: $${usageData.costByProvider[provider].toFixed(4)}`);
  });
  
  // Verify usage data by application
  console.log('\nUsage by Application:');
  Object.entries(usageData.requestsByApp).forEach(([app, requests]) => {
    console.log(`Application: ${app}`);
    console.log(`  Requests: ${requests}`);
    console.log(`  Tokens: ${usageData.tokensByApp[app]}`);
    console.log(`  Input Tokens: ${usageData.inputTokensByApp[app]}`);
    console.log(`  Output Tokens: ${usageData.outputTokensByApp[app]}`);
    console.log(`  Cost: $${usageData.costByApp[app].toFixed(4)}`);
  });
  
  // Verify usage history
  console.log('\nUsage History:');
  console.log(`Total History Entries: ${usageData.usageHistory.length}`);
  
  // Verify model names in history
  console.log('\nVerifying Model Names in History:');
  const taskSmasherEntries = usageData.usageHistory.filter(entry => entry.app === 'task-smasher');
  const articleSmasherEntries = usageData.usageHistory.filter(entry => entry.app === 'article-smasher');
  
  console.log('\nTask Smasher Models:');
  taskSmasherEntries.forEach(entry => {
    console.log(`  ${entry.model} (Provider: ${entry.provider})`);
  });
  
  console.log('\nArticle Smasher Models:');
  articleSmasherEntries.forEach(entry => {
    console.log(`  ${entry.model} (Provider: ${entry.provider})`);
  });
  
  // Verify that model names are displayed correctly (not showing "4o" but "gpt-4o")
  const hasCorrectModelNames = taskSmasherEntries.every(entry => 
    entry.model.includes('gpt-') || entry.model.includes('claude-')
  );
  
  console.log(`\nModel names displayed correctly: ${hasCorrectModelNames ? 'YES ✅' : 'NO ❌'}`);
  
  return {
    totalRequests: usageData.totalRequests,
    articleSmasherRequests: usageData.requestsByApp['article-smasher'] || 0,
    taskSmasherRequests: usageData.requestsByApp['task-smasher'] || 0,
    hasCorrectModelNames
  };
}

// Verify admin settings persistence
function verifyAdminSettings() {
  console.log('\n=== VERIFYING ADMIN SETTINGS PERSISTENCE ===');
  
  // Note: This would typically involve browser interaction to test the UI
  // For this script, we'll just check if the settings are stored in localStorage
  
  const globalSettings = localStorage.getItem('smashingapps_global_settings');
  console.log(`Global settings found in localStorage: ${globalSettings ? 'YES ✅' : 'NO ❌'}`);
  
  if (globalSettings) {
    try {
      const parsedSettings = JSON.parse(globalSettings);
      console.log('Global settings content:', parsedSettings);
    } catch (error) {
      console.error('Error parsing global settings:', error);
    }
  }
  
  return {
    settingsFound: !!globalSettings
  };
}

// Run the verification
async function runVerification() {
  console.log('Starting SmashingApps verification...');
  
  // Step 1: Simulate API requests
  await simulateRequests();
  
  // Step 2: Verify usage data
  const usageResults = verifyUsageData();
  
  // Step 3: Verify admin settings
  const settingsResults = verifyAdminSettings();
  
  // Print summary
  console.log('\n=== VERIFICATION SUMMARY ===');
  console.log(`Total Requests: ${usageResults.totalRequests}`);
  console.log(`Article Smasher Requests: ${usageResults.articleSmasherRequests}`);
  console.log(`Task Smasher Requests: ${usageResults.taskSmasherRequests}`);
  console.log(`Model Names Displayed Correctly: ${usageResults.hasCorrectModelNames ? 'YES ✅' : 'NO ❌'}`);
  console.log(`Admin Settings Persistence: ${settingsResults.settingsFound ? 'YES ✅' : 'NO ❌'}`);
  
  // Overall result
  const allPassed = 
    usageResults.totalRequests === 6 &&
    usageResults.articleSmasherRequests === 3 &&
    usageResults.taskSmasherRequests === 3 &&
    usageResults.hasCorrectModelNames &&
    settingsResults.settingsFound;
  
  console.log(`\nOverall Verification: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`);
  
  if (!allPassed) {
    console.log('\nIssues found:');
    if (usageResults.totalRequests !== 6) console.log('- Incorrect total request count');
    if (usageResults.articleSmasherRequests !== 3) console.log('- Article Smasher requests not tracked correctly');
    if (usageResults.taskSmasherRequests !== 3) console.log('- Task Smasher requests not tracked correctly');
    if (!usageResults.hasCorrectModelNames) console.log('- Model names not displayed correctly');
    if (!settingsResults.settingsFound) console.log('- Admin settings not persisted');
  }
}

// Execute the verification
runVerification().catch(error => {
  console.error('Verification failed with error:', error);
});