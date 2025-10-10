# Text Format and Verbosity Implementation

## Overview

This document explains the implementation of OpenAI's text format and verbosity controls in the Smashing Apps Article Smasher. These features are part of OpenAI's updated responses API and allow fine-grained control over how models format and expand their text output.

## What Are Text Format and Verbosity?

### Text Format
The `format: { type: "text" }` parameter tells the model to output natural, human-readable prose instead of structured data, JSON, or other formats. This ensures polished, flowing content suitable for articles and blog posts.

### Verbosity Levels
The `verbosity` parameter controls how detailed and expansive the model's responses are:

- **`low`**: Short, summarised responses. Great for lists, data extraction, or one-liners.
- **`medium`**: Balanced - concise but clear. Default mode for conversational responses.
- **`high`**: Longer, more explanatory output with extra examples, clarifications, and context. Perfect for SEO articles, reports, and detailed content.

## Model Compatibility

Text format and verbosity controls are supported by:
- **GPT-4o** and later GPT-4 models
- **GPT-5** and all GPT-5 variants (gpt-5, gpt-5-mini, gpt-5-nano)
- **O3** and **O4** series models

These controls are **NOT** supported by:
- GPT-3.5-turbo
- GPT-4 (non-4o variants)
- O1 series models (use reasoning effort instead)

## Implementation Details

### 1. Core Interface Changes

**File**: `core/interfaces/IProvider.ts`

Added text format and verbosity to the `RequestOptions` interface:

```typescript
export interface RequestOptions {
  model: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stop?: string[];
  // Text format and verbosity controls (GPT-4o and GPT-5+ only)
  text?: {
    format?: { type: 'text' };
    verbosity?: 'low' | 'medium' | 'high';
  };
}
```

### 2. Prompt Template Type

**File**: `src/tools/article-smasher/types/index.ts`

Added verbosity field to `PromptTemplate`:

```typescript
export interface PromptTemplate {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  userPromptTemplate: string;
  category: 'topic' | 'keyword' | 'outline' | 'content' | 'image';
  temperature: number;
  maxTokens?: number;
  reasoningEffort?: 'low' | 'medium' | 'high'; // For reasoning models
  verbosity?: 'low' | 'medium' | 'high'; // Text verbosity for GPT-4o and GPT-5+
  createdAt: Date;
  updatedAt: Date;
}
```

### 3. OpenAI Provider Updates

**File**: `core/providers/OpenAIProvider.ts`

The provider now:
1. Detects models that support text controls
2. Adds the `text` parameter to API requests when supported
3. Logs verbosity settings for debugging

Key changes:
- Added `supportsTextControls` flag for GPT-4o and GPT-5+ models
- Sends `text.format` and `text.verbosity` to both `/v1/responses` and `/v1/chat/completions` endpoints
- Only applies these controls when the model supports them

### 4. Default Verbosity Settings

**File**: `src/tools/article-smasher/services/promptService.ts`

Each prompt type has been assigned an appropriate default verbosity:

| Prompt Type | Verbosity | Reasoning |
|------------|-----------|-----------|
| **Topic Generator** | `medium` | Balanced output - concise but clear topic ideas |
| **Keyword Researcher** | `high` | Detailed explanations with reasoning, context, and practical value for SEO decisions |
| **Article Outliner** | `medium` | Clear structure without excessive detail |
| **Content Generator** | `high` | Rich, detailed, SEO-optimised content with examples and context |
| **Image Prompt Generator** | `low` | Concise, focused image prompts without extra explanation |

### 5. Hook Integration

**File**: `src/tools/article-smasher/hooks/useArticleAI.ts`

The `useArticleAI` hook now:
1. Accepts `verbosity` as an optional parameter in the `execute` function
2. Checks if the model supports text controls (GPT-4o, GPT-5+, O3, O4)
3. Adds the `text` parameter to requests when both verbosity is provided and the model supports it
4. Passes verbosity from prompt templates to all AI requests

## How Verbosity Affects Each Stage

### Topic Generation (Medium Verbosity)
**Without verbosity:**
```
"10 SEO Article Ideas for Digital Marketing"
```

