import React from 'react';
import { CheckCircle } from 'lucide-react';

// Define the article types
export const ARTICLE_TYPES = [
  { label: "Engaging Blog Post", value: "blog-post" },
  { label: "SEO-Optimised Web Article", value: "seo-article" },
  { label: "Academic Research Paper", value: "academic-paper" },
  { label: "Breaking News Story", value: "news-article" },
  { label: "In-Depth Long-Form Article", value: "long-form" },
  { label: "Concise Short-Form Write-Up", value: "short-form" },
  { label: "Technical Documentation Guide", value: "technical-doc" },
  { label: "B2B Whitepaper / Technical Report", value: "whitepaper" },
  { label: "Corporate Press Release", value: "press-release" },
  { label: "Step-by-Step How-To Guide", value: "how-to" },
  { label: "SEO Product Description", value: "product-description" },
  { label: "Business Case Study", value: "case-study" },
  { label: "Email Marketing Newsletter", value: "email-newsletter" },
  { label: "Social Media Post or Caption", value: "social-post" },
  { label: "Frequently Asked Questions (FAQ) Page", value: "faq-page" },
  { label: "Service Page Content", value: "service-page" },
  { label: "High-Converting Landing Page Copy", value: "landing-page" },
  { label: "Direct Response Sales Letter", value: "sales-letter" },
  { label: "YouTube or Explainer Video Script", value: "video-script" },
  { label: "Legal or Compliance Statement", value: "legal-notice" },
  { label: "Terms & Conditions Template", value: "terms-conditions" },
  { label: "Expert Product or Service Review", value: "review-article" }
];

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
  return (
    <div className="article-type-sidebar">
      <h3 className="article-type-sidebar-title">Article Type</h3>
      <div className="article-type-list">
        {ARTICLE_TYPES.map((type) => (
          <button
            key={type.value}
            className={`article-type-item ${
              selectedType === type.value ? 'active' : ''
            } ${isLocked ? 'disabled' : ''}`}
            onClick={() => !isLocked && onSelectType(type.value)}
            disabled={isLocked}
          >
            <div className="flex items-center w-full">
              <span className="flex-grow text-sm">{type.label}</span>
              {selectedType === type.value && (
                <CheckCircle size={16} className="text-primary ml-2" />
              )}
            </div>
          </button>
        ))}
      </div>
      <button 
        className="generate-ideas-btn"
        onClick={onGenerateIdeas}
        disabled={isLocked}
      >
        Generate Topic Ideas
      </button>
    </div>
  );
};

export default ArticleTypeSidebar;