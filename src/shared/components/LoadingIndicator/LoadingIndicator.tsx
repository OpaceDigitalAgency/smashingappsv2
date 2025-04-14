import React from 'react';
import { LoadingIndicatorProps } from '../../types';

export const LoadingIndicator: React.FC<LoadingIndicatorProps> = ({
  size = 'md',
  color = 'indigo',
  className = '',
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  // Color classes
  const colorClasses = {
    indigo: 'border-indigo-500 border-t-transparent',
    blue: 'border-blue-500 border-t-transparent',
    green: 'border-green-500 border-t-transparent',
    red: 'border-red-500 border-t-transparent',
    gray: 'border-gray-500 border-t-transparent',
  };

  // Default to indigo if color is not in the predefined colors
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.indigo;

  return (
    <div className={`inline-block ${className}`}>
      <div 
        className={`rounded-full animate-spin ${sizeClasses[size]} ${colorClass}`}
        role="status"
        aria-label="Loading"
      />
    </div>
  );
};

export default LoadingIndicator;