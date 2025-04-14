import React, { useState, useEffect, useRef } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Lock, SidebarOpen, SidebarClose, PanelLeft, PanelRight } from 'lucide-react';
import { ARTICLE_TYPES_BY_CATEGORY, ARTICLE_TYPES } from './ArticleTypeSidebarImproved';

// Re-export for other components to use
export { ARTICLE_TYPES };

interface ArticleTypeSidebarProps {
  selectedType: string;
  onSelectType: (value: string) => void;
  isLocked: boolean;
  onGenerateIdeas: () => void;
}

const ArticleTypeSidebar: React.FC<ArticleTypeSidebarProps> = ({
  selectedType,
  onSelectType,
  isLocked,
  onGenerateIdeas
}) => {
  // Track expanded categories
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'Content Marketing': true,
    'Social Media': false,
    'Professional/Corporate': false,
    'Educational': false,
    'Product/Service': false,
    'Other': false
  });
  
  // State for sidebar collapse
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);

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
  
  // Add click-outside behavior to collapse sidebar when clicking elsewhere
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Only handle if sidebar is expanded and we're on mobile
      if (!isCollapsed && isMobile) {
        // Check if click is outside the sidebar, toggle button, and mobile button
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node) &&
          toggleButtonRef.current &&
          !toggleButtonRef.current.contains(event.target as Node) &&
          mobileButtonRef.current &&
          !mobileButtonRef.current.contains(event.target as Node)
        ) {
          setIsCollapsed(true);
        }
      }
    }

    // Add event listener
    document.addEventListener('mousedown', handleClickOutside);
    
    // Clean up
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCollapsed, isMobile]);

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  // Toggle sidebar collapse state
  const toggleCollapse = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div
      ref={containerRef}
      className={`${isCollapsed ? 'w-16 md:w-20' : 'w-64 md:w-72'}
        bg-white border-r border-gray-200 flex flex-col gap-2
        shadow-lg z-10 transition-all duration-300 ease-in-out
        relative overflow-hidden rounded-xl`}
      style={{
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        height: 'calc(100vh - 12rem)',
        position: 'sticky',
        top: '5rem'
      }}
    >
      {/* Toggle button - desktop version */}
      <button
        ref={toggleButtonRef}
        onClick={toggleCollapse}
        className="absolute top-4 right-3 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700
          text-white transition-all duration-200 z-20 shadow-lg hidden md:flex items-center justify-center
          hover:shadow-xl hover:scale-105"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 12px rgba(0, 104, 179, 0.3)'
        }}
      >
        {isCollapsed ? <SidebarOpen className="w-5 h-5" /> : <SidebarClose className="w-5 h-5" />}
      </button>

      {/* Toggle button - visible on mobile screens */}
      <button
        ref={mobileButtonRef}
        onClick={toggleCollapse}
        className="absolute top-4 right-3 p-2 rounded-lg bg-gradient-to-r from-blue-600 to-blue-700
          text-white transition-all duration-200 z-20 shadow-lg flex md:hidden items-center justify-center
          hover:shadow-xl hover:scale-105"
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 12px rgba(0, 104, 179, 0.3)'
        }}
      >
        {isCollapsed ? <SidebarOpen className="w-5 h-5" /> : <SidebarClose className="w-5 h-5" />}
      </button>
      
      {/* Mobile menu button - floating button for mobile */}
      <button
        ref={mobileButtonRef}
        onClick={toggleCollapse}
        className={`fixed bottom-6 right-6 p-4 rounded-full bg-gradient-to-r from-blue-600 to-blue-700
          text-white shadow-xl md:hidden ${isCollapsed ? 'scale-100' : 'scale-90 opacity-90'}
          transition-all duration-300 z-50 hover:shadow-2xl hover:scale-105`}
        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        style={{
          boxShadow: '0 4px 20px rgba(0, 104, 179, 0.6)'
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
        <div className="mb-4">
          <h2 className={`text-lg font-bold text-gray-900 ${isCollapsed ? 'hidden' : ''}`}>
            Article Type
          </h2>
        </div>
        <p className={`text-sm text-gray-600 mb-4 ${isCollapsed ? 'hidden' : ''}`}>
          Select the type of article you want to create.
        </p>
      </div>
      
      <div className="flex flex-col gap-2 px-2 overflow-y-auto custom-scrollbar">
        {/* Categories */}
        {Object.entries(ARTICLE_TYPES_BY_CATEGORY).map(([category, types]) => (
          <div key={category} className="mb-2">
            {/* Category Header - Only show in expanded mode */}
            {!isCollapsed && (
              <button 
                onClick={() => toggleCategory(category)}
                className="w-full flex items-center justify-between px-2 py-1 text-xs uppercase text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="font-medium">{category}</span>
                {expandedCategories[category] ? (
                  <ChevronDown size={14} />
                ) : (
                  <ChevronRight size={14} />
                )}
              </button>
            )}
            
            {/* Article Types in Category - Expanded view */}
            {!isCollapsed && expandedCategories[category] && (
              <div className="space-y-1 mt-1 pl-1">
                {types.map((type) => (
                  <div key={type.value} className="relative group">
                    <button
                      className={`article-type-item transition-all duration-200 ${
                        selectedType === type.value 
                          ? 'active bg-blue-700 text-white font-medium' 
                          : 'hover:bg-gray-50'
                      } ${isLocked && selectedType !== type.value ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`}
                      onClick={() => !isLocked && onSelectType(type.value)}
                      disabled={isLocked && selectedType !== type.value}
                    >
                      <div className="flex items-center w-full">
                        <span className="flex-grow text-sm">{type.label}</span>
                        {selectedType === type.value && (
                          <CheckCircle size={16} className="ml-2 text-white" />
                        )}
                        {isLocked && selectedType !== type.value && (
                          <Lock size={14} className="ml-2 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-0 z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg 
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                      {type.description}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Collapsed view - show only icons or short names */}
            {isCollapsed && (
              <div className="flex flex-col items-center space-y-2 mt-2">
                {types.slice(0, 3).map((type) => (
                  <div key={type.value} className="relative group">
                    <button
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        selectedType === type.value 
                          ? 'bg-blue-100 text-blue-700' 
                          : 'text-gray-600 hover:bg-gray-50'
                      } ${isLocked && selectedType !== type.value ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={() => !isLocked && onSelectType(type.value)}
                      disabled={isLocked && selectedType !== type.value}
                      title={type.label}
                    >
                      <div className="w-6 h-6 flex items-center justify-center">
                        {type.label.charAt(0)}
                      </div>
                    </button>
                    
                    {/* Tooltip */}
                    <div className="absolute left-full ml-2 top-0 z-10 w-48 p-2 bg-gray-800 text-white text-xs rounded shadow-lg 
                                  opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity duration-200">
                      <p className="font-medium mb-1">{type.label}</p>
                      <p>{type.description}</p>
                    </div>
                  </div>
                ))}
                {types.length > 3 && (
                  <div className="text-xs text-gray-500 mt-1">+{types.length - 3}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      
      {!isCollapsed && (
        <button 
          className="generate-ideas-btn mx-2 mb-4"
          onClick={onGenerateIdeas}
          disabled={isLocked}
        >
          <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 3.5V2M5.06 5.06L4 4M5.06 12.94L4 14M12 18.5V20M18.94 12.94L20 14M18.94 5.06L20 4M17.5 9H19M9 17.5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Generate Topic Ideas
        </button>
      )}
    </div>
  );
};

export default ArticleTypeSidebar;