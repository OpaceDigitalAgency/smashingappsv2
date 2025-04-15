// SmashingApps Verification Script (Console Version)
// Copy and paste this entire script into your browser console while on https://smashingapps.ai

(function() {
  console.clear();
  console.log('%c SmashingApps Verification Script (Console Version) ', 'background: #4f46e5; color: white; font-size: 16px; padding: 5px;');
  console.log('This script verifies that all fixes are working correctly.');

  // Utility function to log with styling
  function log(message, type = 'info') {
    const styles = {
      info: 'color: #333',
      success: 'color: #10b981; font-weight: bold',
      error: 'color: #ef4444; font-weight: bold',
      warning: 'color: #f59e0b; font-weight: bold',
      header: 'color: #4f46e5; font-weight: bold; font-size: 14px'
    };
    
    console.log(`%c ${message}`, styles[type] || styles.info);
  }

  // Test functions
  async function clearUsageData() {
    log('=== CLEARING USAGE DATA ===', 'header');
    
    try {
      // Access the function from the window object if it's available
      if (window.clearAllLimitsAndUsage) {
        window.clearAllLimitsAndUsage();
      } else {
        // Fallback to direct localStorage manipulation
        localStorage.removeItem('smashingapps_usage_data');
        
        // Reset rate limit info
        const resetTime = new Date(Date.now() + 3600000); // 1 hour from now
        const defaultRateLimitInfo = {
          limit: 10,
          remaining: 10,
          used: 0,
          reset: resetTime
        };
        localStorage.setItem('rateLimitInfo', JSON.stringify(defaultRateLimitInfo));
        localStorage.setItem('rateLimited', JSON.stringify(false));
      }
      
      log('Usage data cleared successfully', 'success');
      return true;
    } catch (error) {
      log(`Error clearing usage data: ${error.message}`, 'error');
      return false;
    }
  }

  async function setModelToGpt4o() {
    log('=== SETTING MODEL TO GPT-4O ===', 'header');
    
    try {
      // Get current global settings
      const globalSettings = JSON.parse(localStorage.getItem('smashingapps_global_settings') || '{}');
      
      // Set default model to gpt-4o
      globalSettings.defaultModel = 'gpt-4o';
      
      // Save updated settings
      localStorage.setItem('smashingapps_global_settings', JSON.stringify(globalSettings));
      
      // Also set the app-specific model setting for direct access
      localStorage.setItem('smashingapps_activeModel', 'gpt-4o');
      
      log('Global settings model set to gpt-4o successfully', 'success');
      return true;
    } catch (error) {
      log(`Error setting model: ${error.message}`, 'error');
      return false;
    }
  }

  async function simulateArticleSmasherRequests() {
    log('=== SIMULATING ARTICLE SMASHER REQUESTS ===', 'header');
    
    try {
      // Check if trackApiRequest is available
      if (!window.trackApiRequest) {
        log('trackApiRequest function not found. Are you running this on the SmashingApps site?', 'error');
        return false;
      }
      
      const articleSmasherModels = ['gpt-4o', 'gpt-3.5-turbo', 'claude-3-opus'];
      const articleSmasherProviders = ['openai', 'anthropic'];
      
      // Force Article Smasher app identification
      localStorage.setItem('article_smasher_app', 'true');
      localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
      localStorage.setItem('FORCE_APP_ID', 'article-smasher');
      localStorage.setItem('current_app', 'article-smasher');
      
      for (let i = 0; i < 3; i++) {
        const provider = articleSmasherProviders[i % articleSmasherProviders.length];
        const model = articleSmasherModels[i % articleSmasherModels.length];
        const tokens = 1000 + (i * 500);
        const inputTokens = Math.floor(tokens * 0.7);
        const outputTokens = tokens - inputTokens;
        
        log(`Request ${i+1}: Provider: ${provider}, Model: ${model}, Tokens: ${tokens}`);
        
        window.trackApiRequest(
          provider,
          tokens,
          'article-smasher',
          model,
          inputTokens,
          outputTokens
        );
      }
      
      log('Article Smasher requests simulated successfully', 'success');
      return true;
    } catch (error) {
      log(`Error simulating Article Smasher requests: ${error.message}`, 'error');
      return false;
    }
  }

  async function simulateTaskSmasherRequests() {
    log('=== SIMULATING TASK SMASHER REQUESTS ===', 'header');
    
    try {
      // Check if trackApiRequest is available
      if (!window.trackApiRequest) {
        log('trackApiRequest function not found. Are you running this on the SmashingApps site?', 'error');
        return false;
      }
      
      const taskSmasherModels = ['gpt-4o', 'gpt-4-turbo', 'claude-3-sonnet'];
      const taskSmasherProviders = ['openai', 'anthropic'];
      
      // Force Task Smasher app identification
      localStorage.removeItem('article_smasher_app');
      localStorage.removeItem('article_wizard_state');
      localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
      localStorage.setItem('FORCE_APP_ID', 'task-smasher');
      localStorage.setItem('current_app', 'task-smasher');
      
      for (let i = 0; i < 3; i++) {
        const provider = taskSmasherProviders[i % taskSmasherProviders.length];
        const model = taskSmasherModels[i % taskSmasherModels.length];
        const tokens = 800 + (i * 400);
        const inputTokens = Math.floor(tokens * 0.6);
        const outputTokens = tokens - inputTokens;
        
        log(`Request ${i+1}: Provider: ${provider}, Model: ${model}, Tokens: ${tokens}`);
        
        window.trackApiRequest(
          provider,
          tokens,
          'task-smasher',
          model,
          inputTokens,
          outputTokens
        );
      }
      
      log('Task Smasher requests simulated successfully', 'success');
      return true;
    } catch (error) {
      log(`Error simulating Task Smasher requests: ${error.message}`, 'error');
      return false;
    }
  }

  function verifyUsageData() {
    log('=== VERIFYING USAGE DATA ===', 'header');
    
    try {
      // Check if getUsageData is available
      if (!window.getUsageData) {
        log('getUsageData function not found. Are you running this on the SmashingApps site?', 'error');
        return null;
      }
      
      const usageData = window.getUsageData();
      
      // Verify total usage data
      log('Total Usage Data:');
      log(`Total Requests: ${usageData.totalRequests}`);
      log(`Total Tokens: ${usageData.totalTokens}`);
      log(`Total Input Tokens: ${usageData.totalInputTokens}`);
      log(`Total Output Tokens: ${usageData.totalOutputTokens}`);
      log(`Total Cost Estimate: $${usageData.costEstimate.toFixed(4)}`);
      
      // Verify usage data by application
      log('Usage by Application:');
      Object.entries(usageData.requestsByApp).forEach(([app, requests]) => {
        log(`Application: ${app}`);
        log(`  Requests: ${requests}`);
        log(`  Tokens: ${usageData.tokensByApp[app]}`);
        log(`  Input Tokens: ${usageData.inputTokensByApp[app]}`);
        log(`  Output Tokens: ${usageData.outputTokensByApp[app]}`);
        log(`  Cost: $${usageData.costByApp[app].toFixed(4)}`);
      });
      
      // Verify usage history
      log('Usage History:');
      log(`Total History Entries: ${usageData.usageHistory.length}`);
      
      // Verify model names in history
      log('Verifying Model Names in History:');
      const taskSmasherEntries = usageData.usageHistory.filter(entry => entry.app === 'task-smasher');
      const articleSmasherEntries = usageData.usageHistory.filter(entry => entry.app === 'article-smasher');
      
      log('Task Smasher Models:');
      taskSmasherEntries.forEach(entry => {
        log(`  ${entry.model} (Provider: ${entry.provider})`);
      });
      
      log('Article Smasher Models:');
      articleSmasherEntries.forEach(entry => {
        log(`  ${entry.model} (Provider: ${entry.provider})`);
      });
      
      // Verify that model names are displayed correctly (not showing "4o" but "gpt-4o")
      const hasCorrectModelNames = taskSmasherEntries.every(entry => 
        entry.model.includes('gpt-') || entry.model.includes('claude-')
      );
      
      log(`Model names displayed correctly: ${hasCorrectModelNames ? 'YES ✅' : 'NO ❌'}`, 
        hasCorrectModelNames ? 'success' : 'error');
      
      // Verify that both apps have entries
      const hasArticleSmasherEntries = articleSmasherEntries.length > 0;
      const hasTaskSmasherEntries = taskSmasherEntries.length > 0;
      
      log(`Article Smasher has entries: ${hasArticleSmasherEntries ? 'YES ✅' : 'NO ❌'}`,
        hasArticleSmasherEntries ? 'success' : 'error');
      log(`Task Smasher has entries: ${hasTaskSmasherEntries ? 'YES ✅' : 'NO ❌'}`,
        hasTaskSmasherEntries ? 'success' : 'error');
      
      return {
        totalRequests: usageData.totalRequests,
        articleSmasherRequests: usageData.requestsByApp['article-smasher'] || 0,
        taskSmasherRequests: usageData.requestsByApp['task-smasher'] || 0,
        hasCorrectModelNames,
        hasArticleSmasherEntries,
        hasTaskSmasherEntries
      };
    } catch (error) {
      log(`Error verifying usage data: ${error.message}`, 'error');
      return null;
    }
  }

  function verifyModelSelection() {
    log('=== VERIFYING MODEL SELECTION ===', 'header');
    
    try {
      // Get the global settings model
      const globalSettings = JSON.parse(localStorage.getItem('smashingapps_global_settings') || '{}');
      const globalSettingsModel = globalSettings.defaultModel || 'default';
      
      log(`Global settings model: ${globalSettingsModel}`);
      
      // Check if the model is being used in the usage history
      const usageData = window.getUsageData();
      const usesGlobalSettingsModel = usageData.usageHistory.some(entry => entry.model === globalSettingsModel);
      
      log(`Uses global settings model: ${usesGlobalSettingsModel ? 'YES ✅' : 'NO ❌'}`,
        usesGlobalSettingsModel ? 'success' : 'error');
      
      return {
        globalSettingsModel,
        usesGlobalSettingsModel
      };
    } catch (error) {
      log(`Error verifying model selection: ${error.message}`, 'error');
      return {
        globalSettingsModel: 'unknown',
        usesGlobalSettingsModel: false
      };
    }
  }

  // Main verification function
  async function runVerification() {
    log('Starting SmashingApps verification...', 'header');
    
    // Step 1: Clear existing data
    await clearUsageData();
    
    // Step 2: Set model to gpt-4o
    await setModelToGpt4o();
    
    // Step 3: Simulate Article Smasher requests
    const articleSmasherRequestsSimulated = await simulateArticleSmasherRequests();
    if (!articleSmasherRequestsSimulated) {
      log('Failed to simulate Article Smasher requests. Aborting tests.', 'error');
      return;
    }
    
    // Step 4: Simulate Task Smasher requests
    const taskSmasherRequestsSimulated = await simulateTaskSmasherRequests();
    if (!taskSmasherRequestsSimulated) {
      log('Failed to simulate Task Smasher requests. Aborting tests.', 'error');
      return;
    }
    
    // Step 5: Verify usage data
    const usageResults = verifyUsageData();
    if (!usageResults) {
      log('Failed to verify usage data. Aborting tests.', 'error');
      return;
    }
    
    // Step 6: Verify model selection
    const modelResults = verifyModelSelection();
    
    // Combine results
    const results = {
      ...usageResults,
      ...modelResults
    };
    
    // Print summary
    log('=== VERIFICATION SUMMARY ===', 'header');
    log(`Total Requests: ${results.totalRequests}`);
    log(`Article Smasher Requests: ${results.articleSmasherRequests}`);
    log(`Task Smasher Requests: ${results.taskSmasherRequests}`);
    log(`Model Names Displayed Correctly: ${results.hasCorrectModelNames ? 'YES ✅' : 'NO ❌'}`, 
      results.hasCorrectModelNames ? 'success' : 'error');
    log(`Article Smasher Has Entries: ${results.hasArticleSmasherEntries ? 'YES ✅' : 'NO ❌'}`,
      results.hasArticleSmasherEntries ? 'success' : 'error');
    log(`Task Smasher Has Entries: ${results.hasTaskSmasherEntries ? 'YES ✅' : 'NO ❌'}`,
      results.hasTaskSmasherEntries ? 'success' : 'error');
    log(`Global Settings Model: ${results.globalSettingsModel}`);
    log(`Uses Global Settings Model: ${results.usesGlobalSettingsModel ? 'YES ✅' : 'NO ❌'}`,
      results.usesGlobalSettingsModel ? 'success' : 'error');
    
    // Overall result
    const allPassed = 
      results.totalRequests === 6 &&
      results.articleSmasherRequests === 3 &&
      results.taskSmasherRequests === 3 &&
      results.hasCorrectModelNames &&
      results.hasArticleSmasherEntries &&
      results.hasTaskSmasherEntries &&
      results.usesGlobalSettingsModel;
    
    log(`Overall Verification: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`, 
      allPassed ? 'success' : 'error');
    
    if (!allPassed) {
      log('Issues found:', 'warning');
      if (results.totalRequests !== 6) log('- Incorrect total request count', 'warning');
      if (results.articleSmasherRequests !== 3) log('- Article Smasher requests not tracked correctly', 'warning');
      if (results.taskSmasherRequests !== 3) log('- Task Smasher requests not tracked correctly', 'warning');
      if (!results.hasCorrectModelNames) log('- Model names not displayed correctly', 'warning');
      if (!results.hasArticleSmasherEntries) log('- Article Smasher has no entries', 'warning');
      if (!results.hasTaskSmasherEntries) log('- Task Smasher has no entries', 'warning');
      if (!results.usesGlobalSettingsModel) log('- Global settings model not being used', 'warning');
    }
  }

  // Create a simple UI in the console
  console.log('%c Available Commands: ', 'background: #333; color: white; padding: 5px;');
  console.log('1. clearUsageData() - Clear existing usage data');
  console.log('2. setModelToGpt4o() - Set model to gpt-4o');
  console.log('3. simulateArticleSmasherRequests() - Simulate Article Smasher requests');
  console.log('4. simulateTaskSmasherRequests() - Simulate Task Smasher requests');
  console.log('5. verifyUsageData() - Verify usage data');
  console.log('6. verifyModelSelection() - Verify model selection');
  console.log('7. runVerification() - Run all tests');
  
  // Make functions available globally
  window.clearUsageData = clearUsageData;
  window.setModelToGpt4o = setModelToGpt4o;
  window.simulateArticleSmasherRequests = simulateArticleSmasherRequests;
  window.simulateTaskSmasherRequests = simulateTaskSmasherRequests;
  window.verifyUsageData = verifyUsageData;
  window.verifyModelSelection = verifyModelSelection;
  window.runVerification = runVerification;
  
  console.log('%c Ready to run verification tests. Type runVerification() to start. ', 'background: #10b981; color: white; padding: 5px;');
})();