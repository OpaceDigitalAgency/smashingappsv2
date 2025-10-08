import type { DocumentState, Layer } from '../../types';
import { renderDocumentToCanvas } from '../../utils/export/renderDocumentToCanvas';
import { useGraphicsStore } from '../../state/graphicsStore';

export class MenuHandlers {
  private static instance: MenuHandlers;

  private constructor() {}

  static getInstance(): MenuHandlers {
    if (!MenuHandlers.instance) {
      MenuHandlers.instance = new MenuHandlers();
    }
    return MenuHandlers.instance;
  }

  // File Menu Handlers
  newDocument(): void {
    const { createDocument, setActiveDocument } = useGraphicsStore.getState();
    const id = createDocument({ name: 'Untitled', width: 1920, height: 1080 });
    setActiveDocument(id);
  }

  async openFile(): Promise<void> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';
      input.onchange = async (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve();
          return;
        }

        try {
          const img = new Image();
          const reader = new FileReader();

          reader.onload = (event) => {
            img.onload = () => {
              const { createDocument, setActiveDocument, updateLayer } = useGraphicsStore.getState();
              const docId = createDocument({
                name: file.name.replace(/\.[^/.]+$/, ''),
                width: img.width,
                height: img.height
              });

              setActiveDocument(docId);

              const doc = useGraphicsStore.getState().documents.find(d => d.id === docId);
              if (doc) {
                updateLayer(docId, doc.layers[0].id, (layer) => ({
                  ...layer,
                  metadata: {
                    ...layer.metadata,
                    imageUrl: img.src,
                    imageWidth: img.width,
                    imageHeight: img.height
                  }
                }));
              }
              resolve();
            };
            img.src = event.target?.result as string;
          };

          reader.readAsDataURL(file);
        } catch (error) {
          console.error('Failed to open file:', error);
          resolve();
        }
      };
      input.click();
    });
  }

  async save(document: DocumentState | null): Promise<void> {
    if (!document) return;
    await this.exportAs(document, 'png');
  }

  async saveAs(document: DocumentState | null): Promise<void> {
    if (!document) return;
    await this.exportAs(document, 'png');
  }

  async exportAs(document: DocumentState | null, format: 'png' | 'jpeg' | 'webp' | 'svg'): Promise<void> {
    if (!document) return;

    try {
      const canvas = await renderDocumentToCanvas(document);

      if (format === 'svg') {
        const pngDataUrl = canvas.toDataURL('image/png');
        const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="${document.width}" height="${document.height}" viewBox="0 0 ${document.width} ${document.height}"><image href="${pngDataUrl}" width="${document.width}" height="${document.height}" /></svg>`;
        const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.name}.svg`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
        return;
      }

      const mimeType = `image/${format}`;
      canvas.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to export document.');
          return;
        }

        const url = URL.createObjectURL(blob);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = `${document.name}.${format}`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 100);
      }, mimeType, format === 'jpeg' ? 0.95 : undefined);
    } catch (error) {
      console.error('Failed to export document:', error);
    }
  }

  closeDocument(documentId: string | null): void {
    if (!documentId) return;
    const { closeDocument } = useGraphicsStore.getState();
    closeDocument(documentId);
  }

  // Edit Menu Handlers
  undo(documentId: string | null): void {
    if (!documentId) return;
    const { undo } = useGraphicsStore.getState();
    undo(documentId);
  }

  redo(documentId: string | null): void {
    if (!documentId) return;
    const { redo } = useGraphicsStore.getState();
    redo(documentId);
  }

  async cut(selection: any, documentId: string | null): Promise<void> {
    if (!selection || !documentId) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selection));
      const { clearSelection } = useGraphicsStore.getState();
      clearSelection();
    } catch (error) {
      console.error('Clipboard write failed:', error);
    }
  }

  async copy(selection: any): Promise<void> {
    if (!selection) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(selection));
    } catch (error) {
      console.error('Clipboard write failed:', error);
    }
  }

  async paste(documentId: string | null): Promise<void> {
    if (!documentId) return;
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text);
      console.log('Pasted from clipboard:', data);
    } catch (error) {
      console.log('Clipboard does not contain valid selection data');
    }
  }

  clear(selection: any, documentId: string | null): void {
    if (!selection || !documentId) return;
    const { clearSelection } = useGraphicsStore.getState();
    clearSelection();
  }

  selectAll(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document || !document.activeLayerId) return;
    const { setSelection } = useGraphicsStore.getState();
    setSelection({
      tool: 'marquee-rect',
      layerId: document.activeLayerId,
      shape: {
        type: 'rect',
        x: 0,
        y: 0,
        width: document.width,
        height: document.height
      }
    });
  }

  deselect(): void {
    const { clearSelection } = useGraphicsStore.getState();
    clearSelection();
  }

  // Layer Menu Handlers
  addLayer(documentId: string | null, document: DocumentState | null): void {
    if (!documentId) return;
    const { addLayer } = useGraphicsStore.getState();
    addLayer(documentId, { name: `Layer ${(document?.layers.length || 0) + 1}` });
  }

  duplicateLayer(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { documents, addLayer, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const sourceLayer = document.layers.find(l => l.id === activeLayerId);
    if (!sourceLayer) return;

    const newLayerId = addLayer(documentId, {
      name: `${sourceLayer.name} Copy`,
      opacity: sourceLayer.opacity,
      blendMode: sourceLayer.blendMode,
      visible: sourceLayer.visible,
      locked: false,
      transform: { ...sourceLayer.transform },
      metadata: { ...sourceLayer.metadata }
    });

    if (newLayerId && sourceLayer.metadata) {
      updateLayer(documentId, newLayerId, (layer) => ({
        ...layer,
        metadata: { ...sourceLayer.metadata }
      }));
    }
  }

  deleteLayer(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { removeLayer } = useGraphicsStore.getState();
    removeLayer(documentId, activeLayerId);
  }

  // View Menu Handlers
  zoomIn(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { setViewport } = useGraphicsStore.getState();
    const newZoom = Math.min(document.viewport.zoom * 1.2, 32);
    setViewport(documentId, { zoom: newZoom });
  }

  zoomOut(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { setViewport } = useGraphicsStore.getState();
    const newZoom = Math.max(document.viewport.zoom / 1.2, 0.01);
    setViewport(documentId, { zoom: newZoom });
  }

  fitToScreen(documentId: string | null): void {
    if (!documentId) return;
    const { setViewport } = useGraphicsStore.getState();
    setViewport(documentId, { zoom: 1, panX: 0, panY: 0 });
  }

  actualPixels(documentId: string | null): void {
    if (!documentId) return;
    const { setViewport } = useGraphicsStore.getState();
    setViewport(documentId, { zoom: 1 });
  }

  toggleRulers(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { setViewport } = useGraphicsStore.getState();
    setViewport(documentId, { showRulers: !document.viewport.showRulers });
  }

  toggleGrid(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { setViewport } = useGraphicsStore.getState();
    setViewport(documentId, { showGrid: !document.viewport.showGrid });
  }

  toggleGuides(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { setViewport } = useGraphicsStore.getState();
    setViewport(documentId, { showGuides: !document.viewport.showGuides });
  }

  // Window Menu Handlers
  showPanel(panel: 'layers' | 'history' | 'properties' | 'adjustments'): void {
    const { setActivePanel } = useGraphicsStore.getState();
    setActivePanel(panel);
  }

  // Image Menu Handlers
  cropToSelection(documentId: string | null, selection: any): void {
    if (!documentId || !selection || selection.shape.type !== 'rect') return;
    const { cropDocument } = useGraphicsStore.getState();
    cropDocument(documentId, {
      x: selection.shape.x,
      y: selection.shape.y,
      width: selection.shape.width,
      height: selection.shape.height
    });
  }

  resizeDocument(documentId: string | null, width: number, height: number): void {
    if (!documentId) return;
    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;
    document.width = width;
    document.height = height;
    document.updatedAt = Date.now();
  }

  resizeCanvas(documentId: string | null, width: number, height: number): void {
    if (!documentId) return;
    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;
    document.width = width;
    document.height = height;
    document.updatedAt = Date.now();
  }

  rotateCanvas(documentId: string | null, degrees: number): void {
    if (!documentId) return;
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const radians = (degrees * Math.PI) / 180;
    document.layers.forEach(layer => {
      const currentRotation = layer.transform.rotation || 0;
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          rotation: currentRotation + radians
        }
      }));
    });
  }

  flipHorizontal(documentId: string | null): void {
    if (!documentId) return;
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    document.layers.forEach(layer => {
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          scaleX: -l.transform.scaleX
        }
      }));
    });
  }

  flipVertical(documentId: string | null): void {
    if (!documentId) return;
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    document.layers.forEach(layer => {
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          scaleY: -l.transform.scaleY
        }
      }));
    });
  }

  // Help Menu Handlers
  showHelp(): void {
    window.open('https://github.com/your-repo/graphics-smasher/wiki', '_blank');
  }

  showKeyboardShortcuts(): void {
    const { setCommandPaletteOpen } = useGraphicsStore.getState();
    setCommandPaletteOpen(true);
  }

  showAbout(): void {
    alert('Graphics Smasher\nVersion 1.0.0\nA professional graphics editor built with React and TypeScript');
  }
}

export const menuHandlers = MenuHandlers.getInstance();