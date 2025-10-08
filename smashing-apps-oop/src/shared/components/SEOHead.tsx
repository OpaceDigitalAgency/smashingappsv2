import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  canonical: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage: string;
  structuredData?: object;
}

// SEO data for different routes
const getSEOData = (pathname: string): SEOData => {
  const baseUrl = 'https://smashingapps.ai';
  
  // Default SEO data
  const defaultSEO: SEOData = {
    title: 'SmashingApps.ai | AI-Powered Productivity Tools',
    description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
    canonical: `${baseUrl}${pathname}`,
    ogTitle: 'SmashingApps.ai | AI-Powered Productivity Tools',
    ogDescription: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
    ogImage: `${baseUrl}/og/default.png`,
    twitterTitle: 'SmashingApps.ai | AI-Powered Productivity Tools',
    twitterDescription: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
    twitterImage: `${baseUrl}/og/default.png`
  };

  // Route-specific SEO data
  if (pathname.startsWith('/tools/article-smasher')) {
    if (pathname.includes('/seo-article')) {
      return {
        title: 'SEO Article Generator | AI-Powered Content Creation - ArticleSmasher',
        description: 'Create SEO-optimised articles with AI. Generate high-ranking content with keyword research, meta descriptions, and structured formatting.',
        canonical: `${baseUrl}/tools/article-smasher/seo-article/`,
        ogTitle: 'SEO Article Generator | AI-Powered Content Creation - ArticleSmasher',
        ogDescription: 'Create SEO-optimised articles with AI. Generate high-ranking content with keyword research, meta descriptions, and structured formatting.',
        ogImage: `${baseUrl}/og/article-smasher-seo.png`,
        twitterTitle: 'SEO Article Generator | AI-Powered Content Creation - ArticleSmasher',
        twitterDescription: 'Create SEO-optimised articles with AI. Generate high-ranking content with keyword research, meta descriptions, and structured formatting.',
        twitterImage: `${baseUrl}/og/article-smasher-seo.png`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArticleSmasher - SEO Article Generator",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Web",
          "description": "Create SEO-optimised articles with AI. Generate high-ranking content with keyword research, meta descriptions, and structured formatting."
        }
      };
    }
    
    if (pathname.includes('/academic-paper')) {
      return {
        title: 'Academic Paper Generator | AI Research Writing Tool - ArticleSmasher',
        description: 'Generate academic papers with AI assistance. Create well-structured research papers with proper citations, methodology, and academic formatting.',
        canonical: `${baseUrl}/tools/article-smasher/academic-paper/`,
        ogTitle: 'Academic Paper Generator | AI Research Writing Tool - ArticleSmasher',
        ogDescription: 'Generate academic papers with AI assistance. Create well-structured research papers with proper citations, methodology, and academic formatting.',
        ogImage: `${baseUrl}/og/article-smasher-academic.png`,
        twitterTitle: 'Academic Paper Generator | AI Research Writing Tool - ArticleSmasher',
        twitterDescription: 'Generate academic papers with AI assistance. Create well-structured research papers with proper citations, methodology, and academic formatting.',
        twitterImage: `${baseUrl}/og/article-smasher-academic.png`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArticleSmasher - Academic Paper Generator",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Web",
          "description": "Generate academic papers with AI assistance. Create well-structured research papers with proper citations, methodology, and academic formatting."
        }
      };
    }
    
    if (pathname.includes('/blog-post')) {
      return {
        title: 'Blog Post Generator | AI Content Creation Tool - ArticleSmasher',
        description: 'Create engaging blog posts with AI. Generate compelling content with headlines, outlines, and optimised structure for maximum engagement.',
        canonical: `${baseUrl}/tools/article-smasher/blog-post/`,
        ogTitle: 'Blog Post Generator | AI Content Creation Tool - ArticleSmasher',
        ogDescription: 'Create engaging blog posts with AI. Generate compelling content with headlines, outlines, and optimised structure for maximum engagement.',
        ogImage: `${baseUrl}/og/article-smasher-blog.png`,
        twitterTitle: 'Blog Post Generator | AI Content Creation Tool - ArticleSmasher',
        twitterDescription: 'Create engaging blog posts with AI. Generate compelling content with headlines, outlines, and optimised structure for maximum engagement.',
        twitterImage: `${baseUrl}/og/article-smasher-blog.png`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArticleSmasher - Blog Post Generator",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Web",
          "description": "Create engaging blog posts with AI. Generate compelling content with headlines, outlines, and optimised structure for maximum engagement."
        }
      };
    }
    
    if (pathname.includes('/news-article')) {
      return {
        title: 'News Article Generator | AI Journalism Tool - ArticleSmasher',
        description: 'Generate news articles with AI. Create professional journalism content with proper structure, headlines, and fact-based reporting.',
        canonical: `${baseUrl}/tools/article-smasher/news-article/`,
        ogTitle: 'News Article Generator | AI Journalism Tool - ArticleSmasher',
        ogDescription: 'Generate news articles with AI. Create professional journalism content with proper structure, headlines, and fact-based reporting.',
        ogImage: `${baseUrl}/og/article-smasher-news.png`,
        twitterTitle: 'News Article Generator | AI Journalism Tool - ArticleSmasher',
        twitterDescription: 'Generate news articles with AI. Create professional journalism content with proper structure, headlines, and fact-based reporting.',
        twitterImage: `${baseUrl}/og/article-smasher-news.png`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "ArticleSmasher - News Article Generator",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Web",
          "description": "Generate news articles with AI. Create professional journalism content with proper structure, headlines, and fact-based reporting."
        }
      };
    }
    
    // General Article Smasher
    return {
      title: 'ArticleSmasher | AI-Powered Content Creation Tool',
      description: 'Create high-quality articles with AI assistance. Generate blog posts, SEO content, academic papers, and more with our intelligent writing tool.',
      canonical: `${baseUrl}/tools/article-smasher/`,
      ogTitle: 'ArticleSmasher | AI-Powered Content Creation Tool',
      ogDescription: 'Create high-quality articles with AI assistance. Generate blog posts, SEO content, academic papers, and more with our intelligent writing tool.',
      ogImage: `${baseUrl}/og/article-smasher.png`,
      twitterTitle: 'ArticleSmasher | AI-Powered Content Creation Tool',
      twitterDescription: 'Create high-quality articles with AI assistance. Generate blog posts, SEO content, academic papers, and more with our intelligent writing tool.',
      twitterImage: `${baseUrl}/og/article-smasher.png`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "ArticleSmasher",
        "applicationCategory": "ProductivityApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "operatingSystem": "Web",
        "description": "Create high-quality articles with AI assistance. Generate blog posts, SEO content, academic papers, and more with our intelligent writing tool."
      }
    };
  }
  
  if (pathname.startsWith('/tools/task-smasher')) {
    if (pathname.includes('/daily-organizer')) {
      return {
        title: 'Daily Organizer | Free AI Planner & Magic To-Do Lists - TaskSmasher',
        description: 'Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists.',
        canonical: `${baseUrl}/tools/task-smasher/daily-organizer/`,
        ogTitle: 'Daily Organizer | Free AI Planner & Magic To-Do Lists - TaskSmasher',
        ogDescription: 'Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists.',
        ogImage: `${baseUrl}/og/task-smasher-daily.png`,
        twitterTitle: 'Daily Organizer | Free AI Planner & Magic To-Do Lists - TaskSmasher',
        twitterDescription: 'Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists.',
        twitterImage: `${baseUrl}/og/task-smasher-daily.png`,
        structuredData: {
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "TaskSmasher - Daily Organizer",
          "applicationCategory": "ProductivityApplication",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
          },
          "operatingSystem": "Web",
          "description": "Plan your day efficiently with our free AI planner. Daily tasks simplified into magic to-do lists."
        }
      };
    }
    
    // General Task Smasher
    return {
      title: 'TaskSmasher | AI-Powered Task Management & Planning Tool',
      description: 'Transform single words into comprehensive task lists with AI. Create organised workflows, daily planners, and project breakdowns instantly.',
      canonical: `${baseUrl}/tools/task-smasher/`,
      ogTitle: 'TaskSmasher | AI-Powered Task Management & Planning Tool',
      ogDescription: 'Transform single words into comprehensive task lists with AI. Create organised workflows, daily planners, and project breakdowns instantly.',
      ogImage: `${baseUrl}/og/task-smasher.png`,
      twitterTitle: 'TaskSmasher | AI-Powered Task Management & Planning Tool',
      twitterDescription: 'Transform single words into comprehensive task lists with AI. Create organised workflows, daily planners, and project breakdowns instantly.',
      twitterImage: `${baseUrl}/og/task-smasher.png`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "TaskSmasher",
        "applicationCategory": "ProductivityApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "operatingSystem": "Web",
        "description": "Transform single words into comprehensive task lists with AI. Create organised workflows, daily planners, and project breakdowns instantly."
      }
    };
  }
  
  if (pathname.startsWith('/tools/graphics-smasher')) {
    return {
      title: 'GraphicsSmasher | AI-Powered Graphic Design Tool',
      description: 'Create stunning graphics with AI assistance. Design logos, banners, social media posts, and more with our intelligent design tool.',
      canonical: `${baseUrl}/tools/graphics-smasher/`,
      ogTitle: 'GraphicsSmasher | AI-Powered Graphic Design Tool',
      ogDescription: 'Create stunning graphics with AI assistance. Design logos, banners, social media posts, and more with our intelligent design tool.',
      ogImage: `${baseUrl}/og/graphics-smasher.png`,
      twitterTitle: 'GraphicsSmasher | AI-Powered Graphic Design Tool',
      twitterDescription: 'Create stunning graphics with AI assistance. Design logos, banners, social media posts, and more with our intelligent design tool.',
      twitterImage: `${baseUrl}/og/graphics-smasher.png`,
      structuredData: {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "GraphicsSmasher",
        "applicationCategory": "ProductivityApplication",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD"
        },
        "operatingSystem": "Web",
        "description": "Create stunning graphics with AI assistance. Design logos, banners, social media posts, and more with our intelligent design tool."
      }
    };
  }

  return defaultSEO;
};

