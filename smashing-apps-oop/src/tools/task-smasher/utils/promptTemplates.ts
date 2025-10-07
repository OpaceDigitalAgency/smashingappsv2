import { useCaseDefinitions } from './useCaseDefinitions';

/**
 * TaskSmasher Prompt Template
 * 
 * This interface defines the structure of a prompt template for TaskSmasher.
 * Each template includes system and user prompts for generating subtasks and ideas.
 */
export interface TaskSmasherPromptTemplate {
  id: string;
  category: string;
  label: string;
  description: string;
  // For generating subtasks
  subtaskSystemPrompt: string;
  subtaskUserPromptTemplate: string;
  // For generating ideas
  ideaSystemPrompt: string;
  ideaUserPromptTemplate: string;
  // Settings
  temperature: number;
  maxTokens: number;
  createdAt: Date;
  updatedAt: Date;
}

// Local storage key for TaskSmasher prompts
export const TASKSMASHER_PROMPTS_STORAGE_KEY = 'tasksmasher_prompts';

/**
 * Default prompt templates for each task category
 */
export const DEFAULT_PROMPT_TEMPLATES: TaskSmasherPromptTemplate[] = [
  // Daily Organizer
  {
    id: `prompt-daily-organizer`,
    category: 'daily',
    label: 'Daily Organizer',
    description: 'Prompts for generating daily tasks and organizing daily schedules',
    subtaskSystemPrompt: `You are a productivity expert specializing in daily planning. Break down tasks into specific, actionable subtasks.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Task name", "estimatedTime": 0.5, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this daily task into {{breakdownLevel}} specific, actionable subtasks: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each subtask.',
    ideaSystemPrompt: 'You are a productivity coach specializing in daily planning and organization. Generate practical daily task ideas that help people organize their day effectively.',
    ideaUserPromptTemplate: 'Generate 5 practical daily task ideas for organizing and planning a productive day. Each task should be specific, actionable, and take less than a day to complete. Provide one task per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Goal Planner
  {
    id: `prompt-goal-planner`,
    category: 'goals',
    label: 'Goal Planner',
    description: 'Prompts for breaking down goals into achievable steps',
    subtaskSystemPrompt: `You are a goal-setting and personal development expert. Break down goals into actionable steps with measurable outcomes.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 1, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this goal into {{breakdownLevel}} actionable steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in days), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a goal-setting coach specializing in personal and professional development. Generate inspiring yet achievable goal ideas.',
    ideaUserPromptTemplate: 'Generate 5 meaningful goal ideas that are specific, measurable, achievable, relevant, and time-bound (SMART). Include a mix of personal and professional goals. Provide one goal per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },

  // Marketing Tasks
  {
    id: `prompt-marketing-tasks`,
    category: 'marketing',
    label: 'Marketing Tasks',
    description: 'Prompts for planning and executing marketing campaigns',
    subtaskSystemPrompt: `You are a marketing strategist. Break down marketing tasks into actionable project steps with clear deliverables.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 2, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this marketing task into {{breakdownLevel}} actionable project steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a marketing expert specializing in digital and traditional marketing strategies. Generate effective marketing task ideas for businesses.',
    ideaUserPromptTemplate: 'Generate 5 effective marketing task ideas that can help businesses increase their visibility and engagement. Include a mix of digital and traditional marketing approaches. Provide one task per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Recipe Steps
  {
    id: `prompt-recipe-steps`,
    category: 'recipe',
    label: 'Recipe Steps',
    description: 'Prompts for breaking down recipes into detailed steps',
    subtaskSystemPrompt: `You are a culinary expert. Break down recipes into clear steps with ingredients first, then preparation steps.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 10, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this recipe into {{breakdownLevel}} steps: "{{taskTitle}}"{{taskContext}}. First 1-2 steps should be ingredients lists with measurements. Then preparation/cooking steps. Return ONLY a JSON array with title, estimatedTime (in minutes), and priority for each step.',
    ideaSystemPrompt: 'You are a culinary expert specializing in recipe development. Generate creative and delicious recipe ideas for home cooks.',
    ideaUserPromptTemplate: 'Generate 5 delicious recipe ideas that are suitable for home cooking. Include a variety of cuisines and meal types (breakfast, lunch, dinner, dessert). Provide one recipe title per line.',
    temperature: 0.8,
    maxTokens: 1200,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Home Chores
  {
    id: `prompt-home-chores`,
    category: 'home',
    label: 'Home Chores',
    description: 'Prompts for organizing home maintenance and cleaning tasks',
    subtaskSystemPrompt: `You are a home organization and maintenance expert. Break down home tasks into detailed steps with required materials.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 30, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this home task into {{breakdownLevel}} detailed steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in minutes), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a home organization expert specializing in efficient home maintenance and cleaning. Generate practical home chore ideas.',
    ideaUserPromptTemplate: 'Generate 5 practical home chore ideas that help maintain a clean and organized living space. Include a mix of daily, weekly, and monthly tasks. Provide one chore per line.',
    temperature: 0.6,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Freelancer Projects
  {
    id: `prompt-freelancer-projects`,
    category: 'freelance',
    label: 'Freelancer Projects',
    description: 'Prompts for managing freelance projects and client work',
    subtaskSystemPrompt: `You are a freelance project management expert. Break down freelance projects into clear milestones and deliverables.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 2, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this freelance project into {{breakdownLevel}} specific steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a freelance business consultant specializing in project management and client acquisition. Generate practical freelance project ideas.',
    ideaUserPromptTemplate: 'Generate 5 freelance project ideas that could help a freelancer grow their business and portfolio. Include a variety of project types and complexity levels. Provide one project idea per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Trip Planner
  {
    id: `prompt-trip-planner`,
    category: 'travel',
    label: 'Trip Planner',
    description: 'Prompts for planning and organizing travel itineraries',
    subtaskSystemPrompt: `You are a travel planning expert. Break down travel plans into detailed preparation and itinerary steps.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 2, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this travel plan into {{breakdownLevel}} detailed steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours or days), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a travel consultant specializing in trip planning and itinerary development. Generate inspiring travel planning ideas.',
    ideaUserPromptTemplate: 'Generate 5 travel planning task ideas that would help someone organize a successful trip. Include pre-trip preparation, booking considerations, and on-trip organization. Provide one task per line.',
    temperature: 0.8,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Shopping Tasks
  {
    id: `prompt-shopping-tasks`,
    category: 'shopping',
    label: 'Shopping Tasks',
    description: 'Prompts for organizing shopping lists and purchase planning',
    subtaskSystemPrompt: `You are a shopping and budgeting expert. Break down shopping tasks into organized categories and specific items.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Item or category", "estimatedTime": 1, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this shopping task into {{breakdownLevel}} organized steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a shopping and consumer expert specializing in efficient purchasing and budgeting. Generate practical shopping task ideas.',
    ideaUserPromptTemplate: 'Generate 5 practical shopping task ideas that help people organize their purchases efficiently and stay within budget. Include different types of shopping (groceries, clothing, gifts, etc.). Provide one task per line.',
    temperature: 0.6,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Study Plan
  {
    id: `prompt-study-plan`,
    category: 'study',
    label: 'Study Plan',
    description: 'Prompts for organizing study sessions and learning materials',
    subtaskSystemPrompt: `You are an educational expert. Break down study plans into focused learning sessions with specific objectives.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Session name", "estimatedTime": 2, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this study plan into {{breakdownLevel}} focused learning sessions: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each session.',
    ideaSystemPrompt: 'You are an educational consultant specializing in effective study techniques and learning strategies. Generate practical study task ideas.',
    ideaUserPromptTemplate: 'Generate 5 effective study task ideas that help students learn efficiently and retain information. Include different study approaches and techniques. Provide one task per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Event Planning
  {
    id: `prompt-event-planning`,
    category: 'events',
    label: 'Event Planning',
    description: 'Prompts for organizing and managing events',
    subtaskSystemPrompt: `You are an event planning expert. Break down event planning tasks into detailed action items.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 3, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this event planning task into {{breakdownLevel}} detailed steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours or days), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are an event planning consultant specializing in organizing successful gatherings of all sizes. Generate practical event planning task ideas.',
    ideaUserPromptTemplate: 'Generate 5 essential event planning task ideas that help ensure a successful event. Include pre-event preparation, day-of coordination, and post-event follow-up. Provide one task per line.',
    temperature: 0.7,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // DIY Projects
  {
    id: `prompt-diy-projects`,
    category: 'diy',
    label: 'DIY Projects',
    description: 'Prompts for breaking down DIY and craft projects',
    subtaskSystemPrompt: `You are a DIY and crafting expert. Break down DIY projects into clear, sequential steps.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Step name", "estimatedTime": 2, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this DIY project into {{breakdownLevel}} clear steps: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each step.',
    ideaSystemPrompt: 'You are a DIY and crafting consultant specializing in creative home projects. Generate inspiring DIY project ideas.',
    ideaUserPromptTemplate: 'Generate 5 creative DIY project ideas that people can make at home. Include a variety of difficulty levels and project types (decor, functional items, gifts, etc.). Provide one project idea per line.',
    temperature: 0.8,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Creative Projects
  {
    id: `prompt-creative-projects`,
    category: 'creative',
    label: 'Creative Projects',
    description: 'Prompts for organizing creative and artistic endeavors',
    subtaskSystemPrompt: `You are a creative project management expert. Break down creative projects into structured phases while maintaining artistic freedom.

CRITICAL: Respond ONLY with a valid JSON array. NO other text, explanations, or markdown formatting.
Format: [{"title": "Phase name", "estimatedTime": 3, "priority": "low|medium|high"}]`,
    subtaskUserPromptTemplate: 'Break down this creative project into {{breakdownLevel}} structured phases: "{{taskTitle}}"{{taskContext}}. Return ONLY a JSON array with title, estimatedTime (in hours), and priority (low/medium/high) for each phase.',
    ideaSystemPrompt: 'You are a creative consultant specializing in artistic expression and creative project development. Generate inspiring creative project ideas.',
    ideaUserPromptTemplate: 'Generate 5 inspiring creative project ideas across different artistic mediums (writing, visual arts, music, etc.). Include projects of varying complexity and time commitment. Provide one project idea per line.',
    temperature: 0.9,
    maxTokens: 1000,
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

/**
 * Loads TaskSmasher prompts from local storage or initializes with defaults
 */
export const loadTaskSmasherPrompts = (): TaskSmasherPromptTemplate[] => {
  try {
    const storedPrompts = localStorage.getItem(TASKSMASHER_PROMPTS_STORAGE_KEY);
    if (storedPrompts) {
      const parsedPrompts = JSON.parse(storedPrompts);
      // Convert string dates back to Date objects
      return parsedPrompts.map((prompt: any) => ({
        ...prompt,
        createdAt: new Date(prompt.createdAt),
        updatedAt: new Date(prompt.updatedAt)
      }));
    }
    // Initialize with defaults if no stored prompts
    saveTaskSmasherPrompts(DEFAULT_PROMPT_TEMPLATES);
    return DEFAULT_PROMPT_TEMPLATES;
  } catch (error) {
    console.error('Error loading TaskSmasher prompts:', error);
    return DEFAULT_PROMPT_TEMPLATES;
  }
};

/**
 * Saves TaskSmasher prompts to local storage
 */
export const saveTaskSmasherPrompts = (prompts: TaskSmasherPromptTemplate[]): void => {
  try {
    localStorage.setItem(TASKSMASHER_PROMPTS_STORAGE_KEY, JSON.stringify(prompts));
  } catch (error) {
    console.error('Error saving TaskSmasher prompts:', error);
  }
};

/**
 * Gets a prompt template for a specific category
 */
export const getPromptTemplateForCategory = (category: string): TaskSmasherPromptTemplate | undefined => {
  const prompts = loadTaskSmasherPrompts();
  return prompts.find(p => p.category === category);
};

/**
 * Updates an existing prompt template
 */
export const updateTaskSmasherPrompt = (id: string, promptUpdate: Partial<TaskSmasherPromptTemplate>): TaskSmasherPromptTemplate | null => {
  const prompts = loadTaskSmasherPrompts();
  const index = prompts.findIndex(p => p.id === id);
  
  if (index === -1) {
    return null;
  }
  
  const updatedPrompt = {
    ...prompts[index],
    ...promptUpdate,
    updatedAt: new Date()
  };
  
  prompts[index] = updatedPrompt;
  saveTaskSmasherPrompts(prompts);
  return updatedPrompt;
};

/**
 * Processes a prompt template by replacing variables
 */
export const processPromptTemplate = (
  template: string, 
  variables: Record<string, string>
): string => {
  let processedTemplate = template;
  
  // Replace all variables in the format {{variableName}}
  Object.entries(variables).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    processedTemplate = processedTemplate.replace(regex, value);
  });
  
  return processedTemplate;
};