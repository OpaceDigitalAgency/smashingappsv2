/**
 * Netlify Build Plugin: SEO Enhancer
 * 
 * This plugin runs after the build and ensures that all routes have proper meta tags.
 * It's a fallback in case the prerendering process doesn't work as expected.
 */

const fs = require('fs');
const path = require('path');

// Import the meta config
const metaConfigPath = path.resolve(__dirname, '../../../src/utils/metaConfig.cjs');
let metaConfig, defaultMetaConfig;

try {
  const metaConfigModule = require(metaConfigPath);
  metaConfig = metaConfigModule.default;
  defaultMetaConfig = metaConfigModule.defaultMetaConfig;
} catch (error) {
  console.error('Error loading metaConfig:', error);
  // Fallback to empty objects
  metaConfig = {};
  defaultMetaConfig = {};
}

module.exports = {
  onPostBuild: async ({ constants, utils }) => {
    const { PUBLISH_DIR } = constants;
    
    console.log('Running SEO Enhancer plugin...');
    
    // Check if the index.html file exists
    const indexPath = path.join(PUBLISH_DIR, 'index.html');
    if (!fs.existsSync(indexPath)) {
      utils.build.failBuild('index.html not found in publish directory');
      return;
    }
    
    // Read the original index.html file
    const originalHtml = fs.readFileSync(indexPath, 'utf8');
    
    // Create a version with default meta tags
    let defaultHtml = originalHtml;
    
    // Replace title if defaultMetaConfig is available
    if (defaultMetaConfig.title) {
      defaultHtml = defaultHtml.replace(/<title>[^<]*<\/title>/, `<title>${defaultMetaConfig.title}</title>`);
    }
    
    // Replace or add meta description
    if (defaultMetaConfig.description) {
      if (defaultHtml.includes('<meta name="description"')) {
        defaultHtml = defaultHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${defaultMetaConfig.description}">`);
      } else {
        defaultHtml = defaultHtml.replace('</head>', `  <meta name="description" content="${defaultMetaConfig.description}">\n  </head>`);
      }
    }
    
    // Replace or add canonical link
    if (defaultMetaConfig.canonical) {
      if (defaultHtml.includes('<link rel="canonical"')) {
        defaultHtml = defaultHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${defaultMetaConfig.canonical}">`);
      } else {
        defaultHtml = defaultHtml.replace('</head>', `  <link rel="canonical" href="${defaultMetaConfig.canonical}">\n  </head>`);
      }
    }
    
    // Add robots meta tag
    if (defaultMetaConfig.robots && !defaultHtml.includes('<meta name="robots"')) {
      defaultHtml = defaultHtml.replace('</head>', `  <meta name="robots" content="${defaultMetaConfig.robots}">\n  </head>`);
    }
    
    // Always update Open Graph tags, replacing them if they exist
    if (defaultMetaConfig.title && defaultMetaConfig.description && defaultMetaConfig.image) {
      // First remove any existing OG and Twitter tags
      defaultHtml = defaultHtml.replace(/<meta property="og:[^>]*>/g, '');
      defaultHtml = defaultHtml.replace(/<meta name="twitter:[^>]*>/g, '');
      
      // Then add the new OG and Twitter tags
      const ogTags = `
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website" />
  <meta property="og:url" content="${defaultMetaConfig.canonical || 'https://smashingapps.ai'}" />
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
      console.log(`Added OG and Twitter tags for homepage with description: ${defaultMetaConfig.description.substring(0, 50)}...`);
    }
    
    // Add fallback content for SEO
    if (defaultMetaConfig.title && defaultMetaConfig.description) {
      const fallbackContent = `
      <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
      <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
        <h1>${defaultMetaConfig.title}</h1>
        <p>${defaultMetaConfig.description}</p>
        <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
      </div>
    `;
      
      // Replace the empty root div with our content
      if (defaultHtml.includes('<div id="root"></div>')) {
        defaultHtml = defaultHtml.replace('<div id="root"></div>', `<div id="root">${fallbackContent}</div>`);
        console.log(`Added fallback content for homepage`);
      } else if (defaultHtml.includes('<div id="root">')) {
        // If the root div already has content, try to replace it
        const rootRegex = /<div id="root">[\s\S]*?<\/div>/;
        defaultHtml = defaultHtml.replace(rootRegex, `<div id="root">${fallbackContent}</div>`);
        console.log(`Replaced existing fallback content for homepage`);
      }
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
      if (meta.title) {
        routeHtml = routeHtml.replace(/<title>[^<]*<\/title>/, `<title>${meta.title}</title>`);
      }
      
      // Replace or add meta description
      if (meta.description) {
        if (routeHtml.includes('<meta name="description"')) {
          routeHtml = routeHtml.replace(/<meta name="description"[^>]*>/, `<meta name="description" content="${meta.description}">`);
        } else {
          routeHtml = routeHtml.replace('</head>', `  <meta name="description" content="${meta.description}">\n  </head>`);
        }
      }
      
      // Replace or add canonical link
      if (meta.canonical) {
        if (routeHtml.includes('<link rel="canonical"')) {
          routeHtml = routeHtml.replace(/<link rel="canonical"[^>]*>/, `<link rel="canonical" href="${meta.canonical}">`);
        } else {
          routeHtml = routeHtml.replace('</head>', `  <link rel="canonical" href="${meta.canonical}">\n  </head>`);
        }
      }
      
      // Add robots meta tag
      if (meta.robots && !routeHtml.includes('<meta name="robots"')) {
        routeHtml = routeHtml.replace('</head>', `  <meta name="robots" content="${meta.robots}">\n  </head>`);
      }
      
      // Always update Open Graph tags, replacing them if they exist
      if (meta.title && meta.description && meta.image) {
        // First remove any existing OG and Twitter tags
        routeHtml = routeHtml.replace(/<meta property="og:[^>]*>/g, '');
        routeHtml = routeHtml.replace(/<meta name="twitter:[^>]*>/g, '');
        
        // Then add the new OG and Twitter tags
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
        console.log(`Added OG and Twitter tags for ${route} with description: ${meta.description.substring(0, 50)}...`);
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
      
      // Add fallback content for SEO
      if (meta.title && meta.description) {
        const fallbackContent = `
      <!-- SEO Fallback Content - Only visible to search engines and users with JavaScript disabled -->
      <div id="root-fallback" style="display: none !important; visibility: hidden !important; opacity: 0 !important; position: absolute !important; width: 1px !important; height: 1px !important; overflow: hidden !important; clip: rect(0, 0, 0, 0) !important;">
        <h1>${meta.title}</h1>
        <p>${meta.description}</p>
        <p><em>Content is loading... If it doesn't load, please ensure JavaScript is enabled.</em></p>
      </div>
    `;
        
        // Replace the empty root div with our content
        if (routeHtml.includes('<div id="root"></div>')) {
          routeHtml = routeHtml.replace('<div id="root"></div>', `<div id="root">${fallbackContent}</div>`);
          console.log(`Added fallback content for ${route}`);
        } else {
          // If the root div already has content, try to replace it
          const rootRegex = /<div id="root">[\s\S]*?<\/div>/;
          routeHtml = routeHtml.replace(rootRegex, `<div id="root">${fallbackContent}</div>`);
          console.log(`Replaced existing fallback content for ${route}`);
        }
      }
      
      // Create the directory structure for the route
      const routePath = route.substring(1); // Remove leading slash
      const outputDir = path.join(PUBLISH_DIR, routePath);
      
      try {
        fs.mkdirSync(outputDir, { recursive: true });
        
        // Write the HTML file
        const outputPath = path.join(outputDir, 'index.html');
        fs.writeFileSync(outputPath, routeHtml);
        console.log(`✅ Created ${outputPath} with route-specific meta tags and fallback content`);
      } catch (error) {
        console.error(`Error creating file for route ${route}:`, error);
      }
    }
    
    console.log('SEO Enhancer plugin complete!');
  }
};