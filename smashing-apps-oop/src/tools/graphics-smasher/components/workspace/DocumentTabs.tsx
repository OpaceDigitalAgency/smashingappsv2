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
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2.5">
      <div className="flex flex-1 items-center gap-2 overflow-x-auto">
        {documents.length === 0 ? (
          <div className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-xs text-slate-500">
            {t('landing.ctaSecondary')}
          </div>
        ) : (
          documents.map((document) => {
            const isActive = document.id === activeDocumentId;
            return (
              <button
                key={document.id}
                onClick={() => setActiveDocument(document.id)}
                className={`group flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  isActive ? 'bg-indigo-100 text-indigo-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span className="font-medium">{document.name}</span>
                <span className="text-xs text-slate-400">{document.width}×{document.height}</span>
                <X
                  size={14}
                  className="ml-2 text-slate-400 opacity-0 transition group-hover:opacity-100"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeDocument(document.id);
                  }}
                />
              </button>
            );
          })
        )}
      </div>
      <button
        onClick={() => {
          const id = createDocument({ name: 'Untitled' });
          setActiveDocument(id);
        }}
        className="ml-4 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:border-indigo-300 hover:text-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-400"
      >
        <Plus size={16} className="mr-1" />
        New
      </button>
    </div>
  );
};

export default DocumentTabs;
