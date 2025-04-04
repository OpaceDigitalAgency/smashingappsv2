/**
 * Meta Tags Injector
 * 
 * This script directly injects meta tags into the index.html file
 * based on the metaConfig. This serves as a fallback in case the
 * prerendering process doesn't work as expected.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the meta config
import { default as metaConfig, defaultMetaConfig } from '../src/utils/metaConfig.js';

/**
 * Create route-specific HTML files with proper meta tags
 */
async function injectMetaTags() {
  console.log('Starting meta tags injection...');
  
  // Read the original index.html file
  const indexPath = path.resolve(__dirname, '../dist/index.html');
  const originalHtml = fs.readFileSync(indexPath, 'utf8');
  
  // Create a version with default meta tags
  let defaultHtml = originalHtml;
  
  // Replace title
  defaultHtml = defaultHtml.replace(/<title>[^<]*<\/title>/, `<title>${defaultMetaConfig.title}</title>`);
  
  // Replace or add meta description
  if (defaultHtml.includes('<meta name="description"')) {
    defaultHtml = defaultHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${defaultMetaConfig.description}">`);
  } else {
    defaultHtml = defaultHtml.replace('</head>', `  <meta name="description" content="${defaultMetaConfig.description}">\n  </head>`);
  }
  
  // Replace or add canonical link
  if (defaultHtml.includes('<link rel="canonical"')) {
    defaultHtml = defaultHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${defaultMetaConfig.canonical}">`);
  } else {
    defaultHtml = defaultHtml.replace('</head>', `  <link rel="canonical" href="${defaultMetaConfig.canonical}">\n  </head>`);
  }
  
  // Add robots meta tag
  if (!defaultHtml.includes('<meta name="robots"')) {
    defaultHtml = defaultHtml.replace('</head>', `  <meta name="robots" content="${defaultMetaConfig.robots || 'index, follow'}">\n  </head>`);
  }
  
  // Add Open Graph tags
  if (!defaultHtml.includes('<meta property="og:title"')) {
    const ogTags = `
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${defaultMetaConfig.canonical}" />
  <meta property="og:title" content="${defaultMetaConfig.title}" />
  <meta property="og:description" content="${defaultMetaConfig.description}" />
  <meta property="og:image" content="${defaultMetaConfig.image}" />
  <meta property="og:site_name" content="SmashingApps.ai" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${defaultMetaConfig.title}" />
  <meta name="twitter:description" content="${defaultMetaConfig.description}" />
  <meta name="twitter:image" content="${defaultMetaConfig.image}" />
`;
    defaultHtml = defaultHtml.replace('</head>', `${ogTags}\n  </head>`);
  }
  
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
  
  // Write the updated default HTML back to index.html
  fs.writeFileSync(indexPath, defaultHtml);
  console.log(`✅ Updated default meta tags in ${indexPath}`);
  
  // Create route-specific HTML files for each route in metaConfig
  for (const [route, meta] of Object.entries(metaConfig)) {
    if (route === '/') continue; // Skip the homepage as we've already updated index.html
    
    // Create a copy of the HTML with route-specific meta tags
    let routeHtml = originalHtml;
    
    // Replace title
    routeHtml = routeHtml.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
    
    // Replace or add meta description
    if (routeHtml.includes('<meta name="description"')) {
      routeHtml = routeHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}">`);
    } else {
      routeHtml = routeHtml.replace('</head>', `  <meta name="description" content="${meta.description}">\n  </head>`);
    }
    
    // Replace or add canonical link
    if (routeHtml.includes('<link rel="canonical"')) {
      routeHtml = routeHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}">`);
    } else {
      routeHtml = routeHtml.replace('</head>', `  <link rel="canonical" href="${meta.canonical}">\n  </head>`);
    }
    
    // Add robots meta tag
    if (!routeHtml.includes('<meta name="robots"')) {
      routeHtml = routeHtml.replace('</head>', `  <meta name="robots" content="${meta.robots || 'index, follow'}">\n  </head>`);
    }
    
    // Add Open Graph tags
    if (!routeHtml.includes('<meta property="og:title"')) {
      const ogTags = `
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${meta.canonical}" />
  <meta property="og:title" content="${meta.title}" />
  <meta property="og:description" content="${meta.description}" />
  <meta property="og:image" content="${meta.image}" />
  <meta property="og:site_name" content="SmashingApps.ai" />
  
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${meta.title}" />
  <meta name="twitter:description" content="${meta.description}" />
  <meta name="twitter:image" content="${meta.image}" />
`;
      routeHtml = routeHtml.replace('</head>', `${ogTags}\n  </head>`);
    }
    
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
    
    // Create the directory structure for the route
    const routePath = route.substring(1); // Remove leading slash
    const outputDir = path.resolve(__dirname, '../dist', routePath);
    fs.mkdirSync(outputDir, { recursive: true });
    
    // Write the HTML file
    const outputPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(outputPath, routeHtml);
    console.log(`✅ Created ${outputPath} with route-specific meta tags`);
  }
  
  console.log('Meta tags injection complete!');
}

// Run the injection process
injectMetaTags().catch(error => {
  console.error('Error during meta tags injection:', error);
  process.exit(1);
});