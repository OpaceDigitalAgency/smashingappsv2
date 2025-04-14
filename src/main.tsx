import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAIServicesWithTracking } from './shared/services/initializeAIServices';

// Initialize AI services with usage tracking
initializeAIServicesWithTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
