import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { produce } from 'immer';
import {
  type GraphicsStore,
  type GraphicsSettings,
  type DocumentState,
  type Layer,
  type LayerSnapshot,
  type CanvasEngineStatus,
  type ToolOptionsState
} from '../types';
import { createId } from '../utils/id';
import { createBaseLayer } from '../utils/layers/defaultLayers';
import { cloneLayers } from '../utils/layers/cloneLayers';
import type Konva from 'konva';

const MAX_HISTORY_ITEMS = 60;

const getBrowserLocale = (): string => {
  if (typeof navigator !== 'undefined') {
    return navigator.language || 'en';
  }
  return 'en';
};

const defaultSettings: GraphicsSettings = {
  locale: getBrowserLocale(),
  theme: 'system',
  highContrast: false,
  enableWebGPU: true,
  snapToGrid: true,
  snapToGuides: true,
  livePreview: true,
  autosaveEnabled: true,
  autosaveIntervalMs: 15_000
};

const defaultCanvasEngine: CanvasEngineStatus = {
  renderer: '2d',
  webgpuAvailable: false,
  webglAvailable: false,
  initialized: false
};

const defaultToolOptions: ToolOptionsState = {
  brush: {
    size: 25,
    color: '#000000',
    opacity: 1
  },
  eraser: {
    size: 25,
    opacity: 1
  },
  shape: {
    fill: '#4f46e5',
    stroke: '#000000',
    strokeWidth: 2
  },
  pen: {
    stroke: '#000000',
    strokeWidth: 2
  },
  text: {
    font: 'Arial',
    size: 16,
    color: '#000000',
    bold: false,
    italic: false,
    underline: false
  },
  selection: {
    feather: 0,
    tolerance: 32
  }
};

const defaultViewport = {
  zoom: 1,
  panX: 0,
  panY: 0,
  gridSize: 32,
  showGrid: true,
  showRulers: true,
  showGuides: true
};

function createDocumentState(input: Partial<Pick<DocumentState, 'name' | 'width' | 'height' | 'background'>>): DocumentState {
  const now = Date.now();
  const width = Math.max(8, input.width ?? 1920);
  const height = Math.max(8, input.height ?? 1080);
  const background = input.background ?? '#ffffff';
  const backgroundLayer = createBaseLayer('Background');
  backgroundLayer.locked = true;
  backgroundLayer.metadata = {
    ...backgroundLayer.metadata,
    editable: false,
    fill: background
  };

  const drawingLayer = createBaseLayer('Layer 1');
  drawingLayer.metadata = {
    ...drawingLayer.metadata,
    editable: true
  };
  const documentId = createId('doc');

  return {
    id: documentId,
    name: input.name ?? 'Untitled',
    width,
    height,
    background,
    createdAt: now,
    updatedAt: now,
    layers: [backgroundLayer, drawingLayer],
    history: {
      past: [],
      future: []
    },
    activeLayerId: drawingLayer.id,
    viewport: { ...defaultViewport },
    metadata: {}
  };
}

function pushSnapshot(document: DocumentState, description: string) {
  const snapshot: LayerSnapshot = {
    id: createId('hist'),
    payload: cloneLayers(document.layers),
    createdAt: Date.now(),
    description
  };

  document.history.past.push(snapshot);
  if (document.history.past.length > MAX_HISTORY_ITEMS) {
    document.history.past.shift();
  }
  document.history.future = [];
}

// Load panel visibility from localStorage
const loadPanelVisibility = (): import('../types').PanelVisibility => {
  try {
    const saved = localStorage.getItem('gs_panel_visibility');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Failed to load panel visibility:', error);
  }
  return {
    layers: true,
    adjustments: true,
    history: true,
    properties: true,
    assets: true
  };
};

