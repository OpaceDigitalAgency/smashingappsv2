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
import { USAGE_DATA_KEY } from '../../shared/services/usageTrackingService';
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

    const initializeApp = async () => {
      console.log('ArticleSmasherApp: Starting initialization');
      
      try {
        // First, clear any existing app flags to prevent incorrect identification
        localStorage.removeItem('task_list_state');
        localStorage.removeItem('FORCE_APP_ID');
        localStorage.removeItem('current_app');
        
        // Set primary ArticleSmasher flag first
        localStorage.setItem('article_smasher_app', 'true');
        
        // Small delay to ensure primary flag is set
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Set additional ArticleSmasher flags
        localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
        localStorage.setItem('FORCE_APP_ID', 'article-smasher');
        localStorage.setItem('current_app', 'article-smasher');
        
        // Initialize the admin bridge
        initAdminBridge();
        
        // Another small delay to ensure all flags are set
        await new Promise(resolve => setTimeout(resolve, 50));
        
        // Initialize AI services with usage tracking
        console.log('ArticleSmasherApp: Calling initializeAIServicesWithTracking');
        initializeAIServicesWithTracking();
        console.log('ArticleSmasherApp: AI services initialized');
        
        // Ensure app exists in usage data
        const usageData = JSON.parse(localStorage.getItem(USAGE_DATA_KEY) || '{}');
        if (!usageData.requestsByApp) usageData.requestsByApp = {};
        if (!usageData.requestsByApp['article-smasher']) usageData.requestsByApp['article-smasher'] = 0;
        localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(usageData));
        console.log('ArticleSmasherApp: Ensured article-smasher exists in usage data');
        
        console.log('ArticleSmasherApp: Initialization complete');
      } catch (error) {
        console.error('Error during ArticleSmasher initialization:', error);
        throw error; // Re-throw to be caught by the outer catch
      }
    };

    // Run initialization
    initializeApp().catch(error => {
      console.error('Failed to initialize ArticleSmasher:', error);
    });
    
    // Set a more aggressive periodic check to ensure the app ID flags remain set
    const intervalId = setInterval(() => {
      // Force app ID flags with every check
      localStorage.setItem('article_smasher_app', 'true');
      localStorage.setItem('article_wizard_state', JSON.stringify({ initialized: true, forceTracking: true }));
      localStorage.setItem('FORCE_APP_ID', 'article-smasher');
      localStorage.setItem('current_app', 'article-smasher');
      
      console.log('ArticleSmasherApp: Forced app ID flags refreshed');
      
      // Also directly ensure the app exists in usage tracking data
      try {
        const usageData = JSON.parse(localStorage.getItem(USAGE_DATA_KEY) || '{}');
        if (!usageData.requestsByApp) usageData.requestsByApp = {};
        if (!usageData.requestsByApp['article-smasher']) usageData.requestsByApp['article-smasher'] = 0;
        localStorage.setItem(USAGE_DATA_KEY, JSON.stringify(usageData));
      } catch (e) {
        console.error('Error in interval ensuring article-smasher in usage data:', e);
      }
    }, 5000); // More frequent check - every 5 seconds
    
    // Cleanup function - but don't actually clean up the app ID flags
    return () => {
      clearInterval(intervalId);
      // IMPORTANT: We intentionally DO NOT remove any app ID flags on unmount
      // to ensure persistence between page refreshes and navigation
      console.log('ArticleSmasherApp: Component unmounting, but keeping app ID flags');
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