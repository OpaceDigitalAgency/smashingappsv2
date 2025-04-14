import { ChatCompletionRequest, ChatCompletionResponse, RateLimitInfo } from '../types';

/**
 * Service for interacting with AI APIs
 */
class AIService {
  /**
   * Send a chat completion request to the AI service
   * 
   * @param request The chat completion request
   * @param recaptchaToken Optional reCAPTCHA token for verification
   * @returns The chat completion response and rate limit info
   */
  async createChatCompletion(
    request: ChatCompletionRequest, 
    recaptchaToken?: string | null
  ): Promise<{
    data: ChatCompletionResponse;
    rateLimit: RateLimitInfo;
  }> {
    try {
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add reCAPTCHA token if available
      if (recaptchaToken) {
        headers['X-ReCaptcha-Token'] = recaptchaToken;
      }
      
      // Use the Netlify function proxy instead of direct API
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        // Add timeout handling
        signal: AbortSignal.timeout(60000) // 60 second timeout
      });
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '60', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 3600000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };

      // Handle rate limit exceeded
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded. Try again after ${rateLimit.reset.toLocaleString()}`);
      }

      // Handle other errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status} ${response.statusText}: ${errorText}`);
      }

      // Parse the response
      const data = await response.json() as ChatCompletionResponse;
      
      return { data, rateLimit };
    } catch (error) {
      console.error("Error in createChatCompletion:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with AI API');
    }
  }

  /**
   * Get a simple text completion from the AI service
   * 
   * @param prompt The text prompt
   * @param model The model to use (defaults to gpt-3.5-turbo)
   * @returns The generated text
   */
  async getCompletion(prompt: string, model = 'gpt-3.5-turbo'): Promise<string> {
    try {
      const { data } = await this.createChatCompletion({
        model,
        messages: [{ role: 'user', content: prompt }],
      });
      
      return data.choices[0]?.message.content || '';
    } catch (error) {
      console.error('Error getting completion:', error);
      throw error;
    }
  }

  /**
   * Get the current rate limit status
   * 
   * @returns Promise that resolves to the current rate limit info
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    try {
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = Date.now();
      const response = await fetch(`/.netlify/functions/openai-proxy/rate-limit-status?_=${cacheBuster}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get rate limit status: ${response.statusText}`);
      }
      
      // Extract rate limit information from headers
      const rateLimit: RateLimitInfo = {
        limit: parseInt(response.headers.get('X-RateLimit-Limit') || '60', 10),
        remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0', 10),
        reset: new Date(response.headers.get('X-RateLimit-Reset') || Date.now() + 3600000),
        used: parseInt(response.headers.get('X-RateLimit-Used') || '0', 10)
      };
      
      return rateLimit;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      
      // Return default values if we can't get the actual limits
      return {
        limit: 60,
        remaining: 20,
        reset: new Date(Date.now() + 3600000),  // Reset after 1 hour
        used: 0
      };
    }
  }
}

// Export a singleton instance
export default new AIService();