export const useGraphicsStore = create<GraphicsStore>()(
  devtools((set, get) => ({
    ready: false,
    settings: defaultSettings,
    documents: [],
    activeDocumentId: null,
    activeTool: 'move',
    activePanel: 'layers',
    panelVisibility: loadPanelVisibility(),
    commandPaletteOpen: false,
    keyboardShortcutsModalOpen: false,
    aboutModalOpen: false,
    workerStatus: {
      imageProcessing: 'idle',
      ai: 'idle'
    },
    canvasEngine: defaultCanvasEngine,
    toolOptions: { ...defaultToolOptions },
    selection: null,
    canvasStage: null,
    setReady: (ready) => set({ ready }),
    setLocale: (locale) =>
      set((state) =>
        produce(state, (draft) => {
          draft.settings.locale = locale;
        })
      ),
    setTheme: (theme) =>
      set((state) =>
        produce(state, (draft) => {
          draft.settings.theme = theme;
        })
      ),
    toggleHighContrast: () =>
      set((state) =>
        produce(state, (draft) => {
          draft.settings.highContrast = !draft.settings.highContrast;
        })
      ),
    setSetting: (key, value) =>
      set((state) =>
        produce(state, (draft) => {
          draft.settings[key] = value;
        })
      ),
    createDocument: (input) => {
      const document = createDocumentState(input);
      set((state) =>
        produce(state, (draft) => {
          draft.documents.push(document);
          draft.activeDocumentId = document.id;
        })
      );

      return document.id;
    },
    closeDocument: (documentId) => {
      set((state) =>
        produce(state, (draft) => {
          const index = draft.documents.findIndex((doc) => doc.id === documentId);
          if (index === -1) {
            return;
          }
          draft.documents.splice(index, 1);
          if (draft.activeDocumentId === documentId) {
            draft.activeDocumentId = draft.documents[index]?.id ?? draft.documents[index - 1]?.id ?? null;
          }
        })
      );
    },
    setActiveDocument: (documentId) =>
      set((state) =>
        produce(state, (draft) => {
          draft.activeDocumentId = documentId;
        })
      ),
    duplicateDocument: (documentId) => {
      const source = get().documents.find((doc) => doc.id === documentId);
      if (!source) {
        return null;
      }

      const duplicate: DocumentState = {
        ...source,
        id: createId('doc'),
        name: `${source.name} Copy`,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        layers: cloneLayers(source.layers),
        history: {
          past: [],
          future: []
        },
        activeLayerId: source.activeLayerId
      };

      set((state) =>
        produce(state, (draft) => {
          draft.documents.push(duplicate);
          draft.activeDocumentId = duplicate.id;
        })
      );

      return duplicate.id;
    },
    updateDocumentMeta: (documentId, metadata) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          Object.assign(document, metadata);
          document.updatedAt = Date.now();
        })
      ),
    resizeDocument: (documentId, width, height) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          document.width = Math.max(1, width);
          document.height = Math.max(1, height);
          document.updatedAt = Date.now();
        })
      ),
    addLayer: (documentId, input) => {
      const baseLayer = createBaseLayer(input.name ?? 'Layer');
      const layer: Layer = {
        ...baseLayer,
        ...input,
        id: createId('layer'),
        opacity: input.opacity ?? 1,
        blendMode: input.blendMode ?? 'normal',
        visible: input.visible ?? true,
        locked: input.locked ?? false,
        masks: input.masks ?? [],
        transform: input.transform ?? {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          rotation: 0,
          skewX: 0,
          skewY: 0
        },
        metadata: {
          ...baseLayer.metadata,
          editable: true,
          ...input.metadata
        }
      };

      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          document.layers.push(layer);
          document.activeLayerId = layer.id;
          document.updatedAt = Date.now();
          pushSnapshot(document, `Add layer "${layer.name}"`);
        })
      );

      return layer.id;
    },
    removeLayer: (documentId, layerId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const index = document.layers.findIndex((layer) => layer.id === layerId);
          if (index <= 0) {
            // Prevent removing the base background layer for now
            return;
          }
          const [removed] = document.layers.splice(index, 1);
          document.activeLayerId = document.layers[Math.max(0, index - 1)]?.id ?? null;
          document.updatedAt = Date.now();
          pushSnapshot(document, `Remove layer "${removed.name}"`);
        })
      ),
    reorderLayer: (documentId, layerId, targetIndex) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const currentIndex = document.layers.findIndex((layer) => layer.id === layerId);
          if (currentIndex === -1 || currentIndex === targetIndex) {
            return;
          }
          const [layer] = document.layers.splice(currentIndex, 1);
          const clampedTarget = Math.max(0, Math.min(document.layers.length, targetIndex));
          document.layers.splice(clampedTarget, 0, layer);
          document.updatedAt = Date.now();
          pushSnapshot(document, `Reorder layer "${layer.name}"`);
        })
      ),
    setActiveLayer: (documentId, layerId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          document.activeLayerId = layerId;
        })
      ),
    updateLayer: (documentId, layerId, updater) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const layerIndex = document.layers.findIndex((layer) => layer.id === layerId);
          if (layerIndex === -1) {
            return;
          }
          const currentLayer = document.layers[layerIndex];
          const updatedLayer = updater({ ...currentLayer });
          document.layers[layerIndex] = {
            ...currentLayer,
            ...updatedLayer,
            id: currentLayer.id
          };
          document.updatedAt = Date.now();
          pushSnapshot(document, `Update layer "${currentLayer.name}"`);
        })
      ),
    updateLayerSilent: (documentId, layerId, updater) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const layerIndex = document.layers.findIndex((layer) => layer.id === layerId);
          if (layerIndex === -1) {
            return;
          }
          const currentLayer = document.layers[layerIndex];
          const updatedLayer = updater({ ...currentLayer });
          document.layers[layerIndex] = {
            ...currentLayer,
            ...updatedLayer,
            id: currentLayer.id
          };
          document.updatedAt = Date.now();
          // No history push - silent update
        })
      ),
    toggleLayerVisibility: (documentId, layerId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const layer = document.layers.find((l) => l.id === layerId);
          if (!layer) {
            return;
          }
          layer.visible = !layer.visible;
          document.updatedAt = Date.now();
          pushSnapshot(document, `${layer.visible ? 'Show' : 'Hide'} layer "${layer.name}"`);
        })
      ),
    toggleLayerLock: (documentId, layerId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const layer = document.layers.find((l) => l.id === layerId);
          if (!layer) {
            return;
          }
          layer.locked = !layer.locked;
          document.updatedAt = Date.now();
          pushSnapshot(document, `${layer.locked ? 'Lock' : 'Unlock'} layer "${layer.name}"`);
        })
      ),
    pushHistory: (documentId, description) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          pushSnapshot(document, description);
        })
      ),
    undo: (documentId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const snapshot = document.history.past.pop();
          if (!snapshot) {
            return;
          }
          const current: LayerSnapshot = {
            id: createId('hist'),
            payload: cloneLayers(document.layers),
            createdAt: Date.now(),
            description: 'Checkpoint'
          };
          document.history.future.unshift(current);
          document.layers = cloneLayers(snapshot.payload);
          document.updatedAt = Date.now();
        })
      ),
    redo: (documentId) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          const snapshot = document.history.future.shift();
          if (!snapshot) {
            return;
          }
          document.history.past.push({
            id: createId('hist'),
            payload: cloneLayers(document.layers),
            createdAt: Date.now(),
            description: 'Checkpoint'
          });
          document.layers = cloneLayers(snapshot.payload);
          document.updatedAt = Date.now();
        })
      ),
    setViewport: (documentId, viewport) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }
          document.viewport = { ...document.viewport, ...viewport };
        })
      ),
    setActiveTool: (tool) =>
      set((state) =>
        produce(state, (draft) => {
          draft.activeTool = tool;
        })
      ),
    setActivePanel: (panel) =>
      set((state) =>
        produce(state, (draft) => {
          draft.activePanel = panel;
        })
      ),
    togglePanelVisibility: (panel) =>
      set((state) =>
        produce(state, (draft) => {
          draft.panelVisibility[panel] = !draft.panelVisibility[panel];
          // Save to localStorage
          try {
            localStorage.setItem('gs_panel_visibility', JSON.stringify(draft.panelVisibility));
          } catch (error) {
            console.error('Failed to save panel visibility:', error);
          }
        })
      ),
    setPanelVisibility: (panel, visible) =>
      set((state) =>
        produce(state, (draft) => {
          draft.panelVisibility[panel] = visible;
          // Save to localStorage
          try {
            localStorage.setItem('gs_panel_visibility', JSON.stringify(draft.panelVisibility));
          } catch (error) {
            console.error('Failed to save panel visibility:', error);
          }
        })
      ),
    setCommandPaletteOpen: (open) =>
      set((state) =>
        produce(state, (draft) => {
          draft.commandPaletteOpen = open;
        })
      ),
    setKeyboardShortcutsModalOpen: (open) =>
      set((state) =>
        produce(state, (draft) => {
          draft.keyboardShortcutsModalOpen = open;
        })
      ),
    setAboutModalOpen: (open) =>
      set((state) =>
        produce(state, (draft) => {
          draft.aboutModalOpen = open;
        })
      ),
    setWorkerStatus: (worker, status) =>
      set((state) =>
        produce(state, (draft) => {
          draft.workerStatus[worker] = status as GraphicsStore['workerStatus'][typeof worker];
        })
      ),
    setCanvasEngineStatus: (status) =>
      set((state) =>
        produce(state, (draft) => {
          draft.canvasEngine = {
            ...draft.canvasEngine,
            ...status,
            initialized: status.initialized ?? draft.canvasEngine.initialized
          };
        })
      ),
    setToolOptions: (tool, options) =>
      set((state) =>
        produce(state, (draft) => {
          const key: typeof tool = tool;
          draft.toolOptions[key] = {
            ...(draft.toolOptions[key] as ToolOptionsState[typeof key]),
            ...options
          } as ToolOptionsState[typeof key];
        })
      ),
    setSelection: (selection) =>
      set((state) =>
        produce(state, (draft) => {
          draft.selection = selection;
        })
      ),
    clearSelection: () =>
      set((state) =>
        produce(state, (draft) => {
          draft.selection = null;
        })
      ),
    cropDocument: (documentId, rect) =>
      set((state) =>
        produce(state, (draft) => {
          const document = draft.documents.find((doc) => doc.id === documentId);
          if (!document) {
            return;
          }

          const clampedX = Math.max(0, Math.min(rect.x, document.width));
          const clampedY = Math.max(0, Math.min(rect.y, document.height));
          const clampedWidth = Math.max(
            1,
            Math.min(rect.width, document.width - clampedX)
          );
          const clampedHeight = Math.max(
            1,
            Math.min(rect.height, document.height - clampedY)
          );

          const dx = clampedX;
          const dy = clampedY;

          document.layers.forEach((layer, index) => {
            layer.transform = {
              ...layer.transform,
              x: index === 0 ? 0 : layer.transform.x - dx,
              y: index === 0 ? 0 : layer.transform.y - dy
            };

            const metadata = layer.metadata ?? {};
            const strokes = Array.isArray((metadata as any).strokes) ? (metadata as any).strokes : [];
            const shapes = Array.isArray((metadata as any).shapes) ? (metadata as any).shapes : [];

            const shiftedStrokes = strokes.map((stroke: any) => ({
              ...stroke,
              points: stroke.points.map((value: number, pointIndex: number) =>
                pointIndex % 2 === 0 ? value - dx : value - dy
              )
            }));

            const shiftedShapes = shapes.map((shape: any) => ({
              ...shape,
              x: (shape.x ?? 0) - dx,
              y: (shape.y ?? 0) - dy
            }));

            layer.metadata = {
              ...metadata,
              strokes: shiftedStrokes,
              shapes: shiftedShapes
            };
          });

          document.width = clampedWidth;
          document.height = clampedHeight;
          document.viewport = {
            ...document.viewport,
            panX: 0,
            panY: 0
          };
          document.updatedAt = Date.now();
          draft.selection = null;
        })
      ),
    setCanvasStage: (stage) =>
      set((state) =>
        produce(state, (draft) => {
          draft.canvasStage = stage;
        })
      )
  })),
  { name: 'GraphicsSmasherStore' }
);

