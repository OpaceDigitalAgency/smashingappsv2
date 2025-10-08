import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import GraphicsAppProvider from './providers/GraphicsAppProvider';
import GraphicsWorkspace from './components/workspace/GraphicsWorkspace';
import GraphicsLanding from './components/layout/GraphicsLanding';
import { appRegistry, initializeAIServices } from '../../shared/services';
import { useGraphicsStore } from './state/graphicsStore';
import { initializeCommandRegistry } from './commands';
import './styles/graphics-smasher.css';

const GraphicsSmasherApp: React.FC = () => {
  const setReady = useGraphicsStore((state) => state.setReady);

  useEffect(() => {
    try {
      appRegistry.registerApp('graphics-smasher');
      initializeAIServices();
      initializeCommandRegistry();
      setReady(true);
    } catch (error) {
      console.error('Graphics Smasher initialization failed', error);
    }
  }, [setReady]);

  return (
    <GraphicsAppProvider>
      <Routes>
        <Route index element={<GraphicsLanding />} />
        <Route path="workspace" element={<GraphicsWorkspace />} />
        <Route path="*" element={<Navigate to="workspace" replace />} />
      </Routes>
    </GraphicsAppProvider>
  );
};

export default GraphicsSmasherApp;
