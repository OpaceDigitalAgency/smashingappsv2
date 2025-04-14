# Article Smasher v2 - Developer Guide

## Introduction

Welcome to the Article Smasher v2 Developer Guide. This comprehensive document is designed for developers who need to understand, extend, or customize the AI-powered article generation system. Whether you're looking to add new features, customize the UI, or integrate with additional services, this guide will provide the technical details you need.

## Table of Contents

1. [System Architecture](#system-architecture)
   - [Overview](#overview)
   - [Component Structure](#component-structure)
   - [Data Flow](#data-flow)
   - [Key Technologies](#key-technologies)
2. [Codebase Organization](#codebase-organization)
   - [Directory Structure](#directory-structure)
   - [Key Files](#key-files)
   - [Naming Conventions](#naming-conventions)
3. [Core Concepts](#core-concepts)
   - [Context API Usage](#context-api-usage)
   - [Prompt Templates](#prompt-templates)
   - [Article Workflow](#article-workflow)
   - [AI Service Integration](#ai-service-integration)
4. [Extending the System](#extending-the-system)
   - [Adding New Article Types](#adding-new-article-types)
   - [Creating New Workflow Steps](#creating-new-workflow-steps)
   - [Implementing Custom AI Services](#implementing-custom-ai-services)
   - [Adding New Features](#adding-new-features)
5. [Customizing the UI](#customizing-the-ui)
   - [Styling Guidelines](#styling-guidelines)
   - [Component Customization](#component-customization)
   - [Theme Configuration](#theme-configuration)
   - [Responsive Design](#responsive-design)
6. [API Reference](#api-reference)
   - [Internal APIs](#internal-apis)
   - [External Integrations](#external-integrations)
7. [Testing and Quality Assurance](#testing-and-quality-assurance)
   - [Testing Framework](#testing-framework)
   - [Test Coverage](#test-coverage)
   - [Performance Testing](#performance-testing)
8. [Deployment](#deployment)
   - [Build Process](#build-process)
   - [Environment Configuration](#environment-configuration)
   - [Continuous Integration](#continuous-integration)
9. [Troubleshooting and Debugging](#troubleshooting-and-debugging)

## System Architecture

### Overview

Article Smasher v2 is built as a React single-page application (SPA) with a modular architecture that separates concerns between UI components, business logic, and external services. The system uses React Context API for state management and follows a step-based workflow pattern for article creation.

The architecture follows these key principles:
- **Modularity**: Components and services are designed to be self-contained and reusable
- **Separation of Concerns**: UI, business logic, and data access are separated
- **Extensibility**: The system is designed to be easily extended with new features
- **Progressive Enhancement**: Core functionality works without advanced features

### Component Structure

The application is structured around these major component groups:

1. **Core Application Components**
   - `App.tsx`: Main application component and routing
   - `ArticleWizardApp.tsx`: Entry point for the article creation wizard

2. **Context Providers**
   - `ArticleWizardContext`: Manages the state for the article creation process
   - `PromptContext`: Handles prompt templates and settings

3. **Workflow Steps**
   - `TopicStep`: Topic selection and generation
   - `KeywordStep`: Keyword research and selection
   - `OutlineStep`: Article outline generation and editing
   - `ContentStep`: Content generation and editing
   - `ImageStep`: Image generation and selection
   - `PublishStep`: Publishing and final review

4. **Services**
   - `articleAIService`: Handles AI model interactions
   - `promptService`: Manages prompt templates and processing
   - `wordpressService`: Handles WordPress integration

5. **Shared Components**
   - UI elements shared across the application
   - Utility components for common functionality

### Data Flow

The data flow in Article Smasher v2 follows this pattern:

1. User interacts with a step component in the UI
2. Component calls a function from ArticleWizardContext
3. Context function calls the appropriate service (e.g., articleAIService)
4. Service processes the request, potentially calling external APIs
5. Results are returned to the context
6. Context updates its state
7. UI components re-render with the new state

This unidirectional data flow ensures predictable state management and makes debugging easier.

### Key Technologies

Article Smasher v2 is built with the following key technologies:

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS for utility-first styling
- **Routing**: React Router for navigation
- **Icons**: Lucide React for consistent iconography
- **Drag and Drop**: React Beautiful DnD for interactive elements
- **HTTP Client**: Axios for API requests
- **AI Integration**: OpenAI API client for GPT and DALL-E
- **Storage**: LocalStorage for client-side data persistence
- **Testing**: Jest and React Testing Library

## Codebase Organization

### Directory Structure

```
src/
├── components/           # UI components
│   ├── steps/            # Workflow step components
│   ├── layout/           # Layout components
│   ├── complete/         # Completion view components
│   └── common/           # Shared UI components
├── contexts/             # React context providers
├── services/             # Service modules
├── hooks/                # Custom React hooks
├── types/                # TypeScript type definitions
├── utils/                # Utility functions
├── assets/               # Static assets
├── styles/               # Global styles
├── App.tsx               # Main application component
└── main.tsx              # Application entry point
```

### Key Files

- `src/contexts/ArticleWizardContext.tsx`: Central state management for the article creation process
- `src/contexts/PromptContext.tsx`: Manages prompt templates and settings
- `src/services/articleAIService.ts`: Handles interactions with AI models
- `src/services/promptService.ts`: Manages prompt templates and processing
- `src/components/ArticleWizard.tsx`: Main component for the article creation wizard
- `src/types/index.ts`: TypeScript type definitions for the application

### Naming Conventions

- **Components**: PascalCase (e.g., `TopicStep.tsx`)
- **Contexts**: PascalCase with "Context" suffix (e.g., `ArticleWizardContext.tsx`)
- **Services**: camelCase with "Service" suffix (e.g., `articleAIService.ts`)
- **Hooks**: camelCase with "use" prefix (e.g., `useArticleWizard.ts`)
- **Types**: PascalCase (e.g., `ArticleContent`)
- **Interfaces**: PascalCase with "I" prefix (e.g., `IPromptTemplate`)
- **Enums**: PascalCase (e.g., `ArticleType`)

## Core Concepts

### Context API Usage

Article Smasher v2 uses React Context API for state management. The two main contexts are:

1. **ArticleWizardContext**: Manages the state for the article creation process, including:
   - Current step tracking
   - Article data (title, keywords, outline, content, images)
   - Generation states (loading indicators)
   - Step navigation functions
   - Content generation functions

2. **PromptContext**: Handles prompt templates and settings, including:
   - Loading and saving prompt templates
   - Managing prompt settings
   - Testing prompt templates
   - Providing prompt templates to the article generation process

Example usage of ArticleWizardContext:

```tsx
import { useArticleWizard } from '../contexts/ArticleWizardContext';

const MyComponent = () => {
  const { 
    currentStep, 
    title, 
    setTitle,
    generateTopicIdeas 
  } = useArticleWizard();
  
  // Component logic using the context
  
  return (
    // Component JSX
  );
};
```

### Prompt Templates

Prompt templates are a core concept in Article Smasher v2. They define how the system interacts with AI models to generate content. Each template consists of:

- **System Prompt**: Instructions that define the AI's role and general behavior
- **User Prompt Template**: The specific prompt with variable placeholders
- **Category**: The type of content the prompt generates (topic, keyword, outline, content, image)
- **Parameters**: Settings like temperature and max tokens

Prompt templates are processed by replacing variables in the format `{{variableName}}` with actual values before sending to the AI model.

Example prompt template:

```typescript
{
  id: "123",
  name: "Topic Generator",
  description: "Generates article topic ideas",
  systemPrompt: "You are a professional content strategist specializing in creating engaging article topics.",
  userPromptTemplate: "Generate 5 engaging topic ideas for a {{articleType}} about {{subject}}.",
  category: "topic",
  temperature: 0.8,
  maxTokens: 500,
  createdAt: new Date(),
  updatedAt: new Date()
}
```

### Article Workflow

The article creation workflow is structured as a series of steps, each building on the previous:

1. **Topic Selection**: Choose article type and topic
2. **Keyword Research**: Identify and select relevant keywords
3. **Outline Generation**: Create a structured outline
4. **Content Creation**: Generate the full article content
5. **Image Selection**: Generate and select images
6. **Publishing**: Review and publish the article

Each step is implemented as a separate component with its own UI and logic, but they all share state through the ArticleWizardContext.

### AI Service Integration

Article Smasher v2 is fully integrated with the unified AI service architecture that is shared across all SmashingApps.ai tools. The integration consists of:

1. **Shared AI Services**: Located in `src/shared/services/`, these provide a common interface for all AI providers:
   - `AIService.ts`: Base interface and registry for all AI providers
   - `openaiService.ts`, `anthropicService.ts`, `googleService.ts`: Provider-specific implementations
   - `aiServices.ts`: Exports all services and the registry

2. **Article-Specific Integration**: The `articleAIService` provides methods for:
   - Generating topic ideas
   - Generating keywords
   - Creating article outlines
   - Generating article content
   - Creating image prompts

3. **Hook-Based Architecture**: The service uses the `useArticleAI` hook which wraps the shared `useAI` hook to make API calls to the selected provider. This ensures consistent behavior across all applications while allowing for article-specific customizations.

4. **Provider Selection**: The system automatically selects the appropriate provider based on the model specified in the settings, with fallback options if the primary provider is unavailable.

5. **Unified Admin Interface Integration**: The service now fully integrates with the unified admin interface:
   - Prompts are loaded from the admin interface when available
   - The ArticleSmasherV2 admin page redirects to the unified admin interface
   - All AI operations use the shared AI services configured in the admin interface

## Extending the System

### Adding New Article Types

To add a new article type:

1. Update the `ARTICLE_TYPES` array in `src/components/ArticleTypeSidebar.tsx`:

```typescript
export const ARTICLE_TYPES = [
  { value: 'blog-post', label: 'Blog Post' },
  { value: 'seo-article', label: 'SEO Article' },
  { value: 'academic-paper', label: 'Academic Paper' },
  { value: 'news-article', label: 'News Article' },
  { value: 'product-description', label: 'Product Description' },
  { value: 'your-new-type', label: 'Your New Type' } // Add your new type here
];
```

2. Create specialized prompt templates for the new article type by adding them in the admin interface or directly in the `promptService.ts` default templates.

3. (Optional) Add specialized UI components or logic for the new article type if needed.

### Creating New Workflow Steps

To add a new step to the article creation workflow:

1. Create a new step component in `src/components/steps/`:

```tsx
// src/components/steps/NewStep/NewStep.tsx
import React from 'react';
import { useArticleWizard } from '../../../contexts/ArticleWizardContext';

const NewStep: React.FC = () => {
  const { 
    // Get required state and functions from context
  } = useArticleWizard();
  
  return (
    <div>
      {/* Step UI */}
    </div>
  );
};

export default NewStep;
```

2. Update the `ArticleWizard.tsx` component to include the new step:

```tsx
// src/components/ArticleWizard.tsx
import NewStep from './steps/NewStep/NewStep';

const ArticleWizard: React.FC = () => {
  const { currentStep, showComplete } = useArticleWizard();
  
  return (
    <MainLayout>
      {!showComplete ? (
        <>
          {currentStep === 1 && <TopicStep />}
          {currentStep === 2 && <KeywordStep />}
          {/* ... existing steps ... */}
          {currentStep === 7 && <NewStep />} {/* Add your new step */}
        </>
      ) : (
        <CompleteArticle />
      )}
    </MainLayout>
  );
};
```

3. Update the `ArticleWizardContext.tsx` to handle the new step:
   - Increase the maximum step number in `goToNextStep`
   - Add any new state variables needed for the step
   - Add functions to handle the step's operations

4. Create a new prompt template category if needed for the new step.

### Implementing Custom AI Services

To implement a custom AI service (e.g., using a different AI provider):

1. Create a new service file in `src/services/`:

```typescript
// src/services/customAIService.ts
import { PromptTemplate, KeywordData, OutlineItem, ArticleContent } from '../types';

export class CustomAIService {
  // Implement methods similar to articleAIService
  public async generateTopics(
    prompt: PromptTemplate,
    articleType: string,
    subject: string = 'digital marketing'
  ): Promise<string[]> {
    // Custom implementation
  }
  
  // Other methods...
}

export default new CustomAIService();
```

2. Update the `ArticleWizardContext.tsx` to use your custom service instead of or alongside the default `articleAIService`.

3. If needed, create a configuration UI in the admin interface to manage settings for your custom service.

### Adding New Features

To add a new feature to Article Smasher v2:

1. Identify where the feature fits in the existing architecture:
   - Is it a new step in the workflow?
   - Is it an enhancement to an existing step?
   - Is it a new service or integration?

2. Implement the necessary components, services, and context updates.

3. Update the UI to expose the new feature to users.

4. Add any new prompt templates required for the feature.
   - For global prompt templates, add them through the unified admin interface
   - For local prompt templates, add them through the promptService

5. Update documentation to reflect the new feature.

6. If your feature requires changes to the AI service integration, ensure it works with the unified admin interface.

Example: Adding a "Readability Analysis" feature:

```typescript
// src/services/readabilityService.ts
export const analyzeReadability = (text: string) => {
  // Implement readability analysis logic
  return {
    score: calculateScore(text),
    suggestions: generateSuggestions(text),
    statistics: {
      wordCount: countWords(text),
      sentenceCount: countSentences(text),
      averageSentenceLength: calculateAverageSentenceLength(text),
      // Other metrics
    }
  };
};

// Add to ContentStep.tsx
import { analyzeReadability } from '../../../services/readabilityService';

// In your component
const readabilityResults = analyzeReadability(articleContent?.text || '');
```

## Customizing the UI

### Styling Guidelines

Article Smasher v2 uses Tailwind CSS for styling. To maintain consistency:

1. Use Tailwind utility classes for most styling needs
2. Follow the established color scheme using the primary, secondary, and neutral color variables
3. Use the provided component classes for consistent UI elements:
   - `btn` for buttons
   - `card` for card containers
   - `input` for form inputs
   - `mobile-section` for responsive sections

Example button styling:

```tsx
<button 
  className="btn btn-primary px-4 py-2 rounded-lg"
  onClick={handleClick}
>
  Click Me
</button>
```

### Component Customization

To customize existing components:

1. Create a new component that wraps the original:

```tsx
// src/components/custom/CustomTopicStep.tsx
import React from 'react';
import TopicStep from '../steps/TopicStep/TopicStepWithNav';

const CustomTopicStep: React.FC = () => {
  // Add custom logic
  
  return (
    <div className="custom-container">
      <h2>Custom Heading</h2>
      <TopicStep />
      {/* Additional custom elements */}
    </div>
  );
};

export default CustomTopicStep;
```

2. Replace the original component in `ArticleWizard.tsx`:

```tsx
import CustomTopicStep from './custom/CustomTopicStep';

// In ArticleWizard component
{currentStep === 1 && <CustomTopicStep />}
```

### Theme Configuration

To customize the theme:

1. Modify the Tailwind configuration in `tailwind.config.js`:

```js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0068B3',
          dark: '#004E85',
          light: '#CCE3F4',
          50: '#F0F9FF',
          // Add your custom colors
        },
        // Other color customizations
      },
      // Other theme extensions
    },
  },
  // Other Tailwind config
};
```

2. Use the custom theme values in your components:

```tsx
<div className="bg-primary text-white">
  Themed content
</div>
```

### Responsive Design

Article Smasher v2 is designed to be responsive. Key guidelines:

1. Use the provided responsive classes:
   - `mobile-container` for responsive containers
   - `mobile-section` for responsive sections

2. Use Tailwind's responsive prefixes for different screen sizes:
   - `sm:` for small screens (640px+)
   - `md:` for medium screens (768px+)
   - `lg:` for large screens (1024px+)
   - `xl:` for extra-large screens (1280px+)

Example responsive grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {/* Grid items */}
</div>
```

## API Reference

### Internal APIs

#### ArticleWizardContext API

Key methods and properties:

```typescript
// Navigation
currentStep: number;
goToNextStep(): void;
goToPreviousStep(): void;
handleStepClick(step: number): void;

// Topic Management
title: string;
setTitle(title: string): void;
generateTopicIdeas(): Promise<void>;

// Keyword Management
selectedKeywords: string[];
setSelectedKeywords(keywords: string[]): void;
generateKeywords(topic: string): Promise<void>;

// Outline Management
outline: OutlineItem[];
setOutline(outline: OutlineItem[]): void;
generateOutline(topic: string, keywords: string[]): Promise<void>;

// Content Management
articleContent: ArticleContent | null;
generateContent(topic: string, keywords: string[], outline: OutlineItem[]): Promise<void>;

// Image Management
images: ImageItem[];
generateImages(topic: string, keywords: string[]): Promise<void>;
```

#### PromptContext API

Key methods and properties:

```typescript
// Prompt Management
prompts: PromptTemplate[];
addPrompt(prompt: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>;
updatePrompt(id: string, prompt: Partial<PromptTemplate>): Promise<void>;
deletePrompt(id: string): Promise<void>;
getPromptsByCategory(category: PromptTemplate['category']): PromptTemplate[];

// Settings Management
settings: PromptSettings;
updateSettings(settings: Partial<PromptSettings>): Promise<void>;

// Testing
testPrompt(promptId: string, variables: Record<string, string>): Promise<string>;
```

### External Integrations

#### OpenAI API Integration

Article Smasher v2 integrates with OpenAI's API for content generation. The integration is handled through the `useAI` hook from the shared components library.

Key parameters for OpenAI requests:

```typescript
interface AIRequestParams {
  model: string;           // e.g., 'gpt-4o', 'gpt-4o-mini'
  systemPrompt: string;    // Instructions for the AI's role
  userPrompt: string;      // The specific request
  temperature: number;     // Controls randomness (0.0-1.0)
  maxTokens?: number;      // Maximum response length
}
```

#### WordPress Integration

The WordPress integration allows publishing articles directly to a WordPress site. The integration uses the WordPress REST API.

Key endpoints:

- `POST /wp/v2/posts`: Create a new post
- `GET /wp/v2/categories`: Get available categories
- `GET /wp/v2/tags`: Get available tags

Authentication is handled through API keys or OAuth, configured in the admin settings.

## Testing and Quality Assurance

### Testing Framework

Article Smasher v2 uses the following testing tools:

- **Jest**: For unit and integration testing
- **React Testing Library**: For component testing
- **Puppeteer**: For end-to-end testing

The test files are organized alongside the components they test, with the `.test.tsx` or `.spec.tsx` suffix.

### Test Coverage

The testing strategy focuses on:

1. **Unit Tests**: For utility functions and services
2. **Component Tests**: For UI components
3. **Integration Tests**: For context providers and their interactions
4. **End-to-End Tests**: For complete user workflows

The `test-article-smasher.js` script provides comprehensive end-to-end testing of the entire application.

### Performance Testing

Performance testing focuses on:

1. **Load Time**: Initial application load time
2. **Response Time**: Time to generate content at each step
3. **Memory Usage**: Monitoring memory consumption during content generation
4. **API Efficiency**: Optimizing API calls to minimize token usage

## Deployment

### Build Process

To build Article Smasher v2 for production:

1. Run the build command:
```bash
npm run build
```

2. The build output will be in the `dist/` directory, ready for deployment.

### Environment Configuration

Article Smasher v2 uses environment variables for configuration:

- `VITE_OPENAI_API_KEY`: Default OpenAI API key (optional)
- `VITE_DEFAULT_MODEL`: Default AI model to use
- `VITE_API_ENDPOINT`: Custom API endpoint (if using a proxy)
- `VITE_WORDPRESS_API_URL`: WordPress API URL for integration

Create a `.env` file in the project root to set these variables:

```
VITE_OPENAI_API_KEY=your-api-key
VITE_DEFAULT_MODEL=gpt-4o
VITE_API_ENDPOINT=https://your-api-proxy.com/v1
VITE_WORDPRESS_API_URL=https://your-wordpress-site.com/wp-json
```

### Continuous Integration

The project is set up for continuous integration using GitHub Actions. The workflow includes:

1. Running tests on pull requests
2. Building the application
3. Deploying to staging or production environments

## Troubleshooting and Debugging

### Common Development Issues

#### State Management Issues

**Problem**: Components not updating when state changes

**Solution**:
- Verify you're using the context correctly
- Check that you're not creating new object references unnecessarily
- Use the React DevTools to inspect component props and state

**Problem**: "Prompt with ID not found" error

**Solution**:
- This usually happens when the prompt ID doesn't exist in the current context
- Make sure the prompt exists in the admin interface or in local storage
- The system will attempt to find a fallback prompt based on the category
- Check that the ArticleSmasherV2 is properly integrated with the unified admin interface

#### API Integration Issues

**Problem**: AI API calls failing

**Solution**:
- Check API key and permissions in the unified admin interface
- Verify network connectivity
- Check for rate limiting or quota issues
- Inspect the request and response in the browser's Network tab
- Ensure the selected AI provider is properly configured in the admin interface

**Problem**: Admin interface integration not working

**Solution**:
- Make sure the ArticleSmasherV2 is properly integrated with the unified admin interface
- Check that the window.adminContext is available when running within the main application
- Verify that the prompts are being loaded from the admin interface

#### Build Issues

**Problem**: Build failing with TypeScript errors

**Solution**:
- Run `tsc --noEmit` to check for type errors
- Fix any type issues in your code
- Ensure dependencies are correctly installed

### Debugging Tools

1. **React DevTools**: For inspecting component hierarchy and props
2. **Browser DevTools**: For network requests and console logs
3. **VS Code Debugger**: For step-by-step debugging
4. **Logging**: Use the built-in logging system for tracking issues

Example debugging setup for VS Code:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "chrome",
      "request": "launch",
      "name": "Launch Chrome against localhost",
      "url": "http://localhost:5173",
      "webRoot": "${workspaceFolder}"
    }
  ]
}