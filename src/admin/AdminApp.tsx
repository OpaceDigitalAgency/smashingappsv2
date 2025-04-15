/**
 * AdminApp - Main component for the unified admin interface
 *
 * This component serves as the entry point for the admin interface
 * in the main SmashingApps.ai application.
 */

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/AdminLayout';
import Dashboard from './components/Dashboard';
import ProviderManagement from './components/ProviderManagement';
import PromptManagement from './components/PromptManagement';
import SettingsManagement from './components/SettingsManagement';
import UsageMonitoring from './components/UsageMonitoring';
import { AdminProvider } from './contexts/AdminContext';

/**
 * AdminApp - Main component for the unified admin interface
 *
 * This component provides a centralized admin interface for all tools
 * in the SmashingApps.ai application.
 */
const AdminApp: React.FC = () => {
  const [error, setError] = useState<Error | null>(null);
  
  // Error boundary to catch any errors in the admin app
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      setError(event.error);
      // Prevent the error from propagating
      event.preventDefault();
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  // If there's an error, show a fallback UI
  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
        <p className="mb-4">There was an error loading the admin interface. This is likely due to missing API keys or configuration issues.</p>
        <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
          <pre className="text-sm">{error.message}</pre>
        </div>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          onClick={() => window.location.href = '/'}
        >
          Return to Home
        </button>
      </div>
    );
  }
  
  return (
    <ErrorBoundary>
      <AdminProvider>
        <AdminLayout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="providers" element={<ProviderManagement />} />
            <Route path="prompts" element={<PromptManagement />} />
            <Route path="settings" element={<SettingsManagement />} />
            <Route path="usage" element={<UsageMonitoring />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AdminLayout>
      </AdminProvider>
    </ErrorBoundary>
  );
};

// Simple error boundary component
class ErrorBoundary extends React.Component<{children: React.ReactNode}, {hasError: boolean, error: Error | null}> {
  constructor(props: {children: React.ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8 max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
          <p className="mb-4">There was an error in the admin interface. This is likely due to missing API keys or configuration issues.</p>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
            <pre className="text-sm">{this.state.error?.message}</pre>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            onClick={() => window.location.href = '/'}
          >
            Return to Home
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminApp;