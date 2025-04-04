import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ListChecks, ChefHat, Lightbulb, Calendar, MessageSquare } from 'lucide-react';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const megaMenuRef = useRef<HTMLDivElement>(null);
  
  // Close mega menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (megaMenuRef.current && !megaMenuRef.current.contains(event.target as Node)) {
        setMegaMenuOpen(false);
      }
    }
    
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24">
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <img
                src="/smashingapps-ai-small.png"
                alt="SmashingApps.ai Logo"
                className="h-24 w-auto"
              />
            </a>
          </div>
          
          <div className="hidden md:flex items-center space-x-4">
            <div className="relative" ref={megaMenuRef}>
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={`text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center ${megaMenuOpen ? 'text-primary' : ''}`}
              >
                Tools
                <svg
                  className={`ml-1 h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              
              {/* Mega Menu */}
              {megaMenuOpen && (
                <div className="absolute left-0 mt-2 w-screen max-w-6xl bg-white rounded-lg shadow-xl p-6 grid grid-cols-1 md:grid-cols-3 gap-8 z-50">
                  {/* TaskSmasher */}
                  <div className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-purple-100 p-2 rounded-lg mr-4">
                        <ListChecks className="h-6 w-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">TaskSmasher</h3>
                        <p className="text-sm text-gray-600 mb-3">Turn a single word into a fully organised task list.</p>
                        <a href="/tools/task-smasher/" className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                          Try now →
                        </a>
                        
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <a href="/tools/task-smasher/marketing-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                            Marketing Tasks
                          </a>
                          <a href="/tools/task-smasher/daily-organizer/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                            Daily Organizer
                          </a>
                          <a href="/tools/task-smasher/goal-planner/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                            Goal Planner
                          </a>
                          <a href="/tools/task-smasher/recipe-steps/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                            Recipe Steps
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* RecipeSmasher */}
                  <div className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        <ChefHat className="h-6 w-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">RecipeSmasher</h3>
                        <p className="text-sm text-gray-600 mb-3">Get AI-generated recipe steps from any ingredients.</p>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          Coming soon
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* IdeaSmasher */}
                  <div className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start">
                      <div className="bg-yellow-100 p-2 rounded-lg mr-4">
                        <Lightbulb className="h-6 w-6 text-yellow-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 mb-1">IdeaSmasher</h3>
                        <p className="text-sm text-gray-600 mb-3">Turn vague thoughts into step-by-step action plans.</p>
                        <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800">
                          Coming soon
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <a href="#why" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Why SmashingApps
            </a>
            <a href="#testimonials" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Testimonials
            </a>
            <a href="/contact" className="btn-primary !py-2 !px-4 text-sm">
              Get in Touch
            </a>
          </div>
          
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-primary focus:outline-none"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden bg-white py-2 px-4 shadow-inner">
          <div className="block text-gray-700 px-3 py-2 rounded-md text-base font-medium">
            <div className="flex justify-between items-center" onClick={() => setMegaMenuOpen(!megaMenuOpen)}>
              <span>Tools</span>
              <svg
                className={`ml-1 h-4 w-4 transition-transform ${megaMenuOpen ? 'rotate-180' : ''}`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </div>
            
            {megaMenuOpen && (
              <div className="mt-2 space-y-4 pl-2">
                <div className="border-l-2 border-purple-500 pl-3 py-2">
                  <h3 className="font-medium text-gray-900">TaskSmasher</h3>
                  <p className="text-sm text-gray-600 mb-1">Turn a single word into a fully organised task list.</p>
                  <a href="/tools/task-smasher/" className="text-purple-600 hover:text-purple-800 text-sm font-medium block mb-2">
                    Try now →
                  </a>
                  <div className="flex flex-wrap gap-2">
                    <a href="/tools/task-smasher/marketing-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                      Marketing Tasks
                    </a>
                    <a href="/tools/task-smasher/daily-organizer/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded-full transition-colors">
                      Daily Organizer
                    </a>
                  </div>
                </div>
                
                <div className="border-l-2 border-blue-500 pl-3 py-2">
                  <h3 className="font-medium text-gray-900">RecipeSmasher</h3>
                  <p className="text-sm text-gray-600 mb-1">Get AI-generated recipe steps from any ingredients.</p>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    Coming soon
                  </span>
                </div>
                
                <div className="border-l-2 border-yellow-500 pl-3 py-2">
                  <h3 className="font-medium text-gray-900">IdeaSmasher</h3>
                  <p className="text-sm text-gray-600 mb-1">Turn vague thoughts into step-by-step action plans.</p>
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-800">
                    Coming soon
                  </span>
                </div>
              </div>
            )}
          </div>
          <a 
            href="#why" 
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Why SmashingApps
          </a>
          <a 
            href="#testimonials" 
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Testimonials
          </a>
          <div className="mt-2 pt-2 border-t border-gray-200">
            <a
              href="/contact"
              className="block btn-primary !py-2 !px-4 text-center"
              onClick={() => setIsOpen(false)}
            >
              Get in Touch
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;