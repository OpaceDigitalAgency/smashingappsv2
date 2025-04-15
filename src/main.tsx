import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initializeAIServicesWithTracking } from './shared/services/initializeAIServices';
import { initializeSettingsSynchronizer } from './shared/utils/settingsSynchronizer';

// Initialize settings synchronizer to ensure consistent settings across the application
initializeSettingsSynchronizer();

// Initialize AI services with usage tracking
initializeAIServicesWithTracking();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
