# Migration Guide: From Current System to OOP Architecture

## Overview

This guide will help you migrate your existing SmashingApps tools (Article Smasher, Task Smasher) from the current fragmented system to the new centralised AI-Core architecture.

## Migration Strategy

### Phase 1: Preparation
1. Review current tool implementations
2. Identify all AI-related code
3. Document current API key storage locations
4. Back up existing settings

### Phase 2: Core Integration
1. Install AI-Core dependencies
2. Configure AI-Core with existing API keys
3. Test AI-Core independently

### Phase 3: Tool Migration
1. Update imports
2. Replace provider-specific code
3. Update settings management
4. Test each tool

### Phase 4: Cleanup
1. Remove duplicate code
2. Remove old settings
3. Update documentation

## Detailed Migration Steps

### Step 1: Identify Current AI Code

#### Article Smasher Current Structure
```typescript
// Current locations of AI code
src/tools/article-smasher/src/services/
  - openaiService.ts
  - anthropicService.ts
  - googleService.ts

src/tools/article-smasher/src/contexts/
  - Settings context with API keys

src/tools/article-smasher/src/components/
  - API key input components
```

#### Task Smasher Current Structure
```typescript
// Current locations of AI code
src/tools/task-smasher/components/
  - APISettingsModal.tsx
  - ModelDropdown.tsx

src/tools/task-smasher/utils/
  - openaiServiceAdapter.ts

// API key storage
localStorage keys:
  - taskSmasher_apiKeys
  - taskSmasher_activeProvider
```

### Step 2: Configure AI-Core

#### One-Time Setup
```typescript
// In your main app initialization
import AICore from './smashing-apps-oop/core/AICore';

// Initialize AI-Core
const aiCore = AICore.getInstance();

// Migrate existing API keys
const oldOpenAIKey = localStorage.getItem('article_smasher_openai_key') 
  || localStorage.getItem('taskSmasher_apiKeys')?.openai;

if (oldOpenAIKey) {
  aiCore.setApiKey('openai', oldOpenAIKey);
}

// Repeat for other providers
```

### Step 3: Update Article Smasher

#### Before (Current Code)
```typescript
// src/tools/article-smasher/src/services/openaiService.ts
import { openaiService } from './openaiService';

const response = await openaiService.createChatCompletion({
  model: 'gpt-4o',
  messages: messages,
  max_tokens: 2000
});
```

#### After (Using AI-Core)
```typescript
// src/tools/article-smasher/src/services/aiService.ts
import AICore from '../../../../smashing-apps-oop/core/AICore';

const aiCore = AICore.getInstance();

const response = await aiCore.sendTextRequest(
  'gpt-4o',
  messages,
  { maxTokens: 2000 },
  'article-smasher'
);

const content = AICore.extractContent(response);
```

#### Update Settings Context
```typescript
// Before
const [apiKeys, setApiKeys] = useState({
  openai: '',
  anthropic: '',
  gemini: ''
});

// After - Remove API key state, use AI-Core
import AICore from '../../../../smashing-apps-oop/core/AICore';

const aiCore = AICore.getInstance();
const providerStatus = aiCore.getProviderStatus();
// Use providerStatus to show configuration state
```

### Step 4: Update Task Smasher

#### Before (Current Code)
```typescript
// src/tools/task-smasher/components/APISettingsModal.tsx
const [apiKeys, setApiKeys] = useState<Record<string, string>>({});

const saveApiKey = (provider: AIProvider) => {
  const apiKey = apiKeys[provider]?.trim();
  setStoredApiKeys(prev => ({
    ...prev,
    [provider]: apiKey
  }));
  
  const service = aiServiceRegistry.getService(provider);
  if (service) {
    service.setApiKey(apiKey);
  }
};
```

#### After (Using AI-Core)
```typescript
// src/tools/task-smasher/components/APISettingsModal.tsx
import AICore from '../../../smashing-apps-oop/core/AICore';

const aiCore = AICore.getInstance();

const saveApiKey = (provider: string) => {
  const apiKey = apiKeys[provider]?.trim();
  
  // Save to AI-Core (automatically persists)
  aiCore.setApiKey(provider, apiKey);
  
  // Test the key
  const isValid = await aiCore.testApiKey(provider);
  setValidationStatus(prev => ({
    ...prev,
    [provider]: { 
      valid: isValid, 
      message: isValid ? 'API key saved successfully' : 'Invalid API key' 
    }
  }));
};
```

### Step 5: Create Shared Hook

Create a reusable hook for all tools:

```typescript
// smashing-apps-oop/shared/hooks/useAICore.ts
import { useState, useEffect } from 'react';
import AICore from '../../core/AICore';

export function useAICore() {
  const [aiCore] = useState(() => AICore.getInstance());
  const [isConfigured, setIsConfigured] = useState(false);
  const [providers, setProviders] = useState<string[]>([]);
  
  useEffect(() => {
    const updateStatus = () => {
      setIsConfigured(aiCore.isConfigured());
      setProviders(aiCore.getConfiguredProviders());
    };
    
    updateStatus();
    
    window.addEventListener('ai-core-settings-changed', updateStatus);
    return () => {
      window.removeEventListener('ai-core-settings-changed', updateStatus);
    };
  }, [aiCore]);
  
  const sendRequest = async (
    model: string,
    messages: any[],
    options: any = {},
    appId: string
  ) => {
    return await aiCore.sendTextRequest(model, messages, options, appId);
  };
  
  return {
    aiCore,
    isConfigured,
    providers,
    sendRequest
  };
}
```

### Step 6: Update Tool Components

