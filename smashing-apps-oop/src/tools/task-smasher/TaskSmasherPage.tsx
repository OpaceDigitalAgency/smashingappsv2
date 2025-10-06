import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAICore } from '../../shared/hooks/useAICore';

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
}

const TaskSmasherPage: React.FC = () => {
  const { isConfigured, sendRequest, extractContent } = useAICore();
  const [projectDescription, setProjectDescription] = useState('');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [generating, setGenerating] = useState(false);

  const handleGenerateTasks = async () => {
    if (!projectDescription.trim()) {
      alert('Please enter a project description');
      return;
    }

    setGenerating(true);

    try {
      const prompt = `Based on this project description, create a detailed task breakdown:

"${projectDescription}"

Generate 5-10 specific, actionable tasks. For each task, provide:
1. A clear, concise title
2. A brief description of what needs to be done
3. Priority level (low, medium, or high)

Format your response as a JSON array like this:
[
  {
    "title": "Task title",
    "description": "Task description",
    "priority": "medium"
  }
]

Only return the JSON array, no additional text.`;

      const response = await sendRequest(
        'gpt-4o-mini',
        [
          {
            role: 'system',
            content: 'You are a project management expert who breaks down projects into clear, actionable tasks. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        {
          maxTokens: 1500,
          temperature: 0.7,
        },
        'task-smasher'
      );

      const content = extractContent(response);
      
      // Parse JSON response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const parsedTasks = JSON.parse(jsonMatch[0]);
      
      const newTasks: Task[] = parsedTasks.map((task: any, index: number) => ({
        id: `task-${Date.now()}-${index}`,
        title: task.title,
        description: task.description,
        status: 'todo' as const,
        priority: task.priority || 'medium',
      }));

      setTasks(newTasks);
    } catch (error: any) {
      alert(`Failed to generate tasks: ${error.message}`);
    } finally {
      setGenerating(false);
    }
  };

  const updateTaskStatus = (taskId: string, status: Task['status']) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status } : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'done': return '✅';
      case 'in-progress': return '🔄';
      default: return '⭕';
    }
  };

  if (!isConfigured) {
    return (
      <div className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className="text-6xl mb-6">🔒</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI Not Configured
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Please configure at least one AI provider to use Task Smasher
            </p>
            <Link
              to="/admin"
              className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Configure AI
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress');
  const doneTasks = tasks.filter(t => t.status === 'done');

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">✅ Task Smasher</h1>
          <p className="text-lg text-gray-600">
            Break down projects into manageable tasks with AI assistance
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Project Description</h2>
          <textarea
            value={projectDescription}
            onChange={(e) => setProjectDescription(e.target.value)}
            placeholder="Describe your project... e.g., 'Build a mobile app for tracking fitness goals with social features'"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mb-4"
          />
          <button
            onClick={handleGenerateTasks}
            disabled={generating || !projectDescription.trim()}
            className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {generating ? 'Generating Tasks...' : 'Generate Task Breakdown'}
          </button>
        </div>

        {/* Tasks Board */}
        {tasks.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* To Do Column */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">⭕</span>
                To Do ({todoTasks.length})
              </h3>
              <div className="space-y-3">
                {todoTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'in-progress')}
                        className="flex-1 px-3 py-1 text-sm bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
                      >
                        Start
                      </button>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">🔄</span>
                In Progress ({inProgressTasks.length})
              </h3>
              <div className="space-y-3">
                {inProgressTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => updateTaskStatus(task.id, 'done')}
                        className="flex-1 px-3 py-1 text-sm bg-green-50 text-green-600 rounded hover:bg-green-100"
                      >
                        Complete
                      </button>
                      <button
                        onClick={() => updateTaskStatus(task.id, 'todo')}
                        className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded"
                      >
                        Back
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Done Column */}
            <div className="bg-green-50 rounded-lg p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <span className="mr-2">✅</span>
                Done ({doneTasks.length})
              </h3>
              <div className="space-y-3">
                {doneTasks.map(task => (
                  <div key={task.id} className="bg-white rounded-lg p-4 shadow-sm opacity-75">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 line-through">{task.title}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="w-full px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {tasks.length === 0 && !generating && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to Organise</h3>
            <p className="text-gray-600">
              Describe your project above and let AI break it down into manageable tasks
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskSmasherPage;

