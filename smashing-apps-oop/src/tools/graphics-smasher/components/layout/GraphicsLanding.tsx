import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useGraphicsStore } from '../../state/graphicsStore';
import { DOCUMENT_PRESETS } from '../../utils/files/documentPresets';

const GraphicsLanding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const createDocument = useGraphicsStore((state) => state.createDocument);
  const setActiveDocument = useGraphicsStore((state) => state.setActiveDocument);

  const handleCreate = (presetId?: string) => {
    const preset = DOCUMENT_PRESETS.find((item) => item.id === presetId);
    const documentId = createDocument({
      name: preset ? preset.label : 'Untitled',
      width: preset?.width,
      height: preset?.height
    });
    setActiveDocument(documentId);
    navigate('/tools/graphics-smasher/workspace');
  };

  return (
    <div className="min-h-[calc(100vh-120px)] bg-gradient-to-br from-indigo-50 via-white to-blue-50">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16">
        <section className="rounded-3xl bg-white/80 p-10 shadow-lg ring-1 ring-black/5 backdrop-blur">
          <div className="grid gap-8 md:grid-cols-2 md:items-center">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
                {t('landing.heroTitle')}
              </h1>
              <p className="mt-4 text-lg text-slate-600">{t('landing.heroDescription')}</p>
              <div className="mt-6 flex flex-wrap gap-4">
                <button
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => navigate('/tools/graphics-smasher/workspace')}
                >
                  {t('landing.ctaPrimary')}
                </button>
                <button
                  className="inline-flex items-center rounded-xl border border-indigo-200 bg-indigo-50 px-6 py-3 text-base font-semibold text-indigo-700 transition hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  onClick={() => handleCreate()}
                >
                  {t('landing.ctaSecondary')}
                </button>
              </div>
            </div>
            <div className="rounded-2xl bg-slate-900 p-6 text-slate-100 shadow-2xl">
              <h2 className="text-lg font-semibold">MVP Highlights</h2>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-slate-300">
                <li>• Non-destructive layer stack with adjustment masks</li>
                <li>• GPU-ready canvas engine with guide snapping</li>
                <li>• AI-assisted fill, harmonise, background removal stubs</li>
                <li>• Multi-document tabs and IndexedDB autosave pipeline</li>
                <li>• Command palette with quick actions and accessibility focus</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          <header>
            <h3 className="text-2xl font-bold text-slate-900">Quick Presets</h3>
            <p className="text-sm text-slate-600">Start from production-ready canvas sizes.</p>
          </header>
          <div className="grid gap-6 md:grid-cols-3">
            {DOCUMENT_PRESETS.map((preset) => (
              <button
                key={preset.id}
                className="rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-1 hover:border-indigo-300 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400"
                onClick={() => handleCreate(preset.id)}
              >
                <span className="text-sm font-medium uppercase tracking-widest text-indigo-500">
                  {preset.category}
                </span>
                <h4 className="mt-2 text-xl font-semibold text-slate-900">{preset.label}</h4>
                <p className="mt-1 text-sm text-slate-500">
                  {preset.width} × {preset.height} {preset.unit}
                </p>
                {preset.description && <p className="mt-3 text-sm text-slate-500">{preset.description}</p>}
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

export default GraphicsLanding;
