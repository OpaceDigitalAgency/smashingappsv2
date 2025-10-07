import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ListChecks, Lightbulb, Calendar, MessageSquare, Palette } from 'lucide-react';

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
            <div className="relative group" ref={megaMenuRef}>
              <a
                href="#tools"
                className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium flex items-center"
                onMouseEnter={() => setMegaMenuOpen(true)}
              >
                Tools
                <svg
                  className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </a>
              
              {/* Mega Menu */}
              <div
                className={`absolute left-1/2 transform -translate-x-1/2 mt-2 w-[90vw] max-w-4xl bg-white rounded-lg shadow-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 z-50 transition-opacity duration-200 ${megaMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}
                onMouseEnter={() => setMegaMenuOpen(true)}
                onMouseLeave={() => setMegaMenuOpen(false)}
              >
                {/* TaskSmasher */}
                <div className="p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-purple-100 p-2 rounded-lg mr-3 flex-shrink-0">
                      <ListChecks className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">TaskSmasher</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">Turn a single word into a fully organised task list.</p>
                      <a href="/tools/task-smasher/" className="text-purple-600 hover:text-purple-800 text-xs font-medium">
                        Try now →
                      </a>
                      
                      <div className="mt-2 flex flex-wrap gap-1">
                        <a href="/tools/task-smasher/marketing-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Marketing
                        </a>
                        <a href="/tools/task-smasher/daily-organizer/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Daily
                        </a>
                        <a href="/tools/task-smasher/goal-planner/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Goals
                        </a>
                        <a href="/tools/task-smasher/recipe-steps/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Recipe
                        </a>
                        <a href="/tools/task-smasher/home-chores/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Chores
                        </a>
                        <a href="/tools/task-smasher/freelancer-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Freelancer
                        </a>
                        <a href="/tools/task-smasher/trip-planner/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Trip
                        </a>
                        <a href="/tools/task-smasher/shopping-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Shopping
                        </a>
                        <a href="/tools/task-smasher/study-plan/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Study
                        </a>
                        <a href="/tools/task-smasher/event-planning/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Event
                        </a>
                        <a href="/tools/task-smasher/diy-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          DIY
                        </a>
                        <a href="/tools/task-smasher/creative-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                          Creative
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* GraphicsSmasher */}
                <div className="p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-rose-100 p-2 rounded-lg mr-3 flex-shrink-0">
                      <Palette className="h-5 w-5 text-rose-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">GraphicsSmasher</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">Non-destructive, GPU-accelerated browser image editing.</p>
                      <a href="/tools/graphics-smasher/" className="text-rose-600 hover:text-rose-800 text-xs font-medium">
                        Launch workspace →
                      </a>
                    </div>
                  </div>
                </div>
                
                {/* IdeaSmasher */}
                <div className="p-3 rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-start">
                    <div className="bg-yellow-100 p-2 rounded-lg mr-3 flex-shrink-0">
                      <Lightbulb className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1 text-sm">IdeaSmasher</h3>
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">Turn vague thoughts into step-by-step action plans.</p>
                      <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                        Coming soon
                      </span>
                    </div>
                  </div>
                </div>
              </div>
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
            <a href="/admin" className="text-gray-700 hover:text-primary px-3 py-2 rounded-md text-sm font-medium">
              Admin
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
          <a
            href="#tools"
            className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium"
            onClick={() => setIsOpen(false)}
          >
            Tools
          </a>
          
          {/* Mobile Tools Submenu */}
          <div className="pl-4 mt-1 space-y-2 border-l-2 border-gray-200">
            <a
              href="/tools/task-smasher/"
              className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-sm font-medium"
              onClick={() => setIsOpen(false)}
            >
              TaskSmasher
            </a>
            
            <div className="pl-3">
              <span className="block text-xs text-gray-500 mb-1">Task types:</span>
              <div className="flex flex-wrap gap-1 mb-2">
                <a href="/tools/task-smasher/marketing-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Marketing
                </a>
                <a href="/tools/task-smasher/daily-organizer/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Daily
                </a>
                <a href="/tools/task-smasher/goal-planner/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Goals
                </a>
                <a href="/tools/task-smasher/recipe-steps/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Recipe
                </a>
                <a href="/tools/task-smasher/home-chores/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Chores
                </a>
                <a href="/tools/task-smasher/freelancer-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Freelancer
                </a>
                <a href="/tools/task-smasher/trip-planner/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Trip
                </a>
                <a href="/tools/task-smasher/shopping-tasks/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Shopping
                </a>
                <a href="/tools/task-smasher/study-plan/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Study
                </a>
                <a href="/tools/task-smasher/event-planning/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Event
                </a>
                <a href="/tools/task-smasher/diy-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  DIY
                </a>
                <a href="/tools/task-smasher/creative-projects/" className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full transition-colors">
                  Creative
                </a>
              </div>
            </div>
            
            <a
              href="#recipe-smasher"
              className="block text-gray-500 px-3 py-2 rounded-md text-sm"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              RecipeSmasher <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full ml-1">Coming soon</span>
            </a>
            
            <a
              href="#idea-smasher"
              className="block text-gray-500 px-3 py-2 rounded-md text-sm"
              onClick={(e) => {
                e.preventDefault();
                setIsOpen(false);
              }}
            >
              IdeaSmasher <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded-full ml-1">Coming soon</span>
            </a>
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
            <a
              href="/admin"
              className="block text-gray-700 hover:text-primary hover:bg-gray-50 px-3 py-2 rounded-md text-base font-medium mt-2"
              onClick={() => setIsOpen(false)}
            >
              Admin
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
