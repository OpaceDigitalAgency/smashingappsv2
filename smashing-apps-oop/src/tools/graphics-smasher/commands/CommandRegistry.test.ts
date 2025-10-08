import { describe, it, expect, beforeEach } from 'vitest';
import { CommandRegistry } from './CommandRegistry';
import type { Command } from './types';

describe('CommandRegistry', () => {
  beforeEach(() => {
    // Clear all commands before each test
    CommandRegistry['commands'].clear();
  });

  describe('register', () => {
    it('should register a command', () => {
      const command: Command = {
        id: 'test.command',
        label: 'Test Command',
        category: 'test',
        run: () => {}
      };

      CommandRegistry.register(command);
      const registered = CommandRegistry.get('test.command');

      expect(registered).toBeDefined();
      expect(registered?.id).toBe('test.command');
      expect(registered?.label).toBe('Test Command');
    });

    it('should not register duplicate commands', () => {
      const command: Command = {
        id: 'test.duplicate',
        label: 'Test Duplicate',
        category: 'test',
        run: () => {}
      };

      CommandRegistry.register(command);
      CommandRegistry.register(command);

      const all = CommandRegistry.getAll();
      const duplicates = all.filter(c => c.id === 'test.duplicate');
      expect(duplicates.length).toBe(1);
    });
  });

  describe('registerMany', () => {
    it('should register multiple commands', () => {
      const commands: Command[] = [
        {
          id: 'test.command1',
          label: 'Test Command 1',
          category: 'test',
          run: () => {}
        },
        {
          id: 'test.command2',
          label: 'Test Command 2',
          category: 'test',
          run: () => {}
        }
      ];

      CommandRegistry.registerMany(commands);

      expect(CommandRegistry.get('test.command1')).toBeDefined();
      expect(CommandRegistry.get('test.command2')).toBeDefined();
    });
  });

  describe('execute', () => {
    it('should execute a registered command', () => {
      let executed = false;
      const command: Command = {
        id: 'test.execute',
        label: 'Test Execute',
        category: 'test',
        run: () => {
          executed = true;
        }
      };

      CommandRegistry.register(command);
      CommandRegistry.execute('test.execute');

      expect(executed).toBe(true);
    });

    it('should pass context to command', () => {
      let receivedContext: any = null;
      const command: Command = {
        id: 'test.context',
        label: 'Test Context',
        category: 'test',
        run: (context) => {
          receivedContext = context;
        }
      };

      const testContext = {
        documentId: 'doc-123',
        activeLayerId: 'layer-456',
        hasSelection: true
      };

      CommandRegistry.register(command);
      CommandRegistry.execute('test.context', testContext);

      expect(receivedContext).toEqual(testContext);
    });

    it('should not execute if command is disabled', () => {
      let executed = false;
      const command: Command = {
        id: 'test.disabled',
        label: 'Test Disabled',
        category: 'test',
        run: () => {
          executed = true;
        },
        isEnabled: () => false
      };

      CommandRegistry.register(command);
      CommandRegistry.execute('test.disabled');

      expect(executed).toBe(false);
    });

    it('should execute if command is enabled', () => {
      let executed = false;
      const command: Command = {
        id: 'test.enabled',
        label: 'Test Enabled',
        category: 'test',
        run: () => {
          executed = true;
        },
        isEnabled: () => true
      };

      CommandRegistry.register(command);
      CommandRegistry.execute('test.enabled');

      expect(executed).toBe(true);
    });

    it('should handle non-existent commands gracefully', () => {
      expect(() => {
        CommandRegistry.execute('non.existent');
      }).not.toThrow();
    });
  });

  describe('get', () => {
    it('should return undefined for non-existent command', () => {
      const command = CommandRegistry.get('non.existent');
      expect(command).toBeUndefined();
    });

    it('should return registered command', () => {
      const command: Command = {
        id: 'test.get',
        label: 'Test Get',
        category: 'test',
        run: () => {}
      };

      CommandRegistry.register(command);
      const retrieved = CommandRegistry.get('test.get');

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe('test.get');
    });
  });

  describe('getAll', () => {
    it('should return empty array when no commands registered', () => {
      const all = CommandRegistry.getAll();
      expect(all).toEqual([]);
    });

    it('should return all registered commands', () => {
      const commands: Command[] = [
        {
          id: 'test.all1',
          label: 'Test All 1',
          category: 'test',
          run: () => {}
        },
        {
          id: 'test.all2',
          label: 'Test All 2',
          category: 'test',
          run: () => {}
        },
        {
          id: 'test.all3',
          label: 'Test All 3',
          category: 'test',
          run: () => {}
        }
      ];

      CommandRegistry.registerMany(commands);
      const all = CommandRegistry.getAll();

      expect(all.length).toBe(3);
      expect(all.map(c => c.id)).toContain('test.all1');
      expect(all.map(c => c.id)).toContain('test.all2');
      expect(all.map(c => c.id)).toContain('test.all3');
    });
  });

  describe('getByCategory', () => {
    it('should return commands by category', () => {
      const commands: Command[] = [
        {
          id: 'file.new',
          label: 'New',
          category: 'file',
          run: () => {}
        },
        {
          id: 'file.open',
          label: 'Open',
          category: 'file',
          run: () => {}
        },
        {
          id: 'edit.undo',
          label: 'Undo',
          category: 'edit',
          run: () => {}
        }
      ];

      CommandRegistry.registerMany(commands);
      const fileCommands = CommandRegistry.getByCategory('file');

      expect(fileCommands.length).toBe(2);
      expect(fileCommands.map(c => c.id)).toContain('file.new');
      expect(fileCommands.map(c => c.id)).toContain('file.open');
      expect(fileCommands.map(c => c.id)).not.toContain('edit.undo');
    });

    it('should return empty array for non-existent category', () => {
      const commands = CommandRegistry.getByCategory('nonexistent');
      expect(commands).toEqual([]);
    });
  });

  describe('isEnabled', () => {
    it('should return true for enabled command', () => {
      const command: Command = {
        id: 'test.enabled',
        label: 'Test Enabled',
        category: 'test',
        run: () => {},
        isEnabled: () => true
      };

      CommandRegistry.register(command);
      const enabled = CommandRegistry.isEnabled('test.enabled');

      expect(enabled).toBe(true);
    });

    it('should return false for disabled command', () => {
      const command: Command = {
        id: 'test.disabled',
        label: 'Test Disabled',
        category: 'test',
        run: () => {},
        isEnabled: () => false
      };

      CommandRegistry.register(command);
      const enabled = CommandRegistry.isEnabled('test.disabled');

      expect(enabled).toBe(false);
    });

    it('should return true for command without isEnabled check', () => {
      const command: Command = {
        id: 'test.default',
        label: 'Test Default',
        category: 'test',
        run: () => {}
      };

      CommandRegistry.register(command);
      const enabled = CommandRegistry.isEnabled('test.default');

      expect(enabled).toBe(true);
    });

    it('should return false for non-existent command', () => {
      const enabled = CommandRegistry.isEnabled('non.existent');
      expect(enabled).toBe(false);
    });
  });
});

