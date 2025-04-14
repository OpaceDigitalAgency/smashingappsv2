import { ToolConfig } from '../shared/types';
import { CheckSquare } from 'lucide-react';

// Import tool configurations
import taskSmasherConfig from './task-smasher/config.ts';
import articleSmasherConfig from './article-smasher/config.ts';

// Tool registry
const toolRegistry: Record<string, ToolConfig> = {
  'task-smasher': taskSmasherConfig,
  'article-smasher': articleSmasherConfig
  // Add more tools here as they are created
};

/**
 * Get a tool configuration by ID
 * 
 * @param toolId The tool ID
 * @returns The tool configuration, or undefined if not found
 */
export const getToolConfig = (toolId: string): ToolConfig | undefined => {
  return toolRegistry[toolId];
};

/**
 * Get all tool configurations
 * 
 * @returns An array of all tool configurations
 */
export const getAllTools = (): ToolConfig[] => {
  return Object.values(toolRegistry);
};

/**
 * Get a tool configuration by route
 * 
 * @param route The route to match
 * @returns The tool configuration, or undefined if not found
 */
export const getToolByRoute = (route: string): ToolConfig | undefined => {
  return Object.values(toolRegistry).find(tool => {
    if (route === tool.routes.base || route === `${tool.routes.base}/`) {
      return true;
    }
    
    if (tool.routes.subRoutes) {
      return Object.values(tool.routes.subRoutes).some(
        subRoute => route === subRoute || route === `${subRoute}/`
      );
    }
    
    return false;
  });
};

export default toolRegistry;