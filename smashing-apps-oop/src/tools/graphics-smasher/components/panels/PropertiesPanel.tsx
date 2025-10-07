import React from 'react';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useAIFeatureStatus } from '../../services/ai/aiFeatureGateway';

const PropertiesPanel: React.FC = () => {
  const document = useActiveDocument();
  const updateDocumentMeta = useGraphicsStore((state) => state.updateDocumentMeta);
  const setSetting = useGraphicsStore((state) => state.setSetting);
  const settings = useGraphicsStore((state) => state.settings);
  const aiStatus = useAIFeatureStatus();

  return (
    <div className="space-y-4 p-4 text-sm text-slate-600">
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Workspace</h4>
        <div className="mt-3 space-y-3">
          <label className="flex items-center justify-between gap-2">
            <span>Locale</span>
            <select
              className="rounded border border-slate-300 px-2 py-1 text-sm"
              value={settings.locale}
              onChange={(event) => setSetting('locale', event.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Theme</span>
            <select
              className="rounded border border-slate-300 px-2 py-1 text-sm"
              value={settings.theme}
              onChange={(event) => setSetting('theme', event.target.value as typeof settings.theme)}
            >
              <option value="system">System</option>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>High Contrast</span>
            <input
              type="checkbox"
              checked={settings.highContrast}
              onChange={(event) => setSetting('highContrast', event.target.checked)}
            />
          </label>
          <label className="flex items-center justify-between gap-2">
            <span>Autosave</span>
            <input
              type="checkbox"
              checked={settings.autosaveEnabled}
              onChange={(event) => setSetting('autosaveEnabled', event.target.checked)}
            />
          </label>
        </div>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">AI Features</h4>
        <ul className="mt-3 space-y-2 text-xs text-slate-500">
          {aiStatus.map((feature) => (
            <li
              key={feature.feature}
              className="rounded-lg border border-dashed border-slate-300 px-3 py-2"
            >
              <p className="font-semibold text-slate-700 capitalize">{feature.feature.replace('-', ' ')}</p>
              <p className="text-[11px] uppercase tracking-wide text-slate-400">
                {feature.available ? 'Ready' : 'Stub'}
                {feature.provider ? ` • ${feature.provider}` : ''}
              </p>
              {feature.notes && <p className="mt-1 text-[11px] text-slate-400">{feature.notes}</p>}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-400">Document</h4>
        {document ? (
          <div className="mt-3 space-y-3">
            <label className="flex items-center justify-between gap-2">
              <span>Name</span>
              <input
                className="w-32 rounded border border-slate-300 px-2 py-1 text-sm"
                value={document.name}
                onChange={(event) => updateDocumentMeta(document.id, { name: event.target.value })}
              />
            </label>
            <label className="flex items-center justify-between gap-2">
              <span>Background</span>
              <input
                type="color"
                value={document.background}
                onChange={(event) => updateDocumentMeta(document.id, { background: event.target.value })}
              />
            </label>
            <p className="text-xs text-slate-400">
              {document.width}×{document.height} px • Created {new Date(document.createdAt).toLocaleString()}
            </p>
          </div>
        ) : (
          <p className="mt-3 text-sm text-slate-500">Create or open a document to edit its properties.</p>
        )}
      </div>
    </div>
  );
};

export default PropertiesPanel;
