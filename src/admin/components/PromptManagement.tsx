import React, { useState, useEffect } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Copy,
  ChevronDown,
  ChevronUp,
  Tag,
  Thermometer,
  Hash,
  Zap
} from 'lucide-react';
import Button from '../../shared/components/Button/Button';
import { PromptTemplate } from '../../tools/article-smasher/src/types';
import { TaskSmasherPromptTemplate } from '../../tools/task-smasher/utils/promptTemplates';

const PromptManagement: React.FC = () => {
  const { 
    prompts, 
    activePrompt, 
    setActivePrompt, 
    addPrompt,
    updatePrompt,
    deletePrompt,
    taskSmasherPrompts,
    activeTaskSmasherPrompt,
    setActiveTaskSmasherPrompt,
    addTaskSmasherPrompt,
    updateTaskSmasherPrompt,
    deleteTaskSmasherPrompt
  } = useAdmin();
  
  const [editedPrompt, setEditedPrompt] = useState<PromptTemplate | TaskSmasherPromptTemplate | null>(null);
  const [expandedSection, setExpandedSection] = useState<'system' | 'user' | 'subtask' | 'idea' | 'settings' | null>('system');
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterApplication, setFilterApplication] = useState<'article' | 'task' | null>('article');
  const [searchTerm, setSearchTerm] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Initialize edited prompt when active prompt changes
  useEffect(() => {
    if (activePrompt) {
      setEditedPrompt({ ...activePrompt });
      setFilterApplication('article');
    } else if (activeTaskSmasherPrompt) {
      setEditedPrompt({ ...activeTaskSmasherPrompt });
      setFilterApplication('task');
    } else {
      setEditedPrompt(null);
    }
  }, [activePrompt, activeTaskSmasherPrompt]);

  // Create a new prompt
  const handleCreatePrompt = (type: 'article' | 'task' = 'article') => {
    if (type === 'article') {
      const newPrompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        name: 'New Article Prompt Template',
        description: 'Description of the new article prompt template',
        systemPrompt: 'You are a helpful assistant.',
        userPromptTemplate: 'Please provide information about {{topic}}.',
        category: 'topic',
        temperature: 0.7,
        maxTokens: 1000,
      };
      
      setActivePrompt({
        ...newPrompt,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setActiveTaskSmasherPrompt(null);
    } else {
      const newPrompt: Omit<TaskSmasherPromptTemplate, 'id' | 'createdAt' | 'updatedAt'> = {
        category: 'daily',
        label: 'New Task Prompt Template',
        description: 'Description of the new task prompt template',
        subtaskSystemPrompt: 'You are a task management AI assistant.',
        subtaskUserPromptTemplate: 'Break down this task into {{breakdownLevel}} specific steps: "{{taskTitle}}"{{taskContext}}',
        ideaSystemPrompt: 'You are a helpful assistant. Generate task ideas.',
        ideaUserPromptTemplate: 'Generate 5 task ideas for {{category}}',
        temperature: 0.7,
        maxTokens: 1000,
      };
      
      setActiveTaskSmasherPrompt({
        ...newPrompt,
        id: '',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      setActivePrompt(null);
    }
  };

  // Save prompt changes
  const handleSavePrompt = async () => {
    if (!editedPrompt) return;
    
    try {
      // Check if it's an ArticleSmasher prompt or TaskSmasher prompt
      if ('userPromptTemplate' in editedPrompt) {
        // It's an ArticleSmasher prompt
        if (editedPrompt.id) {
          // Update existing prompt
          await updatePrompt(editedPrompt.id, editedPrompt as PromptTemplate);
        } else {
          // Add new prompt
          const { id, createdAt, updatedAt, ...promptData } = editedPrompt as PromptTemplate;
          await addPrompt(promptData);
        }
      } else if ('subtaskUserPromptTemplate' in editedPrompt) {
        // It's a TaskSmasher prompt
        if (editedPrompt.id) {
          // Update existing prompt
          await updateTaskSmasherPrompt(editedPrompt.id, editedPrompt as TaskSmasherPromptTemplate);
        } else {
          // Add new prompt
          const { id, createdAt, updatedAt, ...promptData } = editedPrompt as TaskSmasherPromptTemplate;
          await addTaskSmasherPrompt(promptData);
        }
      }
    } catch (error) {
      console.error('Failed to save prompt:', error);
    }
  };

  // Delete prompt
  const handleDeletePrompt = async () => {
    try {
      if (activePrompt) {
        await deletePrompt(activePrompt.id);
        setShowDeleteConfirm(false);
      } else if (activeTaskSmasherPrompt) {
        await deleteTaskSmasherPrompt(activeTaskSmasherPrompt.id);
        setShowDeleteConfirm(false);
      }
    } catch (error) {
      console.error('Failed to delete prompt:', error);
    }
  };

  // Handle input changes
  const handleInputChange = (field: string, value: any) => {
    if (!editedPrompt) return;
    
    setEditedPrompt({
      ...editedPrompt,
      [field]: value
    });
  };

  // Toggle section expansion
  const toggleSection = (section: 'system' | 'user' | 'subtask' | 'idea' | 'settings') => {
    setExpandedSection(prev => prev === section ? null : section);
  };

  // Filter prompts by category and search term
  // Filter prompts based on application, category, and search term
  const filteredArticlePrompts = prompts.filter(prompt => {
    const matchesCategory = !filterCategory || prompt.category === filterCategory;
    const matchesSearch = !searchTerm ||
      prompt.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });
  
  const filteredTaskPrompts = taskSmasherPrompts.filter(prompt => {
    const matchesCategory = !filterCategory || prompt.category === filterCategory;
    const matchesSearch = !searchTerm ||
      prompt.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesCategory && matchesSearch;
  });

  // Get unique categories
  // Get unique categories
  const articleCategories = Array.from(new Set(prompts.map(p => p.category)));
  const taskCategories = Array.from(new Set(taskSmasherPrompts.map(p => p.category)));

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Prompt Management</h1>
        <p className="text-gray-600">
          Create and manage AI prompt templates for all applications
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Prompt List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="p-4 border-b border-gray-100 flex justify-between items-center">
              <h2 className="font-medium text-gray-800">Prompt Templates</h2>
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterApplication('article');
                    setActiveTaskSmasherPrompt(null);
                  }}
                  className={filterApplication === 'article' ? 'bg-blue-50' : ''}
                >
                  Article
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setFilterApplication('task');
                    setActivePrompt(null);
                  }}
                  className={filterApplication === 'task' ? 'bg-blue-50' : ''}
                >
                  Task
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleCreatePrompt(filterApplication || 'article')}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  New
                </Button>
              </div>
            </div>
            
            {/* Search and filter */}
            <div className="p-3 border-b border-gray-100 bg-gray-50">
              <div className="mb-2">
                <input
                  type="text"
                  placeholder="Search prompts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-1">
                <button
                  className={`px-2 py-1 text-xs rounded-full ${
                    !filterCategory 
                      ? 'bg-blue-100 text-blue-700' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  onClick={() => setFilterCategory(null)}
                >
                  All
                </button>
                {filterApplication === 'article' ? (
                  articleCategories.map(category => (
                    <button
                      key={category}
                      className={`px-2 py-1 text-xs rounded-full ${
                        filterCategory === category
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </button>
                  ))
                ) : (
                  taskCategories.map(category => (
                    <button
                      key={category}
                      className={`px-2 py-1 text-xs rounded-full ${
                        filterCategory === category
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </button>
                  ))
                )}
              </div>
            </div>
            
            {/* Prompt list */}
            <div className="overflow-y-auto max-h-[500px]">
              {(filterApplication === 'article' ? filteredArticlePrompts : filteredTaskPrompts).length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No prompts found
                </div>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {filterApplication === 'article' ? (
                    // Article prompts
                    filteredArticlePrompts.map(prompt => (
                      <li
                        key={prompt.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          activePrompt?.id === prompt.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setActivePrompt(prompt);
                          setActiveTaskSmasherPrompt(null);
                          setFilterApplication('article');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{prompt.name}</h3>
                            <p className="text-xs text-gray-500">{prompt.description}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {prompt.category}
                          </span>
                        </div>
                      </li>
                    ))
                  ) : (
                    // Task prompts
                    filteredTaskPrompts.map(prompt => (
                      <li
                        key={prompt.id}
                        className={`p-3 hover:bg-gray-50 cursor-pointer ${
                          activeTaskSmasherPrompt?.id === prompt.id ? 'bg-blue-50' : ''
                        }`}
                        onClick={() => {
                          setActiveTaskSmasherPrompt(prompt);
                          setActivePrompt(null);
                          setFilterApplication('task');
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium text-gray-800">{prompt.label}</h3>
                            <p className="text-xs text-gray-500">{prompt.description}</p>
                          </div>
                          <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                            {prompt.category}
                          </span>
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Prompt Editor */}
        <div className="lg:col-span-2">
          {!editedPrompt ? (
            <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
              <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Prompt Selected</h3>
              <p className="text-gray-500 mb-4">
                Select a prompt template from the list or create a new one to edit.
              </p>
              <Button
                variant="primary"
                onClick={handleCreatePrompt}
              >
                <Plus className="w-4 h-4 mr-1" />
                Create New Prompt
              </Button>
            </div>
          ) : (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Editor header */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                <h2 className="font-medium text-gray-800">
                  {editedPrompt.id ? 'Edit Prompt' : 'New Prompt'}
                </h2>
                <div className="flex items-center space-x-2">
                  {editedPrompt.id && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setShowDeleteConfirm(true)}
                    >
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  )}
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleSavePrompt}
                  >
                    <Save className="w-4 h-4 mr-1" />
                    Save
                  </Button>
                </div>
              </div>

              {/* Basic info */}
              <div className="p-4 border-b border-gray-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      value={editedPrompt.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category
                    </label>
                    <select
                      value={editedPrompt.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md"
                    >
                      <option value="topic">Topic</option>
                      <option value="keyword">Keyword</option>
                      <option value="outline">Outline</option>
                      <option value="content">Content</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    value={editedPrompt.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-md"
                  />
                </div>
              </div>

              {/* System prompt */}
              <div className="border-b border-gray-100">
                <button
                  className="w-full p-4 text-left flex items-center justify-between"
                  onClick={() => toggleSection('system')}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-blue-500 mr-2" />
                    <h3 className="font-medium text-gray-800">System Prompt</h3>
                  </div>
                  {expandedSection === 'system' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'system' && (
                  <div className="p-4 bg-gray-50">
                    <textarea
                      value={editedPrompt.systemPrompt}
                      onChange={(e) => handleInputChange('systemPrompt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md h-32"
                      placeholder="Enter system prompt..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      The system prompt sets the behavior and context for the AI assistant.
                    </p>
                  </div>
                )}
              </div>

              {/* User prompt template */}
              <div className="border-b border-gray-100">
                <button
                  className="w-full p-4 text-left flex items-center justify-between"
                  onClick={() => toggleSection('user')}
                >
                  <div className="flex items-center">
                    <MessageSquare className="w-5 h-5 text-green-500 mr-2" />
                    <h3 className="font-medium text-gray-800">User Prompt Template</h3>
                  </div>
                  {expandedSection === 'user' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'user' && (
                  <div className="p-4 bg-gray-50">
                    <textarea
                      value={editedPrompt.userPromptTemplate}
                      onChange={(e) => handleInputChange('userPromptTemplate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-md h-32"
                      placeholder="Enter user prompt template..."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Use variables like {'{{topic}}'} or {'{{keyword}}'} that will be replaced with actual values.
                    </p>
                  </div>
                )}
              </div>

              {/* Settings */}
              <div>
                <button
                  className="w-full p-4 text-left flex items-center justify-between"
                  onClick={() => toggleSection('settings')}
                >
                  <div className="flex items-center">
                    <Tag className="w-5 h-5 text-purple-500 mr-2" />
                    <h3 className="font-medium text-gray-800">Model Settings</h3>
                  </div>
                  {expandedSection === 'settings' ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>
                {expandedSection === 'settings' && (
                  <div className="p-4 bg-gray-50">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Thermometer className="w-4 h-4 mr-1" />
                          Temperature
                        </label>
                        <div className="flex items-center">
                          <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.1"
                            value={editedPrompt.temperature}
                            onChange={(e) => handleInputChange('temperature', parseFloat(e.target.value))}
                            className="flex-1 mr-2"
                          />
                          <span className="text-sm font-medium w-10 text-center">
                            {editedPrompt.temperature}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Higher values make output more random, lower values more deterministic.
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <Hash className="w-4 h-4 mr-1" />
                          Max Tokens
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="32000"
                          value={editedPrompt.maxTokens || 1000}
                          onChange={(e) => handleInputChange('maxTokens', parseInt(e.target.value))}
                          className="w-full px-3 py-2 border border-gray-200 rounded-md"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Maximum number of tokens to generate in the response.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md mx-auto">
                <h3 className="text-lg font-medium text-gray-900 mb-3">Confirm Deletion</h3>
                <p className="text-gray-600 mb-4">
                  Are you sure you want to delete the prompt "{activePrompt?.name}"? This action cannot be undone.
                </p>
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowDeleteConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={handleDeletePrompt}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptManagement;
