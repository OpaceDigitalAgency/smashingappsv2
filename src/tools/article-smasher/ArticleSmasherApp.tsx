/**
 * ArticleSmasherApp - Main component for the Article Smasher tool
 *
 * This component serves as the entry point for the Article Smasher tool
 * in the main SmashingApps.ai application.
 */

import React, { useEffect } from 'react';
import { Routes, Route, Link, useRoutes, useNavigate, useLocation } from 'react-router-dom';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import { PromptProvider } from './src/contexts/PromptContext';
import ArticleWizard from './src/components/ArticleWizard';
import { initAdminBridge } from './src/utils/adminBridge';
import { initializeAIServicesWithTracking } from '../../shared/services/initializeAIServices';
import './src/components/article-smasher.css';

/**
 * ArticleSmasherApp - Main component for the Article Smasher tool
 *
 * This component is designed to work both:
 * 1. As a standalone app (when run directly via src/main.tsx)
 * 2. As an integrated component within the main SmashingApps.ai application
 *
 * It avoids creating nested Router components by using relative paths
 * and working with the parent Router context.
 */
const ArticleSmasherApp: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize admin bridge and AI services with usage tracking
  useEffect(() => {
    console.log('ArticleSmasherApp: Initializing admin bridge and AI services');
    
    // Initialize the admin bridge
    initAdminBridge();
    
    // Initialize AI services with usage tracking
    console.log('ArticleSmasherApp: Calling initializeAIServicesWithTracking');
    initializeAIServicesWithTracking();
    console.log('ArticleSmasherApp: AI services initialized');
    
    // Redirect to unified admin interface if accessing admin routes
    if (location.pathname.includes('/admin') || location.pathname.includes('/settings')) {
      // Redirect to the unified admin interface
      window.location.href = '/admin/prompts';
    }
  }, [location.pathname]);

  return (
    <div className="article-smasher-container">
      <PromptProvider>
        <ArticleWizardProvider>
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Article Smasher</h1>
            <div>
              <Link
                to="/admin/prompts"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Manage Prompts
              </Link>
            </div>
          </div>
          
          {/* Use Routes without creating a new Router context */}
          <Routes>
            <Route path="/" element={<ArticleWizard />} />
            <Route path="/admin/*" element={<AdminRedirect />} />
            <Route path="/settings/*" element={<AdminRedirect />} />
          </Routes>
        </ArticleWizardProvider>
      </PromptProvider>
    </div>
  );
};

// Component to handle admin redirects
const AdminRedirect: React.FC = () => {
  useEffect(() => {
    window.location.href = '/admin/prompts';
  }, []);
  
  return <div>Redirecting to admin interface...</div>;
};
export default ArticleSmasherApp;