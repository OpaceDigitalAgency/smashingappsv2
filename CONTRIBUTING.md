# Contributing to SmashingApps.ai

This document provides guidelines for contributing to the SmashingApps.ai project, particularly focusing on the architecture and how to add new tools to the unified application.

## Project Architecture

SmashingApps.ai follows a unified architecture where multiple tools are integrated into a single React application:

- **Main Application**: The root-level application that provides the landing page and routing to various tools
- **Tools**: Specialized applications that are integrated into the main application

### Directory Structure

```
/
├── src/                      # Main application source code
│   ├── App.tsx               # Main application router
│   ├── components/           # Shared components for the main application
│   └── tools/                # Integrated tools
│       └── tool-name/        # Each tool has its own directory
│           ├── ToolNameApp.tsx  # Main component for the tool
│           ├── components/   # Tool-specific components
│           ├── hooks/        # Tool-specific hooks
│           └── utils/        # Tool-specific utilities
└── tools/                    # Legacy standalone tools (for reference only)
```

## Adding a New Tool

When adding a new tool to the SmashingApps.ai platform, follow these guidelines to maintain consistency:

### 1. Create the Tool Structure

Create a new directory in `src/tools/` with your tool name (use kebab-case):

```
src/tools/your-tool-name/
```

### 2. Create the Main Tool Component

Create a main component for your tool following the naming convention `ToolNameApp.tsx` (use PascalCase for the component name):

```tsx
// src/tools/your-tool-name/YourToolNameApp.tsx
import React from 'react';

const YourToolNameApp: React.FC = () => {
  return (
    <div>
      {/* Your tool implementation */}
    </div>
  );
};

export default YourToolNameApp;
```

### 3. Add the Tool to the Main Router

Update `src/App.tsx` to include routes for your new tool:

```tsx
// In src/App.tsx
import YourToolNameApp from './tools/your-tool-name/YourToolNameApp';

// Add routes in the Routes component
<Route path="/tools/your-tool-name" element={<YourToolNameApp />} />
<Route path="/tools/your-tool-name/" element={<YourToolNameApp />} />
```

### 4. Add the Tool to the Tools Component

Update `src/components/Tools.tsx` to include your new tool in the tools list.

## Best Practices

1. **Consistent Naming**: 
   - Use kebab-case for directory names: `tool-name`
   - Use PascalCase for component names: `ToolNameApp.tsx`

2. **Component Structure**:
   - Each tool should have its own directory in `src/tools/`
   - The main component should be named `ToolNameApp.tsx`
   - Use subdirectories for components, hooks, and utilities

3. **State Management**:
   - Keep tool-specific state within the tool's directory
   - Use context providers if needed for complex state management

4. **Routing**:
   - Always include routes both with and without trailing slashes
   - Use consistent URL patterns: `/tools/tool-name`

5. **Documentation**:
   - Add comments to your code explaining complex logic
   - Update this CONTRIBUTING.md file if you make architectural changes

## Avoiding Common Issues

1. **Duplicate Code**: Don't copy code between tools. Extract shared functionality to common utilities.
2. **Inconsistent Naming**: Follow the naming conventions to avoid confusion.
3. **Standalone vs. Integrated**: Don't create standalone versions of tools. All tools should be integrated into the main application.