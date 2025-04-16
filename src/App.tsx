import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import SEO from './components/SEO';
import { GlobalSettingsProvider, useGlobalSettings, GlobalSettingsTest } from './shared/contexts/GlobalSettings';
import StructuredData from './components/StructuredData';

// Import main site components
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Tools from './components/Tools';
import Features from './components/Features';
import Testimonials from './components/Testimonials';
import CTA from './components/CTA';
import Contact from './components/Contact';
import Footer from './components/Footer';

// Import tool registry
import toolRegistry, { getToolConfig } from './tools/registry';

// Import tool components
import TaskSmasherApp from './tools/task-smasher/TaskSmasherApp';
import AdminApp from './admin/AdminApp';
import ArticleSmasherApp from './tools/article-smasher/ArticleSmasherApp';

// Loading component for Suspense
const LoadingScreen = () => (
  <div className="flex items-center justify-center h-screen">
    <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Get the TaskSmasher tool configuration
const taskSmasherConfig = getToolConfig('task-smasher');

// Theme Manager component
const ThemeManager = () => {
  const { settings } = useGlobalSettings();
  
  useEffect(() => {
    try {
      // Default to light theme if settings aren't loaded
      const theme = settings?.ui?.theme || 'light';
      
      // Remove any existing theme classes
      document.documentElement.classList.remove('light', 'dark');
      
      // Apply theme based on settings
      if (theme === 'system') {
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(isDark ? 'dark' : 'light');

        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
          document.documentElement.classList.remove('light', 'dark');
          document.documentElement.classList.add(e.matches ? 'dark' : 'light');
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } else {
        document.documentElement.classList.add(theme);
      }
    } catch (error) {
      // If anything fails, default to light theme
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add('light');
      console.error('Error in ThemeManager:', error);
    }
  }, [settings?.ui?.theme]);

  return null;
};

// HomePage component for the root route
const HomePage = () => (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-white">
    <StructuredData
      data={{
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'SmashingApps.ai',
        'url': 'https://smashingapps.ai',
        'description': 'AI-powered micro-apps that help you smash through tasks with smart, fun, and focused tools',
        'potentialAction': {
          '@type': 'SearchAction',
          'target': 'https://smashingapps.ai/search?q={search_term_string}',
          'query-input': 'required name=search_term_string'
        }
      }}
    />
    <main>
      <Hero />
      <Tools />
      <Features />
      <Testimonials />
      <CTA />
    </main>
  </div>
);

// BodyClassManager component to manage body classes based on route
const BodyClassManager = () => {
  const location = useLocation();
  
  useEffect(() => {
    // Remove all tool-related classes
    document.body.classList.remove('home', 'admin', ...Object.keys(toolRegistry).map(id => id));
    
    // Add appropriate class based on the current route
    if (location.pathname === '/') {
      document.body.classList.add('home');
    } else if (location.pathname.startsWith('/admin')) {
      document.body.classList.add('admin');
    } else {
      // Find which tool this route belongs to
      for (const [id, config] of Object.entries(toolRegistry)) {
        if (location.pathname.includes(config.routes.base)) {
          document.body.classList.add(id);
          break;
        }
      }
    }
  }, [location.pathname]);
  
  return null;
};

function App() {
  const isDevelopment = process.env.NODE_ENV === 'development';

  return (
    <HelmetProvider>
      <GlobalSettingsProvider>
        <ThemeManager />
        <BrowserRouter>
          <SEO />
          <BodyClassManager />
          <Navbar />
          <div className="pt-0 min-h-screen flex flex-col dark:bg-gray-900 dark:text-white transition-colors duration-200">
            <div className="flex-grow">
              {isDevelopment && (
                <div className="fixed bottom-4 right-4 z-50 max-w-lg bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                  <div className="p-2 bg-blue-500 text-white flex justify-between items-center">
                    <span className="font-semibold">Settings Debug Panel</span>
                    <button
                      onClick={() => document.querySelector('.settings-debug-content')?.classList.toggle('hidden')}
                      className="text-white hover:text-blue-100"
                    >
                      Toggle
                    </button>
                  </div>
                  <div className="settings-debug-content hidden">
                    <GlobalSettingsTest />
                  </div>
                </div>
              )}
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Tool Routes */}
                <Route path="/tools/task-smasher" element={<TaskSmasherApp />} />
                <Route path="/tools/task-smasher/" element={<TaskSmasherApp />} />
                
                <Route path="/tools/article-smasher" element={<ArticleSmasherApp />} />
                <Route path="/tools/article-smasher/" element={<ArticleSmasherApp />} />
                
                <Route path="/tools/article-smasherv2/*" element={<Navigate to="/tools/article-smasher" replace />} />
                
                <Route path="/admin/*" element={<AdminApp />} />
                
                {/* TaskSmasher use case routes */}
                {taskSmasherConfig && taskSmasherConfig.routes.subRoutes &&
                  Object.entries(taskSmasherConfig.useCases).flatMap(([id, useCase]) => {
                    const basePath = taskSmasherConfig.routes.subRoutes?.[id];
                    if (!basePath) return [];
                    
                    const pathWithSlash = `${basePath}/`;
                    
                    return [
                      <Route key={`${id}-no-slash`} path={basePath} element={<TaskSmasherApp />} />,
                      <Route key={`${id}-with-slash`} path={pathWithSlash} element={<TaskSmasherApp />} />
                    ];
                  })
                }
                
                {/* ArticleSmasher use case routes */}
                {getToolConfig('article-smasher')?.routes.subRoutes &&
                  Object.entries(getToolConfig('article-smasher')?.useCases || {}).flatMap(([id, useCase]) => {
                    const basePath = getToolConfig('article-smasher')?.routes.subRoutes?.[id];
                    if (!basePath) return [];
                    
                    const pathWithSlash = `${basePath}/`;
                    
                    return [
                      <Route key={`article-${id}-no-slash`} path={basePath} element={<ArticleSmasherApp />} />,
                      <Route key={`article-${id}-with-slash`} path={pathWithSlash} element={<ArticleSmasherApp />} />
                    ];
                  })
                }
                
                {/* Legacy ArticleSmasherV2 use case routes */}
                {getToolConfig('article-smasherv2')?.routes.subRoutes &&
                  Object.entries(getToolConfig('article-smasherv2')?.useCases || {}).flatMap(([id, useCase]) => {
                    const basePath = getToolConfig('article-smasherv2')?.routes.subRoutes?.[id];
                    if (!basePath) return [];
                    
                    const newPath = basePath.replace('article-smasherv2', 'article-smasher');
                    
                    return [
                      <Route key={`article-v2-${id}-redirect`} path={`${basePath}/*`} element={<Navigate to={newPath} replace />} />
                    ];
                  })
                }
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </div>
            <Footer />
          </div>
        </BrowserRouter>
      </GlobalSettingsProvider>
    </HelmetProvider>
  );
}

export default App;