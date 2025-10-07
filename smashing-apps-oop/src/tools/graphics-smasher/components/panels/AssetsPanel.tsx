import React from 'react';

const SAMPLE_ASSETS = [
  { id: 'gradient-sunrise', label: 'Sunrise Gradient', type: 'gradient', description: 'Warm vibrant gradient for hero sections.' },
  { id: 'pattern-dots', label: 'Offset Dots', type: 'pattern', description: 'Seamless dotted pattern for overlays.' },
  { id: 'brush-halftone', label: 'Halftone Brush', type: 'brush', description: 'Dynamic halftone brush with jitter presets.' },
  { id: 'style-cinemagraph', label: 'Cinemagraph LUT', type: 'style', description: 'Film-inspired LUT for cinematic looks.' }
];

const AssetsPanel: React.FC = () => {
  return (
    <div className="space-y-4 p-4 text-sm text-slate-600">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Asset Library</h4>
        <p className="mt-2 text-xs text-slate-400">
          Import and reuse gradients, brushes, presets, and smart components across documents.
        </p>
      </div>
      <div className="grid gap-3">
        {SAMPLE_ASSETS.map((asset) => (
          <div
            key={asset.id}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition hover:border-indigo-300 hover:shadow"
          >
            <p className="text-xs uppercase tracking-wide text-indigo-500">{asset.type}</p>
            <h5 className="mt-1 text-base font-semibold text-slate-800">{asset.label}</h5>
            <p className="mt-2 text-xs text-slate-500">{asset.description}</p>
            <div className="mt-3 flex justify-end">
              <button className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:border-indigo-300 hover:text-indigo-600">
                Add to Document
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssetsPanel;
