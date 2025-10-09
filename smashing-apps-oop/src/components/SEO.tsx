import React, { useEffect, useState, useRef } from 'react';
import { Helmet } from 'react-helmet-async';
import { useLocation } from 'react-router-dom';
// Import the master SEO configuration
import * as seoMaster from '../utils/seoMaster';
import type { MetaConfig } from '../utils/seoMaster';

interface SEOProps {
  overrides?: Partial<MetaConfig>;
}

/**
 * SEO Component
 *
 * This component dynamically generates meta tags based on the current route.
 * It uses the seoMaster to get route-specific meta information from a single source of truth.
 *
 * Props:
 * - overrides: Optional object to override specific meta values for the current page
 */
const SEO: React.FC<SEOProps> = ({ overrides = {} }) => {

  const location = useLocation();
  const [currentMeta, setCurrentMeta] = useState<MetaConfig>(seoMaster.defaultMeta);
  const prevOverridesRef = useRef<Partial<MetaConfig>>(overrides);
  const prevPathRef = useRef<string>(location.pathname);
  
  useEffect(() => {
    // Get the meta data for this route
    const meta = seoMaster.getMetaForRoute(location.pathname);

    // Apply any overrides
    const finalMeta = { ...meta, ...overrides };
    setCurrentMeta(finalMeta);
  }, [location.pathname, JSON.stringify(overrides)]);
  
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