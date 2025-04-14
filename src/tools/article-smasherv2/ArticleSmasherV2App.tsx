/**
 * ArticleSmasherV2App - Main component for the Article Smasher V2 tool
 * 
 * This component serves as the entry point for the Article Smasher V2 tool
 * in the main SmashingApps.ai application.
 */

import React from 'react';
import Demo from './src/components/Demo';

const ArticleSmasherV2App: React.FC = () => {
  return (
    <div className="article-smasherv2-container">
      <Demo />
    </div>
  );
};

export default ArticleSmasherV2App;