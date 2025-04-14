import { useState, useCallback } from 'react';
import { RateLimitInfo, UseRateLimitReturn } from '../types';
import useLocalStorage from './useLocalStorage';

/**
 * A hook for managing API rate limits
 * 
 * @returns An object with rate limit state and functions
 */
export function useRateLimit(): UseRateLimitReturn {
  // Store rate limit info in localStorage
  const { value: rateLimitInfo, setValue: setRateLimitInfoValue } = useLocalStorage<RateLimitInfo>('rateLimitInfo', {
    limit: 60,
    remaining: 60,
    used: 0,
    reset: new Date(Date.now() + 3600000) // Default reset time is 1 hour from now
  });

  // Store rate limited state in localStorage
  const { value: rateLimited, setValue: setRateLimitedValue } = useLocalStorage<boolean>('rateLimited', false);

  // State for showing the rate limit popup
  const [showRateLimitPopup, setShowRateLimitPopup] = useState(false);

  // Update rate limit info
  const updateRateLimitInfo = useCallback((rateLimit: RateLimitInfo) => {
    setRateLimitInfoValue(rateLimit);
    
    // Update rateLimited state based on remaining calls
    const isLimited = rateLimit.remaining <= 0;
    setRateLimitedValue(isLimited);
    
    // Show popup if rate limited
    if (isLimited) {
      setShowRateLimitPopup(true);
    }
  }, [setRateLimitInfoValue, setRateLimitedValue]);

  // Clear rate limits (for testing or admin purposes)
  const clearRateLimits = useCallback(() => {
    const resetTime = new Date(Date.now() + 3600000); // 1 hour from now
    
    setRateLimitInfoValue({
      limit: 60,
      remaining: 60,
      used: 0,
      reset: resetTime
    });
    
    setRateLimitedValue(false);
    setShowRateLimitPopup(false);
  }, [setRateLimitInfoValue, setRateLimitedValue]);

  return {
    rateLimited,
    rateLimitInfo,
    showRateLimitPopup,
    setShowRateLimitPopup,
    clearRateLimits,
    updateRateLimitInfo
  };
}

export default useRateLimit;