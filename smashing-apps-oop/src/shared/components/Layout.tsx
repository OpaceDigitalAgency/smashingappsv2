import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import AICore from '../../../core/AICore';

const Layout: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const aiCore = AICore.getInstance();
  const isConfigured = aiCore.isConfigured();
  const configuredProviders = aiCore.getConfiguredProviders();

  // Check if we're specifically on the Graphics Smasher workspace page (not just any graphics-smasher page)
  const isGraphicsWorkspace = location.pathname === '/tools/graphics-smasher/workspace';

  // Check if dark mode is enabled for Graphics Smasher - only on workspace page
  const isGraphicsDarkMode = isGraphicsWorkspace && localStorage.getItem('graphics-smasher-theme') === 'dark';

  // Force re-render when location changes to ensure dark mode is properly cleared
  useEffect(() => {
    // This effect runs whenever the location changes, ensuring proper re-evaluation
    console.log('Location changed to:', location.pathname, 'Dark mode:', isGraphicsDarkMode);
  }, [location.pathname, isGraphicsDarkMode]);

  // Get active provider and model from settings
  const settings = aiCore.getSettings();
  const activeModel = settings.model || 'Not set';

  const navigation = [
    { name: 'Home', path: '/' },
    { name: 'Article Smasher', path: '/tools/article-smasher' },
    { name: 'Task Smasher', path: '/tools/task-smasher' },
    { name: 'Graphics Smasher', path: '/tools/graphics-smasher' },
    { name: 'Admin', path: '/admin' },
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        data-layout-header
        className={`shadow-sm sticky top-0 z-50 ${isGraphicsDarkMode ? 'bg-gray-800' : 'bg-white'}`}
      >
        <nav className="w-full px-4">
          <div className="flex justify-between items-center h-16 max-w-7xl mx-auto">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className={`text-xl font-bold ${isGraphicsDarkMode ? 'text-white' : 'text-gray-900'}`}>SmashingApps v2</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? isGraphicsDarkMode
                        ? 'bg-indigo-900 text-indigo-300'
                        : 'bg-indigo-50 text-indigo-600'
                      : isGraphicsDarkMode
                        ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Status Indicator */}
            <div className="hidden md:flex items-center space-x-3">
              {isConfigured ? (
                <div className="flex flex-col items-end text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className={isGraphicsDarkMode ? 'text-gray-300' : 'text-gray-600'}>
                      {configuredProviders.length} provider{configuredProviders.length !== 1 ? 's' : ''} active
                    </span>
                  </div>
                  {configuredProviders.length > 0 && (
                    <span className={`text-xs mt-1 ${isGraphicsDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {activeModel}
                    </span>
                  )}
                </div>
              ) : (
                <Link
                  to="/admin"
                  className={`flex items-center space-x-2 text-sm ${
                    isGraphicsDarkMode
                      ? 'text-amber-400 hover:text-amber-300'
                      : 'text-amber-600 hover:text-amber-700'
                  }`}
                >
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <span>Configure AI</span>
                </Link>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`md:hidden p-2 rounded-lg ${
                isGraphicsDarkMode
                  ? 'text-gray-300 hover:bg-gray-700'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className={`md:hidden py-4 border-t ${isGraphicsDarkMode ? 'border-gray-700' : ''}`}>
              {navigation.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-4 py-2 rounded-lg font-medium transition-colors ${
                    isActive(item.path)
                      ? isGraphicsDarkMode
                        ? 'bg-indigo-900 text-indigo-300'
                        : 'bg-indigo-50 text-indigo-600'
                      : isGraphicsDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              <div className={`mt-4 px-4 py-2 text-sm ${isGraphicsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                {isConfigured ? (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>{configuredProviders.length} provider{configuredProviders.length !== 1 ? 's' : ''} active</span>
                    </div>
                    {configuredProviders.length > 0 && (
                      <div className={`text-xs ${isGraphicsDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        Model: {activeModel}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className={`flex items-center space-x-2 ${isGraphicsDarkMode ? 'text-amber-400' : 'text-amber-600'}`}>
                    <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                    <span>Configure AI in Admin</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Configuration Alert */}
      {!isConfigured && location.pathname !== '/admin' && (
        <div className={`border-b ${isGraphicsDarkMode ? 'bg-amber-900 border-amber-700' : 'bg-amber-50 border-amber-200'}`}>
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <svg
                  className="w-5 h-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className={`text-sm ${isGraphicsDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
                  AI providers not configured. Please configure at least one provider to use the tools.
                </span>
              </div>
              <Link
                to="/admin"
                className={`text-sm font-medium ${isGraphicsDarkMode ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
              >
                Configure Now →
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main data-layout-main className={`flex-1 min-h-0 ${isGraphicsDarkMode ? 'bg-gray-900' : ''}`}>
        <Outlet />
      </main>

      {/* Footer */}
      <footer className={`border-t mt-auto ${isGraphicsDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'}`}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className={`text-sm ${isGraphicsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              © 2025 SmashingApps v2. Powered by AI-Core.
            </div>
            <div className={`flex items-center space-x-6 text-sm ${isGraphicsDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
              <a href="#" className={isGraphicsDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}>Documentation</a>
              <a href="#" className={isGraphicsDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}>Support</a>
              <a href="https://opace.agency" target="_blank" rel="noopener noreferrer" className={isGraphicsDarkMode ? 'hover:text-white' : 'hover:text-gray-900'}>
                Opace Digital Agency
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
