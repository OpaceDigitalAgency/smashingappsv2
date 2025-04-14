# TaskSmasher

TaskSmasher is an AI-powered task management tool that helps users break down complex tasks into manageable subtasks. It's part of the SmashingApps.ai platform.

## Features

- ✅ AI-powered task breakdown for various use cases
- 🔄 Drag-and-drop interface for organizing tasks
- 📋 Multiple specialized use cases (Daily Organizer, Goal Planner, etc.)
- 📱 Responsive design for desktop and mobile
- 📊 Export capabilities for tasks and subtasks
- 🔒 Rate limiting to prevent API abuse

## Use Cases

TaskSmasher supports multiple specialized use cases, each with its own optimized AI prompt:

- **Daily Organizer**: Break down daily tasks and routines
- **Goal Planner**: Plan and track long-term goals
- **Marketing Tasks**: Organize marketing campaigns and activities
- **Recipe Steps**: Break down recipes into clear steps
- **Home Chores**: Organize household tasks and chores
- **Trip Planner**: Plan and organize trips
- **Study Plan**: Create study plans and schedules
- **Event Planning**: Plan and organize events
- **Freelancer Projects**: Manage freelance projects and deliverables
- **Shopping Tasks**: Create and organize shopping lists
- **DIY Projects**: Plan and organize DIY projects
- **Creative Projects**: Organize creative projects and ideas

## Architecture

TaskSmasher is built on the shared architecture of the SmashingApps.ai platform. For detailed information about the architecture, shared component library, and tool configuration system, please refer to the [main README](../../README.md).

## Configuration

TaskSmasher is configured using the tool configuration system. The configuration is defined in `src/tools/task-smasher/config.ts`.

### Key Configuration Options

```typescript
const taskSmasherConfig: ToolConfig = {
  id: 'task-smasher',
  name: 'TaskSmasher',
  description: 'AI-powered task management and breakdown',
  icon: CheckSquare,
  routes: {
    base: '/tools/task-smasher',
    subRoutes: {
      daily: '/tools/task-smasher/daily-organizer',
      goals: '/tools/task-smasher/goal-planner',
      // Other sub-routes...
    }
  },
  capabilities: {
    ai: {
      enabled: true,
      defaultModel: 'gpt-3.5-turbo',
      availableModels: ['gpt-3.5-turbo', 'gpt-4'],
      systemPromptTemplate: 'You are an AI assistant that helps break down tasks into manageable subtasks. {{useCase}}'
    },
    // Other capabilities...
  },
  useCases: {
    daily: {
      id: 'daily',
      label: 'Daily Organizer',
      description: 'Organize your daily tasks and routines',
      promptTemplate: 'Break down this daily task into subtasks: {{task}}'
    },
    // Other use cases...
  },
  defaultUseCase: 'daily',
  metaTags: {
    title: 'TaskSmasher | Free AI Task Planner & Magic To-Do Lists',
    description: 'AI-powered task management that breaks down complex tasks into simple, actionable steps',
    ogImage: 'https://smashingapps.ai/og/task-smasher.png'
  }
};
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

The app will be available at http://localhost:5173/tools/task-smasher

## API Integration

TaskSmasher uses the OpenAI API through a secure proxy implemented with Netlify Functions. The proxy includes rate limiting to prevent abuse.

### OpenAI Proxy

The OpenAI proxy is implemented in `netlify/functions/openai-proxy.ts`. It provides:

- Secure handling of API keys (never exposed to the client)
- Rate limiting (configurable requests per IP per hour)
- Error handling and validation
- Response headers with rate limit information

### Rate Limiting

The proxy implements rate limiting of requests per IP address per hour. Rate limit information is returned in the response headers:

- `X-RateLimit-Limit`: Maximum number of requests allowed per hour
- `X-RateLimit-Remaining`: Number of requests remaining in the current window
- `X-RateLimit-Reset`: ISO timestamp when the rate limit will reset

### Client-Side Integration

The client-side integration is handled through the shared AI service. This service is used by the TaskSmasher app to make requests to the OpenAI API through the proxy.

## Customization

### Modifying Use Cases

To add or modify use cases:

1. Edit the `useCases` object in `src/tools/task-smasher/config.ts`
2. Add or modify the use case definition, including:
   - `id`: Unique identifier for the use case
   - `label`: Display name for the use case
   - `description`: Brief description of the use case
   - `promptTemplate`: Template for the AI prompt

### Modifying AI Settings

To modify AI settings:

1. Edit the `capabilities.ai` object in `src/tools/task-smasher/config.ts`
2. Adjust settings like:
   - `defaultModel`: Default AI model to use
   - `availableModels`: List of available AI models
   - `systemPromptTemplate`: Template for the system prompt

## Security Considerations

- API keys are stored securely as environment variables and never exposed to the client
- All requests are validated before being forwarded to OpenAI
- Rate limiting helps prevent abuse and excessive costs