import React from 'react';
import { Eye, EyeOff, Lock, Unlock, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';

const LayersPanel: React.FC = () => {
  const document = useActiveDocument();
  const {
    toggleLayerVisibility,
    toggleLayerLock,
    setActiveLayer,
    reorderLayer,
    addLayer
  } = useGraphicsStore((state) => ({
    toggleLayerVisibility: state.toggleLayerVisibility,
    toggleLayerLock: state.toggleLayerLock,
    setActiveLayer: state.setActiveLayer,
    reorderLayer: state.reorderLayer,
    addLayer: state.addLayer
  }));

  if (!document) {
    return (
      <div className="p-4 text-sm text-slate-500">
        Create a document to manage its layers.
      </div>
    );
  }

  const handleReorder = (layerId: string, direction: 1 | -1) => {
    const index = document.layers.findIndex((layer) => layer.id === layerId);
    if (index === -1) {
      return;
    }
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= document.layers.length) {
      return;
    }
    reorderLayer(document.id, layerId, targetIndex);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-slate-200 px-3 py-2">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">Layer Stack</h4>
        <button
          className="inline-flex items-center rounded-md border border-slate-300 px-2 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600"
          onClick={() => addLayer(document.id, { name: `Layer ${document.layers.length}` })}
        >
          <Plus size={14} className="mr-1" />
          Layer
        </button>
      </div>
      <ul className="flex-1 divide-y divide-slate-100 overflow-y-auto">
        {[...document.layers].reverse().map((layer, index) => {
          const originalIndex = document.layers.length - 1 - index;
          const isActive = layer.id === document.activeLayerId;
          const isBackground = originalIndex === 0;
          return (
            <li
              key={layer.id}
              className={`group flex items-center justify-between gap-2 px-3 py-2 text-sm ${
                isActive ? 'bg-indigo-50' : 'hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => toggleLayerVisibility(document.id, layer.id)}
                  aria-label={layer.visible ? 'Hide layer' : 'Show layer'}
                >
                  {layer.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                </button>
                <button
                  className="text-slate-400 hover:text-slate-600"
                  onClick={() => toggleLayerLock(document.id, layer.id)}
                  aria-label={layer.locked ? 'Unlock layer' : 'Lock layer'}
                >
                  {layer.locked ? <Lock size={16} /> : <Unlock size={16} />}
                </button>
                <button
                  onClick={() => setActiveLayer(document.id, layer.id)}
                  className="text-left"
                >
                  <p className="font-medium text-slate-700">{layer.name}</p>
                  <p className="text-xs uppercase tracking-wide text-slate-400">{layer.kind}</p>
                </button>
              </div>
              <div className="flex items-center gap-1 opacity-0 transition group-hover:opacity-100">
                {!isBackground && (
                  <>
                    <button
                      className="rounded bg-white p-1 text-slate-400 hover:text-slate-700"
                      onClick={() => handleReorder(layer.id, 1)}
                    >
                      <ChevronUp size={14} />
                    </button>
                    <button
                      className="rounded bg-white p-1 text-slate-400 hover:text-slate-700"
                      onClick={() => handleReorder(layer.id, -1)}
                    >
                      <ChevronDown size={14} />
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default LayersPanel;
