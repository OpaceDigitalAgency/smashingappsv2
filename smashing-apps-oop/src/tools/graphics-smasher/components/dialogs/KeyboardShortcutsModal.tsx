import React from 'react';

interface KeyboardShortcutsModalProps {
  onClose: () => void;
}

const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ onClose }) => {
  const shortcuts = [
    {
      category: 'File',
      items: [
        { label: 'New Document', shortcut: '⌘N' },
        { label: 'Open File', shortcut: '⌘O' },
        { label: 'Save', shortcut: '⌘S' },
        { label: 'Save As', shortcut: '⇧⌘S' },
        { label: 'Export', shortcut: '⌥⇧⌘S' },
        { label: 'Close', shortcut: '⌘W' }
      ]
    },
    {
      category: 'Edit',
      items: [
        { label: 'Undo', shortcut: '⌘Z' },
        { label: 'Redo', shortcut: '⇧⌘Z' },
        { label: 'Cut', shortcut: '⌘X' },
        { label: 'Copy', shortcut: '⌘C' },
        { label: 'Paste', shortcut: '⌘V' },
        { label: 'Delete', shortcut: 'Delete/Backspace' },
        { label: 'Select All', shortcut: '⌘A' },
        { label: 'Deselect', shortcut: '⌘D' },
        { label: 'Free Transform', shortcut: '⌘T' }
      ]
    },
    {
      category: 'Layer',
      items: [
        { label: 'New Layer', shortcut: '⇧⌘N' },
        { label: 'Duplicate Layer', shortcut: '⌘J' },
        { label: 'Merge Down', shortcut: '⌘E' },
        { label: 'Move Layer Up', shortcut: '⌘]' },
        { label: 'Move Layer Down', shortcut: '⌘[' }
      ]
    },
    {
      category: 'View',
      items: [
        { label: 'Zoom In', shortcut: '⌘+' },
        { label: 'Zoom Out', shortcut: '⌘-' },
        { label: 'Fit on Screen', shortcut: '⌘0' },
        { label: 'Actual Pixels', shortcut: '⌘1' },
        { label: 'Show Grid', shortcut: '⌘\'' },
        { label: 'Show Rulers', shortcut: '⌘R' },
        { label: 'Show Guides', shortcut: '⌘;' }
      ]
    },
    {
      category: 'Help',
      items: [
        { label: 'Keyboard Shortcuts', shortcut: '⌘/' },
        { label: 'Command Palette', shortcut: '⌘K' }
      ]
    },
    {
      category: 'Tools',
      items: [
        { label: 'Move Tool', shortcut: 'V' },
        { label: 'Marquee Tool', shortcut: 'M' },
        { label: 'Lasso Tool', shortcut: 'L' },
        { label: 'Magic Wand', shortcut: 'W' },
        { label: 'Eyedropper', shortcut: 'I' },
        { label: 'Brush Tool', shortcut: 'B' },
        { label: 'Eraser Tool', shortcut: 'E' },
        { label: 'Text Tool', shortcut: 'T' },
        { label: 'Shape Tool', shortcut: 'U' },
        { label: 'Pen Tool', shortcut: 'P' },
        { label: 'Hand Tool', shortcut: 'H' },
        { label: 'Zoom Tool', shortcut: 'Z' }
      ]
    }
  ];

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="max-h-[80vh] w-[700px] overflow-y-auto rounded-lg bg-[#2a2a2a] p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-white">Keyboard Shortcuts</h2>
          <button
            onClick={onClose}
            className="rounded p-2 text-gray-400 hover:bg-[#3a3a3a] hover:text-white"
          >
            ✕
          </button>
        </div>

        <div className="space-y-6">
          {shortcuts.map((section) => (
            <div key={section.category}>
              <h3 className="mb-3 text-lg font-semibold text-indigo-400">{section.category}</h3>
              <div className="space-y-2">
                {section.items.map((item) => (
                  <div key={item.label} className="flex items-center justify-between rounded bg-[#3a3a3a] px-4 py-2">
                    <span className="text-gray-300">{item.label}</span>
                    <kbd className="rounded bg-[#4a4a4a] px-3 py-1 font-mono text-sm text-white">
                      {item.shortcut}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={onClose}
            className="rounded bg-indigo-600 px-6 py-2 text-white hover:bg-indigo-500"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default KeyboardShortcutsModal;

