import React from 'react';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';

const HistoryPanel: React.FC = () => {
  const document = useActiveDocument();
  const undo = useGraphicsStore((state) => state.undo);
  const redo = useGraphicsStore((state) => state.redo);

  if (!document) {
    return <div className="p-4 text-sm text-slate-500">History appears once you start editing.</div>;
  }

  const items = document.history.past.slice(-25).reverse();

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2 text-xs">
        <span className="font-semibold uppercase tracking-wide text-slate-500">Timeline</span>
        <div className="space-x-2">
          <button
            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
            onClick={() => undo(document.id)}
            disabled={document.history.past.length === 0}
          >
            Undo
          </button>
          <button
            className="rounded border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
            onClick={() => redo(document.id)}
            disabled={document.history.future.length === 0}
          >
            Redo
          </button>
        </div>
      </div>
      <ul className="flex-1 space-y-2 overflow-y-auto p-3 text-sm">
        {items.length === 0 ? (
          <li className="text-slate-400">No history yet.</li>
        ) : (
          items.map((entry) => (
            <li key={entry.id} className="rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <p className="font-medium text-slate-700">{entry.description}</p>
              <p className="text-xs text-slate-400">
                {new Date(entry.createdAt).toLocaleTimeString()}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
};

export default HistoryPanel;
