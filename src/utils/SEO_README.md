# Unified SEO System Documentation

## Overview

This document explains the unified SEO system for the SmashingApps project. The system is designed to be a single source of truth for all SEO-related content across the entire application.

## Key Files

- `src/utils/seoMaster.ts` - The main TypeScript file containing all SEO functionality
- `src/utils/seoMaster.cjs.ts` - CommonJS wrapper for compatibility with build scripts
- `src/components/SEO.tsx` - React component that uses the seoMaster for dynamic SEO

## Features

1. **Single Source of Truth**: All SEO-related content is defined in one place
2. **TypeScript Support**: Full type safety for all SEO-related code
3. **Dual Format Support**: Automatically exports both ESM and CommonJS versions
4. **Static & Dynamic SEO**: Handles both static HTML generation and React app SEO
5. **Build Integration**: Seamlessly integrates with build scripts

## How It Works

The system uses a TypeScript file (`seoMaster.ts`) as the primary source of truth. This file exports:

- Type definitions for SEO metadata
- Default meta configuration
- Route-specific meta configurations
- Use case definitions for TaskSmasher
- Helper functions for generating meta tags and fallback content

During the build process, the system automatically generates a CommonJS version of the file for use in build scripts.

## How to Use

### Adding a New Page

To add SEO for a new page:

1. Open `src/utils/seoMaster.ts`
2. Add a new entry to the `routeMeta` object:

```typescript
'/your-new-page': {
  title: 'Your Page Title | SmashingApps.ai',
  description: 'Your page description here.',
  image: `${BASE_URL}/og/your-page.png`,
  canonical: `${BASE_URL}/your-new-page`,
  urlPath: '/your-new-page',
  keywords: 'your, keywords, here',
  structuredData: {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Your Page Title',
    description: 'Your page description here.'
  }
}
```

### Updating Existing SEO

To update SEO for an existing page:

1. Open `src/utils/seoMaster.ts`
2. Find the relevant entry in the `routeMeta` object
3. Update the values as needed

### Using in React Components

The SEO component automatically uses the seoMaster to generate meta tags based on the current route:

```tsx
import SEO from '../components/SEO';

function YourPage() {
  return (
    <>
      <SEO />
      {/* Your page content */}
    </>
  );
}
```

You can also override specific meta values for a page:

```tsx
<SEO overrides={{ title: 'Custom Title' }} />
```

## Build Scripts

The following npm scripts are available for working with the SEO system:

- `npm run build:seo-module` - Builds just the SEO module
- `npm run generate-seo` - Generates SEO files
- `npm run inject-meta` - Injects meta tags into HTML files
- `npm run cleanup-seo` - Removes old SEO files (use only after confirming everything works)

## Maintenance

When making changes to the SEO system:

1. Always edit `seoMaster.ts` directly
2. Never edit `seoMaster.cjs.ts` (it's a wrapper for the main file)
3. Run `npm run build:seo-module` to rebuild the CommonJS version
4. Test changes with `npm run dev` before deploying

## Troubleshooting

If you encounter issues with the SEO system:

1. Check the browser console for errors
2. Verify that the meta tags are being generated correctly
3. Check that the build scripts are using the correct version of the seoMaster
4. If necessary, restore the old files from version control and try again

## Migration Notes

This unified SEO system replaces the following files:

- `src/utils/seoMaster.js`
- `src/utils/seoMaster.cjs`
- `src/utils/metaConfig.ts`
- `src/utils/metaConfig.cjs`

After confirming that the new system works correctly, these files can be removed using the cleanup script:

```
npm run cleanup-seo