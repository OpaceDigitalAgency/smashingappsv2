# SmashingApps.ai - Quick Editing Guide for Non-Coders

This guide provides simple instructions for making common edits to the SmashingApps.ai website without coding knowledge.

## SEO Architecture Overview

The SEO system for SmashingApps.ai is distributed across several files that work together to ensure consistent metadata across the site. It's critical that these files stay in sync to maintain proper SEO.

### Key SEO Files and Their Roles

1. **`src/utils/metaConfig.ts`** - TypeScript version used by the React components during runtime
   - Used by the SEO component to generate meta tags, OG tags, and Twitter tags
   - Must match content in metaConfig.cjs for consistency

2. **`src/utils/metaConfig.cjs`** - CommonJS version used during the build process
   - Used by the inject-meta-tags.cjs script to inject meta tags into the HTML files
   - Contains all page titles, descriptions, and other metadata
   - **This is the primary file to edit when changing SEO settings**

3. **`src/tools/task-smasher/utils/useCaseDefinitions.ts`** - Contains descriptions for TaskSmasher use cases
   - Used by TaskSmasherApp.tsx to generate structured data and SEO overrides
   - Descriptions must match those in metaConfig.ts/cjs for consistency

4. **`src/components/SEO.tsx`** - React component that renders meta tags during runtime
   - Adds meta tags, OG tags, and Twitter tags to the page
   - Gets data from metaConfig.ts

5. **`scripts/inject-meta-tags.cjs`** - Script that injects meta tags during build
   - Runs during the Netlify build process
   - Adds meta tags, OG tags, and Twitter tags to the static HTML files
   - Gets data from metaConfig.cjs

6. **`src/components/StructuredData.tsx`** - React component for structured data
   - Adds JSON-LD structured data to the page
   - Used by TaskSmasherApp.tsx for each use case

### Critical SEO Rule

**IMPORTANT:** For proper SEO, the descriptions in all three files must match exactly:
- The meta description
- The OG description
- The Twitter description
- The structured data description

When updating descriptions, you must update them in all relevant files to maintain consistency.

## SEO Settings

### Main Website SEO (Homepage)

**File:** `src/utils/metaConfig.cjs` (Lines 12-19)

```javascript
const defaultMetaConfig = {
  title: 'SmashingApps.ai | AI-Powered Productivity Tools',
  description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'AI tools, productivity, task management, AI apps, SmashingApps, AI assistants'
};
```

Simply edit the text between the quotes to change:
- `title`: The page title shown in search results and browser tabs
- `description`: The description shown in search results
- `keywords`: Keywords for search engines (not visible to users)

### TaskSmasher Tool SEO

**File:** `src/utils/metaConfig.cjs` (Lines 41-59)

```javascript
'/tools/task-smasher/': {
  title: 'TaskSmasher – AI Task Planner | Break Down Complex Tasks Easily',
  description: 'Use AI to break down overwhelming tasks into manageable subtasks.',
  image: `${BASE_URL}/og/task-smasher.png`,
  canonical: `${BASE_URL}/tools/task-smasher/`,
  keywords: 'task management, AI task breakdown, AI TO-DO planner, AI Task planner'
}
```

Edit the text between quotes to change the SEO for the TaskSmasher tool page.

### Contact Page SEO

**File:** `src/utils/metaConfig.cjs` (Lines 61-73)

```javascript
'/contact': {
  title: 'Contact Us | SmashingApps.ai Support & Inquiries',
  description: 'Get in touch with the SmashingApps.ai team for support, feature requests, or partnership inquiries.',
  image: `${BASE_URL}/og/contact.png`,
  canonical: `${BASE_URL}/contact`,
  // ...
}
```

Edit the text between quotes to change the SEO for the Contact page.

### Use Case SEO (Goal Planner, Daily Organizer, etc.)

**File:** `src/utils/metaConfig.cjs` (Lines 77-126)

```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps with our AI Goal Planner."
}
```

Edit the text between quotes to change:
- `label`: The name of the use case shown to users
- `description`: The description shown to users and in search results

### Complete List of All Pages/URLs

The following pages are automatically generated based on the use case definitions. Each page has its own SEO settings that can be edited in `src/utils/metaConfig.cjs`:

