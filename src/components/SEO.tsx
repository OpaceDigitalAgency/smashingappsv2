import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
import metaConfig, { defaultMetaConfig, MetaConfig } from '../utils/metaConfig';

interface SEOProps {
  overrides?: Partial<MetaConfig>;
}

/**
 * SEO Component
 * 
 * This component dynamically generates meta tags based on the current route.
 * It uses the metaConfig to get route-specific meta information and falls back
 * to default values if no specific configuration is found.
 * 
 * Props:
 * - overrides: Optional object to override specific meta values for the current page
 */
const SEO: React.FC<SEOProps> = ({ overrides = {} }) => {
  const location = useLocation();
  const [currentMeta, setCurrentMeta] = useState<MetaConfig>(defaultMetaConfig);
  
  useEffect(() => {
    // Get the current path with trailing slash for consistency
    let path = location.pathname;
    if (!path.endsWith('/') && path !== '/') {
      path = `${path}/`;
    }
    
    // Find the most specific matching route
    // First try exact match
    let meta = metaConfig[path];
    
    // If no exact match, try to find a parent route
    if (!meta) {
      const pathParts = path.split('/').filter(Boolean);
      while (pathParts.length > 0) {
        const parentPath = `/${pathParts.join('/')}/`;
        if (metaConfig[parentPath]) {
          meta = metaConfig[parentPath];
          break;
        }
        pathParts.pop();
      }
    }
    
    // Fall back to default if still no match
    if (!meta) {
      meta = defaultMetaConfig;
    }
    
    // Apply any overrides
    setCurrentMeta({ ...meta, ...overrides });
  }, [location.pathname, overrides]);
  
  // Construct the full URL for canonical and OG tags
  const fullUrl = `https://smashingapps.ai${location.pathname}`;
  
  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{currentMeta.title}</title>
      <meta name="description" content={currentMeta.description} />
      {currentMeta.keywords && <meta name="keywords" content={currentMeta.keywords} />}
      
      {/* Canonical Link */}
      <link rel="canonical" href={currentMeta.canonical || fullUrl} />
      
      {/* Robots Meta Tag */}
      {currentMeta.robots && <meta name="robots" content={currentMeta.robots} />}
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={currentMeta.title} />
      <meta property="og:description" content={currentMeta.description} />
      <meta property="og:image" content={currentMeta.image} />
      <meta property="og:url" content={currentMeta.canonical || fullUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="SmashingApps.ai" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={currentMeta.title} />
      <meta name="twitter:description" content={currentMeta.description} />
      <meta name="twitter:image" content={currentMeta.image} />
      
      {/* Structured Data (JSON-LD) */}
      {currentMeta.structuredData && (
        <script type="application/ld+json">
          {JSON.stringify(currentMeta.structuredData)}
        </script>
      )}
    </Helmet>
  );
};

export default SEO;