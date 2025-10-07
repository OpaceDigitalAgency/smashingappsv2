import { useEffect, useMemo } from 'react';
import { useGraphicsStore } from '../state/graphicsStore';
import type { CommandDescriptor } from '../types';

interface UseCommandPaletteOptions {
  commands: CommandDescriptor[];
}

export function useCommandPalette({ commands }: UseCommandPaletteOptions) {
  const setCommandPaletteOpen = useGraphicsStore((state) => state.setCommandPaletteOpen);
  const isOpen = useGraphicsStore((state) => state.commandPaletteOpen);

  const searchableCommands = useMemo(() => {
    const normalized = commands.map((command) => ({
      ...command,
      searchText: [command.label, ...(command.keywords ?? [])].join(' ').toLowerCase()
    }));
    return normalized;
  }, [commands]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const isPaletteShortcut =
        (isMac && event.metaKey && event.key.toLowerCase() === 'k') ||
        (!isMac && event.ctrlKey && event.key.toLowerCase() === 'k');

      if (isPaletteShortcut) {
        event.preventDefault();
        setCommandPaletteOpen(!isOpen);
      }

      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, setCommandPaletteOpen]);

  return {
    isOpen,
    setCommandPaletteOpen,
    commands: searchableCommands
  };
}
