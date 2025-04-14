# SmashingApps.ai

A modern suite of AI-powered productivity tools, hosted at [smashingapps.ai](https://smashingapps.ai).

## Overview

SmashingApps.ai provides intuitive, AI-powered tools to help users "smash" through specific tasks. The application consists of a main landing page and various specialized tools, including TaskSmasher and ArticleSmasher.

## Application Structure

This is a unified React application that combines:

1. **Main Homepage** (`/`) - Introduces the brand and links to various tools
2. **TaskSmasher** (`/tools/task-smasher/`) - AI-powered task management application with various use cases
3. **ArticleSmasher** (`/tools/article-smasher/`) - AI-powered content creation tool with specialized use cases

## Refactored Architecture

The application has been refactored to use a modular, component-based architecture that makes it easy to add new tools and maintain existing ones.

```
┌─────────────────────────────────────────────────────────────┐
│                      SmashingApps.ai                        │
│                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  Homepage   │    │ TaskSmasher │    │ArticleSmasher│     │
│  └─────────────┘    └─────────────┘    └─────────────┘     │
│         │                 │                  │              │
│         └─────────────────┼──────────────────┘              │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Shared Components                    │   │
│  │                                                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │   │
│  │  │ Button  │  │  Card   │  │ Dropdown│  │ Modal  │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘  │   │
│  │                                                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────────────────┐  │   │
│  │  │ Loading │  │RateLimit│  │    PromptRunner     │  │   │
│  │  │Indicator│  │ Popup   │  │                     │  │   │
│  │  └─────────┘  └─────────┘  └─────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                 Shared Services                      │   │
│  │                                                     │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌────────┐  │   │
│  │  │ AI      │  │ Rate    │  │ Local   │  │ReCaptcha│  │   │
│  │  │ Service │  │ Limiting│  │ Storage │  │ Service │  │   │
│  │  └─────────┘  └─────────┘  └─────────┘  └────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Key Architecture Components

1. **Tool Configuration System**: Each tool is defined by a configuration object that specifies its capabilities, routes, and use cases.
2. **Shared Component Library**: Reusable UI components that maintain consistent design and functionality across tools.
3. **Shared Services**: Common functionality like AI integration, rate limiting, and storage.
4. **Tool Registry**: Central registry for all tools in the platform.

## Shared Component Library

The shared component library provides reusable UI components that maintain a consistent look and feel across all tools in the platform. Components are designed to be flexible, customizable, and easy to use.

### Available Components

- **Button**: Customizable button with variants, sizes, and loading states
- **Card**: Container component with optional title and footer
- **Dropdown**: Select component for choosing from a list of options
- **LoadingIndicator**: Visual indicator for loading states
- **Modal**: Dialog component for displaying content in a modal window
- **PromptRunner**: Component for running AI prompts and displaying results
- **RateLimitPopup**: Component for displaying rate limit information

### Usage Example

```tsx
import { Button, Card, Dropdown } from '../../shared';

const MyComponent = () => {
  return (
    <Card title="My Card">
      <Dropdown
        label="Options"
        value={selectedOption}
        options={options}
        onChange={handleChange}
      />
      <Button variant="primary" onClick={handleClick}>
        Submit
      </Button>
    </Card>
  );
};
```

## Tool Configuration System

The tool configuration system allows for easy definition and management of tools in the platform. Each tool is defined by a configuration object that specifies its capabilities, routes, and use cases.

### Tool Configuration Structure

```typescript
interface ToolConfig {
  id: string;                 // Unique identifier for the tool
  name: string;               // Display name
  description: string;        // Brief description
  icon: LucideIcon;           // Icon component
  routes: {                   // Routing information
    base: string;             // Base route for the tool
    subRoutes?: Record<string, string>; // Sub-routes for use cases
  };
  capabilities: {             // Tool capabilities
    ai: {                     // AI capabilities
      enabled: boolean;
      defaultModel: string;
      availableModels: string[];
      systemPromptTemplate: string;
    };
    export: {                 // Export capabilities
      enabled: boolean;
      formats: string[];
    };
    // Other capabilities...
  };
  useCases: Record<string, {  // Use cases for the tool
    id: string;
    label: string;
    description: string;
    icon?: LucideIcon;
    promptTemplate?: string;
  }>;
  defaultUseCase: string;     // Default use case
  metaTags: {                 // SEO metadata
    title: string;
    description: string;
    ogImage: string;
  };
}
```

### Tool Registry

The tool registry is a central repository for all tools in the platform. It provides methods for retrieving tool configurations by ID or route.

```typescript
// src/tools/registry.ts
const toolRegistry: Record<string, ToolConfig> = {
  'task-smasher': taskSmasherConfig,
  'article-smasher': articleSmasherConfig
  // Add more tools here as they are created
};
```

## Adding a New Tool to the Platform

To add a new tool to the SmashingApps platform, follow these steps:

1. **Create a new directory** for your tool in `src/tools/your-tool-name/`

2. **Create a configuration file** for your tool:

   ```typescript
   // src/tools/your-tool-name/config.ts
   import { ToolConfig } from '../../shared/types';
   import { YourIcon } from 'lucide-react';

   const yourToolConfig: ToolConfig = {
     id: 'your-tool-name',
     name: 'Your Tool Name',
     description: 'Brief description of your tool',
     icon: YourIcon,
     routes: {
       base: '/tools/your-tool-name',
       subRoutes: {
         // Define sub-routes for use cases
         useCase1: '/tools/your-tool-name/use-case-1',
         useCase2: '/tools/your-tool-name/use-case-2',
       }
     },
     capabilities: {
       // Define capabilities
       ai: {
         enabled: true,
         defaultModel: 'gpt-3.5-turbo',
         availableModels: ['gpt-3.5-turbo', 'gpt-4'],
         systemPromptTemplate: 'You are an AI assistant that helps with...'
       },
       // Other capabilities...
     },
     useCases: {
       // Define use cases
       useCase1: {
         id: 'useCase1',
         label: 'Use Case 1',
         description: 'Description of use case 1',
         promptTemplate: 'Template for use case 1: {{input}}'
       },
       // Other use cases...
     },
     defaultUseCase: 'useCase1',
     metaTags: {
       title: 'Your Tool Name | SmashingApps.ai',
       description: 'SEO description for your tool',
       ogImage: 'https://smashingapps.ai/og/your-tool-name.png'
     }
   };

   export default yourToolConfig;
   ```

3. **Create the main component** for your tool:

   ```typescript
   // src/tools/your-tool-name/YourToolApp.tsx
   import React from 'react';
   import { useLocation } from 'react-router-dom';
   import {
     Button,
     Card,
     Dropdown,
     useAI
   } from '../../shared';
   import config from './config';
   import SEO from '../../components/SEO';

   const YourToolApp: React.FC = () => {
     // Implement your tool's UI and functionality
     return (
       <div>
         {/* Your tool's UI */}
       </div>
     );
   };

   export default YourToolApp;
   ```

4. **Register your tool** in the tool registry:

   ```typescript
   // src/tools/registry.ts
   import yourToolConfig from './your-tool-name/config';

   const toolRegistry: Record<string, ToolConfig> = {
     'task-smasher': taskSmasherConfig,
     'article-smasher': articleSmasherConfig,
     'your-tool-name': yourToolConfig
     // Add more tools here as they are created
   };
   ```

5. **Add your tool to the routing** in `src/App.tsx`:

   ```typescript
   // src/App.tsx
   import YourToolApp from './tools/your-tool-name/YourToolApp';

   // In your Routes component
   <Route path="/tools/your-tool-name/*" element={<YourToolApp />} />
   ```

6. **Create a README.md** file for your tool:

   ```markdown
   # Your Tool Name

   Brief description of your tool.

   ## Features

   - Feature 1
   - Feature 2
   - Feature 3

   ## Use Cases

   - Use Case 1: Description
   - Use Case 2: Description

   ## Configuration

   See the [main README](../../README.md) for information on the shared architecture and component library.

   ### Tool-Specific Configuration

   - Configuration option 1
   - Configuration option 2
   ```

## Development

### Prerequisites

- Node.js 18+ and npm

### Setup

1. Clone the repository
   ```
   git clone https://github.com/OpaceDigitalAgency/smashingapps-unified.git
   cd smashingapps-unified
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

- **ArticleSmasher** - AI-powered content creation with specialized use cases:
  - Blog Post
  - SEO Article
  - Academic Paper
  - News Article

## Common Settings for Non-Technical Users

This section provides easy-to-follow instructions for making common changes to the website without coding knowledge.

### SEO Settings

#### Main Website SEO (Homepage and General Settings)

**File Location:** `src/utils/seoMaster.ts`

This file is the single source of truth for all SEO-related content across the entire application. To edit:

1. Open the file in any text editor
2. Find the `defaultMeta` section
3. Edit the following fields:
   - `title`: The main website title
   - `description`: The main website description
   - `image`: The social sharing image URL
   - `keywords`: Keywords for search engines

Example:
```typescript
export const defaultMeta: MetaConfig = {
  title: 'SmashingApps.ai | Free AI Productivity Apps & Tools',
  description: 'Get things done faster with free AI planners and smart to-do lists. Smash tasks easily using auto task management from SmashingApps.ai.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  urlPath: '/',
  robots: 'index, follow',
  keywords: 'free ai planner, magic to-do, ai task manager, ai task planner, smart to-do lists, auto task manager, ai to-do lists'
  // ...
};
```

#### Tool-Specific SEO (TaskSmasher, ArticleSmasher, and Other Tools)

**File Location:** `src/utils/seoMaster.ts` (routeMeta section)

To edit SEO for specific tools:

1. Find the `routeMeta` section
2. Locate the specific tool path (e.g., `/tools/task-smasher/`)
3. Edit the title, description, and other fields

Example for TaskSmasher:
```typescript
'/tools/task-smasher/': {
  title: 'TaskSmasher - Free AI Planner | Magic To-Do Lists & AI Task Manager',
  description: 'Smash complex tasks into smart, manageable lists using our free AI planner. TaskSmasher is an AI task manager tool that creates magic to-do lists for greater productivity.',
  image: `${BASE_URL}/og/task-smasher.png`,
  canonical: `${BASE_URL}/tools/task-smasher/`,
  urlPath: '/tools/task-smasher/',
  keywords: 'task management, AI task breakdown, AI TO-DO planner, AI Task planner, productivity tool, task organizer',
  // ...
}
```

#### Use Case SEO (Goal Planner, Daily Organizer, Blog Post, etc.)

**File Location:** `src/utils/seoMaster.ts`

To edit SEO for specific use cases:

1. Find the appropriate use case definitions section (`useCaseDefinitions` for TaskSmasher or `articleSmasherUseCases` for ArticleSmasher)
2. Locate the specific use case (e.g., `goals` for Goal Planner)
3. Edit the label, description, and keywords

Example for TaskSmasher use case:
```typescript
goals: {
  label: "Goal Planner",
  description: "Achieve goals faster using our free AI task planner. Break down objectives into smart to-do lists.",
  keywords: ["goal", "objective", "milestone", "achieve", "accomplish", "target"]
}
```

For more detailed information about the SEO system, please refer to the [SEO documentation](src/utils/SEO_README.md).

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