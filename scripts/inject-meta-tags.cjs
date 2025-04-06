/**
 * Meta Tags Injector
 * 
 * This script directly injects meta tags into the index.html file
 * based on the metaConfig. This serves as a fallback in case the
 * prerendering process doesn't work as expected.
 */

// Removed duplicate ES module imports
// Use require for CommonJS
const path = require('path');
const fs = require('fs');

// Get the directory name in CommonJS
// Note: __dirname is available directly in CommonJS modules run by Node
// const __filename = fileURLToPath(import.meta.url); // Not needed for CommonJS
// const __dirname = path.dirname(__filename); // Use Node's __dirname

// Import the meta config using require
let metaConfig, defaultMetaConfig;
try {
  console.log('Attempting to require metaConfig...');
  const metaConfigPath = path.resolve(__dirname, '../src/utils/metaConfig.cjs');
  console.log(`Resolved metaConfig path: ${metaConfigPath}`);
  if (!fs.existsSync(metaConfigPath)) {
    throw new Error(`metaConfig file not found at ${metaConfigPath}`);
  }
  const metaConfigModule = require(metaConfigPath);
  metaConfig = metaConfigModule.default;
  defaultMetaConfig = metaConfigModule.defaultMetaConfig;
  console.log('Successfully required metaConfig:', !!metaConfig, 'defaultMetaConfig:', !!defaultMetaConfig);
  if (!metaConfig || !defaultMetaConfig) {
    throw new Error('metaConfig or defaultMetaConfig is undefined after require.');
  }
} catch (error) {
  console.error('Error requiring metaConfig:', error);
  // Fallback to empty objects to prevent script failure
  metaConfig = {};
  defaultMetaConfig = { title: 'SmashingApps.ai | Fallback', description: 'Fallback description', canonical: 'https://smashingapps.ai', image: '' }; // Basic fallback
  process.exit(1); // Exit if config is crucial
}

/**
 * Create route-specific HTML files with proper meta tags and basic body content
 */
