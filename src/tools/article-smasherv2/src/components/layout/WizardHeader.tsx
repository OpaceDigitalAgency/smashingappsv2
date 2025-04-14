import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';

const WizardHeader: React.FC = () => {
  return (
    <div className="bg-primary text-white shadow-md sticky top-0 z-50">
      <div className="mobile-container py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center text-white">
            <ArrowLeft className="mr-2" size={20} />
            <span className="font-medium">Back to Home</span>
          </a>
          <h1 className="text-lg font-bold">AI Scribe Demo</h1>
          <button className="text-white hover:text-primary-50">
            <Settings size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default WizardHeader;