1. **Homepage**: `/` - Edit in the main section (Lines 23-40)
2. **TaskSmasher Main Page**: `/tools/task-smasher/` - Edit in the TaskSmasher section (Lines 41-59)
3. **Contact Page**: `/contact` - Edit in the Contact section (Lines 61-73)
4. **Daily Organizer**: `/tools/task-smasher/daily-organizer/` - Edit in the useCaseDefinitions section (Line 79-81)
5. **Goal Planner**: `/tools/task-smasher/goal-planner/` - Edit in the useCaseDefinitions section (Line 82-85)
6. **Marketing Tasks**: `/tools/task-smasher/marketing-tasks/` - Edit in the useCaseDefinitions section (Line 86-89)
7. **Recipe Steps**: `/tools/task-smasher/recipe-steps/` - Edit in the useCaseDefinitions section (Line 90-93)
8. **Home Chores**: `/tools/task-smasher/home-chores/` - Edit in the useCaseDefinitions section (Line 94-97)
9. **Trip Planner**: `/tools/task-smasher/trip-planner/` - Edit in the useCaseDefinitions section (Line 98-101)
10. **Study Plan**: `/tools/task-smasher/study-plan/` - Edit in the useCaseDefinitions section (Line 102-105)
11. **Event Planning**: `/tools/task-smasher/event-planning/` - Edit in the useCaseDefinitions section (Line 106-109)
12. **Freelancer Projects**: `/tools/task-smasher/freelancer-projects/` - Edit in the useCaseDefinitions section (Line 110-113)
13. **Shopping Tasks**: `/tools/task-smasher/shopping-tasks/` - Edit in the useCaseDefinitions section (Line 114-117)
14. **DIY Projects**: `/tools/task-smasher/diy-projects/` - Edit in the useCaseDefinitions section (Line 118-121)
15. **Creative Projects**: `/tools/task-smasher/creative-projects/` - Edit in the useCaseDefinitions section (Line 122-125)

When you edit the `label` or `description` in the useCaseDefinitions section, the changes will automatically be applied to the corresponding page's SEO settings.

**IMPORTANT:** When updating descriptions, you must ensure they match in all three files:
1. `src/utils/metaConfig.cjs` - For build-time meta tags
2. `src/utils/metaConfig.ts` - For runtime meta tags
3. `src/tools/task-smasher/utils/useCaseDefinitions.ts` - For structured data and SEO overrides

## OpenAI API Settings

### API Limits

**File:** `src/tools/task-smasher/utils/openaiService.ts` (Lines 10-20)

Look for lines like:
```javascript
const MAX_API_CALLS = 20;
const MAX_TOKENS = 1000;
```

Change the numbers to adjust:
- `MAX_API_CALLS`: Maximum number of API calls allowed per user
- `MAX_TOKENS`: Maximum tokens (words) allowed per API call

### AI Behavior Settings

**File:** `netlify/functions/openai-proxy.ts` (Around line 50)

Look for lines like:
```javascript
temperature: 0.7,
max_tokens: 1000,
```

Change the numbers to adjust:
- `temperature`: Higher values (0.7-1.0) make responses more creative/random, lower values (0.2-0.5) make them more focused/deterministic
- `max_tokens`: Maximum length of AI responses

## Use Case Prompts

**File:** `src/tools/task-smasher/utils/useCaseDefinitions.ts`

```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps",
  prompt: "Break down this goal into achievable subtasks with clear milestones...",
}
```

Edit the text between quotes to change:
- `prompt`: The instructions sent to the AI when generating tasks for this use case
- `description`: The description shown to users
- `label`: The name of the use case shown to users

## SEO Build Process

### Meta Tag Injection

**File:** `scripts/inject-meta-tags.cjs`

This script runs during the build process and injects meta tags into the HTML files. It:
1. Reads metadata from `src/utils/metaConfig.cjs`
2. Injects meta tags, OG tags, and Twitter tags into each HTML file
3. Ensures that search engines see the correct metadata even before JavaScript loads

### Static HTML Generation

**File:** `tools/task-smasher/scripts/generate-static-pages.js` (Lines 100-143)

This script generates static HTML files for each TaskSmasher use case. It:
1. Creates an HTML file for each use case
2. Injects the appropriate metadata
3. Ensures that search engines can index all pages

Look for lines like:
```javascript
.replace(
  /<title>.*?<\/title>/,
  `<title>${definition.label} | AI To-Do Lists & Project Planning | TaskSmasher</title>`
)
```

Edit the text between backticks (`) to change the title, description, and other SEO elements.

### SEO Component

**File:** `src/components/SEO.tsx`

This React component adds meta tags to the page during runtime. It:
1. Reads metadata from `src/utils/metaConfig.ts`
2. Adds meta tags, OG tags, and Twitter tags to the page
3. Updates metadata when the route changes

### Structured Data Component

**File:** `src/components/StructuredData.tsx`

This React component adds structured data (JSON-LD) to the page. It:
1. Takes a data object as a prop
2. Serializes it as JSON-LD
3. Adds it to the page head

## How URLs and Pages Are Generated

### URL Structure

The website follows this URL structure:

1. **Main Homepage**: `/`
2. **TaskSmasher Tool**: `/tools/task-smasher/`
3. **Use Case Pages**: `/tools/task-smasher/[use-case-name]/`
   - Example: `/tools/task-smasher/goal-planner/`

### How New Pages Are Created

When you add a new use case to the `useCaseDefinitions` object in `src/utils/metaConfig.cjs`, a new page is automatically generated with the following URL pattern:

```
/tools/task-smasher/[lowercase-label-with-hyphens]/
```

For example, if you add:

```javascript
new_case: {
  label: "Project Timeline",
  description: "Create detailed project timelines with milestones and deadlines."
}
```

A new page will be created at `/tools/task-smasher/project-timeline/` with all the SEO settings automatically generated.

### Adding a Completely New Tool

If you want to add a completely new tool (not just a use case for TaskSmasher):

1. Add a new entry to the `metaConfig` object in `src/utils/metaConfig.cjs`:

```javascript
'/tools/new-tool/': {
  title: 'New Tool Name | SmashingApps.ai',
  description: 'Description of your new tool',
  image: `${BASE_URL}/og/new-tool.png`,
  canonical: `${BASE_URL}/tools/new-tool/`,
  keywords: 'relevant, keywords, here',
  // Add structured data if needed
}
```
2. Create the necessary React components for the new tool
3. Update the routing in the main application to include the new tool

## Adding a New Use Case to TaskSmasher

If you want to add a new use case to TaskSmasher (like "Wedding Planning" or "Fitness Goals"), follow these steps:

### Step 1: Edit the metaConfig.cjs File

Open `src/utils/metaConfig.cjs` and add a new entry to the `useCaseDefinitions` object:

```javascript
useCaseDefinitions = {
  // Existing use cases...
  
  // Add your new use case here
  wedding: {  // Use a short, unique ID (no spaces)
    label: "Wedding Planning",  // User-friendly name (shown to users)
    description: "Plan your perfect wedding day with AI assistance. Our Wedding Planning tool helps you organize venues, guest lists, vendors, and timelines for a stress-free celebration."
  }
};
```

### Step 2: Edit the metaConfig.ts File

Open `src/utils/metaConfig.ts` and add a matching entry to the `useCaseDefinitions` object:

```typescript
const useCaseDefinitions = {
  // Existing use cases...
  
  // Add your new use case here
  wedding: {
    label: "Wedding Planning",
    description: "Plan your perfect wedding day with AI assistance. Our Wedding Planning tool helps you organize venues, guest lists, vendors, and timelines for a stress-free celebration."
  }
};
```

Make sure the description matches exactly what you added to metaConfig.cjs.

### Step 3: Add the Prompt in useCaseDefinitions.ts

Open `src/tools/task-smasher/utils/useCaseDefinitions.ts` and add a matching entry:

```javascript
export const useCaseDefinitions = {
  // Existing use cases...
  
  // Add your new use case here
  wedding: {
    label: "Wedding Planning",
    description: "Plan your perfect wedding day with AI assistance",
    prompt: "Break down this wedding planning task into clear, actionable subtasks. Include considerations for venue, catering, guest list, attire, decorations, and timeline. Provide specific, practical steps that will help the user organize their wedding effectively.",
    keywords: ["wedding", "bride", "groom", "venue", "ceremony", "reception", "guests"]
  }
};
```

The `prompt` is what gets sent to the AI when generating tasks, so make it detailed and specific to get the best results.

### Step 4: Add an Icon (Optional)

If you want to add a custom icon for your new use case, you'll need to edit the `Sidebar.tsx` component.

That's it! The new use case will automatically appear in the sidebar menu, and a new page will be created at `/tools/task-smasher/wedding-planning/` with all the SEO settings automatically generated.

**IMPORTANT:** Make sure the descriptions match exactly in all three files to maintain SEO consistency.