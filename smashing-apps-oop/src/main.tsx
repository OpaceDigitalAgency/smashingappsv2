import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize AI services with usage tracking
import { initializeAIServicesWithTracking } from './shared/services/initializeAIServices';

// Initialize AI services when the app starts
initializeAIServicesWithTracking();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

