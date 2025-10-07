import React from 'react';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';

const ADJUSTMENTS = [
  { id: 'exposure', label: 'Exposure' },
  { id: 'levels', label: 'Levels' },
  { id: 'curves', label: 'Curves' },
  { id: 'hsl', label: 'HSL' },
  { id: 'color-balance', label: 'Color Balance' },
  { id: 'vibrance', label: 'Vibrance' },
  { id: 'black-white', label: 'Black & White' },
  { id: 'photo-filter', label: 'Photo Filter' },
  { id: 'lut', label: '3D LUT' },
  { id: 'noise', label: 'Noise' },
  { id: 'sharpen', label: 'Sharpen' },
  { id: 'gaussian-blur', label: 'Gaussian Blur' }
];

const AdjustmentsPanel: React.FC = () => {
  const document = useActiveDocument();
  const addLayer = useGraphicsStore((state) => state.addLayer);

  if (!document) {
    return <div className="p-4 text-sm text-slate-500">Create a document to add adjustments.</div>;
  }

  return (
    <div className="space-y-3 p-4">
      <p className="text-xs uppercase tracking-wide text-slate-400">Adjustment Layers</p>
      <div className="grid grid-cols-2 gap-2">
        {ADJUSTMENTS.map((adjustment) => (
          <button
            key={adjustment.id}
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600"
            onClick={() =>
              addLayer(document.id, {
                name: adjustment.label,
                kind: 'adjustment',
                metadata: {
                  adjustment: adjustment.id
                }
              })
            }
          >
            {adjustment.label}
          </button>
        ))}
      </div>
      <p className="text-xs text-slate-400">
        Adjustment layers remain editable. Stack them to build non-destructive looks.
      </p>
    </div>
  );
};

export default AdjustmentsPanel;
