import React from 'react';
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
  Trash2,
  Bug,
  RefreshCcw
} from 'lucide-react';
import {
  debugUsageTracking,
  fixUsageTrackingData,
  forceRefreshUsageData,
  forceArticleSmasherIdentification,
  testModelOverride
} from '../../shared/utils/usageDebugUtils';
import Button from '../../shared/components/Button/Button';
import { AIProvider, ProviderConfig } from '../../shared/types/aiProviders';
import { AppId } from '../../shared/services/appRegistry';
import {
  getTimeLabels,
  getTimeSeriesData,
  clearAllLimitsAndUsage,
  UsageData,
  createInitialProviderRecord
} from '../../shared/services/usageTrackingService';

const UsageMonitoring: React.FC = () => {
  const { usageStats, timeRange, setTimeRange, providers } = useAdmin();
  const currentTimeRange = timeRange as TimeRange; // Type assertion since we know it's valid
  const [isRefreshing, setIsRefreshing] = React.useState(false);
  const [isClearing, setIsClearing] = React.useState(false);
  const [showClearSuccess, setShowClearSuccess] = React.useState(false);
  const [showDebugPanel, setShowDebugPanel] = React.useState(false);
  const [isFixingData, setIsFixingData] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<Error | null>(null);

  // Validate usage stats
  if (!usageStats) {
    console.error('Usage stats is undefined');
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: Usage data is not available</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => window.dispatchEvent(new CustomEvent('refresh-usage-data'))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Initialize usage data on mount and handle errors
  React.useEffect(() => {
    const initializeUsageData = async () => {
      try {
        setError(null);
        // Force a refresh of usage data
        window.dispatchEvent(new CustomEvent('refresh-usage-data'));
      } catch (error) {
        console.error('Error initializing usage data:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize usage data'));
      } finally {
        setIsLoading(false);
      }
    };

    initializeUsageData();
  }, []);

  // Show error state if there's an error
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-700">Error: {error.message}</p>
          <button
            className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded hover:bg-red-200"
            onClick={() => window.dispatchEvent(new CustomEvent('refresh-usage-data'))}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-600">Loading usage data...</p>
          </div>
        </div>
      </div>
    );
  }
  
  // Handle refresh with error handling
  const handleRefresh = () => {
    try {
      setIsRefreshing(true);
      setError(null);
      
      // Explicitly refresh enhanced usage tracking
      try {
        const { enhancedUsageTracking } = require('../../shared/services');
        enhancedUsageTracking.refreshData();
        console.log('[UsageMonitoring] Enhanced usage tracking refreshed');
      } catch (error) {
        console.error('[UsageMonitoring] Error refreshing enhanced usage tracking:', error);
      }
      
      // Dispatch a custom event to refresh usage data
      window.dispatchEvent(new CustomEvent('refresh-usage-data'));
      
      // Reset refreshing state after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error refreshing usage data:', error);
      setError(error instanceof Error ? error : new Error('Failed to refresh usage data'));
      setIsRefreshing(false);
    }
  };
  
  // Handle clear rate limits
  const handleClearRateLimits = () => {
    try {
      setIsClearing(true);
      setError(null);
      
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
    } catch (error) {
      console.error('Error clearing rate limits:', error);
      setError(error instanceof Error ? error : new Error('Failed to clear rate limits'));
      setIsClearing(false);
    }
  };
  
  // Handle debug actions
  const handleDebugUsageTracking = () => {
    debugUsageTracking();
  };
  
  const handleFixUsageData = () => {
    setIsFixingData(true);
    
    try {
      fixUsageTrackingData();
      
      // Refresh the UI after fixing
      setTimeout(() => {
        forceRefreshUsageData();
        setIsFixingData(false);
      }, 500);
    } catch (error) {
      console.error('Error fixing usage data:', error);
      setIsFixingData(false);
    }
  };
  
  const handleForceRefresh = () => {
    setIsRefreshing(true);
    
    try {
      forceRefreshUsageData();
      
      // Reset refreshing state after a short delay
      setTimeout(() => {
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error forcing refresh:', error);
      setIsRefreshing(false);
    }
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
      
      const providerRows = Object.entries(usageStats.requestsByProvider || createInitialProviderRecord()).map(([provider, requests]) => {
        const tokens = (usageStats.tokensByProvider || createInitialProviderRecord())[provider as AIProvider] || 0;
        const cost = (usageStats.costByProvider || createInitialProviderRecord())[provider as AIProvider] || 0;
        return [provider, requests, tokens, cost.toFixed(2)].join(',');
      });
      
      const appHeaders = [
        'Application', 'Requests', 'Tokens', 'Cost'
      ].join(',');
      
      const appRows = Object.entries(usageStats.requestsByApp || {} as Record<string, number>).map(([app, requests]) => {
        const appId = app as AppId;
        const tokens = (usageStats.tokensByApp || {} as Record<AppId, number>)[appId] || 0;
        const cost = (usageStats.costByApp || {} as Record<AppId, number>)[appId] || 0;
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
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            className="mr-2"
          >
            <Bug className="w-4 h-4 mr-1" />
            Debug
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
                {usageStats.requestsByProvider && Object.entries(usageStats.requestsByProvider || createInitialProviderRecord()).map(([key, requests]) => {
                  const provider = key as AIProvider;
                  const tokens = (usageStats.tokensByProvider && usageStats.tokensByProvider[provider]) || 0;
                  const cost = (usageStats.costByProvider && usageStats.costByProvider[provider]) || 0;
                  const providerConfig = (providers && providers[provider]);
                  
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
                {(!usageStats.requestsByProvider || Object.keys(usageStats.requestsByProvider).length === 0) && (
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
                {usageStats.requestsByApp && Object.entries(usageStats.requestsByApp || {} as Record<string, number>)
                  .sort((a, b) => b[1] - a[1]) // Sort by number of requests
                  .map(([appId, requests]) => {
                    const appIdTyped = appId as AppId;
                    const tokens = (usageStats.tokensByApp && usageStats.tokensByApp[appIdTyped]) || 0;
                    const inputTokens = (usageStats.inputTokensByApp && usageStats.inputTokensByApp[appIdTyped]) || 0;
                    const outputTokens = (usageStats.outputTokensByApp && usageStats.outputTokensByApp[appIdTyped]) || 0;
                    const cost = (usageStats.costByApp && usageStats.costByApp[appIdTyped]) || 0;
                    
                    // Format app name for display - use a more generic approach
                    const appName = appId.split('-')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    
                    // Calculate percentage of total requests
                    const percentOfTotal = ((requests / usageStats.totalRequests) * 100).toFixed(1);
                  
                  return (
                    <tr key={appId}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-8 w-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-700">
                            <span className="text-sm font-medium">
                              {appName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appName}
                            </div>
                            <div className="text-xs text-gray-500">
                              {percentOfTotal}% of total requests
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {requests.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {tokens.toLocaleString()}
                        <div className="text-xs text-gray-400">
                          Input: {inputTokens.toLocaleString()} / Output: {outputTokens.toLocaleString()}
                        </div>
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
                {(!usageStats.requestsByApp || Object.keys(usageStats.requestsByApp).length === 0) && (
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
      
      {/* Debug Panel */}
      {showDebugPanel && (
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-800">Usage Tracking Debug</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleDebugUsageTracking}
              >
                <Bug className="w-4 h-4 mr-1" />
                Log Debug Info
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleFixUsageData}
                disabled={isFixingData}
              >
                <RefreshCcw className={`w-4 h-4 mr-1 ${isFixingData ? 'animate-spin' : ''}`} />
                Fix Data
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={handleForceRefresh}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-1 ${isRefreshing ? 'animate-spin' : ''}`} />
                Force Refresh
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={() => {
                  // Use our dedicated function to force ArticleSmasher app ID
                  const success = forceArticleSmasherIdentification();
                  if (success) {
                    alert('ArticleSmasher app ID forced successfully!');
                  } else {
                    alert('Error forcing ArticleSmasher app ID. Check console for details.');
                  }
                }}
              >
                Force ArticleSmasher ID
              </Button>
            </div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-2">App Identification Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">ArticleSmasher Flags:</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${localStorage.getItem('article_smasher_app') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">article_smasher_app</span>
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => {
                      localStorage.setItem('article_smasher_app', 'true');
                      forceRefreshUsageData();
                    }}
                  >
                    Set
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${localStorage.getItem('article_wizard_state') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">article_wizard_state</span>
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => {
                      localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
                      forceRefreshUsageData();
                    }}
                  >
                    Set
                  </button>
                </div>
                <div className="flex items-center space-x-2 mt-1">
                  <div className={`w-3 h-3 rounded-full ${localStorage.getItem('FORCE_APP_ID') === 'article-smasher' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">FORCE_APP_ID</span>
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => {
                      localStorage.setItem('FORCE_APP_ID', 'article-smasher');
                      forceRefreshUsageData();
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">TaskSmasher Flags:</p>
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${localStorage.getItem('task_list_state') ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-sm">task_list_state</span>
                  <button
                    className="text-xs text-blue-500 hover:underline"
                    onClick={() => {
                      localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
                      forceRefreshUsageData();
                    }}
                  >
                    Set
                  </button>
                </div>
              </div>
            </div>
            
            <h3 className="text-sm font-medium text-gray-700 mt-4 mb-2">Usage Data Summary</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">ArticleSmasher Usage:</p>
                <p className="text-sm">
                  Requests: {usageStats.requestsByApp['article-smasher'] || 0}
                </p>
                <p className="text-sm">
                  Tokens: {usageStats.tokensByApp['article-smasher'] || 0}
                </p>
                <p className="text-sm">
                  Cost: ${(usageStats.costByApp['article-smasher'] || 0).toFixed(4)}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">TaskSmasher Usage:</p>
                <p className="text-sm">
                  Requests: {usageStats.requestsByApp['task-smasher'] || 0}
                </p>
                <p className="text-sm">
                  Tokens: {usageStats.tokensByApp['task-smasher'] || 0}
                </p>
                <p className="text-sm">
                  Cost: ${(usageStats.costByApp['task-smasher'] || 0).toFixed(4)}
                </p>
              </div>
            </div>
            
            <div className="mt-4">
              <p className="text-xs text-gray-500 mb-1">Debug Instructions:</p>
              <ol className="text-sm list-decimal pl-5 space-y-1">
                <li>Click "Log Debug Info" to output detailed debugging information to the console</li>
                <li>Click "Fix Data" to repair any corrupted usage tracking data</li>
                <li>Click "Force Refresh" to update the UI with the latest data</li>
                <li>Click "Force ArticleSmasher ID" to directly set all ArticleSmasher identification flags</li>
              </ol>
            </div>
            
            {/* Direct Model Override Status */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Model Override Status</h3>
              <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">Model Override Active</p>
                <p className="text-xs text-yellow-700 mt-1">
                  All requests are being forced to use <span className="font-mono">gpt-3.5-turbo</span> regardless of selected model.
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  This override is applied in both useAI.ts and AIService.ts.
                </p>
              </div>
              
              <div className="mt-3 flex items-center">
                <button
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200"
                  onClick={() => {
                    // Use our dedicated function to test model override
                    testModelOverride();
                    alert('Model override test complete. Check console for results.');
                  }}
                >
                  Test Model Override
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageMonitoring;