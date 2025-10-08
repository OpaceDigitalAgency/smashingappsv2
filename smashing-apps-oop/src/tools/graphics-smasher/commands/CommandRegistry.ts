import type { Command, CommandId, CommandContext } from './types';
import { useGraphicsStore } from '../state/graphicsStore';

/**
 * Central command registry for all Graphics Smasher actions
 * Provides a single source of truth for commands across toolbar, menus, context menu, and keyboard shortcuts
 */
class CommandRegistryClass {
  private commands: Map<CommandId, Command> = new Map();
  private listeners: Set<() => void> = new Set();

  /**
   * Register a command
   */
  register(command: Command): void {
    this.commands.set(command.id, command);
    this.notifyListeners();
  }

  /**
   * Register multiple commands at once
   */
  registerMany(commands: Command[]): void {
    commands.forEach(cmd => this.commands.set(cmd.id, cmd));
    this.notifyListeners();
  }

  /**
   * Unregister a command
   */
  unregister(id: CommandId): void {
    this.commands.delete(id);
    this.notifyListeners();
  }

  /**
   * Get a command by ID
   */
  get(id: CommandId): Command | undefined {
    return this.commands.get(id);
  }

  /**
   * Get all commands
   */
  getAll(): Command[] {
    return Array.from(this.commands.values());
  }

  /**
   * Get commands by category
   */
  getByCategory(category: Command['category']): Command[] {
    return this.getAll().filter(cmd => cmd.category === category);
  }

  /**
   * Get current command context from store
   */
  getContext(): CommandContext {
    const state = useGraphicsStore.getState();
    const activeDocument = state.documents.find(d => d.id === state.activeDocumentId);
    
    return {
      documentId: state.activeDocumentId,
      activeLayerId: activeDocument?.activeLayerId ?? null,
      hasSelection: state.selection !== null,
      hasClipboard: false, // Will be updated by ClipboardService
      canUndo: activeDocument ? activeDocument.history.past.length > 0 : false,
      canRedo: activeDocument ? activeDocument.history.future.length > 0 : false,
      layerCount: activeDocument?.layers.length ?? 0,
      isLayerLocked: activeDocument?.layers.find(l => l.id === activeDocument.activeLayerId)?.locked ?? false,
    };
  }

  /**
   * Check if a command is enabled
   */
  isEnabled(id: CommandId): boolean {
    const command = this.commands.get(id);
    if (!command) return false;
    
    if (!command.isEnabled) return true;
    
    const context = this.getContext();
    return command.isEnabled(context);
  }

  /**
   * Check if a command is visible
   */
  isVisible(id: CommandId): boolean {
    const command = this.commands.get(id);
    if (!command) return false;
    
    if (!command.isVisible) return true;
    
    const context = this.getContext();
    return command.isVisible(context);
  }

  /**
   * Execute a command
   */
  async run(id: CommandId): Promise<void> {
    const command = this.commands.get(id);
    if (!command) {
      console.warn(`Command not found: ${id}`);
      return;
    }

    if (!this.isEnabled(id)) {
      console.warn(`Command is disabled: ${id}`);
      return;
    }

    const context = this.getContext();
    
    try {
      await command.run(context);
    } catch (error) {
      console.error(`Error executing command ${id}:`, error);
      throw error;
    }
  }

  /**
   * Subscribe to command registry changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners of changes
   */
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Clear all commands (useful for testing)
   */
  clear(): void {
    this.commands.clear();
    this.notifyListeners();
  }

  /**
   * Get command by shortcut
   */
  getByShortcut(shortcut: string): Command | undefined {
    return this.getAll().find(cmd => cmd.shortcut === shortcut);
  }

  /**
   * Check if a command exists
   */
  has(id: CommandId): boolean {
    return this.commands.has(id);
  }
}

export const CommandRegistry = new CommandRegistryClass();

