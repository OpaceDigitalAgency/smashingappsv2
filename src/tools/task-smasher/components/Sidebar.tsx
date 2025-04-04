import React, { useEffect, useRef, useState } from 'react';
import { Calendar, Target, MessageSquare, ChefHat, Home, Briefcase, Plane, ShoppingCart, GraduationCap, PartyPopper, Wrench, Palette, ChevronLeft, ChevronRight, Menu, PanelLeft, PanelRight, SidebarClose, SidebarOpen, ToggleLeft, ToggleRight } from 'lucide-react';
import { useCaseDefinitions } from '../utils/useCaseDefinitions';
import { Link, useLocation } from 'react-router-dom';

interface SidebarProps {
  selectedUseCase: string | null;
  onSelectUseCase: (useCase: string) => void;
}

const useCases = [
  { id: 'daily', icon: Calendar, label: 'Daily Organizer' },
  { id: 'goals', icon: Target, label: 'Goal Planner' },
  { id: 'marketing', icon: MessageSquare, label: 'Marketing Tasks' },
  { id: 'recipe', icon: ChefHat, label: 'Recipe Steps' },
  { id: 'home', icon: Home, label: 'Home Chores' },
  { id: 'freelance', icon: Briefcase, label: 'Freelancer Projects' },
  { id: 'travel', icon: Plane, label: 'Trip Planner' },
  { id: 'shopping', icon: ShoppingCart, label: 'Shopping Tasks' },
  { id: 'study', icon: GraduationCap, label: 'Study Plan' },
  { id: 'events', icon: PartyPopper, label: 'Event Planning' },
  { id: 'diy', icon: Wrench, label: 'DIY Projects' },
  { id: 'creative', icon: Palette, label: 'Creative Projects' }
];

