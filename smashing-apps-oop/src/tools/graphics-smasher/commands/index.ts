export { CommandRegistry } from './CommandRegistry';
export { HistoryManager } from '../history/HistoryManager';
export * from './types';
export * from './implementations';

import { CommandRegistry } from './CommandRegistry';
import { allCommands } from './implementations';

/**
 * Initialize the command registry with all commands
 * Call this once on app startup
 */
export function initializeCommandRegistry(): void {
  CommandRegistry.registerMany(allCommands);
}

