/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 *
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React from 'react';
import { Routes, Route, Link, useRoutes } from 'react-router-dom';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import { PromptProvider } from './src/contexts/PromptContext';
import ArticleWizard from './src/components/ArticleWizard';
import AdminDashboard from './src/components/admin/AdminDashboard';
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
  return (
    <div className="article-smasherv2-container">
      <PromptProvider>
        <ArticleWizardProvider>
          <div className="mb-4 flex justify-between items-center">
            <h1 className="text-2xl font-bold">Article Smasher V2</h1>
            <nav className="flex space-x-4">
              <Link
                to="/tools/article-smasherv2"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Article Creator
              </Link>
              <Link
                to="/tools/article-smasherv2/admin"
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
              >
                Admin
              </Link>
            </nav>
          </div>
          
          {/* Use Routes without creating a new Router context */}
          <Routes>
            <Route path="/" element={<ArticleWizard />} />
            <Route path="admin" element={<AdminDashboard />} />
          </Routes>
        </ArticleWizardProvider>
      </PromptProvider>
    </div>
  );
};

export default ArticleSmasherV2App;