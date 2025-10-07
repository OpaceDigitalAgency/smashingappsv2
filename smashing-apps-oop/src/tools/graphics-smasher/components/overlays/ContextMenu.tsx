import React, { useEffect, useRef } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useActiveDocument, useActiveDocumentId } from '../../hooks/useGraphicsStore';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const activeDocumentId = useActiveDocumentId();
  const activeDocument = useActiveDocument();
  const { addLayer, removeLayer, duplicateDocument, undo, redo } = useGraphicsStore();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

  const handleUndo = () => {
    if (activeDocumentId) {
      undo(activeDocumentId);
    }
    onClose();
  };

  const handleRedo = () => {
    if (activeDocumentId) {
      redo(activeDocumentId);
    }
    onClose();
  };

  const handleNewLayer = () => {
    if (activeDocumentId) {
      addLayer(activeDocumentId, { name: `Layer ${(activeDocument?.layers.length || 0) + 1}` });
    }
    onClose();
  };

  const handleDeleteLayer = () => {
    if (activeDocumentId && activeDocument?.activeLayerId) {
      removeLayer(activeDocumentId, activeDocument.activeLayerId);
    }
    onClose();
  };

  const handleDuplicate = () => {
    if (activeDocumentId) {
      duplicateDocument(activeDocumentId);
    }
    onClose();
  };

  const menuItems = [
    { label: 'Undo', shortcut: '⌘Z', action: handleUndo, disabled: !activeDocument?.history.past.length },
    { label: 'Redo', shortcut: '⇧⌘Z', action: handleRedo, disabled: !activeDocument?.history.future.length },
    { divider: true },
    { label: 'Cut', shortcut: '⌘X', action: () => console.log('Cut'), disabled: !activeDocumentId },
    { label: 'Copy', shortcut: '⌘C', action: () => console.log('Copy'), disabled: !activeDocumentId },
    { label: 'Paste', shortcut: '⌘V', action: () => console.log('Paste') },
    { divider: true },
    { label: 'New Layer', shortcut: '⇧⌘N', action: handleNewLayer, disabled: !activeDocumentId },
    { label: 'Delete Layer', action: handleDeleteLayer, disabled: !activeDocument?.activeLayerId },
    { label: 'Duplicate Document', action: handleDuplicate, disabled: !activeDocumentId },
    { divider: true },
    { label: 'Select All', shortcut: '⌘A', action: () => console.log('Select all'), disabled: !activeDocumentId },
    { label: 'Deselect', shortcut: '⌘D', action: () => console.log('Deselect'), disabled: !activeDocumentId },
    { divider: true },
    { label: 'Transform', shortcut: '⌘T', action: () => console.log('Transform'), disabled: !activeDocumentId },
    { label: 'Free Transform', action: () => console.log('Free transform'), disabled: !activeDocumentId }
  ];

  return (
    <div
      ref={menuRef}
      className="fixed z-[10000] min-w-[220px] rounded-md border border-[#3a3a3a] bg-[#2a2a2a] py-1 shadow-2xl"
      style={{ left: x, top: y }}
    >
      {menuItems.map((item, index) => {
        if (item.divider) {
          return <div key={`divider-${index}`} className="my-1 h-px bg-[#3a3a3a]" />;
        }
        return (
          <button
            key={index}
            onClick={item.action}
            disabled={item.disabled}
            className={`flex w-full items-center justify-between px-4 py-2 text-left text-sm ${
              item.disabled
                ? 'cursor-not-allowed text-[#606060]'
                : 'text-[#d0d0d0] hover:bg-[#3a3a3a]'
            }`}
          >
            <span>{item.label}</span>
            {item.shortcut && <span className="ml-8 text-xs text-[#808080]">{item.shortcut}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ContextMenu;

