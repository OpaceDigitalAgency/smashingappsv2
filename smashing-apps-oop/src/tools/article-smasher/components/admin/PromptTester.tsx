import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../../types';
import Card from '../../../shared/components/Card/Card';
import Button from '../../../shared/components/Button/Button';
import LoadingIndicator from '../../../shared/components/LoadingIndicator/LoadingIndicator';
import { usePrompt } from '../../contexts/PromptContext';
import { Play } from 'lucide-react';

interface PromptTesterProps {
  promptId: string;
  promptTemplate: PromptTemplate;
}

/**
 * PromptTester Component
 * 
 * Allows testing of prompt templates with variable inputs.
 */
const PromptTester: React.FC<PromptTesterProps> = ({ promptId, promptTemplate }) => {
  const { testPrompt, isLoading } = usePrompt();
  const [variables, setVariables] = useState<Record<string, string>>({});
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string>('');
  
  // Extract variables from the prompt template
  useEffect(() => {
    const variableRegex = /\{\{([^}]+)\}\}/g;
    const matches = [...promptTemplate.userPromptTemplate.matchAll(variableRegex)];
    const extractedVars: Record<string, string> = {};
    
    matches.forEach(match => {
      const varName = match[1].trim();
      if (!extractedVars[varName]) {
        extractedVars[varName] = '';
      }
    });
    
    setVariables(extractedVars);
    setResult('');
    setError('');
  }, [promptTemplate.userPromptTemplate]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setVariables(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleTest = async () => {
    try {
      setError('');
      const result = await testPrompt(promptId || '', variables);
      setResult(result);
    } catch (err) {
      console.error('Error testing prompt:', err);
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    }
  };
  
  return (
    <Card title="Test Prompt">
      <div className="p-4 space-y-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Variables</h3>
          {Object.keys(variables).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(variables).map(([name, value]) => (
                <div key={name} className="space-y-1">
                  <label htmlFor={`var-${name}`} className="block text-sm text-gray-600">
                    {name}
                  </label>
                  <input
                    type="text"
                    id={`var-${name}`}
                    name={name}
                    value={value}
                    onChange={handleInputChange}
                    className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    placeholder={`Enter value for ${name}`}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              No variables found in this prompt template.
            </p>
          )}
        </div>
        
        <div className="flex justify-end">
          <Button
            variant="primary"
            icon={Play}
            onClick={handleTest}
            isLoading={isLoading}
            disabled={Object.values(variables).some(v => !v.trim()) || isLoading}
          >
            Run Test
          </Button>
        </div>
        
        {isLoading && (
          <div className="flex items-center justify-center p-6">
            <LoadingIndicator size="lg" />
            <span className="ml-3 text-gray-600">Generating response...</span>
          </div>
        )}
        
        {error && (
          <div className="bg-red-50 p-4 rounded-md border border-red-200">
            <h4 className="text-red-800 font-medium">Error</h4>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}
        
        {result && !isLoading && !error && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-700">Result</h3>
            <div className="bg-gray-50 p-4 rounded-md border border-gray-200 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{result}</pre>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default PromptTester;