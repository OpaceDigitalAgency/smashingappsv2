# SmashingApps.ai - Quick Editing Guide for Non-Coders

This guide provides simple instructions for making common edits to the SmashingApps.ai website without coding knowledge.

## SEO Settings

### Main Website SEO (Homepage)

**File:** `src/utils/metaConfig.cjs` (Lines 12-19)

```javascript
const defaultMetaConfig = {
  title: 'SmashingApps.ai | AI-Powered Productivity Tools',
  description: 'Discover AI-powered micro-apps that help you smash through tasks with smart, focused tools.',
  image: `${BASE_URL}/og/default.png`,
  canonical: BASE_URL,
  robots: 'index, follow',
  keywords: 'AI tools, productivity, task management, AI apps, SmashingApps, AI assistants'
};
```

Simply edit the text between the quotes to change:
- `title`: The page title shown in search results and browser tabs
- `description`: The description shown in search results
- `keywords`: Keywords for search engines (not visible to users)

### TaskSmasher Tool SEO

**File:** `src/utils/metaConfig.cjs` (Lines 41-59)

```javascript
'/tools/task-smasher/': {
  title: 'TaskSmasher – AI Task Planner | Break Down Complex Tasks Easily',
  description: 'Use AI to break down overwhelming tasks into manageable subtasks.',
  image: `${BASE_URL}/og/task-smasher.png`,
  canonical: `${BASE_URL}/tools/task-smasher/`,
  keywords: 'task management, AI task breakdown, AI TO-DO planner, AI Task planner'
}
```

Edit the text between quotes to change the SEO for the TaskSmasher tool page.

### Use Case SEO (Goal Planner, Daily Organizer, etc.)

**File:** `src/utils/metaConfig.cjs` (Lines 77-126)

```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps with our AI Goal Planner."
}
```

Edit the text between quotes to change:
- `label`: The name of the use case shown to users
- `description`: The description shown to users and in search results

## OpenAI API Settings

### API Limits

**File:** `src/tools/task-smasher/utils/openaiService.ts` (Lines 10-20)

Look for lines like:
```javascript
const MAX_API_CALLS = 20;
const MAX_TOKENS = 1000;
```

Change the numbers to adjust:
- `MAX_API_CALLS`: Maximum number of API calls allowed per user
- `MAX_TOKENS`: Maximum tokens (words) allowed per API call

### AI Behavior Settings

**File:** `netlify/functions/openai-proxy.ts` (Around line 50)

Look for lines like:
```javascript
temperature: 0.7,
max_tokens: 1000,
```

Change the numbers to adjust:
- `temperature`: Higher values (0.7-1.0) make responses more creative/random, lower values (0.2-0.5) make them more focused/deterministic
- `max_tokens`: Maximum length of AI responses

## Use Case Prompts

**File:** `src/tools/task-smasher/utils/useCaseDefinitions.ts`

```javascript
goals: {
  label: "Goal Planner",
  description: "Break down long-term objectives into actionable steps",
  prompt: "Break down this goal into achievable subtasks with clear milestones...",
}
```

Edit the text between quotes to change:
- `prompt`: The instructions sent to the AI when generating tasks for this use case
- `description`: The description shown to users
- `label`: The name of the use case shown to users

## Static HTML Content for SEO

**File:** `tools/task-smasher/scripts/generate-static-pages.js` (Lines 100-143)

This file contains the HTML content that search engines see. Look for lines like:
```javascript
.replace(
  /<title>.*?<\/title>/,
  `<title>${definition.label} | AI To-Do Lists & Project Planning | TaskSmasher</title>`
)
```

Edit the text between backticks (`) to change the title, description, and other SEO elements.