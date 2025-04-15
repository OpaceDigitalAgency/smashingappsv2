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
  const originalCreateTextCompletion = service.createTextCompletion.bind(service);
  const originalCreateChatCompletion = service.createChatCompletion.bind(service);
  const originalCreateImage = service.createImage?.bind(service);

  // Override createTextCompletion to track usage
  service.createTextCompletion = async (options: TextCompletionOptions): Promise<AIResponse<TextCompletionResponse>> => {
    const response = await originalCreateTextCompletion(options);
    
    // Track the usage regardless of success
    const tokensUsed = response.data.usage?.totalTokens || 
                      (response.data.usage?.promptTokens || 0) + (response.data.usage?.completionTokens || 0) ||
                      estimateTokens(options.prompt);
    
    console.log(`Tracking text completion request for ${appId}:`, {
      provider: service.provider,
      tokens: tokensUsed,
      model: options.model
    });
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      appId,
      options.model,
      undefined,
      undefined,
      new Date()
    );
    
    return response;
  };

  // Override createChatCompletion to track usage
  service.createChatCompletion = async (options: ChatCompletionOptions): Promise<AIResponse<ChatCompletionResponse>> => {
    const response = await originalCreateChatCompletion(options);
    
    // Track the usage regardless of success
    const tokensUsed = response.data.usage?.totalTokens || 
                      (response.data.usage?.promptTokens || 0) + (response.data.usage?.completionTokens || 0) ||
                      estimateTokensFromMessages(options.messages);
    
    // Calculate input/output token split
    const inputTokens = response.data.usage?.promptTokens || Math.floor(tokensUsed * 0.7);
    const outputTokens = response.data.usage?.completionTokens || (tokensUsed - inputTokens);
    
    console.log(`Tracking chat completion request for ${appId}:`, {
      provider: service.provider,
      totalTokens: tokensUsed,
      inputTokens,
      outputTokens,
      model: options.model
    });
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      appId,
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
      const response = await originalCreateImage(options);
      
      // Track the usage (image generation typically doesn't return token counts)
      // Use a fixed token count for image generation (this is an estimate)
      const estimatedTokens = 1000;
      
      console.log(`Tracking image generation request for ${appId}:`, {
        provider: service.provider,
        estimatedTokens,
        model: options.model || 'image-generation'
      });
      
      trackApiRequest(
        service.provider,
        estimatedTokens,
        appId,
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
  // Clear any stale usage data that's older than 30 days
  const usageData = JSON.parse(localStorage.getItem('smashingapps_usage_data') || '{}');
  if (usageData.usageHistory) {
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    usageData.usageHistory = usageData.usageHistory.filter((entry: any) =>
      entry.timestamp >= thirtyDaysAgo
    );
    localStorage.setItem('smashingapps_usage_data', JSON.stringify(usageData));
  }
  
  console.log('Usage tracking initialized with data cleanup');
  
  // Add event listener for usage data updates
  window.addEventListener('usage-data-updated', (event: any) => {
    console.log('Usage data updated:', event.detail);
  });
}