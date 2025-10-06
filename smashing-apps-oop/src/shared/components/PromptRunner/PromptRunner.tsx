import React, { useState } from 'react';
import { PromptRunnerProps } from '../../types';
import Button from '../Button/Button';
import Card from '../Card/Card';
import LoadingIndicator from '../LoadingIndicator/LoadingIndicator';

export const PromptRunner: React.FC<PromptRunnerProps> = ({
  model,
  systemPrompt,
  userPrompt,
  temperature = 0.7,
  maxTokens,
  onResult,
  onError,
  renderLoading,
  renderError,
  renderResult,
  className = '',
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [result, setResult] = useState<string | null>(null);
  
  // This is a placeholder for the actual AI execution
  // In a real implementation, this would use the useAI hook
  const handleExecute = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call the AI service
      const response = `This is a simulated response for the prompt: "${userPrompt}"
      
Using model: ${model}
Temperature: ${temperature}
System prompt: "${systemPrompt}"

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam auctor, 
nisl eget ultricies tincidunt, nisl nisl aliquam nisl, eget ultricies
nisl nisl eget nisl. Nullam auctor, nisl eget ultricies tincidunt, nisl
nisl aliquam nisl, eget ultricies nisl nisl eget nisl.`;
      
      setResult(response);
      onResult(response);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Unknown error occurred');
      setError(error);
      onError(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className={`prompt-runner ${className}`}>
      <div className="prompt-runner-content">
        {isLoading && (
          renderLoading ? renderLoading() : (
            <div className="flex items-center justify-center p-6">
              <LoadingIndicator size="lg" />
              <span className="ml-3 text-gray-600">Generating content...</span>
            </div>
          )
        )}
        
        {error && !isLoading && (
          renderError ? renderError(error) : (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-600 mt-1">{error.message}</p>
              <Button 
                variant="secondary" 
                size="sm" 
                className="mt-3" 
                onClick={handleExecute}
              >
                Try Again
              </Button>
            </div>
          )
        )}
        
        {result && !isLoading && !error && (
          renderResult ? renderResult(result) : (
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
              <h4 className="text-gray-800 font-medium">Result</h4>
              <p className="text-gray-600 mt-1 whitespace-pre-wrap">{result}</p>
            </div>
          )
        )}
        
        {!result && !isLoading && !error && (
          <div className="p-4">
            <Button 
              variant="primary" 
              onClick={handleExecute}
              fullWidth
            >
              Generate
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PromptRunner;