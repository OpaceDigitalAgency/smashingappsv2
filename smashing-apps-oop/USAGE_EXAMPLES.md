# AI-Core Usage Examples

## Basic Usage

### 1. Initialize AI-Core

```typescript
import AICore from './core/AICore';

// Get the singleton instance
const aiCore = AICore.getInstance();

// Check if configured
if (!aiCore.isConfigured()) {
  console.log('Please configure at least one AI provider');
  // Redirect to admin settings
}
```

### 2. Send a Simple Request

```typescript
import AICore from './core/AICore';

const aiCore = AICore.getInstance();

try {
  const response = await aiCore.sendTextRequest(
    'gpt-4o-mini',
    [
      { role: 'user', content: 'Hello, AI!' }
    ],
    { maxTokens: 100 },
    'my-app' // App identifier for usage tracking
  );
  
  // Extract content
  const content = AICore.extractContent(response);
  console.log('AI Response:', content);
  
  // Get usage info
  const usage = AICore.extractUsage(response);
  console.log('Tokens used:', usage.totalTokens);
} catch (error) {
  console.error('Request failed:', error);
}
```

### 3. Send a Request with System Prompt

```typescript
const response = await aiCore.sendTextRequest(
  'claude-sonnet-4-20250514',
  [
    { 
      role: 'system', 
      content: 'You are a helpful assistant that writes concise responses.' 
    },
    { 
      role: 'user', 
      content: 'Explain quantum computing in simple terms.' 
    }
  ],
  {
    maxTokens: 500,
    temperature: 0.7
  },
  'article-smasher'
);
```

### 4. Multi-turn Conversation

```typescript
const messages = [
  { role: 'system', content: 'You are a helpful coding assistant.' },
  { role: 'user', content: 'How do I create a React component?' },
  { role: 'assistant', content: 'Here is how to create a React component...' },
  { role: 'user', content: 'Can you show me with TypeScript?' }
];

const response = await aiCore.sendTextRequest(
  'gpt-4o',
  messages,
  { maxTokens: 1000 },
  'task-smasher'
);
```

## Provider Management

### 1. Check Provider Status

```typescript
const status = aiCore.getProviderStatus();

console.log('OpenAI:', status.openai.configured ? 'Configured' : 'Not configured');
console.log('Anthropic:', status.anthropic.configured ? 'Configured' : 'Not configured');
console.log('Gemini:', status.gemini.configured ? 'Configured' : 'Not configured');
```

### 2. Get Configured Providers

```typescript
const providers = aiCore.getConfiguredProviders();
console.log('Available providers:', providers);
// Output: ['openai', 'anthropic']
```

### 3. Set API Key

```typescript
// Set API key for a provider
aiCore.setApiKey('openai', 'sk-...');

// Test the API key
const isValid = await aiCore.testApiKey('openai');
console.log('API key valid:', isValid);
```

## Model Management

### 1. Get Available Models

```typescript
// Get all models from registry
const allModels = aiCore.getAllModels();
console.log('All models:', allModels);

// Get models for a specific provider
const openaiModels = aiCore.getModelsByProvider('openai');
console.log('OpenAI models:', openaiModels);

// Get live models from provider API
const liveModels = await aiCore.getAvailableModels('openai');
console.log('Live OpenAI models:', liveModels);
```

### 2. Get Model Information

```typescript
import ModelRegistry from './core/registry/ModelRegistry';

const registry = ModelRegistry.getInstance();

// Get model info
const modelInfo = registry.getModel('gpt-4o');
console.log('Model:', modelInfo?.name);
console.log('Max tokens:', modelInfo?.capabilities.maxTokens);
console.log('Supports images:', modelInfo?.capabilities.supportsImages);

// Calculate cost
const cost = registry.calculateCost('gpt-4o', 1000, 500);
console.log('Estimated cost: $', cost.toFixed(4));
```

## Settings Management

### 1. Get Current Settings

```typescript
const settings = aiCore.getSettings();
console.log('Default provider:', settings.defaultProvider);
console.log('Default model:', settings.defaultModel);
console.log('Stats enabled:', settings.enableStats);
```

### 2. Update Settings

