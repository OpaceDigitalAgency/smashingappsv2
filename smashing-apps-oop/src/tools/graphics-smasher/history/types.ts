/**
 * History Manager types for undo/redo functionality
 */

export interface HistoryCommand {
  id: string;
  name: string;
  timestamp: number;
  do: () => void | Promise<void>;
  undo: () => void | Promise<void>;
}

export interface HistoryState {
  past: HistoryCommand[];
  future: HistoryCommand[];
  maxSize: number;
}

