import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';
import { useCommandPalette } from '../../hooks/useCommandPalette';
import { useActiveDocument, useActiveDocumentId } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';
import type { CommandDescriptor } from '../../types';

const CommandPaletteOverlay: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const activeDocument = useActiveDocument();
  const activeDocumentId = useActiveDocumentId();
  const {
    createDocument,
    duplicateDocument,
    closeDocument,
    setCommandPaletteOpen,
    setActivePanel,
    settings,
    setSetting
  } = useGraphicsStore((state) => ({
    createDocument: state.createDocument,
    duplicateDocument: state.duplicateDocument,
    closeDocument: state.closeDocument,
    setCommandPaletteOpen: state.setCommandPaletteOpen,
    setActivePanel: state.setActivePanel,
    settings: state.settings,
    setSetting: state.setSetting
  }));

  const baseCommands = useMemo<CommandDescriptor[]>(() => {
    const commands: CommandDescriptor[] = [
      {
        id: 'new-document',
        label: t('commands.newDocument'),
        shortcut: '⇧⌘N',
        section: 'document',
        run: () => {
          const id = createDocument({ name: 'Untitled' });
          navigate('/tools/graphics-smasher/workspace');
          setTimeout(() => {
            useGraphicsStore.getState().setActiveDocument(id);
          }, 0);
        },
        keywords: ['doc', 'create', 'new']
      },
      {
        id: 'duplicate-document',
        label: t('commands.duplicateDocument'),
        shortcut: '⌘D',
        section: 'document',
        run: () => {
          if (!activeDocumentId) {
            return;
          }
          duplicateDocument(activeDocumentId);
        },
        disabled: !activeDocumentId,
        keywords: ['copy', 'clone']
      },
      {
        id: 'close-document',
        label: t('commands.closeDocument'),
        shortcut: '⌘W',
        section: 'document',
        run: () => {
          if (!activeDocumentId) {
            return;
          }
          closeDocument(activeDocumentId);
        },
        disabled: !activeDocumentId,
        keywords: ['close', 'exit']
      },
      {
        id: 'toggle-guides',
        label: t('commands.toggleGuides'),
        section: 'view',
        run: () => {
          setSetting('snapToGuides', !settings.snapToGuides);
        }
      },
      {
        id: 'toggle-grid',
        label: t('commands.toggleGrid'),
        section: 'view',
        run: () => {
          setSetting('snapToGrid', !settings.snapToGrid);
        }
      },
      {
        id: 'open-settings',
        label: t('commands.openSettings'),
        section: 'settings',
        run: () => {
          setActivePanel('properties');
        }
      }
    ];

    if (location.pathname.endsWith('/workspace')) {
      commands.push({
        id: 'add-layer',
        label: t('commands.addLayer'),
        section: 'edit',
        run: () => {
          if (!activeDocumentId) {
            return;
          }
          useGraphicsStore.getState().addLayer(activeDocumentId, {
            name: `Layer ${activeDocument?.layers.length ?? 0}`
          });
        },
        disabled: !activeDocumentId
      });
    } else {
      commands.push({
        id: 'go-to-workspace',
        label: t('landing.ctaPrimary'),
        section: 'document',
        run: () => navigate('/tools/graphics-smasher/workspace')
      });
    }

    return commands;
  }, [
    t,
    createDocument,
    duplicateDocument,
    closeDocument,
    setSetting,
    settings.snapToGuides,
    settings.snapToGrid,
    setActivePanel,
    location.pathname,
    navigate,
    activeDocumentId,
    activeDocument
  ]);

  const { isOpen, commands, setCommandPaletteOpen: togglePalette } = useCommandPalette({ commands: baseCommands });
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!query) {
      return commands;
    }
    const value = query.toLowerCase();
    return commands.filter((command) => command.searchText.includes(value));
  }, [commands, query]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[200] flex items-start justify-center bg-black/40 backdrop-blur-sm p-6"
      onClick={() => togglePalette(false)}
    >
      <div
        className="w-full max-w-2xl rounded-xl bg-white shadow-xl ring-1 ring-black/10 dark:bg-slate-900 dark:text-slate-100"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-700">
          <input
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search commands…"
            className="w-full bg-transparent text-base outline-none placeholder:text-slate-400"
          />
        </div>
        <div className="max-h-80 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">No commands match “{query}”.</div>
          ) : (
            filtered.map((command) => (
              <button
                key={command.id}
                className="flex w-full items-center justify-between px-4 py-3 text-left text-sm hover:bg-indigo-50 disabled:opacity-50"
                onClick={async () => {
                  await command.run();
                  togglePalette(false);
                }}
                disabled={command.disabled}
              >
                <span>
                  <span className="font-medium">{command.label}</span>
                  <span className="ml-2 text-xs uppercase text-slate-400">{command.section}</span>
                </span>
                {command.shortcut && <span className="text-xs text-slate-400">{command.shortcut}</span>}
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPaletteOverlay;
