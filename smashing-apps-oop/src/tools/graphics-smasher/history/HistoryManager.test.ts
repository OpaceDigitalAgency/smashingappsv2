import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from './HistoryManager';
import type { HistoryEntry } from './types';

describe('HistoryManager', () => {
  let manager: HistoryManager;

  beforeEach(() => {
    manager = new HistoryManager();
  });

  describe('push', () => {
    it('should add entry to history', () => {
      const entry: HistoryEntry = {
        description: 'Test Action',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      const state = manager.getState();

      expect(state.past.length).toBe(1);
      expect(state.past[0].description).toBe('Test Action');
      expect(state.future.length).toBe(0);
    });

    it('should clear future when pushing new entry', () => {
      const entry1: HistoryEntry = {
        description: 'Action 1',
        do: () => {},
        undo: () => {}
      };

      const entry2: HistoryEntry = {
        description: 'Action 2',
        do: () => {},
        undo: () => {}
      };

      const entry3: HistoryEntry = {
        description: 'Action 3',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry1);
      manager.push(entry2);
      manager.undo();
      
      expect(manager.getState().future.length).toBe(1);
      
      manager.push(entry3);
      
      expect(manager.getState().future.length).toBe(0);
      expect(manager.getState().past.length).toBe(2);
    });

    it('should execute do function when pushing', () => {
      let executed = false;
      const entry: HistoryEntry = {
        description: 'Test Do',
        do: () => {
          executed = true;
        },
        undo: () => {}
      };

      manager.push(entry);
      expect(executed).toBe(true);
    });
  });

  describe('undo', () => {
    it('should undo last action', () => {
      let value = 0;
      const entry: HistoryEntry = {
        description: 'Increment',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      manager.push(entry);
      expect(value).toBe(1);

      manager.undo();
      expect(value).toBe(0);
    });

    it('should move entry from past to future', () => {
      const entry: HistoryEntry = {
        description: 'Test Undo',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      expect(manager.getState().past.length).toBe(1);
      expect(manager.getState().future.length).toBe(0);

      manager.undo();
      expect(manager.getState().past.length).toBe(0);
      expect(manager.getState().future.length).toBe(1);
    });

    it('should do nothing when no history', () => {
      expect(() => {
        manager.undo();
      }).not.toThrow();

      expect(manager.getState().past.length).toBe(0);
      expect(manager.getState().future.length).toBe(0);
    });

    it('should handle multiple undos', () => {
      let value = 0;
      const entry1: HistoryEntry = {
        description: 'Action 1',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      const entry2: HistoryEntry = {
        description: 'Action 2',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      manager.push(entry1);
      manager.push(entry2);
      expect(value).toBe(2);

      manager.undo();
      expect(value).toBe(1);

      manager.undo();
      expect(value).toBe(0);
    });
  });

  describe('redo', () => {
    it('should redo last undone action', () => {
      let value = 0;
      const entry: HistoryEntry = {
        description: 'Increment',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      manager.push(entry);
      manager.undo();
      expect(value).toBe(0);

      manager.redo();
      expect(value).toBe(1);
    });

    it('should move entry from future to past', () => {
      const entry: HistoryEntry = {
        description: 'Test Redo',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      manager.undo();
      
      expect(manager.getState().past.length).toBe(0);
      expect(manager.getState().future.length).toBe(1);

      manager.redo();
      
      expect(manager.getState().past.length).toBe(1);
      expect(manager.getState().future.length).toBe(0);
    });

    it('should do nothing when no future', () => {
      expect(() => {
        manager.redo();
      }).not.toThrow();

      expect(manager.getState().past.length).toBe(0);
      expect(manager.getState().future.length).toBe(0);
    });

    it('should handle multiple redos', () => {
      let value = 0;
      const entry1: HistoryEntry = {
        description: 'Action 1',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      const entry2: HistoryEntry = {
        description: 'Action 2',
        do: () => {
          value++;
        },
        undo: () => {
          value--;
        }
      };

      manager.push(entry1);
      manager.push(entry2);
      manager.undo();
      manager.undo();
      expect(value).toBe(0);

      manager.redo();
      expect(value).toBe(1);

      manager.redo();
      expect(value).toBe(2);
    });
  });

  describe('canUndo', () => {
    it('should return false when no history', () => {
      expect(manager.canUndo()).toBe(false);
    });

    it('should return true when history exists', () => {
      const entry: HistoryEntry = {
        description: 'Test',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      expect(manager.canUndo()).toBe(true);
    });

    it('should return false after undoing all', () => {
      const entry: HistoryEntry = {
        description: 'Test',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      manager.undo();
      expect(manager.canUndo()).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('should return false when no future', () => {
      expect(manager.canRedo()).toBe(false);
    });

    it('should return true after undo', () => {
      const entry: HistoryEntry = {
        description: 'Test',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      manager.undo();
      expect(manager.canRedo()).toBe(true);
    });

    it('should return false after redoing all', () => {
      const entry: HistoryEntry = {
        description: 'Test',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      manager.undo();
      manager.redo();
      expect(manager.canRedo()).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all history', () => {
      const entry1: HistoryEntry = {
        description: 'Action 1',
        do: () => {},
        undo: () => {}
      };

      const entry2: HistoryEntry = {
        description: 'Action 2',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry1);
      manager.push(entry2);
      manager.undo();

      expect(manager.getState().past.length).toBe(1);
      expect(manager.getState().future.length).toBe(1);

      manager.clear();

      expect(manager.getState().past.length).toBe(0);
      expect(manager.getState().future.length).toBe(0);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = manager.getState();
      expect(state).toHaveProperty('past');
      expect(state).toHaveProperty('future');
      expect(Array.isArray(state.past)).toBe(true);
      expect(Array.isArray(state.future)).toBe(true);
    });

    it('should reflect changes after operations', () => {
      const entry: HistoryEntry = {
        description: 'Test',
        do: () => {},
        undo: () => {}
      };

      manager.push(entry);
      let state = manager.getState();
      expect(state.past.length).toBe(1);

      manager.undo();
      state = manager.getState();
      expect(state.future.length).toBe(1);
    });
  });
});

