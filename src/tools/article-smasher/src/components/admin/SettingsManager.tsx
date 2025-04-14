import React, { useState } from 'react';
import { PromptSettings } from '../../types';
import Button from '../../../../../shared/components/Button/Button';
import { usePrompt } from '../../contexts/PromptContext';
import { Save } from 'lucide-react';

interface SettingsManagerProps {
  settings: PromptSettings;
}

/**
 * SettingsManager Component
 * 
 * Allows management of global AI settings for the Article Smasher tool.
 */
const SettingsManager: React.FC<SettingsManagerProps> = ({ settings }) => {
  const { updateSettings, isLoading } = usePrompt();
  const [formState, setFormState] = useState<PromptSettings>({ ...settings });
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle numeric values
    if (name === 'defaultTemperature' || name === 'defaultMaxTokens') {
      setFormState({
        ...formState,
        [name]: name === 'defaultTemperature' ? parseFloat(value) : parseInt(value, 10)
      });
    } else if (name === 'defaultModel') {
      setFormState({
        ...formState,
        [name]: value
      });
    }
  };
  
  const handleCategoryToggle = (category: 'topic' | 'keyword' | 'outline' | 'content' | 'image') => {
    const updatedCategories = formState.enabledCategories.includes(category)
      ? formState.enabledCategories.filter(c => c !== category)
      : [...formState.enabledCategories, category];
    
    setFormState({
      ...formState,
      enabledCategories: updatedCategories
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await updateSettings(formState);
      alert('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Failed to update settings. Please try again.');
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">AI Model Settings</h3>
        
        <div className="space-y-2">
          <label htmlFor="defaultModel" className="block text-sm font-medium text-gray-700">
            Default AI Model
          </label>
          <select
            id="defaultModel"
            name="defaultModel"
            value={formState.defaultModel}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="gpt-4o">GPT-4o</option>
            <option value="gpt-4-turbo">GPT-4 Turbo</option>
            <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
            <option value="claude-3-opus">Claude 3 Opus</option>
            <option value="claude-3-sonnet">Claude 3 Sonnet</option>
            <option value="claude-3-haiku">Claude 3 Haiku</option>
            <option value="gemini-pro">Gemini Pro</option>
          </select>
          <p className="text-xs text-gray-500">
            The default AI model to use for all prompts unless specified otherwise.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="defaultTemperature" className="block text-sm font-medium text-gray-700">
              Default Temperature (0.0 - 1.0)
            </label>
            <input
              type="number"
              id="defaultTemperature"
              name="defaultTemperature"
              value={formState.defaultTemperature}
              onChange={handleInputChange}
              min="0"
              max="1"
              step="0.1"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Controls randomness. Higher values (0.7-1.0) make output more random, lower values (0.0-0.3) make it more focused.
            </p>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="defaultMaxTokens" className="block text-sm font-medium text-gray-700">
              Default Max Tokens
            </label>
            <input
              type="number"
              id="defaultMaxTokens"
              name="defaultMaxTokens"
              value={formState.defaultMaxTokens}
              onChange={handleInputChange}
              min="1"
              className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500">
              Default maximum length of the generated text.
            </p>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-700">Enabled Categories</h3>
        <p className="text-sm text-gray-500">
          Select which prompt categories should be available in the article creation workflow.
        </p>
        
        <div className="space-y-2">
          {[
            { id: 'topic', label: 'Topic Generation' },
            { id: 'keyword', label: 'Keyword Research' },
            { id: 'outline', label: 'Article Outline' },
            { id: 'content', label: 'Content Generation' },
            { id: 'image', label: 'Image Prompts' }
          ].map(category => (
            <div key={category.id} className="flex items-center">
              <input
                type="checkbox"
                id={`category-${category.id}`}
                checked={formState.enabledCategories.includes(category.id as any)}
                onChange={() => handleCategoryToggle(category.id as any)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`category-${category.id}`} className="ml-2 block text-sm text-gray-700">
                {category.label}
              </label>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          icon={Save}
          isLoading={isLoading}
        >
          Save Settings
        </Button>
      </div>
    </form>
  );
};

export default SettingsManager;