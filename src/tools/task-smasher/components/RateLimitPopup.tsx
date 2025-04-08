import React, { useEffect, useState } from 'react';
import { AlertCircle, Ban, RefreshCw, ExternalLink } from 'lucide-react';

type RateLimitPopupProps = {
  isVisible: boolean;
  rateLimitInfo: {
    limit: number;
    remaining: number;
    used: number;
    reset: Date;
  };
  onClose: () => void;
  onClearRateLimits: () => void;
};

const RateLimitPopup: React.FC<RateLimitPopupProps> = ({
  isVisible,
  rateLimitInfo,
  onClose,
  onClearRateLimits
}) => {
  const [animation, setAnimation] = useState('');
  
  // Apply animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      setAnimation('animate-in');
      
      // Auto-close after 15 seconds if not interacted with
      const timer = setTimeout(() => {
        setAnimation('animate-out');
        setTimeout(onClose, 500);
      }, 15000);
      
      return () => clearTimeout(timer);
    } else {
      setAnimation('animate-out');
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const handleClearRateLimits = () => {
    onClearRateLimits();
    setAnimation('animate-out');
    setTimeout(onClose, 500);
  };
  
  const handleClose = () => {
    setAnimation('animate-out');
    setTimeout(onClose, 500);
  };
  
  // Format the reset time
  const resetTime = new Date(rateLimitInfo.reset).toLocaleTimeString();
  
  return (
    <>
      {isVisible && (
        <div
          className="fixed top-0 left-0 w-full h-full flex items-center justify-center"
          style={{
            zIndex: 9999,
            backgroundColor: 'rgba(0, 0, 0, 0.5)'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              handleClose();
            }
          }}
        >
          <div
            className="bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden w-full max-w-md mx-4"
            style={{
              animation: animation === 'animate-in' ? 'fadeIn 0.3s ease-out forwards' : 'fadeOut 0.3s ease-in forwards'
            }}
          >
            {/* Header */}
            <div className="bg-red-50 px-4 py-3 border-b border-red-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <Ban className="w-5 h-5 text-red-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">API Rate Limit Exceeded</h3>
              </div>
            </div>
            
            {/* Content */}
            <div className="px-4 py-4">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">
                You have exceeded your API usage limit. This limit helps prevent abuse and ensures fair usage for all users.
              </p>
              
              <div className="bg-gray-50 rounded-md p-4 mb-4 border border-gray-200">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">API Limit:</span>
                  <span className="text-sm text-gray-900">{rateLimitInfo.limit} calls</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Used:</span>
                  <span className="text-sm text-gray-900">{rateLimitInfo.used} calls</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Remaining:</span>
                  <span className="text-sm text-red-600">{rateLimitInfo.remaining} calls</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Reset at:</span>
                  <span className="text-sm text-gray-900">{resetTime}</span>
                </div>
              </div>
              
              <p className="text-xs text-gray-500 italic">
                Note: AI features will be disabled until your rate limit resets or is cleared.
              </p>
            </div>
            
            {/* Footer with buttons */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
              >
                Close
              </button>
              
              <button
                onClick={handleClearRateLimits}
                className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-red-600 rounded-md hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-1" />
                Clear Limits
              </button>
            </div>
            
            {/* Progress bar for auto-close */}
            <div className="h-1 bg-gray-200 w-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-red-500 to-red-600"
                style={{
                  width: '100%',
                  animation: 'shrink 15s linear forwards'
                }}
              />
            </div>
          </div>
        </div>
      )}
      
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: scale(0.95); }
            to { opacity: 1; transform: scale(1); }
          }
          
          @keyframes fadeOut {
            from { opacity: 1; transform: scale(1); }
            to { opacity: 0; transform: scale(0.95); }
          }
          
          @keyframes shrink {
            0% { width: 100%; }
            100% { width: 0%; }
          }
        `}
      </style>
    </>
  );
};

export default RateLimitPopup;