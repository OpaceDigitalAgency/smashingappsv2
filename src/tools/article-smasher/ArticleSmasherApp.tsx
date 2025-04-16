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
import { appRegistry } from '../../shared/services/appRegistry';
import { initializeAIServices } from '../../shared/services/aiServiceInitializer';
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
  
  // Use the centralized app registry and AI service initializer
  useEffect(() => {
    console.log('ArticleSmasherApp: Starting initialization');
    
    try {
      // Register the app once on mount using the centralized app registry
      appRegistry.registerApp('article-smasher');
      console.log('ArticleSmasherApp: Registered with app registry');
      
      // Initialize the admin bridge
      initAdminBridge();
      
      // Initialize AI services if not already initialized
      initializeAIServices();
      console.log('ArticleSmasherApp: AI services initialized');
      
      console.log('ArticleSmasherApp: Initialization complete');
    } catch (error) {
      console.error('Error during ArticleSmasher initialization:', error);
    }
    
    // No need for periodic refreshes or clearing other app's flags
    
    // Cleanup function
    return () => {
      console.log('ArticleSmasherApp: Component unmounting');
    };
  }, []); // Run only once on mount
  
  // Handle admin route redirects
  useEffect(() => {
    if (location.pathname.includes('/admin') || location.pathname.includes('/settings')) {
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