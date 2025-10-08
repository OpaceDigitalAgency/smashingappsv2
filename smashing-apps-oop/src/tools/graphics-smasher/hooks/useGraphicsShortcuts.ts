import { useEffect } from 'react';
import { useGraphicsStore } from '../state/graphicsStore';

export function useGraphicsShortcuts(documentId: string | null) {
  const {
    undo,
    redo,
    setActiveTool,
    setCommandPaletteOpen,
    createDocument,
    setActiveDocument,
    closeDocument,
    addLayer,
    selection,
    clearSelection,
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
          redo(documentId);
        } else {
          undo(documentId);
        }
        return;
      }

      // New Document (Cmd/Ctrl + N)
      if (metaKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        const id = createDocument({ name: 'Untitled', width: 1920, height: 1080 });
        setActiveDocument(id);
        return;
      }

      // Close Document (Cmd/Ctrl + W)
      if (documentId && metaKey && event.key.toLowerCase() === 'w') {
        event.preventDefault();
        closeDocument(documentId);
        return;
      }

      // Cut (Cmd/Ctrl + X)
      if (documentId && selection && metaKey && event.key.toLowerCase() === 'x') {
        event.preventDefault();
        // Store selection in clipboard
        navigator.clipboard.writeText(JSON.stringify(selection)).catch(() => {
          console.log('Clipboard write failed, using internal clipboard');
        });
        // Clear the selection visually
        clearSelection();
        console.log('Cut selection to clipboard');
        return;
      }

      // Copy (Cmd/Ctrl + C)
      if (documentId && selection && metaKey && event.key.toLowerCase() === 'c') {
        event.preventDefault();
        // Store selection in clipboard
        navigator.clipboard.writeText(JSON.stringify(selection)).catch(() => {
          console.log('Clipboard write failed, using internal clipboard');
        });
        console.log('Copied selection to clipboard');
        return;
      }

      // Paste (Cmd/Ctrl + V)
      if (documentId && metaKey && event.key.toLowerCase() === 'v') {
        event.preventDefault();
        // For now, just log - actual paste implementation would need canvas data
        navigator.clipboard.readText().then((text) => {
          try {
            const data = JSON.parse(text);
            console.log('Pasted from clipboard:', data);
            // TODO: Implement actual paste functionality
          } catch {
            console.log('Clipboard does not contain valid selection data');
          }
        }).catch(() => {
          console.log('Clipboard read failed');
        });
        return;
      }

      // Delete/Backspace (delete selection)
      if (documentId && selection && (event.key === 'Delete' || event.key === 'Backspace')) {
        event.preventDefault();
        clearSelection();
        console.log('Deleted selection');
        return;
      }

      // New Layer (Shift + Cmd/Ctrl + N)
      if (documentId && metaKey && event.shiftKey && event.key.toLowerCase() === 'n') {
        event.preventDefault();
        addLayer(documentId, { name: `Layer ${useGraphicsStore.getState().documents.find(d => d.id === documentId)?.layers.length || 0}` });
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
  }, [documentId, undo, redo, setActiveTool, setCommandPaletteOpen, createDocument, setActiveDocument, closeDocument, addLayer, selection, clearSelection]);
}
