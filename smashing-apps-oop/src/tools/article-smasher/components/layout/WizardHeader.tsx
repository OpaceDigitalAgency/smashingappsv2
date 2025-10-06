import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const WizardHeader: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md sticky top-0 z-50">
      <div className="mobile-container py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center text-white hover:text-gray-100 transition-colors">
            <ArrowLeft className="mr-2" size={20} />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="flex items-center gap-3">
            <img src="/logo.svg" alt="SmashingApps" className="w-8 h-8" />
            <h1 className="text-lg font-bold">AI Scribe</h1>
          </div>
          <Link to="/admin" className="text-white hover:text-gray-100 transition-colors">
            <Settings size={20} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WizardHeader;