#### Article Smasher - Main Component
```typescript
// Before
import { openaiService } from './services/openaiService';

// After
import { useAICore } from '../../../smashing-apps-oop/shared/hooks/useAICore';

function ArticleSmasher() {
  const { isConfigured, sendRequest } = useAICore();
  
  const generateArticle = async (prompt: string) => {
    if (!isConfigured) {
      alert('Please configure AI provider in settings');
      return;
    }
    
    const response = await sendRequest(
      'gpt-4o',
      [{ role: 'user', content: prompt }],
      { maxTokens: 2000 },
      'article-smasher'
    );
    
    return AICore.extractContent(response);
  };
  
  // ... rest of component
}
```

#### Task Smasher - Main Component
```typescript
// Before
import { aiServiceRegistry } from '../../shared/services/aiServices';

// After
import { useAICore } from '../../../smashing-apps-oop/shared/hooks/useAICore';

function TaskSmasher() {
  const { isConfigured, sendRequest } = useAICore();
  
  const generateTask = async (description: string) => {
    if (!isConfigured) {
      alert('Please configure AI provider in settings');
      return;
    }
    
    const response = await sendRequest(
      'gpt-4o-mini',
      [{ role: 'user', content: description }],
      { maxTokens: 500 },
      'task-smasher'
    );
    
    return AICore.extractContent(response);
  };
  
  // ... rest of component
}
```

### Step 7: Remove Old Code

#### Files to Remove
```
src/shared/services/
  - openaiService.ts (replaced by OpenAIProvider)
  - anthropicService.ts (replaced by AnthropicProvider)
  - googleService.ts (replaced by GeminiProvider)
  - openRouterService.ts (replaced by OpenRouterProvider)
  - aiServiceInitializer.ts (replaced by AICore)
  - aiServiceWrapper.ts (replaced by AICore)
  - aiServices.ts (replaced by AICore)

src/shared/contexts/
  - GlobalSettings/ (replaced by SettingsStorage)

src/tools/article-smasher/src/services/
  - All provider-specific services

src/tools/task-smasher/utils/
  - openaiServiceAdapter.ts
```

#### localStorage Keys to Migrate/Remove
```typescript
// Migration script
const migrateSettings = () => {
  const aiCore = AICore.getInstance();
  
  // Migrate API keys
  const oldKeys = {
    openai: localStorage.getItem('smashingapps_openai_key'),
    anthropic: localStorage.getItem('smashingapps_anthropic_key'),
    gemini: localStorage.getItem('smashingapps_gemini_key'),
    openrouter: localStorage.getItem('smashingapps_openrouter_key')
  };
  
  Object.entries(oldKeys).forEach(([provider, key]) => {
    if (key) {
      aiCore.setApiKey(provider, key);
    }
  });
  
  // Remove old keys
  localStorage.removeItem('smashingapps_openai_key');
  localStorage.removeItem('smashingapps_anthropic_key');
  localStorage.removeItem('smashingapps_gemini_key');
  localStorage.removeItem('smashingapps_openrouter_key');
  localStorage.removeItem('article_smasher_prompt_settings');
  localStorage.removeItem('taskSmasher_apiKeys');
  localStorage.removeItem('global-settings');
  localStorage.removeItem('smashingapps-global-settings');
};
```

### Step 8: Testing Checklist

#### Unit Tests
- [ ] Test AICore initialization
- [ ] Test provider selection
- [ ] Test API key storage
- [ ] Test response normalisation
- [ ] Test usage tracking

#### Integration Tests
- [ ] Test Article Smasher with AI-Core
- [ ] Test Task Smasher with AI-Core
- [ ] Test settings persistence
- [ ] Test provider switching
- [ ] Test error handling

#### User Acceptance Tests
- [ ] Configure API keys in admin
- [ ] Generate article in Article Smasher
- [ ] Create task in Task Smasher
- [ ] View usage statistics
- [ ] Switch between providers

## Rollback Plan

If issues arise during migration:

1. **Keep old code temporarily**
   ```typescript
   // Feature flag approach
   const USE_NEW_AI_CORE = false;
   
   if (USE_NEW_AI_CORE) {
     // Use AI-Core
   } else {
     // Use old system
   }
   ```

2. **Backup settings**
   ```typescript
   // Before migration
   const backup = {
     settings: localStorage.getItem('smashingapps-global-settings'),
     apiKeys: {
       openai: localStorage.getItem('smashingapps_openai_key'),
       // ... other keys
     }
   };
   localStorage.setItem('settings_backup', JSON.stringify(backup));
   ```

3. **Restore if needed**
   ```typescript
   const restore = () => {
     const backup = JSON.parse(localStorage.getItem('settings_backup'));
     // Restore old settings
   };
   ```

## Timeline Estimate

- **Phase 1 (Preparation)**: 1-2 hours
- **Phase 2 (Core Integration)**: 2-3 hours
- **Phase 3 (Tool Migration)**: 4-6 hours per tool
- **Phase 4 (Cleanup)**: 2-3 hours
- **Testing**: 3-4 hours

**Total**: 2-3 days for complete migration

## Support

If you encounter issues during migration:

1. Check the USAGE_EXAMPLES.md file
2. Review the IMPLEMENTATION_SUMMARY.md
3. Test AI-Core independently before integrating
4. Use console.log to debug provider selection
5. Check browser console for errors

## Post-Migration Benefits

After migration, you'll have:

- ✅ Single source of truth for AI settings
- ✅ No duplicate API key management
- ✅ Consistent error handling
- ✅ Usage tracking across all tools
- ✅ Easy to add new tools
- ✅ Easy to add new providers
- ✅ Better code organisation
- ✅ Improved maintainability

