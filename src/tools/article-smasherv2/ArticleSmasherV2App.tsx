/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 * 
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import App from './src/App';

const ArticleSmasherV2App: React.FC = () => {
  return (
    <div className="article-smasherv2-container">
      {/* Wrap the App component with BrowserRouter only in development */}
      {process.env.NODE_ENV === 'development' ? (
        <BrowserRouter>
          <App />
        </BrowserRouter>
      ) : (
        <App />
      )}
    </div>
  );
};

export default ArticleSmasherV2App;