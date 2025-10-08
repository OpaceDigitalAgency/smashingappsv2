import type { HistoryCommand, HistoryState } from './types';
import { createId } from '../utils/id';

/**
 * History Manager implementing the Command pattern for undo/redo
 * Every mutating command registers a do/undo pair
 */
class HistoryManagerClass {
  private histories: Map<string, HistoryState> = new Map();
  private readonly DEFAULT_MAX_SIZE = 60;

  /**
   * Initialize history for a document
   */
  initialize(documentId: string, maxSize: number = this.DEFAULT_MAX_SIZE): void {
    this.histories.set(documentId, {
      past: [],
      future: [],
      maxSize
    });
  }

  /**
   * Execute a command and add it to history
   */
  async execute(documentId: string, command: Omit<HistoryCommand, 'id' | 'timestamp'>): Promise<void> {
    const history = this.histories.get(documentId);
    if (!history) {
      console.warn(`No history initialized for document ${documentId}`);
      return;
    }

    const fullCommand: HistoryCommand = {
      id: createId(),
      timestamp: Date.now(),
      ...command
    };

    try {
      // Execute the command
      await fullCommand.do();

      // Add to history
      history.past.push(fullCommand);
      
      // Clear future (can't redo after new action)
      history.future = [];

      // Trim history if needed
      if (history.past.length > history.maxSize) {
        history.past.shift();
      }
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  /**
   * Undo the last command
   */
  async undo(documentId: string): Promise<boolean> {
    const history = this.histories.get(documentId);
    if (!history || history.past.length === 0) {
      return false;
    }

    const command = history.past.pop()!;
    
    try {
      await command.undo();
      history.future.push(command);
      return true;
    } catch (error) {
      console.error('Error undoing command:', error);
      // Put command back if undo failed
      history.past.push(command);
      throw error;
    }
  }

  /**
   * Redo the last undone command
   */
  async redo(documentId: string): Promise<boolean> {
    const history = this.histories.get(documentId);
    if (!history || history.future.length === 0) {
      return false;
    }

    const command = history.future.pop()!;
    
    try {
      await command.do();
      history.past.push(command);
      return true;
    } catch (error) {
      console.error('Error redoing command:', error);
      // Put command back if redo failed
      history.future.push(command);
      throw error;
    }
  }

  /**
   * Check if undo is available
   */
  canUndo(documentId: string): boolean {
    const history = this.histories.get(documentId);
    return history ? history.past.length > 0 : false;
  }

  /**
   * Check if redo is available
   */
  canRedo(documentId: string): boolean {
    const history = this.histories.get(documentId);
    return history ? history.future.length > 0 : false;
  }

  /**
   * Get history state for a document
   */
  getState(documentId: string): HistoryState | undefined {
    return this.histories.get(documentId);
  }

  /**
   * Clear history for a document
   */
  clear(documentId: string): void {
    const history = this.histories.get(documentId);
    if (history) {
      history.past = [];
      history.future = [];
    }
  }

  /**
   * Remove history for a document (when document is closed)
   */
  remove(documentId: string): void {
    this.histories.delete(documentId);
  }

  /**
   * Get the last command name (for display)
   */
  getLastCommandName(documentId: string): string | null {
    const history = this.histories.get(documentId);
    if (!history || history.past.length === 0) {
      return null;
    }
    return history.past[history.past.length - 1].name;
  }

  /**
   * Get the next redo command name (for display)
   */
  getNextRedoCommandName(documentId: string): string | null {
    const history = this.histories.get(documentId);
    if (!history || history.future.length === 0) {
      return null;
    }
    return history.future[history.future.length - 1].name;
  }

  /**
   * Get all past command names (for history panel)
   */
  getPastCommands(documentId: string): string[] {
    const history = this.histories.get(documentId);
    if (!history) return [];
    return history.past.map(cmd => cmd.name);
  }

  /**
   * Get all future command names (for history panel)
   */
  getFutureCommands(documentId: string): string[] {
    const history = this.histories.get(documentId);
    if (!history) return [];
    return history.future.map(cmd => cmd.name);
  }

  /**
   * Undo multiple steps at once
   */
  async undoMultiple(documentId: string, count: number): Promise<number> {
    let undone = 0;
    for (let i = 0; i < count; i++) {
      const success = await this.undo(documentId);
      if (!success) break;
      undone++;
    }
    return undone;
  }

  /**
   * Redo multiple steps at once
   */
  async redoMultiple(documentId: string, count: number): Promise<number> {
    let redone = 0;
    for (let i = 0; i < count; i++) {
      const success = await this.redo(documentId);
      if (!success) break;
      redone++;
    }
    return redone;
  }
}

export const HistoryManager = new HistoryManagerClass();