```typescript
aiCore.updateSettings({
  defaultProvider: 'anthropic',
  defaultModel: 'claude-sonnet-4-20250514',
  enableStats: true,
  enableCaching: true
});
```

## Usage Statistics

### 1. Get Usage Stats

```typescript
const stats = aiCore.getStats();

console.log('Total requests:', stats.totalRequests);
console.log('Total tokens:', stats.totalTokens);
console.log('Total cost: $', stats.totalCost.toFixed(2));

// By provider
console.log('OpenAI requests:', stats.byProvider.openai?.requests || 0);
console.log('Anthropic requests:', stats.byProvider.anthropic?.requests || 0);

// By model
console.log('GPT-4o requests:', stats.byModel['gpt-4o']?.requests || 0);

// By app
console.log('Article Smasher usage:', stats.byApp['article-smasher']?.cost || 0);
```

### 2. Reset Statistics

```typescript
aiCore.resetStats();
console.log('Statistics reset');
```

## Error Handling

### 1. Handle Provider Not Configured

```typescript
try {
  const response = await aiCore.sendTextRequest(
    'gpt-4o',
    [{ role: 'user', content: 'Hello' }]
  );
} catch (error) {
  if (error.message.includes('not configured')) {
    // Show API key configuration prompt
    console.log('Please configure your OpenAI API key');
  } else {
    console.error('Request failed:', error);
  }
}
```

### 2. Handle Rate Limits

```typescript
try {
  const response = await aiCore.sendTextRequest(
    'gpt-4o',
    [{ role: 'user', content: 'Hello' }]
  );
} catch (error) {
  if (error.message.includes('rate limit')) {
    // Show rate limit message
    console.log('Rate limit exceeded. Please try again later.');
  } else {
    throw error;
  }
}
```

## React Integration

### 1. Custom Hook

```typescript
import { useState, useEffect } from 'react';
import AICore from '../core/AICore';

export function useAICore() {
  const [aiCore] = useState(() => AICore.getInstance());
  const [isConfigured, setIsConfigured] = useState(false);
  
  useEffect(() => {
    setIsConfigured(aiCore.isConfigured());
    
    // Listen for settings changes
    const handleSettingsChange = () => {
      setIsConfigured(aiCore.isConfigured());
    };
    
    window.addEventListener('ai-core-settings-changed', handleSettingsChange);
    
    return () => {
      window.removeEventListener('ai-core-settings-changed', handleSettingsChange);
    };
  }, [aiCore]);
  
  return { aiCore, isConfigured };
}
```

### 2. Component Usage

```typescript
import React, { useState } from 'react';
import { useAICore } from '../hooks/useAICore';

function MyComponent() {
  const { aiCore, isConfigured } = useAICore();
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (prompt: string) => {
    if (!isConfigured) {
      alert('Please configure AI provider first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await aiCore.sendTextRequest(
        'gpt-4o-mini',
        [{ role: 'user', content: prompt }],
        { maxTokens: 500 },
        'my-app'
      );
      
      setResponse(AICore.extractContent(result));
    } catch (error) {
      console.error('Failed:', error);
      alert('Request failed');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div>
      {!isConfigured && (
        <div className="alert">
          Please configure your AI provider in settings
        </div>
      )}
      
      <button 
        onClick={() => handleSubmit('Hello, AI!')}
        disabled={!isConfigured || loading}
      >
        {loading ? 'Loading...' : 'Send Request'}
      </button>
      
      {response && (
        <div className="response">
          {response}
        </div>
      )}
    </div>
  );
}
```

## Advanced Usage

### 1. Custom Provider Selection

```typescript
// Let user choose provider
const providers = aiCore.getConfiguredProviders();

// Get default model for each provider
const settings = aiCore.getSettings();
const models = providers.map(p => settings.providers[p].defaultModel);

// Send request with selected model
const response = await aiCore.sendTextRequest(
  models[0], // Use first available model
  messages,
  options,
  'my-app'
);
```

### 2. Streaming Responses (Future Feature)

```typescript
// This will be implemented in a future version
// const stream = await aiCore.sendStreamingRequest(model, messages, options);
// 
// for await (const chunk of stream) {
//   console.log(chunk.content);
// }
```

