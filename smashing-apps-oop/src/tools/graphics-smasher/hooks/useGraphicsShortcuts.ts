import { useEffect } from 'react';
import { useGraphicsStore } from '../state/graphicsStore';
import { CommandRegistry } from '../commands';

export function useGraphicsShortcuts(documentId: string | null) {
  const {
    setActiveTool,
    setCommandPaletteOpen,
  } = useGraphicsStore();

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isMac = navigator.platform.toLowerCase().includes('mac');
      const metaKey = isMac ? event.metaKey : event.ctrlKey;
      const target = event.target as HTMLElement;

      // Don't trigger shortcuts when typing in inputs
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        // Allow Cmd+K even in inputs
        if (metaKey && event.key.toLowerCase() === 'k') {
          event.preventDefault();
          setCommandPaletteOpen(true);
        }
        return;
      }

      // Command Palette (Cmd/Ctrl + K)
      if (metaKey && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Undo/Redo
      if (documentId && metaKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        if (event.shiftKey) {
          CommandRegistry.run('edit.redo');
        } else {
          CommandRegistry.run('edit.undo');
        }
        return;
      }

      // New Document (Cmd/Ctrl + N)
      if (metaKey && event.key.toLowerCase() === 'n' && !event.shiftKey) {
        event.preventDefault();
        CommandRegistry.run('file.new');
        return;
      }

      // Close Document (Cmd/Ctrl + W)
      if (documentId && metaKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        CommandRegistry.run('file.close');
        return;
      }

      // Cut (Cmd/Ctrl + X)
      if (metaKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        CommandRegistry.run('edit.cut');
        return;
      }

      // Copy (Cmd/Ctrl + C)
      if (metaKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        CommandRegistry.run('edit.copy');
        return;
      }

      // Paste (Cmd/Ctrl + V)
      if (metaKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        CommandRegistry.run('edit.paste');
        return;
      }

      // Select All (Cmd/Ctrl + A)
      if (metaKey && event.key.toLowerCase() === 'a') {
        event.preventDefault();
        CommandRegistry.run('edit.selectAll');
        return;
      }

      // Deselect (Cmd/Ctrl + D)
      if (metaKey && event.key.toLowerCase() === 'd') {
        event.preventDefault();
        CommandRegistry.run('edit.deselect');
        return;
      }

      // Delete (Delete or Backspace key)
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        CommandRegistry.run('edit.delete');
        return;
      }

      // Free Transform (Cmd/Ctrl + T)
      if (metaKey && event.key.toLowerCase() === 't') {
        event.preventDefault();
        CommandRegistry.run('edit.transform.free');
        return;
      }

      // New Layer (Shift + Cmd/Ctrl + N)
      if (documentId && metaKey && event.shiftKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        CommandRegistry.run('layer.new');
        return;
      }

      // Zoom In (Cmd/Ctrl + +)
      if (metaKey && (event.key === '+' || event.key === '=')) {
        event.preventDefault();
        CommandRegistry.run('view.zoomIn');
        return;
      }

      // Zoom Out (Cmd/Ctrl + -)
      if (metaKey && event.key === '-') {
        event.preventDefault();
        CommandRegistry.run('view.zoomOut');
        return;
      }

      // Fit on Screen (Cmd/Ctrl + 0)
      if (metaKey && event.key === '0') {
        event.preventDefault();
        CommandRegistry.run('view.zoomFit');
        return;
      }

      // Actual Pixels (Cmd/Ctrl + 1)
      if (metaKey && event.key === '1') {
        event.preventDefault();
        CommandRegistry.run('view.zoomActual');
        return;
      }

      // Tool shortcuts (only when not in input)
      if (!metaKey && !event.shiftKey && !event.altKey) {
        const key = event.key.toLowerCase();
        switch (key) {
          case 'v':
            setActiveTool('move');
            break;
          case 'm':
            setActiveTool('marquee-rect');
            break;
          case 'l':
            setActiveTool('lasso-free');
            break;
          case 'w':
            setActiveTool('magic-wand');
            break;
          case 'b':
            setActiveTool('brush');
            break;
          case 'e':
            setActiveTool('eraser');
            break;
          case 't':
            setActiveTool('text');
            break;
          case 'u':
            setActiveTool('shape');
            break;
          case 'p':
            setActiveTool('pen');
            break;
          case 'h':
            setActiveTool('hand');
            break;
          case 'z':
            setActiveTool('zoom');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentId, setActiveTool, setCommandPaletteOpen]);
}
