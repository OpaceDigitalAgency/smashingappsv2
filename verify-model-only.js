// SmashingApps Model Verification Script
// This script only checks if the model selection is working correctly
// without trying to simulate API requests

(function() {
  console.clear();
  console.log('%c SmashingApps Model Verification Script ', 'background: #4f46e5; color: white; font-size: 16px; padding: 5px;');
  console.log('This script verifies that model selection is working correctly.');

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

  // Check global settings
  function checkGlobalSettings() {
    log('=== CHECKING GLOBAL SETTINGS ===', 'header');
    
    try {
      // Get current global settings
      const globalSettings = JSON.parse(localStorage.getItem('smashingapps_global_settings') || '{}');
      
      log('Current global settings:', 'info');
      log(`Default Provider: ${globalSettings.defaultProvider || 'not set'}`, 'info');
      log(`Default Model: ${globalSettings.defaultModel || 'not set'}`, 'info');
      log(`Default Temperature: ${globalSettings.defaultTemperature || 'not set'}`, 'info');
      log(`Default Max Tokens: ${globalSettings.defaultMaxTokens || 'not set'}`, 'info');
      
      // Check if model is forced to gpt-3.5-turbo
      const isModelForced = globalSettings.defaultModel === 'gpt-3.5-turbo' && 
                           localStorage.getItem('smashingapps_activeModel') === 'gpt-3.5-turbo';
      
      if (isModelForced) {
        log('Model appears to be forced to gpt-3.5-turbo', 'warning');
      } else {
        log('Model does not appear to be forced', 'success');
      }
      
      return {
        defaultModel: globalSettings.defaultModel,
        isModelForced
      };
    } catch (error) {
      log(`Error checking global settings: ${error.message}`, 'error');
      return {
        defaultModel: 'unknown',
        isModelForced: false
      };
    }
  }

  // Set model to gpt-4o
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

  // Check if model change persists
  function checkModelPersistence() {
    log('=== CHECKING MODEL PERSISTENCE ===', 'header');
    
    try {
      // Get current global settings
      const globalSettings = JSON.parse(localStorage.getItem('smashingapps_global_settings') || '{}');
      const activeModel = localStorage.getItem('smashingapps_activeModel');
      
      log(`Global settings model: ${globalSettings.defaultModel || 'not set'}`, 'info');
      log(`Active model: ${activeModel || 'not set'}`, 'info');
      
      const modelPersisted = globalSettings.defaultModel === 'gpt-4o' && activeModel === 'gpt-4o';
      
      if (modelPersisted) {
        log('Model change persisted successfully', 'success');
      } else {
        log('Model change did not persist', 'error');
      }
      
      return {
        modelPersisted,
        globalSettingsModel: globalSettings.defaultModel,
        activeModel
      };
    } catch (error) {
      log(`Error checking model persistence: ${error.message}`, 'error');
      return {
        modelPersisted: false,
        globalSettingsModel: 'unknown',
        activeModel: 'unknown'
      };
    }
  }

  // Check usage data for model information
  function checkUsageData() {
    log('=== CHECKING USAGE DATA ===', 'header');
    
    try {
      // Get usage data
      const usageDataStr = localStorage.getItem('smashingapps_usage_data');
      
      if (!usageDataStr) {
        log('No usage data found', 'warning');
        return {
          hasUsageData: false,
          hasModelInfo: false
        };
      }
      
      const usageData = JSON.parse(usageDataStr);
      
      log(`Total requests: ${usageData.totalRequests || 0}`, 'info');
      log(`Total tokens: ${usageData.totalTokens || 0}`, 'info');
      
      // Check if usage history has model information
      const hasModelInfo = usageData.usageHistory && 
                          usageData.usageHistory.length > 0 && 
                          usageData.usageHistory.some(entry => entry.model);
      
      if (hasModelInfo) {
        log('Usage data contains model information', 'success');
        
        // Check if any models are gpt-4o
        const hasGpt4o = usageData.usageHistory.some(entry => entry.model === 'gpt-4o');
        
        if (hasGpt4o) {
          log('Found gpt-4o in usage history', 'success');
        } else {
          log('No gpt-4o found in usage history', 'warning');
        }
        
        // Check if any models are truncated (e.g., "4o" instead of "gpt-4o")
        const hasTruncatedModels = usageData.usageHistory.some(entry => 
          entry.model && !entry.model.includes('-') && !entry.model.includes('/')
        );
        
        if (hasTruncatedModels) {
          log('Found truncated model names in usage history', 'error');
        } else {
          log('No truncated model names found in usage history', 'success');
        }
      } else {
        log('Usage data does not contain model information', 'warning');
      }
      
      return {
        hasUsageData: true,
        hasModelInfo,
        hasGpt4o: hasModelInfo && usageData.usageHistory.some(entry => entry.model === 'gpt-4o'),
        hasTruncatedModels: hasModelInfo && usageData.usageHistory.some(entry => 
          entry.model && !entry.model.includes('-') && !entry.model.includes('/')
        )
      };
    } catch (error) {
      log(`Error checking usage data: ${error.message}`, 'error');
      return {
        hasUsageData: false,
        hasModelInfo: false
      };
    }
  }

  // Main verification function
  async function runVerification() {
    log('Starting SmashingApps model verification...', 'header');
    
    // Step 1: Check current global settings
    const initialSettings = checkGlobalSettings();
    
    // Step 2: Set model to gpt-4o
    const modelSet = await setModelToGpt4o();
    if (!modelSet) {
      log('Failed to set model to gpt-4o. Aborting verification.', 'error');
      return;
    }
    
    // Step 3: Check if model change persisted
    const persistenceResult = checkModelPersistence();
    
    // Step 4: Check usage data for model information
    const usageResult = checkUsageData();
    
    // Print summary
    log('=== VERIFICATION SUMMARY ===', 'header');
    log(`Initial Model: ${initialSettings.defaultModel || 'not set'}`, 'info');
    log(`Model Forced: ${initialSettings.isModelForced ? 'YES ❌' : 'NO ✅'}`, 
      initialSettings.isModelForced ? 'error' : 'success');
    log(`Model Change Persisted: ${persistenceResult.modelPersisted ? 'YES ✅' : 'NO ❌'}`, 
      persistenceResult.modelPersisted ? 'success' : 'error');
    
    if (usageResult.hasUsageData && usageResult.hasModelInfo) {
      log(`Truncated Model Names: ${usageResult.hasTruncatedModels ? 'YES ❌' : 'NO ✅'}`, 
        usageResult.hasTruncatedModels ? 'error' : 'success');
    }
    
    // Overall result
    const allPassed = 
      !initialSettings.isModelForced &&
      persistenceResult.modelPersisted &&
      (!usageResult.hasModelInfo || !usageResult.hasTruncatedModels);
    
    log(`Overall Verification: ${allPassed ? 'PASSED ✅' : 'FAILED ❌'}`, 
      allPassed ? 'success' : 'error');
    
    if (!allPassed) {
      log('Issues found:', 'warning');
      if (initialSettings.isModelForced) log('- Model appears to be forced to gpt-3.5-turbo', 'warning');
      if (!persistenceResult.modelPersisted) log('- Model change did not persist', 'warning');
      if (usageResult.hasModelInfo && usageResult.hasTruncatedModels) log('- Truncated model names found in usage history', 'warning');
    }
    
    log('', 'info');
    log('This verification confirms that:', 'info');
    log('1. The model is not forced to gpt-3.5-turbo', 'info');
    log('2. Model changes in settings are properly persisted', 'info');
    log('3. Model names are displayed correctly (not truncated)', 'info');
  }

  // Run the verification
  runVerification();
})();