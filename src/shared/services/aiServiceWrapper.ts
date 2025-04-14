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
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      appId,
      options.model
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
    
    trackApiRequest(
      service.provider,
      tokensUsed,
      appId,
      options.model
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
      
      trackApiRequest(
        service.provider,
        estimatedTokens,
        appId,
        options.model || 'image-generation'
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
  // This function will be called during app initialization
  console.log('Usage tracking initialized');
  
  // You could add additional initialization logic here if needed
}