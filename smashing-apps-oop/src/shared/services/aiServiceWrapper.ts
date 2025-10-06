import { AIService } from './AIService';
import { 
  AIProvider, 
  TextCompletionOptions, 
  ChatCompletionOptions, 
  ImageGenerationOptions,
  TextCompletionResponse,
  ChatCompletionResponse,
  ImageGenerationResponse,
  AIResponse
} from '../types/aiProviders';
import { trackApiRequest } from './usageTrackingService';

/**
 * Wraps an AIService to track usage data
 */
export function wrapAIService(service: AIService, appId: string): AIService {
  // Ensure we have a valid app ID
  if (!appId || appId === 'unknown-app') {
    console.warn('[DEBUG] Wrapping service with invalid app ID:', appId);
    
    // Try to determine app ID from localStorage flags in priority order
    // 1. FORCE_APP_ID has highest priority
    const forcedAppId = localStorage.getItem('FORCE_APP_ID');
    if (forcedAppId) {
      console.log(`[DEBUG] Found FORCE_APP_ID, using ${forcedAppId} as app ID`);
      appId = forcedAppId;
    }
    // 2. current_app has second priority
    else if (localStorage.getItem('current_app')) {
      appId = localStorage.getItem('current_app') || 'unknown-app';
      console.log(`[DEBUG] Found current_app, using ${appId} as app ID`);
    }
    // 3. App-specific flags have third priority
    else if (localStorage.getItem('article_smasher_app') ||
             localStorage.getItem('article_wizard_state') ||
             window.location.pathname.includes('article-smasher')) {
      console.log('[DEBUG] Found ArticleSmasher indicators, using article-smasher as app ID');
      appId = 'article-smasher';
    } else if (localStorage.getItem('task_list_state') ||
               window.location.pathname.includes('task-smasher')) {
      console.log('[DEBUG] Found TaskSmasher indicators, using task-smasher as app ID');
      appId = 'task-smasher';
    }
  }
  
  console.log(`[DEBUG] Wrapping AI service for app: ${appId}`);
  const originalCreateTextCompletion = service.createTextCompletion.bind(service);
  const originalCreateChatCompletion = service.createChatCompletion.bind(service);
  const originalCreateImage = service.createImage?.bind(service);

  // Override createTextCompletion to track usage
  service.createTextCompletion = async (options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>> => {
    // Double-check app ID before making the request
    let currentAppId = appId;
    
    // Check for forced app ID in localStorage
    const forcedAppId = localStorage.getItem('FORCE_APP_ID');
    if (forcedAppId) {
      console.log(`[DEBUG] Using forced app ID from FORCE_APP_ID for text completion: ${forcedAppId}`);
      currentAppId = forcedAppId;
    }
    
    const response = await originalCreateTextCompletion(options);
    
    // Track the usage regardless of success
    const tokensUsed = response.data.usage?.totalTokens ||
                      (response.data.usage?.promptTokens || 0) + (response.data.usage?.completionTokens || 0) ||
                      estimateTokens(options.prompt);
    
    // Calculate input/output token split
    const inputTokens = response.data.usage?.promptTokens || Math.floor(tokensUsed * 0.7);
    const outputTokens = response.data.usage?.completionTokens || (tokensUsed - inputTokens);
    
    console.log(`[DEBUG] Tracking text completion request for ${currentAppId}:`, {
      provider: service.provider,
      tokens: tokensUsed,
      inputTokens,
      outputTokens,
      model: options.model,
      timestamp: new Date().toISOString(),
      appIdentifiers: {
        article_smasher_app: localStorage.getItem('article_smasher_app'),
        article_wizard_state: localStorage.getItem('article_wizard_state'),
        task_list_state: localStorage.getItem('task_list_state'),
        FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
        current_app: localStorage.getItem('current_app')
      }
    });
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      currentAppId,
      options.model,
      inputTokens,
      outputTokens,
      new Date()
    );
    
    return response;
  };

  // Override createChatCompletion to track usage
  service.createChatCompletion = async (options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> => {
    // Double-check app ID before making the request
    let currentAppId = appId;
    
    // Check for forced app ID in localStorage
    const forcedAppId = localStorage.getItem('FORCE_APP_ID');
    if (forcedAppId) {
      console.log(`[DEBUG] Using forced app ID from FORCE_APP_ID: ${forcedAppId}`);
      currentAppId = forcedAppId;
    }
    
    // Make the API request
    const response = await originalCreateChatCompletion(options);
    
    // Track the usage regardless of success
    const tokensUsed = response.data.usage?.totalTokens ||
                      (response.data.usage?.promptTokens || 0) + (response.data.usage?.completionTokens || 0) ||
                      estimateTokensFromMessages(options.messages);
    
    // Calculate input/output token split
    const inputTokens = response.data.usage?.promptTokens || Math.floor(tokensUsed * 0.7);
    const outputTokens = response.data.usage?.completionTokens || (tokensUsed - inputTokens);
    
    console.log(`[DEBUG] Tracking chat completion request for ${currentAppId}:`, {
      provider: service.provider,
      totalTokens: tokensUsed,
      inputTokens,
      outputTokens,
      model: options.model,
      timestamp: new Date().toISOString(),
      appIdentifiers: {
        article_smasher_app: localStorage.getItem('article_smasher_app'),
        article_wizard_state: localStorage.getItem('article_wizard_state'),
        task_list_state: localStorage.getItem('task_list_state'),
        FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
        current_app: localStorage.getItem('current_app')
      }
    });
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      currentAppId,
      options.model,
      inputTokens,
      outputTokens,
      new Date()
    );
    
    return response;
  };

  // Override createImage if it exists
  if (originalCreateImage) {
    service.createImage = async (options: ImageGenerationOptions): Promise<AIResponse<ImageGenerationResponse>> => {
      // Double-check app ID before making the request
      let currentAppId = appId;
      
      // Check for forced app ID in localStorage
      const forcedAppId = localStorage.getItem('FORCE_APP_ID');
      if (forcedAppId) {
        console.log(`[DEBUG] Using forced app ID from FORCE_APP_ID for image generation: ${forcedAppId}`);
        currentAppId = forcedAppId;
      }
      
      const response = await originalCreateImage(options);
      
      // Track the usage (image generation typically doesn't return token counts)
      // Use a fixed token count for image generation (this is an estimate)
      const estimatedTokens = 1000;
      
      console.log(`[DEBUG] Tracking image generation request for ${currentAppId}:`, {
        provider: service.provider,
        estimatedTokens,
        model: options.model || 'image-generation',
        timestamp: new Date().toISOString(),
        appIdentifiers: {
          article_smasher_app: localStorage.getItem('article_smasher_app'),
          article_wizard_state: localStorage.getItem('article_wizard_state'),
          task_list_state: localStorage.getItem('task_list_state'),
          FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
          current_app: localStorage.getItem('current_app')
        }
      });
      
      trackApiRequest(
        service.provider,
        estimatedTokens,
        currentAppId,
        options.model || 'image-generation',
        estimatedTokens,
        0,
        new Date()
      );
      
      return response;
    };
  }

  return service;
}

