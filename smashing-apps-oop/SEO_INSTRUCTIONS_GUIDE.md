# SEO Instructions Guide - SmashingApps OOP Version

## 📋 **Overview**

This is the **COMPLETE REFERENCE** for the SEO system in the SmashingApps OOP version. The system uses a **single source of truth** approach for all SEO-related content, ensuring consistency across static HTML generation and React app SEO.

## 🎯 **Single Source of Truth**

**File**: `src/utils/seoMaster.ts`

This file controls **EVERYTHING** related to SEO:
- Meta tags (title, description, keywords)
- Open Graph tags (Facebook/LinkedIn sharing)
- Twitter Card tags
- Structured data (JSON-LD schemas)
- Canonical URLs
- H1 tags (in fallback content)
- Use case definitions

## 🔧 **How to Customize SEO**

### **Option 1: Edit Central Configuration (Recommended)**

Open `src/utils/seoMaster.ts` and modify the `routeMeta` object:

```typescript
export const routeMeta: MetaConfigMap = {
  '/your-custom-page/': {
    title: 'Your Custom Title | SmashingApps.ai',
    description: 'Your custom description here.',
    image: `${BASE_URL}/og/your-custom-image.png`,
    canonical: `${BASE_URL}/your-custom-page/`,
    urlPath: '/your-custom-page/',
    keywords: 'your, custom, keywords',
    robots: 'index, follow',
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'WebPage', // Or any other schema type
      name: 'Your Custom Page',
      description: 'Your custom description',
      // Add any custom schema properties
    }
  }
}
```

### **Option 2: Override in React Components**

```tsx
// In any React component
<SEO overrides={{
  title: 'Completely Custom Title',
  description: 'Custom description',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'Product', // Custom schema
    name: 'Custom Product'
  }
}} />
```

### **Option 3: Custom Fallback Content (H1s and Body)**

Modify the `generateFallbackContent` function in `seoMaster.ts`:

```typescript
export function generateFallbackContent(route: string): string {
  const meta = getMetaForRoute(route);
  
  // Custom logic for specific routes
  if (route === '/your-special-page/') {
    return `
      <div id="root-fallback" style="display: none !important;">
        <h1>Your Custom H1</h1>
        <h2>Custom Subheading</h2>
        <p>Custom paragraph content</p>
        <ul>
          <li>Custom list item 1</li>
          <li>Custom list item 2</li>
        </ul>
      </div>
    `;
  }
  
  // Default fallback for other routes
  return `
    <div id="root-fallback" style="display: none !important;">
      <h1>${meta.title}</h1>
      <p>${meta.description}</p>
    </div>
  `;
}
```

## 🏗️ **Build Process**

### **Development vs Production**

- **Development** (`npm run dev`): Uses React Helmet for client-side SEO
- **Production** (`npm run build`): Generates static HTML files with SEO meta tags

### **Build Commands**

```bash
# Full build with SEO injection
npm run build

# Build just the SEO module
npm run build:seo-module

# Generate SEO files only
npm run generate-seo

# Inject meta tags into existing HTML
npm run inject-meta

# Preview with proper SEO (use this for testing)
npm run preview-seo
```

## 🧪 **Testing SEO**

### **Local Testing**

1. **Build the project**: `npm run build`
2. **Start SEO preview server**: `npm run preview-seo`
3. **Test view-source**: `view-source:http://localhost:[PORT]/your-route/`

### **What to Check**

- ✅ Page-specific title tags
- ✅ Meta descriptions
- ✅ Canonical URLs
- ✅ Open Graph tags
- ✅ Twitter Card tags
- ✅ Structured data (JSON-LD)
- ✅ H1 tags in fallback content

## 🚀 **Netlify Deployment**

The SEO system is **fully compatible** with Netlify:

1. **Build Process**: `npm run build` generates static HTML files with SEO
2. **Static Files**: Each route gets its own `index.html` with proper SEO
3. **Search Engines**: See the raw HTML with all meta tags and structured data

## 📁 **File Structure**

```
src/utils/
├── seoMaster.ts          # MAIN FILE - Edit this for all SEO changes
├── seoMaster.pure.cjs    # Auto-generated CommonJS version
├── seoMaster.cjs.ts      # CommonJS wrapper (don't edit)
└── SEO_README.md         # Technical documentation

src/components/
└── SEO.tsx               # React component for dynamic SEO

scripts/
└── inject-meta-tags.cjs  # Build script for static HTML generation
```

## 🎨 **Current SEO Patterns**

### **TaskSmasher Use Cases**
- **Title Pattern**: `${definition.label} | Free AI Planner & Magic To-Do Lists - TaskSmasher`
- **H1 Pattern**: Uses the full title as H1
- **Schema Type**: `SoftwareApplication`

### **ArticleSmasher Use Cases**
- **Title Pattern**: `${definition.label} | AI Content Creator - ArticleSmasher`
- **H1 Pattern**: Uses the full title as H1
- **Schema Type**: `SoftwareApplication`

### **Main Pages**
- **Homepage**: `SmashingApps.ai | Free AI Productivity Apps & Tools`
- **Tool Pages**: `ToolName - Description | SmashingApps.ai`

## 🔄 **Comparison with Original Version**

The OOP version uses **IDENTICAL SEO rules** as the original/parent version:
- ✅ Same title patterns
- ✅ Same H1 generation
- ✅ Same meta descriptions
- ✅ Same structured data schemas
- ✅ Same canonical URL patterns
- ✅ Same Open Graph and Twitter Card configurations

## 🛠️ **Maintenance**

### **Making Changes**

1. **Edit**: `src/utils/seoMaster.ts`
2. **Build**: `npm run build:seo-module` (if needed)
3. **Test**: `npm run dev` or `npm run preview-seo`
4. **Deploy**: `npm run build` and deploy to Netlify

### **Don't Edit These Files**
- `seoMaster.cjs.ts` (auto-generated wrapper)
- `seoMaster.pure.cjs` (auto-generated CommonJS version)

## 🚨 **Troubleshooting**

### **Common Issues**

1. **Wrong meta tags showing**: Check if you're using the correct preview server (`npm run preview-seo`)
2. **Changes not appearing**: Run `npm run build` to regenerate static files
3. **View-source hanging**: Use the SEO preview server, not the dev server

### **Debug Commands**

```bash
# Check what routes are being processed
node scripts/inject-meta-tags.cjs

# Verify SEO data for a specific route
node -e "const seo = require('./dist/utils/seoMaster.cjs.js'); console.log(seo.getMetaForRoute('/your-route/'));"
```

## 📚 **Additional Resources**

- **Technical Documentation**: `src/utils/SEO_README.md`
- **Editing Guide**: `EDITING_GUIDE.md` (in parent folder)
- **Schema.org Documentation**: https://schema.org/
- **Open Graph Documentation**: https://ogp.me/
- **Twitter Cards Documentation**: https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards

---

**Remember**: The `seoMaster.ts` file is your **single source of truth**. All SEO changes should be made there for consistency across the entire application.