**With medium verbosity:**
```
"10 SEO Article Ideas for Digital Marketing

Here are 10 engaging topic ideas that balance search volume with user intent..."
```

### Keyword Research (High Verbosity)
**Without verbosity:**
```
Keyword: "content marketing"
Volume: High
Difficulty: 7
CPC: $5.20
```

**With high verbosity:**
```
Keyword: "content marketing"
Volume: High (estimated 50,000+ monthly searches)
Difficulty: 7/10 (moderately competitive - achievable with quality content and backlinks)
CPC: $5.20 (indicates strong commercial intent and advertiser competition)

This keyword is ideal for your H1 and meta title. The high search volume combined with moderate difficulty makes it a prime target for organic traffic. The CPC value suggests this topic has strong monetisation potential.
```

### Content Generation (High Verbosity)
**Without verbosity:**
```
Content marketing is important for businesses. It helps attract customers.
```

**With high verbosity:**
```
Content marketing has become an essential strategy for modern businesses looking to build lasting relationships with their audience. Rather than interrupting potential customers with traditional advertising, content marketing focuses on creating valuable, relevant content that naturally attracts and engages your target market.

According to recent studies, 70% of consumers prefer learning about products through content rather than traditional advertisements. This shift in consumer behaviour has made content marketing not just beneficial, but necessary for businesses of all sizes.
```

### Image Prompts (Low Verbosity)
**Without verbosity:**
```
Here are three image prompts for your article:

1. A professional workspace showing content marketing tools and analytics
2. An infographic illustrating the content marketing funnel
3. A team collaborating on content strategy
```

**With low verbosity:**
```
Professional workspace with laptop displaying content analytics dashboard
Content marketing funnel infographic with stages from awareness to conversion
Marketing team brainstorming around whiteboard with content strategy notes
```

## Response Handling

The text format and verbosity controls **do not change how responses are handled** in the application because:

1. **Normalised Responses**: All responses go through `ResponseNormaliser` which extracts content consistently regardless of verbosity
2. **Text Format**: Setting `format: { type: 'text' }` ensures we always get text output, which is what we already expect
3. **Parsing Logic**: Our existing parsing functions (`parseTopicsFromResponse`, `parseKeywordsFromResponse`, etc.) handle varying levels of detail gracefully

The main difference is in the **quality and richness** of the content, not its structure.

## Usage Examples

### In Prompt Templates
```typescript
{
  name: 'Content Generator',
  category: 'content',
  temperature: 0.7,
  maxTokens: 4000,
  reasoningEffort: 'medium',
  verbosity: 'high', // Rich, detailed content
  // ... other fields
}
```

### In Custom AI Requests
```typescript
const result = await execute({
  model: 'gpt-5',
  systemPrompt: 'You are an SEO expert.',
  userPrompt: 'Analyse this keyword...',
  temperature: 0.7,
  maxTokens: 2000,
  reasoningEffort: 'medium',
  verbosity: 'high' // Detailed analysis with examples
});
```

## Best Practices

1. **Use High Verbosity for Content**: SEO articles, blog posts, and reports benefit from detailed, expansive output
2. **Use Medium Verbosity for Structure**: Outlines, topic ideas, and general responses work well with balanced verbosity
3. **Use Low Verbosity for Data**: Lists, keywords, image prompts, and structured data should be concise
4. **Combine with Reasoning**: For GPT-5 models, use both `reasoningEffort` and `verbosity` together for best results
5. **Model Compatibility**: Always check model compatibility before applying verbosity settings

## Testing

To test verbosity settings:

1. Navigate to Article Smasher
2. Select a GPT-4o or GPT-5 model in settings
3. Generate content at each stage
4. Compare output quality and detail level
5. Check browser console for verbosity logging

## Future Enhancements

Potential improvements:
- User-configurable verbosity per prompt in the UI
- A/B testing different verbosity levels for optimal results
- Verbosity presets for different content types (blog, technical, marketing)
- Analytics on how verbosity affects content quality metrics

## References

- OpenAI Responses API Documentation
- Article Smasher Architecture
- AI-Core Provider System

