/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 *
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React from 'react';
import { ArticleWizardProvider } from './src/contexts/ArticleWizardContext';
import ArticleWizard from './src/components/ArticleWizard';
import './src/styles/article-smasher-v2.css';

const ArticleSmasherV2App: React.FC = () => {
  return (
    <div className="article-smasherv2-container">
      <ArticleWizardProvider>
        <ArticleWizard />
      </ArticleWizardProvider>
    </div>
  );
};

export default ArticleSmasherV2App;