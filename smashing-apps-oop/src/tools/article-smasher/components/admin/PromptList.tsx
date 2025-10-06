import React from 'react';
import { PromptTemplate } from '../../types';
import Button from '../../../shared/components/Button/Button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { usePrompt } from '../../contexts/PromptContext';

interface PromptListProps {
  prompts: PromptTemplate[];
  activePromptId?: string;
  onSelectPrompt: (prompt: PromptTemplate) => void;
  onAddNewPrompt: () => void;
}

/**
 * PromptList Component
 * 
 * Displays a list of prompt templates with options to select, edit, or delete them.
 */
const PromptList: React.FC<PromptListProps> = ({
  prompts,
  activePromptId,
  onSelectPrompt,
  onAddNewPrompt
}) => {
  const { deletePrompt } = usePrompt();

  // Group prompts by category
  const promptsByCategory: Record<string, PromptTemplate[]> = {};
  
  prompts.forEach(prompt => {
    if (!promptsByCategory[prompt.category]) {
      promptsByCategory[prompt.category] = [];
    }
    promptsByCategory[prompt.category].push(prompt);
  });

  // Category labels for display
  const categoryLabels: Record<string, string> = {
    'topic': 'Topic Generation',
    'keyword': 'Keyword Research',
    'outline': 'Article Outline',
    'content': 'Content Generation',
    'image': 'Image Prompts'
  };

  const handleDeletePrompt = async (e: React.MouseEvent, promptId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this prompt template?')) {
      await deletePrompt(promptId);
    }
  };

  return (
    <div className="prompt-list">
      <div className="mb-4 flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-700">Prompt Templates</h3>
        <Button
          variant="primary"
          size="sm"
          icon={Plus}
          onClick={onAddNewPrompt}
        >
          New
        </Button>
      </div>

      <div className="space-y-4">
        {Object.entries(promptsByCategory).map(([category, categoryPrompts]) => (
          <div key={category} className="category-group">
            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-2">
              {categoryLabels[category] || category}
            </h4>
            <ul className="space-y-1">
              {categoryPrompts.map(prompt => (
                <li
                  key={prompt.id}
                  className={`
                    flex justify-between items-center p-2 rounded-md cursor-pointer
                    ${activePromptId === prompt.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}
                  `}
                  onClick={() => onSelectPrompt(prompt)}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {prompt.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {prompt.description}
                    </p>
                  </div>
                  <div className="flex space-x-1">
                    <button
                      className="p-1 text-gray-400 hover:text-blue-500"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectPrompt(prompt);
                      }}
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={(e) => handleDeletePrompt(e, prompt.id)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {prompts.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500 mb-2">No prompt templates found</p>
            <Button
              variant="primary"
              size="sm"
              icon={Plus}
              onClick={onAddNewPrompt}
            >
              Create Your First Prompt
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptList;