# SmashingApps.ai

A modern suite of AI-powered productivity tools, hosted at [smashingapps.ai](https://smashingapps.ai).

## Overview

SmashingApps.ai provides intuitive, AI-powered tools to help users "smash" through specific tasks. The application consists of a main landing page and various specialized tools, with the primary tool being TaskSmasher.

## Application Structure

This is a unified React application that combines:

1. **Main Homepage** (`/`) - Introduces the brand and links to various tools
2. **TaskSmasher** (`/tools/task-smasher/`) - AI-powered task management application with various use cases

### Unified Architecture

- The application uses React Router for client-side routing
- Both the homepage and TaskSmasher are part of the same React application
- All routes are handled through React Router
- The app is built as a single SPA (Single Page Application)

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository
   ```
   git clone https://github.com/OpaceDigitalAgency/smashingapps.git
   cd smashingapps
   ```

2. Install dependencies
   ```
   npm install
   ```

3. Run the development server
   ```
   npm run dev
   ```

The app will be available at http://localhost:5173/

## Deployment

The application is configured for deployment on Netlify:

1. Push changes to the repository
2. Netlify automatically builds and deploys the application
3. The build process creates a single unified application

### Build Configuration

- The build process is defined in `netlify.toml`
- The app is built with `npm run build`
- All redirects are configured to support SPA routing

## Routing

The application handles both URLs with and without trailing slashes:

- `/tools/task-smasher` and `/tools/task-smasher/` both work
- All use case paths like `/tools/task-smasher/daily-organizer` and `/tools/task-smasher/daily-organizer/` work correctly

## Available Tools

Currently available tools:

- **TaskSmasher** - AI-powered task management with specialized use cases:
  - Daily Organizer
  - Goal Planner
  - Marketing Tasks
  - And more...

## Common Settings for Non-Technical Users

This section provides easy-to-follow instructions for making common changes to the website without coding knowledge.

### SEO Settings

#### Main Website SEO (Homepage and General Settings)

**File Location:** `src/utils/metaConfig.cjs` (Lines 12-19)

This file contains SEO settings for the main website. To edit:

1. Open the file in any text editor
2. Find the `defaultMetaConfig` section (around line 12)
3. Edit the following fields:
   - `title`: The main website title
   - `description`: The main website description
   - `image`: The social sharing image URL
   - `keywords`: Keywords for search engines

Example:
```javascript
const defaultMetaConfig = {
  title: 'SmashingApps.ai | AI-Powered Productivity Tools',
  description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools. Boost your productivity with our suite of specialized AI assistants.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'AI tools, productivity, task management, AI apps, SmashingApps, AI assistants'
};
```

#### Tool-Specific SEO (TaskSmasher and Other Tools)

**File Location:** `src/utils/metaConfig.cjs` (Lines 22-73)

To edit SEO for specific tools:

1. Find the `metaConfig` section (around line 22)
2. Locate the specific tool path (e.g., `/tools/task-smasher/`)
3. Edit the title, description, and other fields

Example for TaskSmasher:
```javascript
'/tools/task-smasher/': {
  title: 'TaskSmasher – AI Task Planner | Break Down Complex Tasks Easily',
  description: 'Use AI to break down overwhelming tasks into manageable subtasks. TaskSmasher helps you organize, prioritize, and complete tasks efficiently with AI assistance.',
  image: `${BASE_URL}/og/task-smasher.png`,
  canonical: `${BASE_URL}/tools/task-smasher/`,
  keywords: 'task management, AI task breakdown, AI TO-DO planner, AI Task planner, productivity tool, task organizer',
  // ...
}
```

#### Use Case SEO (Goal Planner, Daily Organizer, etc.)

**File Location:** `src/utils/metaConfig.cjs` (Lines 77-126)

To edit SEO for specific use cases:

1. Find the `useCaseDefinitions` section (around line 77)
2. Locate the specific use case (e.g., `goals` for Goal Planner)
3. Edit the label and description

Example:
```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps with our AI Goal Planner. Set SMART goals, track progress, and achieve your ambitions with structured planning."
}
```

### OpenAI API Settings

#### API Limits and Usage

**File Location:** `src/tools/task-smasher/utils/openaiService.ts` (Around lines 10-20)

To adjust OpenAI API limits:

1. Open the file in any text editor
2. Look for constants like `MAX_API_CALLS` or similar variables
3. Change the values to adjust limits

#### API Proxy Configuration

**File Location:** `netlify/functions/openai-proxy.ts`

This file handles the OpenAI API proxy. To change API settings:

1. Look for the `handler` function
2. Find settings like `temperature`, `max_tokens`, etc.
3. Adjust these values to change AI behavior

### Use Case Prompts and Definitions

**File Location:** `src/tools/task-smasher/utils/useCaseDefinitions.ts`

This file contains the prompts and definitions for each use case:

1. Find the use case you want to edit (e.g., `goals`, `daily`, etc.)
2. Edit the `prompt` field to change what the AI generates
3. Edit the `description` field to change what users see

Example:
```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps",
  prompt: "Break down this goal into achievable subtasks with clear milestones...",
  // ...
}
```

### Visual Customization

#### Homepage Styling

**File Location:** `src/index.css` and component files in `src/components/`

To change colors, fonts, or other visual elements:

1. Find the relevant component file (e.g., `Hero.tsx` for the hero section)
2. Look for CSS classes or inline styles
3. Edit the values to change appearance

#### Tool-Specific Styling

**File Location:** `src/tools/task-smasher/components/`

To change the appearance of specific tools:

1. Find the relevant component file (e.g., `Board.tsx` for the task board)
2. Look for CSS classes or inline styles
3. Edit the values to change appearance

## License

Copyright © 2024 Opace Digital Agency. All rights reserved.