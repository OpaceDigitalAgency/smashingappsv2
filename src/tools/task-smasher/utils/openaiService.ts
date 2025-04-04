import { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * Interface for OpenAI chat completion request
 */
interface ChatCompletionRequest {
  model: string;
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

/**
 * Interface for OpenAI chat completion response
 */
interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: {
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Error response from the API
 */
interface ErrorResponse {
  error: string;
  message: string;
}

/**
 * Rate limit information from response headers
 */
interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: Date;
  used: number;
}

/**
 * Service for interacting with OpenAI API through our Netlify function proxy
 */
export const OpenAIService = {
  /**
   * Send a chat completion request to OpenAI through our proxy
   * 
   * @param request The chat completion request
   * @returns The chat completion response and rate limit info
   * @throws Error if the request fails
   */
  async createChatCompletion(request: ChatCompletionRequest, recaptchaToken?: string | null): Promise<{
    data: ChatCompletionResponse;
    rateLimit: RateLimitInfo;
  }> {
    try {
      // Get the current API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem('apiCallCount') || '0', 10);
      
      // Prepare headers
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'X-API-Call-Count': apiCallCount.toString() // Send the current count to the server
      };
      
      // Add reCAPTCHA token if available
      if (recaptchaToken) {
        headers['X-ReCaptcha-Token'] = recaptchaToken;
        console.log('Adding reCAPTCHA token to headers:', recaptchaToken.substring(0, 10) + '...');
      } else {
        console.warn('No reCAPTCHA token available for this request');
      }
      
      console.log('Request headers:', headers);
      console.log('Request body:', JSON.stringify(request));
      
      // Use the Netlify function proxy instead of direct OpenAI API
      // Use relative path to ensure compatibility with all deployment environments
      // For the integrated app, we need to use the correct path to the function
      const response = await fetch('/.netlify/functions/openai-proxy', {
        method: 'POST',
        headers,
        body: JSON.stringify(request),
        // Add timeout handling
        signal: AbortSignal.timeout(60000) // 60 second timeout (increased from 30s)
      });
      
      // Log the response headers for debugging
      console.log('Response status:', response.status, response.statusText);
      console.log('Response headers:', {
        'X-ReCaptcha-Verified': response.headers.get('X-ReCaptcha-Verified'),
        'X-RateLimit-Used': response.headers.get('X-RateLimit-Used'),
        'X-RateLimit-Remaining': response.headers.get('X-RateLimit-Remaining')
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
        const errorData = await response.json() as ErrorResponse;
        throw new Error(`Rate limit exceeded. Try again after ${rateLimit.reset.toLocaleString()}`);
      }

      // Handle other errors
      if (!response.ok) {
        try {
          // Try to parse the error response as JSON
          const errorText = await response.text();
          console.error("Error response text:", errorText);
          
          let errorData: ErrorResponse;
          try {
            errorData = JSON.parse(errorText) as ErrorResponse;
          } catch (jsonError) {
            console.error("Failed to parse error response as JSON:", jsonError);
            // If JSON parsing fails, create a simple error object
            errorData = {
              error: "Parse error",
              message: errorText
            };
          }
          
          // Include status code in error message for better debugging
          throw new Error(`${response.status} ${response.statusText}: ${errorData.message || 'Unknown error occurred'}`);
        } catch (parseError) {
          // If we can't parse the response at all, throw a generic error with the status
          console.error("Error parsing response:", parseError);
          throw new Error(`${response.status} ${response.statusText}: Unable to parse error response`);
        }
      }

      // Parse the response
      let data: ChatCompletionResponse;
      try {
        data = await response.json() as ChatCompletionResponse;
      } catch (jsonError) {
        console.error("Error parsing JSON response:", jsonError);
        throw new Error("Failed to parse response from OpenAI API");
      }
      
      // Increment the API call count in localStorage
      const newApiCallCount = apiCallCount + 1;
      localStorage.setItem('apiCallCount', newApiCallCount.toString());
      console.log(`API call count updated: ${newApiCallCount}`);
      
      // Update the rate limit info in localStorage
      localStorage.setItem('rateLimitInfo', JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: newApiCallCount, // Use our local counter for consistency
        timestamp: new Date().toISOString()
      }));
      
      // Override the used count with our local counter for consistency
      rateLimit.used = newApiCallCount;
      
      return { data, rateLimit };
    } catch (error) {
      console.error("Error in createChatCompletion:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to communicate with OpenAI API');
    }
  },

  /**
   * Get a simple text completion from OpenAI
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
  },

  /**
   * Get the current rate limit status
   * 
   * @returns Promise that resolves to the current rate limit info
   */
  async getRateLimitStatus(): Promise<RateLimitInfo> {
    try {
      // First, check if we have rate limit info in localStorage
      const storedRateLimitInfo = localStorage.getItem('rateLimitInfo');
      
      if (storedRateLimitInfo) {
        try {
          console.log('Found stored rate limit info in localStorage');
          const parsedInfo = JSON.parse(storedRateLimitInfo);
          console.log('Parsed stored rate limit info:', parsedInfo);
          
          // Check if the stored info is still valid (not expired)
          const resetTime = new Date(parsedInfo.reset);
          if (resetTime > new Date()) {
            // The stored info is still valid
            return {
              limit: parsedInfo.limit,
              remaining: parsedInfo.remaining,
              reset: resetTime,
              used: parsedInfo.used
            };
          } else {
            console.log('Stored rate limit info is expired, fetching new info');
          }
        } catch (e) {
          console.error('Error parsing stored rate limit info:', e);
        }
      }
      
      // If we don't have valid stored info, fetch it from the server
      console.log('Fetching rate limit status from dedicated endpoint');
      
      // Add a cache-busting parameter to prevent caching
      const cacheBuster = Date.now();
      // Use relative path to ensure compatibility with all deployment environments
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
      
      console.log('Rate limit status from server:', rateLimit);
      
      // Get the API call count from localStorage
      const apiCallCount = parseInt(localStorage.getItem('apiCallCount') || '0', 10);
      
      // If our local count is higher, use that instead
      if (apiCallCount > rateLimit.used) {
        console.log(`Using local API call count (${apiCallCount}) instead of server count (${rateLimit.used})`);
        rateLimit.used = apiCallCount;
        rateLimit.remaining = Math.max(0, rateLimit.limit - apiCallCount);
      }
      
      // Store the updated rate limit info in localStorage
      localStorage.setItem('rateLimitInfo', JSON.stringify({
        limit: rateLimit.limit,
        remaining: rateLimit.remaining,
        reset: rateLimit.reset.toISOString(),
        used: rateLimit.used,
        timestamp: new Date().toISOString()
      }));
      
      return rateLimit;
    } catch (error) {
      console.error('Error getting rate limit status:', error);
      
      // Fallback to default values
      return {
        limit: 60,
        remaining: 19,
        reset: new Date(Date.now() + 3600000),
        used: 1
      };
    }
  }
};

export default OpenAIService;