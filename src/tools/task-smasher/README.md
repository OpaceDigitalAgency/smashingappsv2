# TaskSmasher

TaskSmasher is an AI-powered task management tool that helps users break down complex tasks into manageable subtasks. It's part of the SmashingApps.ai platform.

## Features

- ✅ AI-powered task breakdown for various use cases
- 📋 Multiple task types (Daily Organizer, Goal Planner, Marketing Tasks, and more)
- 🔄 Drag and drop functionality for task organization
- 📊 Export capabilities (PDF, Excel)
- 🎤 Voice input support
- 🎨 Clean, user-friendly interface
- 🔒 Rate limiting to prevent API abuse

## Use Cases

TaskSmasher supports multiple specialized use cases, each with its own optimized AI prompt:

- **Daily Organizer**: Organize your daily tasks and routines
- **Goal Planner**: Plan and track your long-term goals
- **Marketing Tasks**: Organize marketing campaigns and activities
- **Recipe Steps**: Break down recipes into clear steps
- **Home Chores**: Organize household tasks and chores
- **Trip Planner**: Plan and organize your trips
- **Study Plan**: Create study plans and schedules
- **Event Planning**: Plan and organize events
- **Freelancer Projects**: Manage freelance projects and deliverables
- **Shopping Tasks**: Create and organize shopping lists
- **DIY Projects**: Plan and organize DIY projects
- **Creative Projects**: Organize creative projects and ideas

## Architecture

TaskSmasher is built on the shared architecture of the SmashingApps.ai platform. For detailed information about the architecture, shared component library, and tool configuration system, please refer to the [main README](../../../README.md).

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
      // Other routes...
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
      icon: Calendar,
      promptTemplate: 'Break down this daily task into subtasks: {{task}}'
    },
    // Other use cases...
  },
  defaultUseCase: 'daily'
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

## Component Structure

TaskSmasher is built using a component-based architecture:

- **TaskSmasherApp.tsx**: Main component that renders the entire application
- **Board.tsx**: Component for displaying and organizing tasks and subtasks
- **Task.tsx**: Component for displaying and editing individual tasks
- **Subtask.tsx**: Component for displaying and editing individual subtasks
- **Sidebar.tsx**: Navigation component for switching between use cases
- **ModelDropdown.tsx**: Component for selecting the AI model
- **RateLimitPopup.tsx**: Component for displaying rate limit warnings

## API Integration

TaskSmasher uses the OpenAI API through the shared AI service. This service handles:

- Making requests to the OpenAI API through the secure proxy
- Managing rate limiting
- Handling errors and loading states
- Processing and formatting responses

### Usage Example

```typescript
const { execute, isLoading, error } = useAI();

const generateSubtasks = async (task) => {
  try {
    const result = await execute({
      model: selectedModel,
      systemPrompt: systemPrompt,
      userPrompt: prompt,
      temperature: 0.7,
    });
    
    // Update the task with the generated subtasks
    setSubtasks(result.content);
  } catch (error) {
    console.error('Error generating subtasks:', error);
  }
};
```

## SEO Configuration

TaskSmasher uses the centralized SEO system defined in `src/utils/seoMaster.ts`. This system provides:

- Meta tags for the main TaskSmasher page
- Meta tags for each use case page
- Structured data for search engines
- Open Graph tags for social sharing

## Customization

### Modifying Use Cases

To add or modify use cases:

1. Edit the `useCases` object in `src/tools/task-smasher/config.ts`
2. Add or modify the use case definition, including:
   - `id`: Unique identifier for the use case
   - `label`: Display name for the use case
   - `description`: Brief description of the use case
   - `icon`: Icon component from Lucide React
   - `promptTemplate`: Template for the AI prompt

### Modifying AI Settings

To modify AI settings:

1. Edit the `capabilities.ai` object in `src/tools/task-smasher/config.ts`
2. Adjust settings like:
   - `defaultModel`: Default AI model to use
   - `availableModels`: List of available AI models
   - `systemPromptTemplate`: Template for the system prompt

### Adding Export Formats

To add new export formats:

1. Edit the `capabilities.export.formats` array in `src/tools/task-smasher/config.ts`
2. Implement the export functionality in the appropriate component

## Future Enhancements

Planned enhancements for TaskSmasher include:

- Enhanced drag and drop functionality
- Task templates for common scenarios
- Task sharing capabilities
- Integration with calendar systems
- Mobile app version
- Task progress tracking
- Recurring tasks