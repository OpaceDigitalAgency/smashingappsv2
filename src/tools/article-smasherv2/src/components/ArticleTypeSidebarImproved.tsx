import React, { useState } from 'react';
import { CheckCircle, ChevronDown, ChevronRight, Lock } from 'lucide-react';

// Define the article types by category
export const ARTICLE_TYPES_BY_CATEGORY = {
  'Content Marketing': [
    { label: "Engaging Blog Post", value: "blog-post", description: "Perfect for engaging readers with valuable content" },
    { label: "SEO-Optimised Web Article", value: "seo-article", description: "Structured for search engine visibility" },
    { label: "In-Depth Long-Form Article", value: "long-form", description: "Comprehensive coverage of complex topics" },
    { label: "Concise Short-Form Write-Up", value: "short-form", description: "Brief, focused content for quick consumption" }
  ],
  'Social Media': [
    { label: "Social Media Post or Caption", value: "social-post", description: "Engaging content for social platforms" },
    { label: "Email Marketing Newsletter", value: "email-newsletter", description: "Compelling email content that converts" }
  ],
  'Professional/Corporate': [
    { label: "B2B Whitepaper / Technical Report", value: "whitepaper", description: "In-depth analysis for business audiences" },
    { label: "Corporate Press Release", value: "press-release", description: "Official announcements for media distribution" },
    { label: "Business Case Study", value: "case-study", description: "Real-world examples of success stories" }
  ],
  'Educational': [
    { label: "Academic Research Paper", value: "academic-paper", description: "Scholarly content with citations and research" },
    { label: "Technical Documentation Guide", value: "technical-doc", description: "Step-by-step technical instructions" },
    { label: "Step-by-Step How-To Guide", value: "how-to", description: "Practical guidance for specific tasks" },
    { label: "Frequently Asked Questions (FAQ) Page", value: "faq-page", description: "Answers to common questions" }
  ],
  'Product/Service': [
    { label: "SEO Product Description", value: "product-description", description: "Compelling product details that sell" },
    { label: "Service Page Content", value: "service-page", description: "Showcase your services effectively" },
    { label: "High-Converting Landing Page Copy", value: "landing-page", description: "Persuasive content designed to convert" },
    { label: "Direct Response Sales Letter", value: "sales-letter", description: "Compelling copy that drives action" }
  ],
  'Other': [
    { label: "Breaking News Story", value: "news-article", description: "Timely reporting on current events" },
    { label: "YouTube or Explainer Video Script", value: "video-script", description: "Engaging scripts for video content" },
    { label: "Legal or Compliance Statement", value: "legal-notice", description: "Formal legal documentation" },
    { label: "Terms & Conditions Template", value: "terms-conditions", description: "Standard legal agreements" },
    { label: "Expert Product or Service Review", value: "review-article", description: "Detailed evaluation of products or services" }
  ]
};

// Flatten the categories for easier lookup
export const ARTICLE_TYPES = Object.values(ARTICLE_TYPES_BY_CATEGORY).flat();

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

  // Toggle category expansion
  const toggleCategory = (category: string) => {
    setExpandedCategories({
      ...expandedCategories,
      [category]: !expandedCategories[category]
    });
  };

  return (
    <div className="article-type-sidebar">
      <h3 className="article-type-sidebar-title">Article Type</h3>
      
      <div className="article-type-list custom-scrollbar">
        {Object.entries(ARTICLE_TYPES_BY_CATEGORY).map(([category, types]) => (
          <div key={category} className="mb-2">
            {/* Category Header */}
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
            
            {/* Article Types in Category */}
            {expandedCategories[category] && (
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
          </div>
        ))}
      </div>
      
      <button 
        className="generate-ideas-btn"
        onClick={onGenerateIdeas}
        disabled={isLocked}
      >
        <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 3.5V2M5.06 5.06L4 4M5.06 12.94L4 14M12 18.5V20M18.94 12.94L20 14M18.94 5.06L20 4M17.5 9H19M9 17.5H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M12 15C15.3137 15 18 12.3137 18 9C18 5.68629 15.3137 3 12 3C8.68629 3 6 5.68629 6 9C6 12.3137 8.68629 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Generate Topic Ideas
      </button>
      
      {/* Custom styles are now in the CSS file */}
    </div>
  );
};

export default ArticleTypeSidebar;