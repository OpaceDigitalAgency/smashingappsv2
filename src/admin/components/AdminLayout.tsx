import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Settings, 
  Server, 
  MessageSquare, 
  BarChart3, 
  ChevronRight, 
  LogOut 
} from 'lucide-react';
import { useAdmin } from '../contexts/AdminContext';
import Card from '../../shared/components/Card/Card';

interface AdminLayoutProps {
  children: ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const { activeSection, setActiveSection } = useAdmin();

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', path: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { id: 'providers', label: 'Providers', path: '/admin/providers', icon: <Server className="w-5 h-5" /> },
    { id: 'prompts', label: 'Prompts', path: '/admin/prompts', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', path: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
    { id: 'usage', label: 'Usage', path: '/admin/usage', icon: <BarChart3 className="w-5 h-5" /> },
  ];

  // Handle navigation item click
  const handleNavItemClick = (id: string) => {
    setActiveSection(id);
  };

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
                <Link
                  to={item.path}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${
                    location.pathname === item.path || 
                    (item.path === '/admin' && location.pathname === '/admin/')
                      ? 'bg-indigo-50 text-indigo-600'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  onClick={() => handleNavItemClick(item.id)}
                >
                  {item.icon}
                  <span className="ml-3">{item.label}</span>
                  {location.pathname === item.path && (
                    <ChevronRight className="w-4 h-4 ml-auto" />
                  )}
                </Link>
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
};

export default AdminLayout;