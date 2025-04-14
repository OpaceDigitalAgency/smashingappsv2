/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 *
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React, { useEffect } from 'react';
import { Routes, Route, Link, useRoutes, useNavigate, useLocation } from 'react-router-dom';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import { PromptProvider } from './src/contexts/PromptContext';
import ArticleWizard from './src/components/ArticleWizard';
import { initAdminBridge } from './src/utils/adminBridge';
import './src/styles/article-smasher-v2.css';

/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 *
 * This component is designed to work both:
 * 1. As a standalone app (when run directly via src/main.tsx)
 * 2. As an integrated component within the main SmashingApps.ai application
 *
 * It avoids creating nested Router components by using relative paths
 * and working with the parent Router context.
 */
const ArticleSmasherV2App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Initialize admin bridge and handle redirects
  useEffect(() => {
    // Initialize the admin bridge
    initAdminBridge();
    
    // Redirect to unified admin interface if accessing admin routes
    if (location.pathname.includes('/admin') || location.pathname.includes('/settings')) {
      // Redirect to the unified admin interface
      window.location.href = '/admin/prompts';
    }
  }, [location.pathname]);

  return (
    <div className="article-smasherv2-container">
      <PromptProvider>
        <ArticleWizardProvider>
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Article Smasher V2</h1>
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

export default ArticleSmasherV2App;