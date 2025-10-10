# AI Response Formatting System

## Overview

The Article Smasher tool now includes a robust response formatting system that handles the varying output formats from different AI models. This system ensures consistent parsing and display of AI-generated content regardless of which model is used.

## Problem Statement

Different AI models interpret prompts and format their responses differently:

### GPT-5 Issues
- Returns results as a single continuous string with `\n` escape sequences
- Example: `"- Topic 1\n- Topic 2\n- Topic 3"`
- Doesn't separate items into new lines visually

### GPT-5-nano Issues
- Sometimes echoes the prompt in the response
- Example: `"Here are 5 SEO-friendly, breaking..."`
- Returns partial prompt text instead of actual results

### GPT-4o-mini Issues
- Includes conversational preambles
- Example: `"Certainly! Here are 5 engaging and SEO-friendly blog post topic ideas..."`
- Mixes formatting with unnecessary text

### O-series, GPT-4, GPT-4.1 Models
- Generally work well but may include:
  - Markdown formatting (`**bold**`, `*italic*`)
  - Various bullet styles (`-`, `*`, `•`)
  - Numbered lists with different formats (`1.`, `1)`)

## Solution: Response Formatter Utility

Located at: `src/tools/article-smasher/utils/responseFormatter.ts`

### Core Functions

#### 1. `cleanAIResponse(text: string): string`

Removes common artifacts from AI responses:
- Prompt echoes ("Here are...", "Certainly!...", etc.)
- Markdown code blocks
- Excessive whitespace
- Conversational preambles

**Example:**
```typescript
const raw = "Certainly! Here are 5 topics:\n\n1. Topic One\n2. Topic Two";
const cleaned = cleanAIResponse(raw);
// Result: "1. Topic One\n2. Topic Two"
```

#### 2. `parseListFromResponse(text: string, options?): string[]`

Parses various list formats into a clean array:
- Handles numbered lists (1. 2. 3.)
- Handles bullet points (-, *, •)
- Removes markdown formatting
- Removes quotes and extra whitespace
- Filters out section headers

**Options:**
- `maxItems`: Maximum number of items to return (default: 10)
- `minLength`: Minimum character length for valid items (default: 3)
- `removeFormatting`: Whether to strip formatting (default: true)

**Example:**
```typescript
const response = "1. **First Topic**\n2. Second Topic\n- Third Topic";
const topics = parseListFromResponse(response, { maxItems: 5 });
// Result: ["First Topic", "Second Topic", "Third Topic"]
```

#### 3. `parseTopicsFromResponse(text: string, maxTopics?: number): string[]`

Specialized parser for topic generation:
- Removes "Primary keyword:" annotations
- Ensures minimum topic length (10 characters)
- Handles multi-line topics (takes first line only)

**Example:**
```typescript
const response = "1. SEO Guide for 2025\n   Primary keyword: seo guide\n2. Content Marketing Tips";
const topics = parseTopicsFromResponse(response, 5);
// Result: ["SEO Guide for 2025", "Content Marketing Tips"]
```

#### 4. `parseKeywordsFromResponse(text: string): KeywordData[]`

Parses keyword lists with metadata:
- Extracts keyword names
- Parses search volume (High/Medium/Low or numbers)
- Parses difficulty scores
- Parses CPC values

**Example:**
```typescript
const response = `
1. **AI SEO Tools**
   - Search Volume: High
   - Difficulty Score: 6
   - CPC Value: $5.50
2. Content Marketing
   - Search Volume: Medium
`;
const keywords = parseKeywordsFromResponse(response);
// Result: [
//   { keyword: "AI SEO Tools", volume: 1000, difficulty: 6, cpc: 5.50 },
//   { keyword: "Content Marketing", volume: 500, difficulty: 5, cpc: 3.0 }
// ]
```

#### 5. `parseOutlineFromResponse(text: string): OutlineItem[]`

Parses article outlines with hierarchical structure:
- Handles markdown headings (# ## ###)
- Handles numbered outlines (1. A. i.)
- Handles bullet points
- Maintains parent-child relationships

**Example:**
```typescript
const response = `
# Introduction
## Background
## Problem Statement
# Main Content
## Solution Overview
# Conclusion
`;
const outline = parseOutlineFromResponse(response);
// Result: Hierarchical outline structure with proper nesting
```

## Integration Points

### 1. useArticleAI Hook

The main hook (`src/tools/article-smasher/hooks/useArticleAI.ts`) uses these formatters in:

- `generateTopics()` - Uses `parseTopicsFromResponse()`
- `generateKeywords()` - Uses `parseKeywordsFromResponse()`
- `generateOutline()` - Uses `parseOutlineFromResponse()`
- `generateContent()` - Uses `cleanAIResponse()`
- `generateImagePrompts()` - Uses `parseListFromResponse()`

### 2. ArticleAICoreAdapter

The adapter (`src/tools/article-smasher/services/articleAICoreAdapter.ts`) uses the same formatters to ensure consistency across different code paths.

## Supported Response Formats

### Topics/Lists
✅ Numbered: `1. Topic`, `1) Topic`
✅ Bullets: `- Topic`, `* Topic`, `• Topic`
✅ Bold: `**Topic**`, `__Topic__`
✅ Quoted: `"Topic"`, `'Topic'`
✅ Plain lines separated by newlines

### Keywords
✅ Structured with metadata
✅ Simple lists
✅ JSON arrays (fallback)

### Outlines
✅ Markdown headings (`#`, `##`, `###`)
✅ Roman numerals (`I.`, `II.`, `III.`)
✅ Letters (`A.`, `B.`, `a.`, `b.`)
✅ Numbers (`1.`, `2.`, `3.`)
✅ Bullets (`-`, `*`, `•`)

## Testing Different Models

To test the formatting system with different models:

1. Navigate to Article Smasher
2. Select an article type
3. Generate topics using different models:
   - GPT-5
   - GPT-5-nano
   - GPT-4o
   - GPT-4o-mini
   - O3, O1
   - Claude models

The system should handle all formats consistently.

## Debugging

Enable console logging to see parsed results:

```typescript
console.log('[useArticleAI] Generated topics:', topics);
console.log('[useArticleAI] Parsed keywords:', keywords);
console.log('[useArticleAI] Parsed outline:', outline);
```

These logs are already included in the code and will show:
- Raw AI response
- Cleaned response
- Final parsed result

## Future Improvements

Potential enhancements:
1. Add support for more exotic list formats
2. Improve multi-language support
3. Add validation for parsed results
4. Create unit tests for each formatter function
5. Add performance monitoring

## Related Files

- `src/tools/article-smasher/utils/responseFormatter.ts` - Core formatting utilities
- `src/tools/article-smasher/hooks/useArticleAI.ts` - Main hook using formatters
- `src/tools/article-smasher/services/articleAICoreAdapter.ts` - Adapter using formatters
- `core/response/ResponseNormaliser.ts` - Low-level response normalisation
- `AI_PROVIDERS_MODELS.md` - Model-specific documentation