const SEOHead: React.FC = () => {
  const location = useLocation();
  
  useEffect(() => {
    const seoData = getSEOData(location.pathname);
    
    // Update document title
    document.title = seoData.title;
    
    // Update meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector) as HTMLMetaElement;
      
      if (!meta) {
        meta = document.createElement('meta');
        if (property) {
          meta.setAttribute('property', name);
        } else {
          meta.setAttribute('name', name);
        }
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Update canonical link
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', seoData.canonical);
    
    // Update basic meta tags
    updateMetaTag('description', seoData.description);
    
    // Update Open Graph tags
    updateMetaTag('og:title', seoData.ogTitle, true);
    updateMetaTag('og:description', seoData.ogDescription, true);
    updateMetaTag('og:image', seoData.ogImage, true);
    updateMetaTag('og:url', seoData.canonical, true);
    updateMetaTag('og:type', 'website', true);
    
    // Update Twitter tags
    updateMetaTag('twitter:title', seoData.twitterTitle);
    updateMetaTag('twitter:description', seoData.twitterDescription);
    updateMetaTag('twitter:image', seoData.twitterImage);
    updateMetaTag('twitter:card', 'summary_large_image');
    updateMetaTag('twitter:url', seoData.canonical);
    
    // Update structured data
    if (seoData.structuredData) {
      let structuredDataScript = document.querySelector('script[type="application/ld+json"]');
      if (!structuredDataScript) {
        structuredDataScript = document.createElement('script');
        structuredDataScript.setAttribute('type', 'application/ld+json');
        document.head.appendChild(structuredDataScript);
      }
      structuredDataScript.textContent = JSON.stringify(seoData.structuredData);
    }
    
  }, [location.pathname]);
  
  return null; // This component doesn't render anything
};

export default SEOHead;
