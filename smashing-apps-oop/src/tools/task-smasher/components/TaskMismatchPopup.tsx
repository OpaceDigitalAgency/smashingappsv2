import React, { useEffect, useState } from 'react';
import { AlertCircle, ThumbsUp, AlertTriangle } from 'lucide-react';
import { useCaseDefinitions } from '../utils/useCaseDefinitions';

type TaskMismatchPopupProps = {
  isVisible: boolean;
  reason: string;
  suggestedUseCase: string | undefined;
  onClose: () => void;
  onSwitchUseCase: (useCase: string) => void;
};

const TaskMismatchPopup: React.FC<TaskMismatchPopupProps> = ({
  isVisible,
  reason,
  suggestedUseCase,
  onClose,
  onSwitchUseCase
}) => {
  const [animation, setAnimation] = useState('');
  
  // Apply animation when visibility changes
  useEffect(() => {
    if (isVisible) {
      setAnimation('animate-in');
      
      // Auto-close after 8 seconds if not interacted with
      const timer = setTimeout(() => {
        setAnimation('animate-out');
        setTimeout(onClose, 500);
      }, 8000);
      
      return () => clearTimeout(timer);
    } else {
      setAnimation('animate-out');
    }
  }, [isVisible, onClose]);
  
  if (!isVisible) return null;
  
  const handleSwitch = () => {
    if (suggestedUseCase) {
      onSwitchUseCase(suggestedUseCase);
    }
    setAnimation('animate-out');
    setTimeout(onClose, 500);
  };
  
  const handleIgnore = () => {
    setAnimation('animate-out');
    setTimeout(onClose, 500);
  };
  
  const suggestedUseCaseName = suggestedUseCase 
    ? useCaseDefinitions[suggestedUseCase]?.label || suggestedUseCase
    : '';
  
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
              handleIgnore();
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
            <div className="bg-yellow-50 px-4 py-3 border-b border-yellow-100">
              <div className="flex items-center">
                <div className="flex-shrink-0 mr-3">
                  <div className="bg-white p-2 rounded-full shadow-sm">
                    <AlertTriangle className="w-5 h-5 text-yellow-500" />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Task Mismatch Detected!</h3>
              </div>
            </div>
            
            {/* Content */}
            {/* Content */}
            <div className="px-4 py-4">
              <p className="text-gray-600 mb-4 text-sm leading-relaxed">{reason}</p>
              
              {suggestedUseCase && (
                <div className="bg-indigo-50 rounded-md p-4 mb-4 border border-indigo-100">
                  <p className="text-sm text-gray-700 mb-2">
                    This task would fit better in the <span className="font-semibold text-indigo-700">{suggestedUseCaseName}</span> category.
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                    <AlertCircle className="w-3 h-3" />
                    <span>Proper categorization helps AI generate better subtasks</span>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer with buttons */}
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 flex justify-end space-x-3">
              <button
                onClick={handleIgnore}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                Ignore
              </button>
              {suggestedUseCase && (
                <button
                  onClick={handleSwitch}
                  className="px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:shadow-lg"
                  style={{
                    background: `linear-gradient(135deg, #6366f1, #8b5cf6)`,
                    boxShadow: '0 2px 4px rgba(99, 102, 241, 0.3)'
                  }}
                >
                  Switch to {suggestedUseCaseName}
                </button>
              )}
            </div>
            
            {/* Progress bar for auto-close */}
            <div className="h-1 bg-gray-200 w-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                style={{
                  width: '100%',
                  animation: 'shrink 8s linear forwards'
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

export default TaskMismatchPopup;