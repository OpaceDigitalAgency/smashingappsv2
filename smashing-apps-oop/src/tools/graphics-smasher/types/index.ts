import type { ReactNode } from 'react';

export type GraphicsToolId =
  | 'move'
  | 'marquee-rect'
  | 'marquee-ellipse'
  | 'lasso-free'
  | 'lasso-poly'
  | 'lasso-magnetic'
  | 'object-select'
  | 'magic-wand'
  | 'crop'
  | 'brush'
  | 'eraser'
  | 'clone-stamp'
  | 'healing-brush'
  | 'gradient'
  | 'paint-bucket'
  | 'text'
  | 'shape'
  | 'pen'
  | 'zoom'
  | 'hand';

export type LayerBlendMode =
  | 'normal'
  | 'multiply'
  | 'screen'
  | 'overlay'
  | 'soft-light'
  | 'hard-light'
  | 'color'
  | 'luminosity';

export type LayerKind =
  | 'raster'
  | 'vector'
  | 'text'
  | 'adjustment'
  | 'group'
  | 'smart-object'
  | 'artboard'
  | 'procedural';

export interface LayerMask {
  id: string;
  type: 'pixel' | 'vector';
  enabled: boolean;
  data?: ArrayBuffer;
}

export interface LayerTransform {
  x: number;
  y: number;
  scaleX: number;
  scaleY: number;
  rotation: number;
  skewX: number;
  skewY: number;
  perspective?: number;
}

export interface Layer {
  id: string;
  name: string;
  kind: LayerKind;
  visible: boolean;
  locked: boolean;
  opacity: number;
  blendMode: LayerBlendMode;
  groupId?: string;
  masks: LayerMask[];
  transform: LayerTransform;
  metadata?: Record<string, unknown>;
}

export interface LayerSnapshot {
  id: string;
  payload: Layer[];
  createdAt: number;
  description: string;
}

export interface DocumentHistory {
  past: LayerSnapshot[];
  future: LayerSnapshot[];
}

export interface DocumentViewport {
  zoom: number;
  panX: number;
  panY: number;
  gridSize: number;
  showGrid: boolean;
  showRulers: boolean;
  showGuides: boolean;
}

export interface DocumentState {
  id: string;
  name: string;
  width: number;
  height: number;
  background: string;
  createdAt: number;
  updatedAt: number;
  layers: Layer[];
  history: DocumentHistory;
  activeLayerId: string | null;
  viewport: DocumentViewport;
  metadata?: Record<string, unknown>;
}

export type PanelTab =
  | 'layers'
  | 'adjustments'
  | 'history'
  | 'properties'
  | 'assets';

export interface CommandDescriptor {
  id: string;
  label: string;
  shortcut?: string;
  section: 'document' | 'edit' | 'view' | 'ai' | 'export' | 'settings';
  run: () => void | Promise<void>;
  disabled?: boolean;
  keywords?: string[];
  icon?: ReactNode;
}

export interface CanvasEngineStatus {
  renderer: '2d' | 'webgl' | 'webgpu';
  webgpuAvailable: boolean;
  webglAvailable: boolean;
  initialized: boolean;
}

export interface GraphicsSettings {
  locale: string;
  theme: 'light' | 'dark' | 'system';
  highContrast: boolean;
  enableWebGPU: boolean;
  snapToGrid: boolean;
  snapToGuides: boolean;
  livePreview: boolean;
  autosaveEnabled: boolean;
  autosaveIntervalMs: number;
}

export interface WorkerStatus {
  imageProcessing: 'idle' | 'initializing' | 'ready' | 'error';
  ai: 'idle' | 'initializing' | 'ready' | 'error';
}

export interface GraphicsStoreState {
  ready: boolean;
  settings: GraphicsSettings;
  documents: DocumentState[];
  activeDocumentId: string | null;
  activeTool: GraphicsToolId;
  activePanel: PanelTab;
  commandPaletteOpen: boolean;
  workerStatus: WorkerStatus;
  canvasEngine: CanvasEngineStatus;
}

export interface GraphicsStoreActions {
  setReady: (ready: boolean) => void;
  setLocale: (locale: string) => void;
  setTheme: (theme: GraphicsSettings['theme']) => void;
  toggleHighContrast: () => void;
  setSetting: <K extends keyof GraphicsSettings>(key: K, value: GraphicsSettings[K]) => void;
  createDocument: (input: Partial<Pick<DocumentState, 'name' | 'width' | 'height' | 'background'>>) => string;
  closeDocument: (documentId: string) => void;
  setActiveDocument: (documentId: string) => void;
  duplicateDocument: (documentId: string) => string | null;
  updateDocumentMeta: (documentId: string, metadata: Partial<Pick<DocumentState, 'name' | 'background'>>) => void;
  addLayer: (documentId: string, layer: Partial<Layer>) => string | null;
  removeLayer: (documentId: string, layerId: string) => void;
  reorderLayer: (documentId: string, layerId: string, targetIndex: number) => void;
  setActiveLayer: (documentId: string, layerId: string | null) => void;
  updateLayer: (documentId: string, layerId: string, updater: (layer: Layer) => Layer) => void;
  toggleLayerVisibility: (documentId: string, layerId: string) => void;
  toggleLayerLock: (documentId: string, layerId: string) => void;
  pushHistory: (documentId: string, description: string) => void;
  undo: (documentId: string) => void;
  redo: (documentId: string) => void;
  setViewport: (documentId: string, viewport: Partial<DocumentViewport>) => void;
  setActiveTool: (tool: GraphicsToolId) => void;
  setActivePanel: (panel: PanelTab) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  setWorkerStatus: (worker: keyof WorkerStatus, status: WorkerStatus[keyof WorkerStatus]) => void;
  setCanvasEngineStatus: (status: Partial<CanvasEngineStatus>) => void;
}

export type GraphicsStore = GraphicsStoreState & GraphicsStoreActions;
