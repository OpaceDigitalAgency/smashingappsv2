import React, { useState } from 'react';
import { useAdmin } from '../contexts/AdminContext';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar, 
  Download, 
  RefreshCw, 
  DollarSign, 
  Zap, 
  Hash, 
  Clock 
} from 'lucide-react';
import Button from '../../shared/components/Button/Button';
import { AIProvider } from '../../shared/types/aiProviders';

const UsageMonitoring: React.FC = () => {
  const { usageStats, providers } = useAdmin();
  const [timeRange, setTimeRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Simulate refreshing data
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    // In a real implementation, we would export the data to a file
    console.log(`Exporting usage data as ${format}`);
  };
  
  // Generate random data for the charts
  const generateRandomData = (length: number, min: number, max: number) => {
    return Array.from({ length }, () => Math.floor(Math.random() * (max - min + 1)) + min);
  };
  
  // Generate labels for the time range
  const generateLabels = () => {
    const now = new Date();
    const labels: string[] = [];
    
    switch (timeRange) {
      case 'day':
        // Generate hourly labels for the past 24 hours
        for (let i = 0; i < 24; i++) {
          labels.push(`${i}:00`);
        }
        break;
      case 'week':
        // Generate daily labels for the past 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          labels.push(date.toLocaleDateString('en-US', { weekday: 'short' }));
        }
        break;
      case 'month':
        // Generate weekly labels for the past 4 weeks
        for (let i = 4; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - (i * 7));
          labels.push(`Week ${4 - i}`);
        }
        break;
      case 'year':
        // Generate monthly labels for the past 12 months
        for (let i = 0; i < 12; i++) {
          const date = new Date(now);
          date.setMonth(date.getMonth() - (11 - i));
          labels.push(date.toLocaleDateString('en-US', { month: 'short' }));
        }
        break;
    }
    
    return labels;
  };
  
  // Generate random data for the charts based on the time range
  const labels = generateLabels();
  const requestsData = generateRandomData(labels.length, 10, 100);
  const tokensData = generateRandomData(labels.length, 1000, 10000);
  const costData = tokensData.map(tokens => (tokens * 0.002).toFixed(2));
  
  // Calculate totals
  const totalRequests = requestsData.reduce((sum, value) => sum + value, 0);
  const totalTokens = tokensData.reduce((sum, value) => sum + value, 0);
  const totalCost = costData.reduce((sum, value) => sum + parseFloat(value), 0);
  
  return (
    <div className="p-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Usage Monitoring</h1>
          <p className="text-gray-600">
            Monitor API usage and costs across all applications
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <div className="relative">
            <Button
              variant="secondary"
              size="sm"
            >
              <Download className="w-4 h-4 mr-1" />
              Export
            </Button>
            <div className="absolute right-0 mt-1 w-32 bg-white rounded-md shadow-lg border border-gray-200 z-10 hidden group-hover:block">
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('csv')}
              >
                Export as CSV
              </button>
              <button
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                onClick={() => handleExport('json')}
              >
                Export as JSON
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Time range selector */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 flex space-x-2">
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeRange === 'day' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setTimeRange('day')}
          >
            Day
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeRange === 'week' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setTimeRange('week')}
          >
            Week
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeRange === 'month' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setTimeRange('month')}
          >
            Month
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-sm font-medium ${
              timeRange === 'year' 
                ? 'bg-blue-100 text-blue-700' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setTimeRange('year')}
          >
            Year
          </button>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">API Requests</h2>
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalRequests.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total requests in selected period</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Tokens Used</h2>
            <Hash className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{totalTokens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total tokens in selected period</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Cost Estimate</h2>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">${totalCost.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Estimated cost in selected period</p>
        </div>
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Requests chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">API Requests</h2>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between">
            {requestsData.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-blue-500 rounded-t-sm w-8" 
                  style={{ height: `${(value / Math.max(...requestsData)) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{labels[index]}</span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Tokens chart */}
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Tokens Used</h2>
            <LineChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="h-64 flex items-end justify-between">
            {tokensData.map((value, index) => (
              <div key={index} className="flex flex-col items-center">
                <div 
                  className="bg-purple-500 rounded-t-sm w-8" 
                  style={{ height: `${(value / Math.max(...tokensData)) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-1">{labels[index]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Usage by provider */}
      <div className="mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Usage by Provider</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Provider
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(providers).map(([key, provider]) => {
                  // Generate random data for each provider
                  const providerRequests = Math.floor(Math.random() * totalRequests * 0.5);
                  const providerTokens = Math.floor(Math.random() * totalTokens * 0.5);
                  const providerCost = (providerTokens * 0.002).toFixed(2);
                  
                  return (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm font-medium text-gray-700">
                              {provider.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {provider.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {providerRequests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {providerTokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${providerCost}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Usage by application */}
      <div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Usage by Application</h2>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Requests
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tokens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[
                  { id: 'task-smasher', name: 'Task Smasher' },
                  { id: 'article-smasher', name: 'Article Smasher' },
                  { id: 'article-smasherv2', name: 'Article Smasher V2' }
                ].map(app => {
                  // Generate random data for each app
                  const appRequests = Math.floor(Math.random() * totalRequests * 0.5);
                  const appTokens = Math.floor(Math.random() * totalTokens * 0.5);
                  const appCost = (appTokens * 0.002).toFixed(2);
                  
                  return (
                    <tr key={app.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm font-medium text-gray-700">
                              {app.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {app.name}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appRequests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {appTokens.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${appCost}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageMonitoring;