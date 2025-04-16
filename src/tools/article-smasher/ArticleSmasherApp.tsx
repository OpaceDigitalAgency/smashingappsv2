/**
 * ArticleSmasherApp - Main component for the Article Smasher tool
 *
 * This component serves as the entry point for the Article Smasher tool
 * in the main SmashingApps.ai application.
 */

import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useRoutes, useNavigate, useLocation } from 'react-router-dom';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import { PromptProvider } from './src/contexts/PromptContext';
import ArticleWizard from './src/components/ArticleWizard';
import { initAdminBridge } from './src/utils/adminBridge';
import { appRegistry, initializeAIServices, unifiedSettings } from '../../shared/services';
import APIKeyPopup from '../../shared/components/APIKeyPopup';
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
  const [showApiKeyPopup, setShowApiKeyPopup] = useState<boolean>(false);
  
  // Check if API key is configured
  const checkApiKey = () => {
    const aiSettings = unifiedSettings.getAISettings();
    const currentProvider = aiSettings.provider;
    const apiKey = aiSettings.apiKeys[currentProvider];
    
    // Show popup if no API key is configured for the current provider
    if (!apiKey) {
      console.log('No API key configured for provider:', currentProvider);
      setShowApiKeyPopup(true);
    } else {
      console.log('API key configured for provider:', currentProvider);
    }
  };
  
  // Use the centralized app registry and AI service initializer
  useEffect(() => {
    console.log('ArticleSmasherApp: Starting initialization');
    
    try {
      // Register the app once on mount using the centralized app registry
      appRegistry.registerApp('article-smasher');
      console.log('ArticleSmasherApp: Registered with app registry');
      
      // Set app identification flags for usage tracking
      localStorage.setItem('article_smasher_app', 'true');
      localStorage.setItem('current_app', 'article-smasher');
      console.log('ArticleSmasherApp: Set app identification flags');
      
      // Initialize the admin bridge
      initAdminBridge();
      
      // Initialize AI services if not already initialized
      initializeAIServices();
      console.log('ArticleSmasherApp: AI services initialized');
      
      // Explicitly initialize enhanced usage tracking
      try {
        const { enhancedUsageTracking } = require('../../shared/services');
        enhancedUsageTracking.refreshData();
        console.log('ArticleSmasherApp: Enhanced usage tracking initialized');
      } catch (error) {
        console.error('Error initializing enhanced usage tracking:', error);
      }
      
      // Check if API key is configured
      checkApiKey();
      
      console.log('ArticleSmasherApp: Initialization complete');
    } catch (error) {
      console.error('Error during ArticleSmasher initialization:', error);
    }
    
    // No need for periodic refreshes or clearing other app's flags
    
    // Cleanup function
    return () => {
      console.log('ArticleSmasherApp: Component unmounting');
      
      // Only clear the article_smasher_app flag, not current_app
      // This ensures we don't interfere with other apps
      localStorage.removeItem('article_smasher_app');
      console.log('ArticleSmasherApp: Cleared app identification flag');
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
          
          {/* API Key Popup */}
          {showApiKeyPopup && (
            <APIKeyPopup onClose={() => {
              setShowApiKeyPopup(false);
              // Re-check API key after closing the popup
              setTimeout(checkApiKey, 500);
            }} />
          )}
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