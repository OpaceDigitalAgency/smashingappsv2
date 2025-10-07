import { useCallback } from 'react';
import { useGraphicsStore } from '../state/graphicsStore';
import type { GraphicsStore } from '../types';

export function useGraphicsSelector<T>(selector: (state: GraphicsStore) => T): T {
  return useGraphicsStore(selector);
}

export function useGraphicsDispatch() {
  const setCommandPaletteOpen = useGraphicsStore((state) => state.setCommandPaletteOpen);
  const setActiveTool = useGraphicsStore((state) => state.setActiveTool);

  return {
    setCommandPaletteOpen,
    setActiveTool
  };
}

export function useActiveDocument() {
  return useGraphicsStore(
    useCallback(
      (state) => state.documents.find((doc) => doc.id === state.activeDocumentId) ?? null,
      []
    )
  );
}

export function useActiveDocumentId() {
  return useGraphicsStore((state) => state.activeDocumentId);
}

export function useGraphicsCommands() {
  return useGraphicsStore((state) => ({
    createDocument: state.createDocument,
    closeDocument: state.closeDocument,
    duplicateDocument: state.duplicateDocument,
    setActiveDocument: state.setActiveDocument,
    addLayer: state.addLayer,
    removeLayer: state.removeLayer,
    reorderLayer: state.reorderLayer,
    updateLayer: state.updateLayer,
    toggleLayerVisibility: state.toggleLayerVisibility,
    toggleLayerLock: state.toggleLayerLock,
    undo: state.undo,
    redo: state.redo,
    pushHistory: state.pushHistory,
    setViewport: state.setViewport
  }));
}
