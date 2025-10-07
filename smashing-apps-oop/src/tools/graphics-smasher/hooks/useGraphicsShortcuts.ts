import { useEffect } from 'react';
import { useGraphicsStore } from '../state/graphicsStore';

export function useGraphicsShortcuts(documentId: string | null) {
  const undo = useGraphicsStore((state) => state.undo);
  const redo = useGraphicsStore((state) => state.redo);
  const setActiveTool = useGraphicsStore((state) => state.setActiveTool);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!documentId) {
        return;
      }

      const isMac = navigator.platform.toLowerCase().includes('mac');
      const metaKey = isMac ? event.metaKey : event.ctrlKey;

      if (metaKey && event.key.toLowerCase() === 'z') {
        event.preventDefault();
        const shiftKey = event.shiftKey;
        if (shiftKey) {
          redo(documentId);
        } else {
          undo(documentId);
        }
        return;
      }

      if (event.key === 'b') {
        setActiveTool('brush');
      } else if (event.key === 'v') {
        setActiveTool('move');
      } else if (event.key === 'm') {
        setActiveTool('marquee-rect');
      } else if (event.key === 'l') {
        setActiveTool('lasso-free');
      } else if (event.key === 'e') {
        setActiveTool('eraser');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [documentId, redo, setActiveTool, undo]);
}
