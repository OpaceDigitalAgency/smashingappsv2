import React, { useEffect, useRef } from 'react';
import { CommandRegistry } from '../../commands';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, onClose }) => {
  const menuRef = useRef<HTMLDivElement>(null);

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

  const runCommand = async (commandId: string) => {
    await CommandRegistry.run(commandId as any);
    onClose();
  };

  const menuItems = [
    { label: 'Undo', shortcut: '⌘Z', action: () => runCommand('edit.undo'), disabled: !CommandRegistry.isEnabled('edit.undo') },
    { label: 'Redo', shortcut: '⇧⌘Z', action: () => runCommand('edit.redo'), disabled: !CommandRegistry.isEnabled('edit.redo') },
    { divider: true },
    { label: 'Cut', shortcut: '⌘X', action: () => runCommand('edit.cut'), disabled: !CommandRegistry.isEnabled('edit.cut') },
    { label: 'Copy', shortcut: '⌘C', action: () => runCommand('edit.copy'), disabled: !CommandRegistry.isEnabled('edit.copy') },
    { label: 'Paste', shortcut: '⌘V', action: () => runCommand('edit.paste'), disabled: !CommandRegistry.isEnabled('edit.paste') },
    { divider: true },
    { label: 'New Layer', shortcut: '⇧⌘N', action: () => runCommand('layer.new'), disabled: !CommandRegistry.isEnabled('layer.new') },
    { label: 'Delete Layer', action: () => runCommand('layer.delete'), disabled: !CommandRegistry.isEnabled('layer.delete') },
    { label: 'Duplicate Document', action: () => runCommand('document.duplicate'), disabled: !CommandRegistry.isEnabled('document.duplicate') },
    { divider: true },
    { label: 'Select All', shortcut: '⌘A', action: () => runCommand('select.all'), disabled: !CommandRegistry.isEnabled('select.all') },
    { label: 'Deselect', shortcut: '⌘D', action: () => runCommand('select.deselect'), disabled: !CommandRegistry.isEnabled('select.deselect') },
    { divider: true },
    { label: 'Free Transform', shortcut: '⌘T', action: () => runCommand('edit.transform.free'), disabled: !CommandRegistry.isEnabled('edit.transform.free') }
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

