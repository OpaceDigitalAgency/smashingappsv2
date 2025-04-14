/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 *
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import { PromptProvider } from './src/contexts/PromptContext';
import ArticleWizard from './src/components/ArticleWizard';
import AdminDashboard from './src/components/admin/AdminDashboard';
import './src/styles/article-smasher-v2.css';

const ArticleSmasherV2App: React.FC = () => {
  return (
    <div className="article-smasherv2-container">
      <PromptProvider>
        <ArticleWizardProvider>
          <Router>
            <div className="mb-4 flex justify-between items-center">
              <h1 className="text-2xl font-bold">Article Smasher V2</h1>
              <nav className="flex space-x-4">
                <Link 
                  to="/" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Article Creator
                </Link>
                <Link 
                  to="/admin" 
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600"
                >
                  Admin
                </Link>
              </nav>
            </div>
            
            <Routes>
              <Route path="/" element={<ArticleWizard />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
          </Router>
        </ArticleWizardProvider>
      </PromptProvider>
    </div>
  );
};

export default ArticleSmasherV2App;