export const graphicsStoreApi = {
  getState: () => useGraphicsStore.getState(),
  subscribe: useGraphicsStore.subscribe,
  setState: useGraphicsStore.setState
};

export function resetGraphicsStore() {
  useGraphicsStore.setState(() => ({
    ready: false,
    settings: { ...defaultSettings },
    documents: [],
    activeDocumentId: null,
    activeTool: 'move',
    activePanel: 'layers',
    commandPaletteOpen: false,
    workerStatus: {
      imageProcessing: 'idle',
      ai: 'idle'
    },
    canvasEngine: { ...defaultCanvasEngine },
    toolOptions: { ...defaultToolOptions },
    selection: null,
    canvasStage: null,
    setReady: useGraphicsStore.getState().setReady,
    setLocale: useGraphicsStore.getState().setLocale,
    setTheme: useGraphicsStore.getState().setTheme,
    toggleHighContrast: useGraphicsStore.getState().toggleHighContrast,
    setSetting: useGraphicsStore.getState().setSetting,
    createDocument: useGraphicsStore.getState().createDocument,
    closeDocument: useGraphicsStore.getState().closeDocument,
    setActiveDocument: useGraphicsStore.getState().setActiveDocument,
    duplicateDocument: useGraphicsStore.getState().duplicateDocument,
    updateDocumentMeta: useGraphicsStore.getState().updateDocumentMeta,
    addLayer: useGraphicsStore.getState().addLayer,
    removeLayer: useGraphicsStore.getState().removeLayer,
    reorderLayer: useGraphicsStore.getState().reorderLayer,
    setActiveLayer: useGraphicsStore.getState().setActiveLayer,
    updateLayer: useGraphicsStore.getState().updateLayer,
    toggleLayerVisibility: useGraphicsStore.getState().toggleLayerVisibility,
    toggleLayerLock: useGraphicsStore.getState().toggleLayerLock,
    pushHistory: useGraphicsStore.getState().pushHistory,
    undo: useGraphicsStore.getState().undo,
    redo: useGraphicsStore.getState().redo,
    setViewport: useGraphicsStore.getState().setViewport,
    setActiveTool: useGraphicsStore.getState().setActiveTool,
    setActivePanel: useGraphicsStore.getState().setActivePanel,
    togglePanelVisibility: useGraphicsStore.getState().togglePanelVisibility,
    setPanelVisibility: useGraphicsStore.getState().setPanelVisibility,
    setCommandPaletteOpen: useGraphicsStore.getState().setCommandPaletteOpen,
    setWorkerStatus: useGraphicsStore.getState().setWorkerStatus,
    setCanvasEngineStatus: useGraphicsStore.getState().setCanvasEngineStatus,
    setToolOptions: useGraphicsStore.getState().setToolOptions,
    setSelection: useGraphicsStore.getState().setSelection,
    clearSelection: useGraphicsStore.getState().clearSelection,
    cropDocument: useGraphicsStore.getState().cropDocument,
    setCanvasStage: useGraphicsStore.getState().setCanvasStage
  }));
}
