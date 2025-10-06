import React from 'react';
import AICore from '../../../core/AICore';

interface UsageStatsProps {
  aiCore: AICore;
  refreshKey: number;
}

const UsageStats: React.FC<UsageStatsProps> = ({ aiCore, refreshKey }) => {
  const stats = aiCore.getStats();

  if (stats.totalRequests === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">No Usage Data Yet</h3>
        <p className="text-gray-600">
          Start using the AI tools to see usage statistics here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total Requests</div>
          <div className="text-4xl font-bold">{stats.totalRequests}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total Tokens</div>
          <div className="text-4xl font-bold">{stats.totalTokens.toLocaleString()}</div>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg p-6 text-white">
          <div className="text-sm opacity-90 mb-1">Total Cost</div>
          <div className="text-4xl font-bold">${stats.totalCost.toFixed(2)}</div>
        </div>
      </div>

      {/* By Provider */}
      {Object.keys(stats.byProvider).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Usage by Provider</h3>
          <div className="space-y-3">
            {Object.entries(stats.byProvider).map(([provider, data]) => (
              <div key={provider} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 capitalize">{provider}</div>
                  <div className="text-sm text-gray-600">
                    {data.requests} requests • {data.tokens.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${data.cost.toFixed(4)}</div>
                  <div className="text-sm text-gray-600">
                    {((data.cost / stats.totalCost) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Model */}
      {Object.keys(stats.byModel).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Usage by Model</h3>
          <div className="space-y-3">
            {Object.entries(stats.byModel)
              .sort(([, a], [, b]) => b.cost - a.cost)
              .slice(0, 10)
              .map(([model, data]) => (
                <div key={model} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-gray-900">{model}</div>
                    <div className="text-sm text-gray-600">
                      {data.requests} requests • {data.tokens.toLocaleString()} tokens
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-gray-900">${data.cost.toFixed(4)}</div>
                    <div className="text-sm text-gray-600">
                      {((data.cost / stats.totalCost) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* By App */}
      {Object.keys(stats.byApp).length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Usage by Application</h3>
          <div className="space-y-3">
            {Object.entries(stats.byApp).map(([app, data]) => (
              <div key={app} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium text-gray-900 capitalize">{app.replace(/-/g, ' ')}</div>
                  <div className="text-sm text-gray-600">
                    {data.requests} requests • {data.tokens.toLocaleString()} tokens
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-gray-900">${data.cost.toFixed(4)}</div>
                  <div className="text-sm text-gray-600">
                    {((data.cost / stats.totalCost) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last Reset */}
      {stats.lastReset && (
        <div className="text-center text-sm text-gray-600">
          Statistics last reset: {new Date(stats.lastReset).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default UsageStats;

