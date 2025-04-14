/**
 * Standalone entry point for Article Smasher
 *
 * This file is only used when running the tool independently,
 * not when it's integrated into the main SmashingApps.ai application.
 *
 * When integrated, the ArticleSmasherApp component is imported directly
 * into the main application's router.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.tsx';
import './index.css';

// Check if we're running in standalone mode
// This prevents double initialization when imported into the main app
const rootElement = document.getElementById('root');

if (rootElement) {
  // Only initialize if we're in standalone mode (root element exists)
  createRoot(rootElement).render(
    <StrictMode>
      <BrowserRouter basename="/tools/article-smasher">
        <App />
      </BrowserRouter>
    </StrictMode>
  );
}