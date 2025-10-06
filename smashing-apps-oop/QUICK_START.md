# Quick Start Guide

## Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd smashing-apps-oop
npm install
```

### 2. Initialize AI-Core

```typescript
// In your main app file (e.g., main.tsx or App.tsx)
import AICore from './core/AICore';

// Initialize on app startup
const aiCore = AICore.getInstance();

console.log('AI-Core initialized');
console.log('Configured providers:', aiCore.getConfiguredProviders());
```

### 3. Configure Your First Provider

```typescript
import AICore from './core/AICore';

const aiCore = AICore.getInstance();

// Set your OpenAI API key
aiCore.setApiKey('openai', 'sk-your-api-key-here');

// Test the key
const isValid = await aiCore.testApiKey('openai');
console.log('API key valid:', isValid);
```

### 4. Send Your First Request

```typescript
import AICore from './core/AICore';

const aiCore = AICore.getInstance();

// Send a simple request
const response = await aiCore.sendTextRequest(
  'gpt-4o-mini',
  [
    { role: 'user', content: 'Hello, AI! Tell me a joke.' }
  ],
  { maxTokens: 100 },
  'my-app'
);

// Extract the content
const content = AICore.extractContent(response);
console.log('AI Response:', content);

// Check usage
const usage = AICore.extractUsage(response);
console.log('Tokens used:', usage.totalTokens);
```

### 5. View Statistics

```typescript
const stats = aiCore.getStats();

console.log('Total requests:', stats.totalRequests);
console.log('Total cost: $', stats.totalCost.toFixed(4));
console.log('By provider:', stats.byProvider);
console.log('By app:', stats.byApp);
```

## Complete Example: Simple Chat Component

```typescript
import React, { useState } from 'react';
import AICore from './core/AICore';

function SimpleChat() {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const aiCore = AICore.getInstance();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!aiCore.isConfigured()) {
      alert('Please configure an AI provider first');
      return;
    }
    
    setLoading(true);
    try {
      const result = await aiCore.sendTextRequest(
        'gpt-4o-mini',
        [{ role: 'user', content: input }],
        { maxTokens: 500 },
        'simple-chat'
      );
      
      setResponse(AICore.extractContent(result));
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to get response');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="chat-container">
      <h1>Simple AI Chat</h1>
      
      <form onSubmit={handleSubmit}>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message..."
          rows={4}
        />
        
        <button type="submit" disabled={loading || !input.trim()}>
          {loading ? 'Thinking...' : 'Send'}
        </button>
      </form>
      
      {response && (
        <div className="response">
          <h3>AI Response:</h3>
          <p>{response}</p>
        </div>
      )}
    </div>
  );
}

export default SimpleChat;
```

## Testing Different Providers

```typescript
import AICore from './core/AICore';

const aiCore = AICore.getInstance();

// Configure multiple providers
aiCore.setApiKey('openai', 'sk-...');
aiCore.setApiKey('anthropic', 'sk-ant-...');
aiCore.setApiKey('gemini', 'AIza...');

// Test each provider
const providers = ['openai', 'anthropic', 'gemini'];

for (const provider of providers) {
  const isValid = await aiCore.testApiKey(provider);
  console.log(`${provider}: ${isValid ? '✓' : '✗'}`);
}

// Use different models
const models = [
  'gpt-4o-mini',           // OpenAI
  'claude-sonnet-4-20250514', // Anthropic
  'gemini-2.0-flash-exp'   // Gemini
];

for (const model of models) {
  const response = await aiCore.sendTextRequest(
    model,
    [{ role: 'user', content: 'Hello!' }],
    { maxTokens: 50 },
    'test-app'
  );
  
  console.log(`${model}:`, AICore.extractContent(response));
}
```

## Common Patterns

### Pattern 1: Check Configuration Before Use

```typescript
const aiCore = AICore.getInstance();

if (!aiCore.isConfigured()) {
  // Show configuration prompt
  return <ConfigurationPrompt />;
}

// Proceed with AI operations
```

### Pattern 2: Handle Errors Gracefully

```typescript
try {
  const response = await aiCore.sendTextRequest(model, messages);
  return AICore.extractContent(response);
} catch (error) {
  if (error.message.includes('not configured')) {
    // Show API key prompt
  } else if (error.message.includes('rate limit')) {
    // Show rate limit message
  } else {
    // Show generic error
  }
}
```

### Pattern 3: Track Usage by Feature

```typescript
// Different features use different app IDs
const generateArticle = async (prompt: string) => {
  return await aiCore.sendTextRequest(
    'gpt-4o',
    [{ role: 'user', content: prompt }],
    { maxTokens: 2000 },
    'article-generator' // Specific app ID
  );
};

const generateSummary = async (text: string) => {
  return await aiCore.sendTextRequest(
    'gpt-4o-mini',
    [{ role: 'user', content: `Summarise: ${text}` }],
    { maxTokens: 200 },
    'summariser' // Different app ID
  );
};

// Later, view usage by feature
const stats = aiCore.getStats();
console.log('Article generation cost:', stats.byApp['article-generator']?.cost);
console.log('Summarisation cost:', stats.byApp['summariser']?.cost);
```

### Pattern 4: Model Selection Based on Task

```typescript
const selectModel = (taskType: string) => {
  switch (taskType) {
    case 'simple':
      return 'gpt-4o-mini'; // Fast and cheap
    case 'complex':
      return 'gpt-4o'; // More capable
    case 'creative':
      return 'claude-sonnet-4-20250514'; // Good for creative tasks
    default:
      return 'gpt-4o-mini';
  }
};

const response = await aiCore.sendTextRequest(
  selectModel('complex'),
  messages,
  options,
  'my-app'
);
```

## Next Steps

1. **Build Admin Interface**
   - Create UI for managing API keys
   - Add provider configuration
   - Show usage statistics

2. **Migrate Existing Tools**
   - Update Article Smasher
   - Update Task Smasher
   - Remove duplicate code

3. **Add Advanced Features**
   - Streaming responses
   - Image generation
   - Prompt library
   - Rate limiting

## Troubleshooting

### Issue: "Provider not configured"
**Solution:** Set the API key for the provider
```typescript
aiCore.setApiKey('openai', 'your-api-key');
```

### Issue: "Unknown model"
**Solution:** Check if the model name is correct
```typescript
const models = aiCore.getAllModels();
console.log('Available models:', models);
```

### Issue: Settings not persisting
**Solution:** Check localStorage is enabled
```typescript
console.log('Settings:', aiCore.getSettings());
```

### Issue: High costs
**Solution:** Check usage statistics
```typescript
const stats = aiCore.getStats();
console.log('Cost by model:', stats.byModel);
// Consider using cheaper models for simple tasks
```

## Resources

- **Full Documentation**: See README.md
- **Usage Examples**: See USAGE_EXAMPLES.md
- **Migration Guide**: See MIGRATION_GUIDE.md
- **Implementation Details**: See IMPLEMENTATION_SUMMARY.md

## Support

If you need help:
1. Check the documentation files
2. Review the code examples
3. Test AI-Core independently
4. Check browser console for errors
5. Verify API keys are valid

## Tips

- Start with `gpt-4o-mini` for testing (cheaper)
- Use specific app IDs for better usage tracking
- Test API keys before using in production
- Monitor usage statistics regularly
- Use appropriate models for different tasks
- Handle errors gracefully
- Cache responses when possible

