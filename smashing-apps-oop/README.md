# SmashingApps OOP Architecture

## Overview

This is a complete rebuild of the SmashingApps platform using an Object-Oriented Programming (OOP) architecture inspired by the WordPress AI-Core plugin. The system provides a centralised, independent AI settings and management core that all tools and apps can share.

## Architecture Principles

### 1. Independent AI-Core System
- **Single Source of Truth**: All AI provider settings, API keys, and configurations are managed centrally
- **Provider Agnostic**: Support for multiple AI providers (OpenAI, Anthropic, Google Gemini, OpenRouter)
- **Shared Configuration**: All tools/apps use the same settings without duplication

### 2. OOP Design Patterns
- **Factory Pattern**: AICore class creates provider instances
- **Singleton Pattern**: Core services use singleton pattern for global access
- **Interface-Based**: All providers implement common interfaces
- **Normalisation**: All responses normalised to a consistent format

### 3. Separation of Concerns
```
smashing-apps-oop/
├── core/                    # Independent AI-Core system
│   ├── AICore.ts           # Main factory class
│   ├── interfaces/         # Provider interfaces
│   ├── providers/          # Provider implementations
│   ├── registry/           # Model registry
│   ├── response/           # Response normalisation
│   └── storage/            # Settings storage
├── admin/                   # Admin interface
│   ├── AdminApp.tsx        # Admin application
│   ├── components/         # Admin UI components
│   └── services/           # Admin services
├── tools/                   # Individual tools/apps
│   ├── article-smasher/    # Article Smasher tool
│   └── task-smasher/       # Task Smasher tool
└── shared/                  # Shared utilities
    ├── components/         # Reusable UI components
    └── utils/              # Helper functions
```

## Key Features

### AI-Core System
- ✅ Centralised API key management
- ✅ Multiple provider support (OpenAI, Anthropic, Gemini, OpenRouter)
- ✅ Automatic provider selection based on model
- ✅ Model registry with capabilities
- ✅ Response normalisation
- ✅ Usage tracking and statistics
- ✅ Settings persistence

### Admin Interface
- ✅ Provider configuration
- ✅ API key testing and validation
- ✅ Model discovery and selection
- ✅ Usage monitoring
- ✅ Settings management
- ✅ Prompt library

### Tool Integration
- ✅ Simple API for tools to access AI services
- ✅ Automatic configuration from AI-Core
- ✅ No duplicate API key management
- ✅ Consistent error handling

## Comparison with WordPress AI-Core

| Feature | WordPress AI-Core | SmashingApps OOP |
|---------|------------------|------------------|
| Language | PHP | TypeScript |
| Storage | WordPress Options API | localStorage + IndexedDB |
| Provider Management | ✅ | ✅ |
| Model Registry | ✅ | ✅ |
| Response Normalisation | ✅ | ✅ |
| Usage Tracking | ✅ | ✅ |
| Admin Interface | ✅ | ✅ |
| Prompt Library | ✅ | ✅ |
| Add-on System | ✅ | ✅ (Tools) |

## Getting Started

### For Tool Developers

```typescript
import { AICore } from '../core/AICore';

// Initialize AI-Core
const aiCore = AICore.getInstance();

// Check if configured
if (!aiCore.isConfigured()) {
  // Show configuration prompt
  return;
}

// Send a request
const response = await aiCore.sendTextRequest(
  'gpt-4o',
  [
    { role: 'user', content: 'Hello, AI!' }
  ],
  { maxTokens: 100 }
);

// Use the response
const content = response.choices[0].message.content;
```

### For Admin Users

1. Navigate to the Admin interface
2. Configure API keys for your preferred providers
3. Test each API key to ensure it works
4. Select default provider and model
5. All tools will automatically use these settings

## Migration from Current System

The new OOP architecture maintains all existing functionality while providing:
- Better code organisation
- Easier maintenance
- Clearer separation of concerns
- Reduced code duplication
- Improved type safety
- Consistent error handling

All existing tools (Article Smasher, Task Smasher) will be migrated to use the new AI-Core system.