function Sidebar({ selectedUseCase, onSelectUseCase }: SidebarProps) {
  const [smashPosition, setSmashPosition] = useState({ top: 0, left: 0 });
  const [showSmashEffect, setShowSmashEffect] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  
  // Check if mobile and auto-collapse on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      // Set initial collapsed state based on mobile
      if (mobile) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };
    
    // Initial check
    checkIfMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);
    
    // Cleanup
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);
  
  // Determine the current use case from the URL path
  useEffect(() => {
    const fullPath = location.pathname.substring(1); // Remove leading slash
    
    // Check if the path starts with 'tools/task-smasher/'
    if (fullPath.startsWith('tools/task-smasher/')) {
      // Extract the use case part from the path (trim trailing slash if present)
      let path = fullPath.substring('tools/task-smasher/'.length);
      
      // Remove trailing slash if present
      if (path.endsWith('/')) {
        path = path.slice(0, -1);
      }
      
      if (path) {
        const matchedUseCase = useCases.find(useCase =>
          useCase.label.toLowerCase().replace(/\s+/g, '-') === path.toLowerCase()
        );
        if (matchedUseCase && matchedUseCase.id !== selectedUseCase) {
          onSelectUseCase(matchedUseCase.id);
        }
      }
    } else if (!selectedUseCase) {
      // Default to daily if no path and no selected use case
      onSelectUseCase('daily');
    }
  }, [location, selectedUseCase, onSelectUseCase]);
  
  const handleUseCaseClick = (useCaseId: string, e: React.MouseEvent) => {
    // Only trigger animation if the use case is changing
    if (useCaseId !== selectedUseCase) {
      // Get position relative to sidebar
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;
        
        // Set smash position to click position
        setSmashPosition({ top: clickY, left: clickX });
        
        // Trigger smash effect
        setShowSmashEffect(true);
        
        // Clear effect after animation is complete
        setTimeout(() => {
          setShowSmashEffect(false);
        }, 800);
        
        // Actually change the use case
        onSelectUseCase(useCaseId);
      }
    }
  };

  // Get current use case label
  const currentUseCaseLabel = selectedUseCase 
    ? useCaseDefinitions[selectedUseCase]?.label || 'Use Cases'
    : 'Use Cases';

  // Toggle sidebar collapse state
  const toggleCollapse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("Toggle sidebar collapse state", isCollapsed, "->", !isCollapsed);
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={containerRef}
      className={`${isCollapsed ? 'w-16 md:w-20' : 'w-64 md:w-72'}
        bg-white border-r border-gray-200 flex flex-col gap-2
        shadow-lg z-10 transition-all duration-300 ease-in-out
        relative overflow-hidden`}
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
      }}
    >
      {/* Toggle button - desktop version */}
      <button
        onClick={toggleCollapse}
        className="absolute top-4 right-3 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600
          text-white transition-all duration-200 z-20 shadow-lg hidden md:flex items-center justify-center
          hover:shadow-xl hover:scale-105 sidebar-toggle-pulse"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}
      >
        {isCollapsed ? <SidebarOpen className="w-5 h-5" /> : <SidebarClose className="w-5 h-5" />}
      </button>

      {/* Toggle button - visible on all screens */}
      <button
        onClick={toggleCollapse}
        className="absolute top-4 right-3 p-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600
          text-white transition-all duration-200 z-20 shadow-lg flex md:hidden items-center justify-center
          hover:shadow-xl hover:scale-105 sidebar-toggle-pulse"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}
      >
        {isCollapsed ? <SidebarOpen className="w-5 h-5" /> : <SidebarClose className="w-5 h-5" />}
      </button>
      
      {/* Mobile menu button - floating button for mobile */}
      <button
        onClick={toggleCollapse}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600
          text-white shadow-xl md:hidden ${isCollapsed ? 'scale-100' : 'scale-90 opacity-90'}
          transition-all duration-300 z-50 hover:shadow-2xl hover:scale-105 sidebar-toggle-pulse`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 20px rgba(79, 70, 229, 0.6)'
        }}
      >
        {isCollapsed ?
          <div className="relative">
            <PanelLeft className="w-6 h-6" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
          </div>
          :
          <PanelRight className="w-6 h-6" />
        }
      </button>
      <div className={`p-4 ${isCollapsed ? 'text-center' : ''}`}>
        <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''} mb-4`}>
          <div className="w-8 h-8 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center shadow-md">
            <Target className="w-5 h-5 text-white" />
          </div>
          <h2 className={`text-lg font-bold text-gray-900 ml-3 ${isCollapsed ? 'hidden' : ''}`}>
            Use Case Categories
          </h2>
        </div>
        <p className={`text-sm text-gray-600 mb-4 ${isCollapsed ? 'hidden' : ''}`}>
          Select a category below to create AI-generated tasks specific to that domain
        </p>
      </div>
      
      {/* Active smash effect (appears on click) */}
      {showSmashEffect && (
        <div 
          className="absolute pointer-events-none z-50"
          style={{ 
            top: `${smashPosition.top - 40}px`, 
            left: `${smashPosition.left - 40}px`,
          }}
        >
          <div className="smash-effect">
            <svg viewBox="0 0 100 100" width="80" height="80">
              <polygon className="smash-star" points="50,0 61,35 95,35 67,57 79,90 50,70 21,90 33,57 5,35 39,35" fill="var(--primary-color)" />
            </svg>
            <div className="smash-text">SMASH!</div>
          </div>
        </div>
      )}
      
      <div className="flex flex-col gap-2 px-2 overflow-y-auto custom-scrollbar">
        {useCases.map(useCase => {
          const Icon = useCase.icon;
          const isSelected = selectedUseCase === useCase.id;
          
          return (
            <Link
              key={useCase.id}
              to={`/tools/task-smasher/${useCase.label.toLowerCase().replace(/\s+/g, '-')}/`}
              onClick={(e) => handleUseCaseClick(useCase.id, e)}
              className={`flex flex-col items-${isCollapsed ? 'center' : 'start'} gap-1 px-3 py-3 rounded-xl text-left transition-all duration-300 relative no-underline
                ${isSelected
                  ? 'bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 shadow-md scale-[1.02] font-medium'
                  : 'text-gray-700 hover:bg-gray-50 hover:shadow-sm'}`}
              style={{
                backgroundColor: isSelected ? `var(--${useCase.id}-light)` : '',
                color: isSelected ? `var(--${useCase.id}-primary)` : '',
                boxShadow: isSelected ? '0 4px 12px rgba(79, 70, 229, 0.15)' : ''
              }}
              title={useCase.label}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : ''} gap-3 w-full`}>
                <div className={`flex items-center justify-center ${isSelected ? 'bg-white' : 'bg-gray-100'} p-2 rounded-lg transition-colors duration-300`}>
                  <Icon
                    className={`w-5 h-5 transition-colors duration-300 ${isSelected ? 'text-indigo-600' : 'text-gray-600'}`}
                    style={{ color: isSelected ? `var(--${useCase.id}-primary)` : '' }}
                  />
                </div>
                {!isCollapsed && <span className={`font-medium ${isSelected ? 'text-indigo-700' : 'text-gray-700'}`}>{useCase.label}</span>}
              </div>
              {isSelected && !isCollapsed && (
                <p className="text-xs text-gray-500 mt-2 pl-10 pr-2 bg-white bg-opacity-50 py-1 rounded-md">
                  {useCaseDefinitions[useCase.id]?.description || ''}
                </p>
              )}
            </Link>
          );
        })}
      </div>
      
      <div className={`mt-auto pt-4 border-t border-gray-100 text-xs text-center ${isCollapsed ? 'px-2' : 'px-4'} pb-4`}>
        {!isCollapsed && <span className="block mb-1 font-medium text-indigo-600">TaskSmasher</span>}
        {!isCollapsed && <span className="text-gray-500">Click to smash your tasks!</span>}
        {isCollapsed && <span className="block text-indigo-600">TS</span>}
      </div>
    </div>
  );
}

export default Sidebar;