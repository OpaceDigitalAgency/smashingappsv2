import React, { useState } from 'react';
import { usePrompt } from '../../contexts/PromptContext';
import PromptList from './PromptList';
import PromptEditor from './PromptEditor';
import SettingsManager from './SettingsManager';
import Card from '../../../../../shared/components/Card/Card';
import Button from '../../../../../shared/components/Button/Button';

/**
 * Admin Dashboard Component
 * 
 * This component serves as the main admin interface for managing prompts and settings.
 */
const AdminDashboard: React.FC = () => {
  const { prompts, settings, activePrompt, setActivePrompt } = usePrompt();
  const [activeTab, setActiveTab] = useState<'prompts' | 'settings'>('prompts');

  return (
    <div className="admin-dashboard">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Admin Dashboard</h1>
        <p className="text-gray-600">
          Manage AI prompts and settings for the Article Smasher tool.
        </p>
      </div>

      <div className="flex mb-6 border-b border-gray-200">
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'prompts'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('prompts')}
        >
          Prompts
        </button>
        <button
          className={`py-2 px-4 font-medium ${
            activeTab === 'settings'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </div>

      {activeTab === 'prompts' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card title="Prompt Templates">
              <PromptList
                prompts={prompts}
                activePromptId={activePrompt?.id}
                onSelectPrompt={(prompt) => setActivePrompt(prompt)}
                onAddNewPrompt={() => {
                  setActivePrompt({
                    id: '',
                    name: 'New Prompt Template',
                    description: 'Description of the new prompt template',
                    systemPrompt: 'You are a helpful assistant.',
                    userPromptTemplate: 'Please provide information about {{topic}}.',
                    category: 'topic',
                    temperature: 0.7,
                    maxTokens: 1000,
                    createdAt: new Date(),
                    updatedAt: new Date()
                  });
                }}
              />
            </Card>
          </div>
          <div className="lg:col-span-2">
            {activePrompt ? (
              <PromptEditor prompt={activePrompt} />
            ) : (
              <Card>
                <div className="p-6 text-center">
                  <p className="text-gray-500 mb-4">
                    Select a prompt template from the list or create a new one to edit.
                  </p>
                  <Button
                    variant="primary"
                    onClick={() => {
                      setActivePrompt({
                        id: '',
                        name: 'New Prompt Template',
                        description: 'Description of the new prompt template',
                        systemPrompt: 'You are a helpful assistant.',
                        userPromptTemplate: 'Please provide information about {{topic}}.',
                        category: 'topic',
                        temperature: 0.7,
                        maxTokens: 1000,
                        createdAt: new Date(),
                        updatedAt: new Date()
                      });
                    }}
                  >
                    Create New Prompt
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}

      {activeTab === 'settings' && (
        <Card title="AI Settings">
          <SettingsManager settings={settings} />
        </Card>
      )}
    </div>
  );
};

export default AdminDashboard;