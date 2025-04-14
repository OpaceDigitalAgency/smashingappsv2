import React, { useState, useEffect } from 'react';
import { PromptTemplate } from '../../types';
import Card from '../../../../../shared/components/Card/Card';
import Button from '../../../../../shared/components/Button/Button';
import { usePrompt } from '../../contexts/PromptContext';
import PromptTester from './PromptTester';
import { Save, Play } from 'lucide-react';

interface PromptEditorProps {
  prompt: PromptTemplate;
}

/**
 * PromptEditor Component
 * 
 * Allows editing and testing of prompt templates.
 */
const PromptEditor: React.FC<PromptEditorProps> = ({ prompt }) => {
  const { addPrompt, updatePrompt, isLoading } = usePrompt();
  const [showTester, setShowTester] = useState(false);
  
  // Local state for form
  const [formState, setFormState] = useState<PromptTemplate>({
    ...prompt
  });
  
  // Update form state when prompt changes
  useEffect(() => {
    setFormState({ ...prompt });
  }, [prompt]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'temperature' || name === 'maxTokens') {
      setFormState({
        ...formState,
        [name]: name === 'temperature' ? parseFloat(value) : parseInt(value, 10)
      });
    } else {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (formState.id) {
        // Update existing prompt
        await updatePrompt(formState.id, formState);
      } else {
        // Add new prompt
        await addPrompt({
          name: formState.name,
          description: formState.description,
          systemPrompt: formState.systemPrompt,
          userPromptTemplate: formState.userPromptTemplate,
          category: formState.category,
          temperature: formState.temperature,
          maxTokens: formState.maxTokens
        });
      }
      
      alert(formState.id ? 'Prompt updated successfully!' : 'Prompt created successfully!');
    } catch (error) {
      console.error('Error saving prompt:', error);
      alert('Failed to save prompt. Please try again.');
    }
  };
  
  return (
    <div className="prompt-editor">
      <Card title={formState.id ? `Edit Prompt: ${formState.name}` : 'Create New Prompt'}>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formState.name}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <select
                id="category"
                name="category"
                value={formState.category}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              >
                <option value="topic">Topic Generation</option>
                <option value="keyword">Keyword Research</option>
                <option value="outline">Article Outline</option>
                <option value="content">Content Generation</option>
                <option value="image">Image Prompts</option>
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <input
              type="text"
              id="description"
              name="description"
              value={formState.description}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="systemPrompt" className="block text-sm font-medium text-gray-700">
              System Prompt
            </label>
            <textarea
              id="systemPrompt"
              name="systemPrompt"
              value={formState.systemPrompt}
              onChange={handleInputChange}
              rows={3}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              Instructions that define the AI's role and behavior.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="userPromptTemplate" className="block text-sm font-medium text-gray-700">
              User Prompt Template
            </label>
            <textarea
              id="userPromptTemplate"
              name="userPromptTemplate"
              value={formState.userPromptTemplate}
              onChange={handleInputChange}
              rows={5}
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              required
            />
            <p className="text-xs text-gray-500">
              Template with variables in double curly braces. Example: "Generate content about &#123;&#123;topic&#125;&#125; with &#123;&#123;tone&#125;&#125; tone."
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="temperature" className="block text-sm font-medium text-gray-700">
                Temperature (0.0 - 1.0)
              </label>
              <input
                type="number"
                id="temperature"
                name="temperature"
                value={formState.temperature}
                onChange={handleInputChange}
                min="0"
                max="1"
                step="0.1"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                required
              />
              <p className="text-xs text-gray-500">
                Higher values (0.7-1.0) make output more random, lower values (0.0-0.3) make it more focused.
              </p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="maxTokens" className="block text-sm font-medium text-gray-700">
                Max Tokens
              </label>
              <input
                type="number"
                id="maxTokens"
                name="maxTokens"
                value={formState.maxTokens || ''}
                onChange={handleInputChange}
                min="1"
                className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500">
                Maximum length of the generated text. Leave empty for model default.
              </p>
            </div>
          </div>
          
          <div className="flex justify-between pt-4">
            <Button
              type="button"
              variant="secondary"
              icon={Play}
              onClick={() => setShowTester(!showTester)}
            >
              {showTester ? 'Hide Tester' : 'Test Prompt'}
            </Button>
            
            <Button
              type="submit"
              variant="primary"
              icon={Save}
              isLoading={isLoading}
            >
              {formState.id ? 'Update Prompt' : 'Create Prompt'}
            </Button>
          </div>
        </form>
      </Card>
      
      {showTester && (
        <div className="mt-6">
          <PromptTester promptId={formState.id} promptTemplate={formState} />
        </div>
      )}
    </div>
  );
};

export default PromptEditor;