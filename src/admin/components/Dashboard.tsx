import React from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  Server, 
  MessageSquare, 
  Settings, 
  BarChart3, 
  Users, 
  Zap, 
  Clock, 
  DollarSign 
} from 'lucide-react';

const Dashboard: React.FC = () => {
  const [error, setError] = React.useState<Error | null>(null);
  
  // Wrap the useAdmin hook in a try-catch to prevent uncaught exceptions
  let adminData;
  try {
    console.log('Dashboard: Attempting to use admin context');
    adminData = useAdmin();
    console.log('Dashboard: Successfully loaded admin context');
  } catch (err) {
    console.error('Dashboard: Error loading admin context:', err);
    setError(err instanceof Error ? err : new Error('Failed to load admin context'));
    // Provide fallback data
    adminData = {
      providers: {},
      prompts: [],
      usageStats: { totalRequests: 0, costEstimate: 0 },
      globalSettings: {
        defaultProvider: 'unknown',
        defaultModel: 'unknown',
        defaultTemperature: 0.7,
        defaultMaxTokens: 1000
      }
    };
  }
  
  const {
    providers,
    prompts,
    usageStats,
    globalSettings
  } = adminData;

  // Count enabled providers
  const enabledProviders = Object.values(providers).filter(p => p.enabled).length;
  const totalProviders = Object.values(providers).length;

  // Stats cards data
  const statsCards = [
    {
      title: 'AI Providers',
      value: `${enabledProviders}/${totalProviders}`,
      icon: <Server className="w-6 h-6 text-blue-500" />,
      description: 'Active providers',
      color: 'bg-blue-50',
    },
    {
      title: 'Prompt Templates',
      value: prompts.length.toString(),
      icon: <MessageSquare className="w-6 h-6 text-purple-500" />,
      description: 'Available templates',
      color: 'bg-purple-50',
    },
    {
      title: 'API Requests',
      value: usageStats.totalRequests.toLocaleString(),
      icon: <Zap className="w-6 h-6 text-yellow-500" />,
      description: 'Total API calls',
      color: 'bg-yellow-50',
    },
    {
      title: 'Cost Estimate',
      value: `$${usageStats.costEstimate.toFixed(2)}`,
      icon: <DollarSign className="w-6 h-6 text-green-500" />,
      description: 'Estimated cost',
      color: 'bg-green-50',
    },
  ];

  // If there's an error, show a fallback UI
  if (error) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-red-600">Dashboard Error</h1>
          <p className="text-gray-600">
            There was an error loading the dashboard data. This is likely due to missing API keys or configuration issues.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
          <pre className="text-sm">{error.message}</pre>
        </div>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
        >
          Return to Home
        </a>
      </div>
    );
  }

  // Wrap the entire component in a try-catch to prevent uncaught exceptions
  try {
    console.log('Dashboard: Rendering dashboard');
    return (
      <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
        <p className="text-gray-600">
          Welcome to the unified admin interface for SmashingApps.ai
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((card, index) => (
          <div 
            key={index} 
            className={`${card.color} p-6 rounded-lg shadow-sm border border-gray-100`}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-700">{card.title}</h2>
              {card.icon}
            </div>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-800">{card.value}</p>
              <p className="text-sm text-gray-500">{card.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a 
            href="/admin/providers" 
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all flex items-center"
          >
            <div className="bg-blue-50 p-3 rounded-lg mr-4">
              <Server className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Manage Providers</h3>
              <p className="text-sm text-gray-500">Configure AI providers and API keys</p>
            </div>
          </a>
          
          <a 
            href="/admin/prompts" 
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 hover:shadow-md transition-all flex items-center"
          >
            <div className="bg-purple-50 p-3 rounded-lg mr-4">
              <MessageSquare className="w-6 h-6 text-purple-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Manage Prompts</h3>
              <p className="text-sm text-gray-500">Create and edit prompt templates</p>
            </div>
          </a>
          
          <a 
            href="/admin/settings" 
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-md transition-all flex items-center"
          >
            <div className="bg-green-50 p-3 rounded-lg mr-4">
              <Settings className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-800">Global Settings</h3>
              <p className="text-sm text-gray-500">Configure application settings</p>
            </div>
          </a>
        </div>
      </div>

      {/* System Information */}
      <div>
        <h2 className="text-lg font-medium text-gray-800 mb-4">System Information</h2>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Default Configuration</h3>
              <ul className="space-y-2">
                <li className="flex items-center text-sm">
                  <span className="text-gray-500 w-32">Default Provider:</span>
                  <span className="font-medium">{globalSettings.defaultProvider}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-gray-500 w-32">Default Model:</span>
                  <span className="font-medium">{globalSettings.defaultModel}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-gray-500 w-32">Temperature:</span>
                  <span className="font-medium">{globalSettings.defaultTemperature}</span>
                </li>
                <li className="flex items-center text-sm">
                  <span className="text-gray-500 w-32">Max Tokens:</span>
                  <span className="font-medium">{globalSettings.defaultMaxTokens}</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-gray-700 mb-2">Active Providers</h3>
              <ul className="space-y-2">
                {Object.entries(providers).map(([key, provider]) => (
                  <li key={key} className="flex items-center text-sm">
                    <span className={`w-3 h-3 rounded-full mr-2 ${provider.enabled ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                    <span className="text-gray-800">{provider.name}</span>
                    <span className="ml-2 text-xs text-gray-500">
                      {provider.enabled ? 'Active' : 'Inactive'}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
      </div>
    );
  } catch (err) {
    console.error('Dashboard: Error rendering dashboard:', err);
    return (
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-red-600">Rendering Error</h1>
          <p className="text-gray-600">
            There was an error rendering the dashboard.
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
          <pre className="text-sm">{err instanceof Error ? err.message : 'Unknown error'}</pre>
        </div>
        <a
          href="/"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
        >
          Return to Home
        </a>
      </div>
    );
  }
};

export default Dashboard;