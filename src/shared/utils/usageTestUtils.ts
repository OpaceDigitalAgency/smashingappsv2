import { AIProvider } from '../types/aiProviders';
import { trackApiRequest } from '../services/usageTrackingService';

/**
 * Generate sample usage data for testing
 * 
 * This utility function generates random usage data for testing the usage monitoring
 * dashboard. It creates usage entries for different providers and applications over
 * a specified time period.
 */
export function generateSampleUsageData(
  days: number = 30,
  entriesPerDay: number = 10
): void {
  const now = Date.now();
  const providers: AIProvider[] = ['openai', 'anthropic', 'google', 'openrouter', 'image'];
  const apps = ['task-smasher', 'article-smasher'];
  const models = {
    'openai': ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    'anthropic': ['claude-2', 'claude-instant'],
    'google': ['gemini-pro', 'gemini-ultra'],
    'openrouter': ['openai/gpt-3.5-turbo', 'anthropic/claude-2'],
    'image': ['dall-e-3', 'stable-diffusion']
  };
  
  // Generate data for each day
  for (let day = 0; day < days; day++) {
    const dayTimestamp = now - (day * 24 * 60 * 60 * 1000);
    
    // Generate multiple entries per day
    for (let entry = 0; entry < entriesPerDay; entry++) {
      // Randomly select provider, app, and model
      const provider = providers[Math.floor(Math.random() * providers.length)];
      const app = apps[Math.floor(Math.random() * apps.length)];
      const providerModels = models[provider] || models['openai'];
      const model = providerModels[Math.floor(Math.random() * providerModels.length)];
      
      // Generate random token count (between 100 and 5000)
      const tokens = Math.floor(Math.random() * 4900) + 100;
      
      // Create a timestamp within the day
      const entryTimestamp = dayTimestamp - (Math.floor(Math.random() * 24 * 60 * 60 * 1000));
      
      // Track the usage
      trackApiRequest(
        provider,
        tokens,
        app,
        model,
        new Date(entryTimestamp) // Override the timestamp for testing
      );
    }
  }
  
  console.log(`Generated sample usage data: ${days} days, ${entriesPerDay} entries per day`);
}

/**
 * Clear all usage data
 */
export function clearAllUsageData(): void {
  localStorage.removeItem('smashingapps_usage_data');
  window.dispatchEvent(new CustomEvent('usage-data-updated'));
  console.log('All usage data cleared');
}