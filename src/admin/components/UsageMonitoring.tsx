import React, { useEffect } from 'react';
import { useAdmin, TimeRange } from '../contexts/AdminContext';
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
  Clock,
  Trash2
} from 'lucide-react';
import Button from '../../shared/components/Button/Button';
import { AIProvider, ProviderConfig } from '../../shared/types/aiProviders';
import {
  getTimeLabels,
  getTimeSeriesData,
  clearAllLimitsAndUsage,
  UsageData
} from '../../shared/services/usageTrackingService';

const UsageMonitoring: React.FC = () => {
  const { usageStats, timeRange, setTimeRange, providers } = useAdmin();
  const currentTimeRange = timeRange as TimeRange; // Type assertion since we know it's valid
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [showClearSuccess, setShowClearSuccess] = React.useState(false);
  
  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    
    // Dispatch a custom event to refresh usage data
    window.dispatchEvent(new CustomEvent('refresh-usage-data'));
    
    // Reset refreshing state after a short delay
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };
  
  // Handle clear rate limits
  const handleClearRateLimits = () => {
    setIsClearing(true);
    
    // Clear all usage data and rate limits
    clearAllLimitsAndUsage();
    
    // Show success message
    setShowClearSuccess(true);
    
    // Reset clearing state after a short delay
    setTimeout(() => {
      setIsClearing(false);
      
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowClearSuccess(false);
      }, 3000);
    }, 1000);
  };
  
  // Handle export
  const handleExport = (format: 'csv' | 'json') => {
    // Create a data object to export
    const dataToExport = {
      timeRange,
      totalRequests: usageStats.totalRequests,
      totalTokens: usageStats.totalTokens,
      costEstimate: usageStats.costEstimate,
      requestsByProvider: usageStats.requestsByProvider,
      tokensByProvider: usageStats.tokensByProvider,
      costByProvider: usageStats.costByProvider,
      requestsByApp: usageStats.requestsByApp,
      tokensByApp: usageStats.tokensByApp,
      costByApp: usageStats.costByApp,
      exportDate: new Date().toISOString()
    };
    
    // Convert to the requested format
    let content: string;
    let mimeType: string;
    let filename: string;
    
    if (format === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json';
      filename = `usage-data-${timeRange}-${new Date().toISOString().split('T')[0]}.json`;
    } else {
      // Convert to CSV
      const headers = [
        'Provider', 'Requests', 'Tokens', 'Cost'
      ].join(',');
      
      const providerRows = Object.entries(usageStats.requestsByProvider as Record<AIProvider, number>).map(([provider, requests]) => {
        const tokens = (usageStats.tokensByProvider as Record<AIProvider, number>)[provider as AIProvider] || 0;
        const cost = (usageStats.costByProvider as Record<AIProvider, number>)[provider as AIProvider] || 0;
        return [provider, requests, tokens, cost.toFixed(2)].join(',');
      });
      
      const appHeaders = [
        'Application', 'Requests', 'Tokens', 'Cost'
      ].join(',');
      
      const appRows = Object.entries(usageStats.requestsByApp as Record<string, number>).map(([app, requests]) => {
        const tokens = (usageStats.tokensByApp as Record<string, number>)[app] || 0;
        const cost = (usageStats.costByApp as Record<string, number>)[app] || 0;
        return [app, requests, tokens, cost.toFixed(2)].join(',');
      });
      
      content = [
        `Usage Data - ${timeRange} - ${new Date().toLocaleDateString()}`,
        `Total Requests: ${usageStats.totalRequests}`,
        `Total Tokens: ${usageStats.totalTokens}`,
        `Total Cost: $${usageStats.costEstimate.toFixed(2)}`,
        '',
        'Usage by Provider:',
        headers,
        ...providerRows,
        '',
        'Usage by Application:',
        appHeaders,
        ...appRows
      ].join('\n');
      
      mimeType = 'text/csv';
      filename = `usage-data-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
    }
    
    // Create a download link
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  // Get time labels and data for charts
  const labels = getTimeLabels(currentTimeRange);
  const { requests: requestsData, tokens: tokensData, inputTokens: inputTokensData, outputTokens: outputTokensData, costs: costData } = getTimeSeriesData(currentTimeRange);
  
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
          {showClearSuccess && (
            <div className="mr-2 px-3 py-1 bg-green-100 text-green-800 rounded-md text-sm">
              Rate limits cleared successfully!
            </div>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="mr-2"
          >
            <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={handleClearRateLimits}
            disabled={isClearing}
            className="mr-2"
          >
            <Trash2 className={`w-4 h-4 mr-1 ${isClearing ? 'animate-spin' : ''}`} />
            Clear Rate Limits
          </Button>
          <div className="relative group">
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
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">API Requests</h2>
            <Zap className="w-6 h-6 text-yellow-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{usageStats.totalRequests.toLocaleString()}</p>
          <p className="text-sm text-gray-500">Total requests in selected period</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Tokens Used</h2>
            <Hash className="w-6 h-6 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{usageStats.totalTokens.toLocaleString()}</p>
          <p className="text-sm text-gray-500">
            Input: {(usageStats.totalInputTokens || 0).toLocaleString()} |
            Output: {(usageStats.totalOutputTokens || 0).toLocaleString()}
          </p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Cost Estimate</h2>
            <DollarSign className="w-6 h-6 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">${usageStats.costEstimate.toFixed(2)}</p>
          <p className="text-sm text-gray-500">Based on model-specific rates</p>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Average Cost</h2>
            <DollarSign className="w-6 h-6 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900 mb-1">
            ${usageStats.totalTokens > 0 ? ((usageStats.costEstimate / usageStats.totalTokens) * 1000).toFixed(4) : '0.0000'}
          </p>
          <p className="text-sm text-gray-500">Per 1K tokens</p>
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
                  style={{ height: `${(value / Math.max(...requestsData, 1)) * 100}%` }}
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
            <div className="flex items-center text-xs">
              <div className="w-3 h-3 bg-purple-500 rounded-sm mr-1"></div>
              <span className="mr-3">Total</span>
              <div className="w-3 h-3 bg-blue-400 rounded-sm mr-1"></div>
              <span className="mr-3">Input</span>
              <div className="w-3 h-3 bg-green-400 rounded-sm mr-1"></div>
              <span>Output</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between">
            {tokensData.map((value, index) => {
              const inputValue = inputTokensData[index];
              const outputValue = outputTokensData[index];
              const maxValue = Math.max(...tokensData, 1);
              
              return (
                <div key={index} className="flex flex-col items-center">
                  <div className="relative w-12 flex justify-center">
                    {/* Total tokens bar */}
                    <div
                      className="bg-purple-500 rounded-t-sm w-8 absolute"
                      style={{ height: `${(value / maxValue) * 100}%`, zIndex: 1 }}
                    ></div>
                    {/* Input tokens bar */}
                    <div
                      className="bg-blue-400 rounded-t-sm w-4 absolute left-0"
                      style={{ height: `${(inputValue / maxValue) * 100}%`, zIndex: 2 }}
                    ></div>
                    {/* Output tokens bar */}
                    <div
                      className="bg-green-400 rounded-t-sm w-4 absolute right-0"
                      style={{ height: `${(outputValue / maxValue) * 100}%`, zIndex: 2 }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">{labels[index]}</span>
                </div>
              );
            })}
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
                    Tokens (Input/Output)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Cost/1K
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(usageStats.requestsByProvider as Record<AIProvider, number>).map(([key, requests]) => {
                  const provider = key as AIProvider;
                  const tokens = (usageStats.tokensByProvider as Record<AIProvider, number>)[provider] || 0;
                  const cost = (usageStats.costByProvider as Record<AIProvider, number>)[provider] || 0;
                  const providerConfig = (providers as Record<AIProvider, ProviderConfig>)[provider];
                  
                  return (
                    <tr key={key}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm font-medium text-gray-700">
                              {(providerConfig?.name || provider).charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {providerConfig?.name || provider} {providerConfig?.defaultModel ? providerConfig.defaultModel.split('/')[1] : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tokens.toLocaleString()}
                        <span className="text-xs text-gray-400">
                          ({(usageStats.inputTokensByProvider[provider] || 0).toLocaleString()} /
                          {(usageStats.outputTokensByProvider[provider] || 0).toLocaleString()})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${tokens > 0 ? ((cost / tokens) * 1000).toFixed(4) : '0.0000'}
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(usageStats.requestsByProvider).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No provider usage data available for the selected time period.
                    </td>
                  </tr>
                )}
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
                    Tokens (Input/Output)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg. Cost/1K
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(usageStats.requestsByApp as Record<string, number>).map(([appId, requests]) => {
                  const tokens = (usageStats.tokensByApp as Record<string, number>)[appId] || 0;
                  const cost = (usageStats.costByApp as Record<string, number>)[appId] || 0;
                  
                  // Format app name for display
                  const appName = appId
                    .split('-')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(' ');
                  
                  return (
                    <tr key={appId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100">
                            <span className="text-sm font-medium text-gray-700">
                              {appName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tokens.toLocaleString()}
                        <span className="text-xs text-gray-400">
                          ({((usageStats.inputTokensByApp as Record<string, number>)[appId] || 0).toLocaleString()} /
                          {((usageStats.outputTokensByApp as Record<string, number>)[appId] || 0).toLocaleString()})
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${tokens > 0 ? ((cost / tokens) * 1000).toFixed(4) : '0.0000'}
                      </td>
                    </tr>
                  );
                })}
                {Object.keys(usageStats.requestsByApp).length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      No application usage data available for the selected time period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsageMonitoring;