import React from 'react';
import { X, Plus } from 'lucide-react';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useTranslation } from 'react-i18next';

const DocumentTabs: React.FC = () => {
  const { t } = useTranslation();
  const documents = useGraphicsStore((state) => state.documents);
  const activeDocumentId = useGraphicsStore((state) => state.activeDocumentId);
  const setActiveDocument = useGraphicsStore((state) => state.setActiveDocument);
  const closeDocument = useGraphicsStore((state) => state.closeDocument);
  const createDocument = useGraphicsStore((state) => state.createDocument);

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-gradient-to-b from-white to-slate-50 px-4 py-2 shadow-sm">
      <div className="flex flex-1 items-center gap-1.5 overflow-x-auto">
        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-medium text-slate-500">
            {t('landing.ctaSecondary')}
          </div>
        ) : (
          documents.map((document) => {
            const isActive = document.id === activeDocumentId;
            return (
              <div
                key={document.id}
                onClick={() => setActiveDocument(document.id)}
                className={`group relative flex items-center gap-2 rounded-t-lg border-t-2 px-4 py-2 text-sm font-medium transition-all cursor-pointer ${
                  isActive
                    ? 'border-t-indigo-500 bg-white text-indigo-700 shadow-md'
                    : 'border-t-transparent bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                }`}
              >
                <span className="font-semibold">{document.name}</span>
                <span className="text-xs font-medium text-slate-400">
                  {document.width}×{document.height}
                </span>
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    closeDocument(document.id);
                  }}
                  className={`ml-1 rounded p-0.5 transition ${
                    isActive
                      ? 'text-slate-400 hover:bg-red-100 hover:text-red-600'
                      : 'text-slate-400 opacity-0 hover:bg-red-100 hover:text-red-600 group-hover:opacity-100'
                  }`}
                  title="Close document"
                >
                  <X size={14} />
                </button>
              </div>
            );
          })
        )}
      </div>
      <button
        onClick={() => {
          const id = createDocument({ name: 'Untitled' });
          setActiveDocument(id);
        }}
        className="ml-4 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <Plus size={16} className="mr-1.5" />
        New Document
      </button>
    </div>
  );
};

export default DocumentTabs;