function injectMetaTagsAndContent() { // Removed async as require is synchronous
  console.log('Starting meta tags injection...');
  
  // Read the original index.html file from the build output directory
  const distDir = path.resolve(__dirname, '../dist');
  const indexPath = path.join(distDir, 'index.html');
  const originalHtml = fs.readFileSync(indexPath, 'utf8');
  
  // Create a version with default meta tags
  let defaultHtml = originalHtml;
  
  // Replace title - Ensure defaultMetaConfig exists
  if (defaultMetaConfig.title) {
    defaultHtml = defaultHtml.replace(/<title>[^<]*<\/title>/, `<title>${defaultMetaConfig.title}</title>`);
  }
  
  // Replace or add meta description
  // Replace or add meta description - Ensure defaultMetaConfig exists
  if (defaultMetaConfig.description) {
    if (defaultHtml.includes('<meta name="description"')) {
      defaultHtml = defaultHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${defaultMetaConfig.description}">`);
    } else {
      defaultHtml = defaultHtml.replace('</head>', `  <meta name="description" content="${defaultMetaConfig.description}">\n  </head>`);
    }
  }
  
  // Replace or add canonical link
  // Replace or add canonical link - Ensure defaultMetaConfig exists
  if (defaultMetaConfig.canonical) {
    if (defaultHtml.includes('<link rel="canonical"')) {
      defaultHtml = defaultHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${defaultMetaConfig.canonical}">`);
    } else {
      defaultHtml = defaultHtml.replace('</head>', `  <link rel="canonical" href="${defaultMetaConfig.canonical}">\n  </head>`);
    }
  }
  
  // Add robots meta tag
  // Add robots meta tag - Ensure defaultMetaConfig exists
  if (defaultMetaConfig.robots && !defaultHtml.includes('<meta name="robots"')) {
    defaultHtml = defaultHtml.replace('</head>', `  <meta name="robots" content="${defaultMetaConfig.robots}">\n  </head>`);
  }
  
  // Add Open Graph tags
  // Add Open Graph tags - Ensure defaultMetaConfig exists and use the same description as meta tag
  // Always update OG and Twitter tags, replacing them if they exist
  const metaDescription = defaultMetaConfig.description;
  console.log(`Setting OG/Twitter description to: ${metaDescription.substring(0, 50)}...`);
  
  // First remove any existing OG and Twitter tags
  defaultHtml = defaultHtml.replace(/<meta property="og:[^>]*>/g, '');
  defaultHtml = defaultHtml.replace(/<meta name="twitter:[^>]*>/g, '');
  
  // Then add the new OG and Twitter tags
  const ogTags = `
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${defaultMetaConfig.canonical || 'https://smashingapps.ai'}" />
  <meta property="og:title" content="${defaultMetaConfig.title}" />
  <meta property="og:description" content="${metaDescription}" />
  <meta property="og:image" content="${defaultMetaConfig.image}" />
  <meta property="og:site_name" content="SmashingApps.ai" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${defaultMetaConfig.title}" />
  <meta name="twitter:description" content="${metaDescription}" />
  <meta name="twitter:image" content="${defaultMetaConfig.image}" />
`;
  defaultHtml = defaultHtml.replace('</head>', `${ogTags}\n  </head>`);
  console.log('Added OG and Twitter tags with matching description');
  
  // Add structured data if available
  if (defaultMetaConfig.structuredData && !defaultHtml.includes('application/ld+json')) {
    const structuredDataTag = `
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(defaultMetaConfig.structuredData, null, 2)}
  </script>
`;
    defaultHtml = defaultHtml.replace('</head>', `${structuredDataTag}\n  </head>`);
  }
  
  // Add CSS to hide the fallback content by default - aggressive approach
  const hideFallbackCSS = `
  <style>
    /* Hide fallback content by default - aggressive approach */
    #root-fallback {
      display: none !important;
      visibility: hidden !important;
      opacity: 0 !important;
      position: absolute !important;
      width: 1px !important;
      height: 1px !important;
      overflow: hidden !important;
      clip: rect(0, 0, 0, 0) !important;
    }
  </style>
  
  <!-- Fallback style for when JavaScript is disabled -->
  <noscript>
    <style>
      #root-fallback {
        display: block !important;
        padding: 20px;
        font-family: sans-serif;
      }
    </style>
  </noscript>
  `;
  defaultHtml = defaultHtml.replace('</head>', `${hideFallbackCSS}\n  </head>`);
  
  // Add Google Analytics and Hotjar tracking code
  const trackingCode = `
  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-38TGWBFRMN"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-38TGWBFRMN');
  </script>
  <!-- Hotjar Tracking Code for smashingapps.ai -->
  <script>
    (function(h,o,t,j,a,r){
        h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
        h._hjSettings={hjid:5361995,hjsv:6};
        a=o.getElementsByTagName('head')[0];
        r=o.createElement('script');r.async=1;
        r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
        a.appendChild(r);
    })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
  </script>
  `;
  defaultHtml = defaultHtml.replace('</head>', `${trackingCode}\n  </head>`);
  
  // Add script to immediately hide the fallback content - aggressive approach
  const hideScript = `
  <script>
    // Immediately hide the fallback content - aggressive approach
    (function() {
      // Create a style element with aggressive hiding
      var style = document.createElement('style');
      style.textContent = '#root-fallback { display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important; }';
      
      // Append it to the head
      document.head.appendChild(style);
      
      // Also directly hide any existing elements
      document.addEventListener('DOMContentLoaded', function() {
        var fallback = document.getElementById('root-fallback');
        if (fallback) {
          fallback.style.display = 'none';
          fallback.style.visibility = 'hidden';
          fallback.style.opacity = '0';
          fallback.style.position = 'absolute';
          fallback.style.width = '1px';
          fallback.style.height = '1px';
          fallback.style.overflow = 'hidden';
          fallback.style.clip = 'rect(0, 0, 0, 0)';
        }
      });
    })();
  </script>
  `;
  defaultHtml = defaultHtml.replace('<head>', `<head>\n  ${hideScript}`);
  
  // Inject basic body content for default index.html (for SEO and JS-disabled browsers)
  // Update the fallback content in the body to match the meta description
  // Update the fallback content in the body to match the meta description
  const defaultBodyContent = `
      <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
      <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
        <h1>${defaultMetaConfig.title || 'SmashingApps.ai'}</h1>
        <p>${defaultMetaConfig.description || 'Loading...'}</p>
        <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
      </div>
    `;
  
  // Always replace the root div content, regardless of its current content
  const rootDivRegex = /<div id="root"[^>]*>[\s\S]*?<\/div>/;
  if (rootDivRegex.test(defaultHtml)) {
    defaultHtml = defaultHtml.replace(rootDivRegex, `<div id="root">${defaultBodyContent}</div>`);
    console.log('   Successfully injected fallback content for homepage');
  } else if (defaultHtml.includes('<div id="root"></div>')) {
    defaultHtml = defaultHtml.replace('<div id="root"></div>', `<div id="root">${defaultBodyContent}</div>`);
    console.log('   Successfully injected fallback content for homepage');
  } else {
    console.log('   Could not find root div to inject fallback content for homepage');
    // Try to insert before the closing body tag as a last resort
    defaultHtml = defaultHtml.replace('</body>', `<div id="root">${defaultBodyContent}</div></body>`);
    console.log('   Inserted fallback content before closing body tag for homepage');
  }

  // Write the updated default HTML back to index.html
  fs.writeFileSync(indexPath, defaultHtml);
  console.log(`✅ Updated default meta tags and basic content in ${indexPath}`);
  console.log(`   Title: ${defaultMetaConfig.title}`);
  console.log(`   Description: ${defaultMetaConfig.description ? defaultMetaConfig.description.substring(0, 50) + '...' : 'N/A'}`);
  
  // Create route-specific HTML files for each route defined in metaConfig
  console.log('\nProcessing route-specific files...');
  console.log('Available routes in metaConfig:', Object.keys(metaConfig));
  
  for (const route of Object.keys(metaConfig)) {
    const meta = metaConfig[route];
    console.log(`\nProcessing route: ${route}`);
    console.log(`Route meta data: ${JSON.stringify(meta, null, 2)}`);
    if (!meta) {
      console.warn(`   No meta config found for route: ${route}. Skipping.`);
      continue;
    }
    if (route === '/') {
      console.log('   Skipping homepage as we\'ve already updated index.html');
      continue; // Skip the homepage as we've already updated index.html
    }
    
    // Don't skip any routes - we want to ensure all pages have correct meta tags
    // if (route.startsWith('/tools/task-smasher/') && route !== '/tools/task-smasher/') {
    //   console.log(`   Skipping ${route} as it's handled by the generate-static-pages.js script`);
    //   continue;
    // }
    
    // Create a copy of the HTML with route-specific meta tags
    let routeHtml = originalHtml;
    
    // Replace title - Ensure meta exists
    if (meta.title) {
      console.log(`   Setting title to: ${meta.title}`);
      routeHtml = routeHtml.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
      console.log('   Replaced title tag');
    } else {
      console.log('   Skipped title - no title provided');
    }
    
    // Replace or add meta description
    // Replace or add meta description - Ensure meta exists
    if (meta.description) {
      console.log(`   Setting meta description to: ${meta.description.substring(0, 50)}...`);
      if (routeHtml.includes('<meta name="description"')) {
        routeHtml = routeHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}">`);
        console.log('   Replaced existing meta description tag');
      } else {
        routeHtml = routeHtml.replace('</head>', `  <meta name="description" content="${meta.description}">\n  </head>`);
        console.log('   Added new meta description tag');
      }
    } else {
      console.log('   Skipped meta description - no description provided');
    }
    
    // Replace or add canonical link
    // Replace or add canonical link - Ensure meta exists
    if (meta.canonical) {
      console.log(`   Setting canonical URL to: ${meta.canonical}`);
      if (routeHtml.includes('<link rel="canonical"')) {
        routeHtml = routeHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}">`);
        console.log('   Replaced existing canonical link');
      } else {
        routeHtml = routeHtml.replace('</head>', `  <link rel="canonical" href="${meta.canonical}">\n  </head>`);
        console.log('   Added new canonical link');
      }
    } else {
      console.log('   Skipped canonical link - no canonical URL provided');
    }
    
    // Add robots meta tag
    // Add robots meta tag - Ensure meta exists
    if (meta.robots && !routeHtml.includes('<meta name="robots"')) {
      routeHtml = routeHtml.replace('</head>', `  <meta name="robots" content="${meta.robots}">\n  </head>`);
    }
    
    // Add Open Graph tags
    // Add Open Graph tags - Ensure meta exists and use the same description as meta tag
    // Always update OG and Twitter tags, replacing them if they exist
    const metaDescription = meta.description;
    console.log(`   Setting OG/Twitter description to: ${metaDescription.substring(0, 50)}...`);
    
    // First remove any existing OG and Twitter tags
    routeHtml = routeHtml.replace(/<meta property="og:[^>]*>/g, '');
    routeHtml = routeHtml.replace(/<meta name="twitter:[^>]*>/g, '');
    
    // Then add the new OG and Twitter tags
    const ogTags = `
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${meta.canonical || 'https://smashingapps.ai' + route}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${metaDescription}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:site_name" content="SmashingApps.ai" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${metaDescription}" />
  <meta name="twitter:image" content="${meta.image}" />
`;
    routeHtml = routeHtml.replace('</head>', `${ogTags}\n  </head>`);
    console.log('   Added OG and Twitter tags with matching description');
    
    // Add structured data if available
    if (meta.structuredData && !routeHtml.includes('application/ld+json')) {
      const structuredDataTag = `
  <!-- Structured Data -->
  <script type="application/ld+json">
    ${JSON.stringify(meta.structuredData, null, 2)}
  </script>
`;
      routeHtml = routeHtml.replace('</head>', `${structuredDataTag}\n  </head>`);
    }
    
    // Add Google Analytics and Hotjar tracking code to route-specific pages
    const routeTrackingCode = `
    <!-- Google tag (gtag.js) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=G-38TGWBFRMN"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());

      gtag('config', 'G-38TGWBFRMN');
    </script>
    <!-- Hotjar Tracking Code for smashingapps.ai -->
    <script>
      (function(h,o,t,j,a,r){
          h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
          h._hjSettings={hjid:5361995,hjsv:6};
          a=o.getElementsByTagName('head')[0];
          r=o.createElement('script');r.async=1;
          r.src=t+h._hjSettings.hjid+j+h._hjSettings.hjsv;
          a.appendChild(r);
      })(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
    </script>
    `;
    routeHtml = routeHtml.replace('</head>', `${routeTrackingCode}\n  </head>`);
    
    // Add CSS to hide the fallback content for users with JavaScript enabled
    routeHtml = routeHtml.replace('</head>', `${hideFallbackCSS}\n  </head>`);
    
    // Add script to immediately hide the fallback content
    routeHtml = routeHtml.replace('<head>', `<head>\n  ${hideScript}`);
    
    // Create the directory structure relative to the dist directory
    const routePath = route.startsWith('/') ? route.substring(1) : route; // Ensure no leading slash for path joining
    const outputDir = path.join(distDir, routePath);
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`   Ensured directory exists: ${outputDir}`);
    } catch (mkdirError) {
      console.error(`   Error creating directory ${outputDir}:`, mkdirError);
      continue; // Skip this route if directory creation fails
    }
    
    // Inject basic body content for the route (for SEO and JS-disabled browsers)
    console.log('   Injecting fallback content with route-specific H1 and description');
    const h1Content = meta.title || 'SmashingApps.ai';
    const pContent = meta.description || 'Loading...';
    console.log(`   H1 content: ${h1Content}`);
    console.log(`   P content: ${pContent.substring(0, 50)}...`);
    
    const routeBodyContent = `
      <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
      <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
        <h1>${h1Content}</h1>
        <p>${pContent}</p>
        <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
      </div>
    `;
    // Always replace the root div content, regardless of its current content
    const rootDivRegex = /<div id="root"[^>]*>[\s\S]*?<\/div>/;
    if (rootDivRegex.test(routeHtml)) {
      routeHtml = routeHtml.replace(rootDivRegex, `<div id="root">${routeBodyContent}</div>`);
      console.log('   Successfully injected fallback content');
    } else if (routeHtml.includes('<div id="root"></div>')) {
      routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${routeBodyContent}</div>`);
      console.log('   Successfully injected fallback content');
    } else {
      console.log('   Could not find root div to inject fallback content');
      // Try to insert before the closing body tag as a last resort
      routeHtml = routeHtml.replace('</body>', `<div id="root">${routeBodyContent}</div></body>`);
      console.log('   Inserted fallback content before closing body tag');
    }

    // Write the HTML file
    const outputPath = path.join(outputDir, 'index.html');
    try {
      fs.writeFileSync(outputPath, routeHtml);
      console.log(`✅ Created ${outputPath} with route-specific meta tags and basic content`);
      console.log(`   Title: ${meta.title}`);
      console.log(`   Description: ${meta.description ? meta.description.substring(0, 50) + '...' : 'N/A'}`);
      console.log(`   Canonical: ${meta.canonical}`);
    } catch (writeError) {
      console.error(`   Error writing file ${outputPath}:`, writeError);
    }
  }
  
  console.log('Meta tags injection complete!');
}

// Run the injection process (no longer needs async/await for require)
try {
  injectMetaTagsAndContent();
} catch (error) {
  console.error('Error during meta tags injection:', error);
  process.exit(1);
}