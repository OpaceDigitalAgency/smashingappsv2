import { ToolConfig } from '../../shared/types';
import { CheckSquare, Calendar, Target, ShoppingCart, Home, Plane, Book, PartyPopper, Briefcase, List, Wrench, Palette } from 'lucide-react';

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
      marketing: '/tools/task-smasher/marketing-tasks',
      recipe: '/tools/task-smasher/recipe-steps',
      home: '/tools/task-smasher/home-chores',
      travel: '/tools/task-smasher/trip-planner',
      study: '/tools/task-smasher/study-plan',
      events: '/tools/task-smasher/event-planning',
      freelance: '/tools/task-smasher/freelancer-projects',
      shopping: '/tools/task-smasher/shopping-tasks',
      diy: '/tools/task-smasher/diy-projects',
      creative: '/tools/task-smasher/creative-projects'
    }
  },
  capabilities: {
    ai: {
      enabled: true,
      defaultModel: 'gpt-3.5-turbo',
      availableModels: ['gpt-3.5-turbo', 'gpt-4'],
      systemPromptTemplate: 'You are an AI assistant that helps break down tasks into manageable subtasks. {{useCase}}'
    },
    export: {
      enabled: true,
      formats: ['pdf', 'excel']
    },
    voice: {
      enabled: true
    },
    dragDrop: {
      enabled: true
    },
    rateLimit: {
      enabled: true,
      defaultLimit: 60
    }
  },
  useCases: {
    daily: {
      id: 'daily',
      label: 'Daily Organizer',
      description: 'Organize your daily tasks and routines',
      icon: Calendar,
      promptTemplate: 'Break down this daily task into subtasks: {{task}}'
    },
    goals: {
      id: 'goals',
      label: 'Goal Planner',
      description: 'Plan and track your long-term goals',
      icon: Target,
      promptTemplate: 'Break down this goal into actionable steps: {{task}}'
    },
    marketing: {
      id: 'marketing',
      label: 'Marketing Tasks',
      description: 'Organize marketing campaigns and activities',
      icon: Target,
      promptTemplate: 'Break down this marketing task into subtasks: {{task}}'
    },
    recipe: {
      id: 'recipe',
      label: 'Recipe Steps',
      description: 'Break down recipes into clear steps',
      icon: List,
      promptTemplate: 'Break down this recipe into detailed steps: {{task}}'
    },
    home: {
      id: 'home',
      label: 'Home Chores',
      description: 'Organize household tasks and chores',
      icon: Home,
      promptTemplate: 'Break down this household task into subtasks: {{task}}'
    },
    travel: {
      id: 'travel',
      label: 'Trip Planner',
      description: 'Plan and organize your trips',
      icon: Plane,
      promptTemplate: 'Break down this trip planning task into subtasks: {{task}}'
    },
    study: {
      id: 'study',
      label: 'Study Plan',
      description: 'Create study plans and schedules',
      icon: Book,
      promptTemplate: 'Break down this study topic into learning steps: {{task}}'
    },
    events: {
      id: 'events',
      label: 'Event Planning',
      description: 'Plan and organize events',
      icon: PartyPopper,
      promptTemplate: 'Break down this event planning task into subtasks: {{task}}'
    },
    freelance: {
      id: 'freelance',
      label: 'Freelancer Projects',
      description: 'Manage freelance projects and deliverables',
      icon: Briefcase,
      promptTemplate: 'Break down this freelance project into subtasks: {{task}}'
    },
    shopping: {
      id: 'shopping',
      label: 'Shopping Tasks',
      description: 'Create and organize shopping lists',
      icon: ShoppingCart,
      promptTemplate: 'Break down this shopping task into subtasks: {{task}}'
    },
    diy: {
      id: 'diy',
      label: 'DIY Projects',
      description: 'Plan and organize DIY projects',
      icon: Wrench,
      promptTemplate: 'Break down this DIY project into steps: {{task}}'
    },
    creative: {
      id: 'creative',
      label: 'Creative Projects',
      description: 'Organize creative projects and ideas',
      icon: Palette,
      promptTemplate: 'Break down this creative project into steps: {{task}}'
    }
  },
  defaultUseCase: 'daily',
  // NOTE: The metaTags section below is kept for backward compatibility and reference.
  // For SEO purposes, the centralized seoMaster.ts file is now the single source of truth.
  // Any changes to SEO should be made in src/utils/seoMaster.ts instead of here.
  metaTags: {
    title: 'TaskSmasher | Free AI Task Planner & Magic To-Do Lists',
    description: 'AI-powered task management that breaks down complex tasks into simple, actionable steps',
    ogImage: 'https://smashingapps.ai/og/task-smasher.png'
  }
};

export default taskSmasherConfig;