/**
 * Estimate tokens from a text prompt (very rough estimate)
 */
function estimateTokens(text: string): number {
  // A very rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Estimate tokens from chat messages (very rough estimate)
 */
function estimateTokensFromMessages(messages: Array<{ role: string; content: string }>): number {
  // Sum up the content lengths and add some overhead for the message format
  return messages.reduce((total, message) => {
    return total + estimateTokens(message.content) + 4; // 4 tokens overhead per message
  }, 0);
}

/**
 * Initialize usage tracking for all services
 */
export function initializeUsageTracking(): void {
  console.log('[DEBUG] Initializing usage tracking');
  console.log('[DEBUG] App identification flags:', {
    // High priority flags
    FORCE_APP_ID: localStorage.getItem('FORCE_APP_ID'),
    current_app: localStorage.getItem('current_app'),
    // App-specific flags
    article_smasher_app: localStorage.getItem('article_smasher_app'),
    article_wizard_state: localStorage.getItem('article_wizard_state'),
    task_list_state: localStorage.getItem('task_list_state')
  });
  
  // Clear any stale usage data that's older than 30 days
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  if (usageData.usageHistory) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const originalLength = usageData.usageHistory.length;
    usageData.usageHistory = usageData.usageHistory.filter((entry: any) =>
      entry.timestamp >= thirtyDaysAgo
    );
    console.log(`[DEBUG] Cleaned up usage history: removed ${originalLength - usageData.usageHistory.length} old entries`);
    
    // Log app-specific usage stats
    const appStats = {
      'article-smasher': usageData.usageHistory.filter((entry: any) => entry.app === 'article-smasher').length,
      'task-smasher': usageData.usageHistory.filter((entry: any) => entry.app === 'task-smasher').length,
      'unknown-app': usageData.usageHistory.filter((entry: any) => entry.app === 'unknown-app').length
    };
    console.log('[DEBUG] Usage history by app:', appStats);
    
    localStorage.setItem('smashingapps_usage_data', JSON.stringify(usageData));
  }
  
  console.log('[DEBUG] Usage tracking initialized with data cleanup');
  
  // Add event listener for usage data updates
  window.addEventListener('usage-data-updated', (event: any) => {
    console.log('[DEBUG] Usage data updated:', {
      totalRequests: event.detail.totalRequests,
      totalTokens: event.detail.totalTokens,
      requestsByApp: event.detail.requestsByApp,
      tokensByApp: event.detail.tokensByApp
    });
  });
}