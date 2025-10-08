import { describe, it, expect, beforeEach } from 'vitest';
import { HistoryManager } from './HistoryManager';

describe('HistoryManager', () => {
  const testDocId = 'test-doc-id';

  beforeEach(() => {
    // Initialize history for test document and clear any existing state
    HistoryManager.initialize(testDocId);
    HistoryManager.clear(testDocId);
  });

  describe('execute', () => {
    it('should execute command and add to history', async () => {
      let executed = false;

      await HistoryManager.execute(testDocId, {
        name: 'Test Action',
        do: () => { executed = true; },
        undo: () => { executed = false; }
      });

      expect(executed).toBe(true);
      expect(HistoryManager.canUndo(testDocId)).toBe(true);
      expect(HistoryManager.getPastCommands(testDocId)).toHaveLength(1);
      expect(HistoryManager.getPastCommands(testDocId)[0]).toBe('Test Action');
    });

    it('should clear future when executing new command', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Action 1',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.execute(testDocId, {
        name: 'Action 2',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);

      expect(HistoryManager.canRedo(testDocId)).toBe(true);
      expect(HistoryManager.getFutureCommands(testDocId)).toHaveLength(1);

      await HistoryManager.execute(testDocId, {
        name: 'Action 3',
        do: () => {},
        undo: () => {}
      });

      expect(HistoryManager.canRedo(testDocId)).toBe(false);
      expect(HistoryManager.getFutureCommands(testDocId)).toHaveLength(0);
      expect(HistoryManager.getPastCommands(testDocId)).toHaveLength(2);
    });
  });

  describe('undo', () => {
    it('should undo last action', async () => {
      let value = 0;

      await HistoryManager.execute(testDocId, {
        name: 'Increment',
        do: () => { value++; },
        undo: () => { value--; }
      });

      expect(value).toBe(1);

      await HistoryManager.undo(testDocId);
      expect(value).toBe(0);
    });

    it('should move command from past to future', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test Undo',
        do: () => {},
        undo: () => {}
      });

      expect(HistoryManager.canUndo(testDocId)).toBe(true);
      expect(HistoryManager.canRedo(testDocId)).toBe(false);

      await HistoryManager.undo(testDocId);

      expect(HistoryManager.canUndo(testDocId)).toBe(false);
      expect(HistoryManager.canRedo(testDocId)).toBe(true);
    });

    it('should do nothing when no history', async () => {
      const result = await HistoryManager.undo(testDocId);
      expect(result).toBe(false);
      expect(HistoryManager.canUndo(testDocId)).toBe(false);
    });

    it('should handle multiple undos', async () => {
      let value = 0;

      await HistoryManager.execute(testDocId, {
        name: 'Action 1',
        do: () => { value++; },
        undo: () => { value--; }
      });

      await HistoryManager.execute(testDocId, {
        name: 'Action 2',
        do: () => { value++; },
        undo: () => { value--; }
      });

      expect(value).toBe(2);

      await HistoryManager.undo(testDocId);
      expect(value).toBe(1);

      await HistoryManager.undo(testDocId);
      expect(value).toBe(0);
    });
  });

  describe('redo', () => {
    it('should redo last undone action', async () => {
      let value = 0;

      await HistoryManager.execute(testDocId, {
        name: 'Increment',
        do: () => { value++; },
        undo: () => { value--; }
      });

      await HistoryManager.undo(testDocId);
      expect(value).toBe(0);

      await HistoryManager.redo(testDocId);
      expect(value).toBe(1);
    });

    it('should move command from future to past', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test Redo',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);

      expect(HistoryManager.canUndo(testDocId)).toBe(false);
      expect(HistoryManager.canRedo(testDocId)).toBe(true);

      await HistoryManager.redo(testDocId);

      expect(HistoryManager.canUndo(testDocId)).toBe(true);
      expect(HistoryManager.canRedo(testDocId)).toBe(false);
    });

    it('should do nothing when no future', async () => {
      const result = await HistoryManager.redo(testDocId);
      expect(result).toBe(false);
      expect(HistoryManager.canRedo(testDocId)).toBe(false);
    });

    it('should handle multiple redos', async () => {
      let value = 0;

      await HistoryManager.execute(testDocId, {
        name: 'Action 1',
        do: () => { value++; },
        undo: () => { value--; }
      });

      await HistoryManager.execute(testDocId, {
        name: 'Action 2',
        do: () => { value++; },
        undo: () => { value--; }
      });

      await HistoryManager.undo(testDocId);
      await HistoryManager.undo(testDocId);
      expect(value).toBe(0);

      await HistoryManager.redo(testDocId);
      expect(value).toBe(1);

      await HistoryManager.redo(testDocId);
      expect(value).toBe(2);
    });
  });

  describe('canUndo', () => {
    it('should return false when no history', () => {
      expect(HistoryManager.canUndo(testDocId)).toBe(false);
    });

    it('should return true when history exists', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test',
        do: () => {},
        undo: () => {}
      });

      expect(HistoryManager.canUndo(testDocId)).toBe(true);
    });

    it('should return false after undoing all', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);
      expect(HistoryManager.canUndo(testDocId)).toBe(false);
    });
  });

  describe('canRedo', () => {
    it('should return false when no future', () => {
      expect(HistoryManager.canRedo(testDocId)).toBe(false);
    });

    it('should return true after undo', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);
      expect(HistoryManager.canRedo(testDocId)).toBe(true);
    });

    it('should return false after redoing all', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);
      await HistoryManager.redo(testDocId);
      expect(HistoryManager.canRedo(testDocId)).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all history', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Action 1',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.execute(testDocId, {
        name: 'Action 2',
        do: () => {},
        undo: () => {}
      });

      await HistoryManager.undo(testDocId);

      expect(HistoryManager.canUndo(testDocId)).toBe(true);
      expect(HistoryManager.canRedo(testDocId)).toBe(true);

      HistoryManager.clear(testDocId);

      expect(HistoryManager.canUndo(testDocId)).toBe(false);
      expect(HistoryManager.canRedo(testDocId)).toBe(false);
    });
  });

  describe('getState', () => {
    it('should return current state', () => {
      const state = HistoryManager.getState(testDocId);
      expect(state).toBeDefined();
      expect(state).toHaveProperty('past');
      expect(state).toHaveProperty('future');
      expect(Array.isArray(state?.past)).toBe(true);
      expect(Array.isArray(state?.future)).toBe(true);
    });

    it('should reflect changes after operations', async () => {
      await HistoryManager.execute(testDocId, {
        name: 'Test',
        do: () => {},
        undo: () => {}
      });

      let state = HistoryManager.getState(testDocId);
      expect(state?.past.length).toBe(1);

      await HistoryManager.undo(testDocId);
      state = HistoryManager.getState(testDocId);
      expect(state?.future.length).toBe(1);
    });
  });
});

