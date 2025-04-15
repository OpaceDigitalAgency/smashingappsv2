import React, { ReactNode, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Server,
  MessageSquare,
  BarChart3,
  ChevronRight,
  LogOut,
  Bug
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import Card from '../../shared/components/Card/Card';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const [error, setError] = React.useState<Error | null>(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  // Wrap the useAdmin hook in a try-catch to prevent uncaught exceptions
  let adminContext;
  try {
    adminContext = useAdmin();
    console.log('AdminLayout: Successfully loaded admin context');
  } catch (err) {
    console.error('AdminLayout: Error loading admin context:', err);
    setError(err instanceof Error ? err : new Error('Failed to load admin context'));
    adminContext = {
      activeSection: 'dashboard',
      setActiveSection: () => console.log('Fallback setActiveSection called')
    };
  }
  
  const { activeSection, setActiveSection } = adminContext;

  // Navigation items with correct paths
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'providers', label: 'Providers', path: '/admin/providers', icon: <Server className="w-5 h-5" /> },
    { id: 'prompts', label: 'Prompts', path: '/admin/prompts', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'usage', label: 'Usage', path: '/admin/usage', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'debug', label: 'Debug', path: '/admin/debug', icon: <Bug className="w-5 h-5" /> },
  ];

  // Update active section based on location
  useEffect(() => {
    // Extract the section from the path
    const path = location.pathname;
    const section = path.split('/').pop() || 'dashboard';
    
    // Set the active section based on the path
    if (section !== activeSection) {
      setActiveSection(section);
    }
  }, [location.pathname, activeSection, setActiveSection]);

  // Handle navigation item click
  const handleNavItemClick = (id: string, path: string) => {
    setActiveSection(id);
    // Use window.location.href for hard navigation instead of navigate
    window.location.href = path;
  };

  // If there's an error, show a fallback UI
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Admin Interface Error</h1>
          <p className="mb-4">There was an error loading the admin interface. This is likely due to missing API keys or configuration issues.</p>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
            <pre className="text-sm">{error.message}</pre>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Wrap the entire component in a try-catch to prevent uncaught exceptions
  try {
    console.log('AdminLayout: Rendering layout');
    return (
      <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">SmashingApps.ai</p>
        </div>
        <nav className="flex-1 p-4">
          <ul className="space-y-1">
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`flex items-center w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path || 
                    (item.path === '/admin' && location.pathname === '/admin/') ||
                    (activeSection === item.id)
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavItemClick(item.id, item.path)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {(location.pathname === item.path || activeSection === item.id) && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link
            to="/"
            className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5" />
            <span className="ml-3">Back to Site</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        <div className="p-6">
          <Card className="w-full">
            {children}
          </Card>
        </div>
      </div>
      </div>
    );
  } catch (err) {
    console.error('AdminLayout: Error rendering layout:', err);
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Rendering Error</h1>
          <p className="mb-4">There was an error rendering the admin interface.</p>
          <div className="bg-gray-100 p-4 rounded mb-4 overflow-auto">
            <pre className="text-sm">{err instanceof Error ? err.message : 'Unknown error'}</pre>
          </div>
          <a
            href="/"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 inline-block"
          >
            Return to Home
          </a>
        </div>
      </div>
    );
  }
};

export default AdminLayout;