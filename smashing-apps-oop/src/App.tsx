import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import Layout from './shared/components/Layout';
import HomePage from './pages/HomePage';
import AdminPage from './admin/AdminPage';
import ArticleSmasherIntegrated from './tools/article-smasher/ArticleSmasherIntegrated';
import TaskSmasherApp from './tools/task-smasher/TaskSmasherApp';
import GraphicsSmasherApp from './tools/graphics-smasher/GraphicsSmasherApp';

function App() {
  return (
    <HelmetProvider>
      <Router>
        <Routes>
          {/* All routes with layout */}
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="admin" element={<AdminPage />} />
            <Route path="tools/article-smasher/*" element={<ArticleSmasherIntegrated />} />
            <Route path="tools/task-smasher/*" element={<TaskSmasherApp />} />
            <Route path="tools/graphics-smasher/*" element={<GraphicsSmasherApp />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Router>
    </HelmetProvider>
  );
}

export default App;
