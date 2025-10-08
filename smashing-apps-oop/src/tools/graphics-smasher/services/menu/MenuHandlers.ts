import type { DocumentState, Layer } from '../../types';
import { renderDocumentToCanvas } from '../../utils/export/renderDocumentToCanvas';
import { useGraphicsStore } from '../../state/graphicsStore';
import { ClipboardService } from '../clipboard/ClipboardService';

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
    await ClipboardService.cutSelection(selection, documentId);
  }

  async copy(selection: any): Promise<void> {
    if (!selection) return;
    const { activeDocumentId } = useGraphicsStore.getState();
    await ClipboardService.copySelection(selection, activeDocumentId);
  }

  async paste(documentId: string | null): Promise<void> {
    if (!documentId) return;
    await ClipboardService.paste(documentId);
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
    const { resizeDocument } = useGraphicsStore.getState();
    resizeDocument(documentId, width, height);
  }

  resizeCanvas(documentId: string | null, width: number, height: number): void {
    if (!documentId) return;
    const { resizeDocument } = useGraphicsStore.getState();
    resizeDocument(documentId, width, height);
  }

  rotateCanvas(documentId: string | null, degrees: number): void {
    if (!documentId) return;
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const radians = (degrees * Math.PI) / 180;
    
    // Rotate each layer around the document center
    const centerX = document.width / 2;
    const centerY = document.height / 2;
    
    document.layers.forEach(layer => {
      const currentRotation = layer.transform.rotation || 0;
      const currentX = layer.transform.x || 0;
      const currentY = layer.transform.y || 0;
      
      // Calculate new position after rotation around center
      const dx = currentX - centerX;
      const dy = currentY - centerY;
      const cos = Math.cos(radians);
      const sin = Math.sin(radians);
      
      const newX = centerX + (dx * cos - dy * sin);
      const newY = centerY + (dx * sin + dy * cos);
      
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          x: newX,
          y: newY,
          rotation: currentRotation + radians
        }
      }));
    });
    
    // Force a re-render by updating the document timestamp
    const { updateDocumentMeta } = useGraphicsStore.getState();
    updateDocumentMeta(documentId, {});
  }

  flipHorizontal(documentId: string | null): void {
    if (!documentId) return;
    const { documents, updateLayer, updateDocumentMeta } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const centerX = document.width / 2;
    
    document.layers.forEach(layer => {
      const currentX = layer.transform.x || 0;
      const currentScaleX = layer.transform.scaleX;
      
      // Calculate new X position to keep layer centered after flip
      const newX = centerX - (currentX - centerX);
      
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          x: newX,
          scaleX: -currentScaleX
        }
      }));
    });
    
    // Force a re-render
    updateDocumentMeta(documentId, {});
  }

  flipVertical(documentId: string | null): void {
    if (!documentId) return;
    const { documents, updateLayer, updateDocumentMeta } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const centerY = document.height / 2;
    
    document.layers.forEach(layer => {
      const currentY = layer.transform.y || 0;
      const currentScaleY = layer.transform.scaleY;
      
      // Calculate new Y position to keep layer centered after flip
      const newY = centerY - (currentY - centerY);
      
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          y: newY,
          scaleY: -currentScaleY
        }
      }));
    });
    
    // Force a re-render
    updateDocumentMeta(documentId, {});
  }

  // Transform Menu Handlers
  transformLayer(documentId: string | null, activeLayerId: string | null, type: 'scale' | 'rotate' | 'skew'): void {
    if (!documentId || !activeLayerId) return;
    // TODO: Implement transform UI
    alert(`Transform ${type} - Coming soon`);
  }

  // Fill and Stroke Handlers
  fill(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const color = prompt('Enter fill colour (hex):', '#000000');
    if (!color) return;
    
    const { updateLayer } = useGraphicsStore.getState();
    updateLayer(documentId, activeLayerId, (layer) => ({
      ...layer,
      metadata: {
        ...layer.metadata,
        fill: color
      }
    }));
  }

  stroke(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const color = prompt('Enter stroke colour (hex):', '#000000');
    if (!color) return;
    const width = prompt('Enter stroke width:', '2');
    if (!width) return;
    
    const { updateLayer } = useGraphicsStore.getState();
    updateLayer(documentId, activeLayerId, (layer) => ({
      ...layer,
      metadata: {
        ...layer.metadata,
        stroke: color,
        strokeWidth: parseFloat(width)
      }
    }));
  }

  // Select Menu Handlers
  reselect(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement reselect from history
    alert('Reselect - Coming soon');
  }

  inverseSelection(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    // TODO: Implement inverse selection
    alert('Inverse Selection - Coming soon');
  }

  modifySelection(type: 'border' | 'smooth' | 'expand' | 'contract' | 'feather', documentId: string | null): void {
    if (!documentId) return;
    const value = prompt(`Enter ${type} value:`, '1');
    if (!value) return;
    // TODO: Implement selection modification
    alert(`Modify Selection: ${type} by ${value}px - Coming soon`);
  }

  growSelection(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement grow selection
    alert('Grow Selection - Coming soon');
  }

  similarSelection(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement similar selection
    alert('Similar Selection - Coming soon');
  }

  transformSelection(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement transform selection
    alert('Transform Selection - Coming soon');
  }

  saveSelection(documentId: string | null): void {
    if (!documentId) return;
    const name = prompt('Enter selection name:', 'Selection 1');
    if (!name) return;
    // TODO: Implement save selection
    alert(`Save Selection: ${name} - Coming soon`);
  }

  loadSelection(): void {
    // TODO: Implement load selection
    alert('Load Selection - Coming soon');
  }

  // Image Size & Canvas Size Dialogs
  showImageSizeDialog(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const width = prompt('Enter new image width:', String(document.width));
    if (!width) return;
    const height = prompt('Enter new image height:', String(document.height));
    if (!height) return;
    
    this.resizeDocument(documentId, parseInt(width), parseInt(height));
  }

  showCanvasSizeDialog(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const width = prompt('Enter new canvas width:', String(document.width));
    if (!width) return;
    const height = prompt('Enter new canvas height:', String(document.height));
    if (!height) return;
    
    this.resizeCanvas(documentId, parseInt(width), parseInt(height));
  }

  showArbitraryRotateDialog(documentId: string | null): void {
    if (!documentId) return;
    const degrees = prompt('Enter rotation angle in degrees:', '45');
    if (!degrees) return;
    
    this.rotateCanvas(documentId, parseFloat(degrees));
  }

  // Trim functionality
  trim(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement trim transparent pixels
    alert('Trim - Coming soon');
  }

  // Place and Import
  async placeFile(): Promise<void> {
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
          const { activeDocumentId, addLayer, updateLayer } = useGraphicsStore.getState();
          if (!activeDocumentId) {
            resolve();
            return;
          }

          const img = new Image();
          const reader = new FileReader();

          reader.onload = (event) => {
            img.onload = () => {
              const layerId = addLayer(activeDocumentId, {
                name: file.name.replace(/\.[^/.]+$/, ''),
              });

              if (layerId) {
                updateLayer(activeDocumentId, layerId, (layer) => ({
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
          console.error('Failed to place file:', error);
          resolve();
        }
      };
      input.click();
    });
  }

  async importFromClipboard(): Promise<void> {
    const { activeDocumentId } = useGraphicsStore.getState();
    if (!activeDocumentId) return;
    await ClipboardService.paste(activeDocumentId);
  }

  // Filter Menu Handlers
  applyFilter(filter: string, documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement actual filters with Web Workers
    alert(`Apply Filter: ${filter} - Coming soon`);
  }

  // Layer Operations
  mergeDown(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { documents, updateLayer, removeLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const currentIndex = document.layers.findIndex(l => l.id === activeLayerId);
    if (currentIndex <= 0) return; // Can't merge down from bottom layer

    const belowLayer = document.layers[currentIndex - 1];
    if (!belowLayer) return;

    // TODO: Implement actual layer merging with canvas composition
    alert('Merge Down - Coming soon');
  }

  mergeVisible(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement merge visible layers
    alert('Merge Visible - Coming soon');
  }

  flattenImage(documentId: string | null): void {
    if (!documentId) return;
    if (!confirm('Flatten all layers into one? This cannot be undone.')) return;
    
    // TODO: Implement actual layer flattening
    alert('Flatten Image - Coming soon');
  }

  // Layer Properties
  showLayerProperties(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { setActivePanel } = useGraphicsStore.getState();
    setActivePanel('properties');
  }

  // Layer Styles (placeholder implementations)
  applyLayerStyle(style: string, documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    alert(`Apply ${style} - Coming soon`);
  }

  // Adjustment Layers
  addAdjustmentLayer(type: string, documentId: string | null): void {
    if (!documentId) return;
    const { addLayer } = useGraphicsStore.getState();
    addLayer(documentId, {
      name: `${type} Adjustment`,
      kind: 'adjustment',
      metadata: { adjustmentType: type }
    });
  }

  // Layer Masks
  addLayerMask(type: 'reveal' | 'hide' | 'selection', documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    alert(`Add Layer Mask: ${type} - Coming soon`);
  }

  // View Operations
  toggleSnap(): void {
    const { settings, setSetting } = useGraphicsStore.getState();
    setSetting('snapToGrid', !settings.snapToGrid);
  }

  lockGuides(): void {
    // TODO: Implement guide locking
    alert('Lock Guides - Coming soon');
  }

  clearGuides(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement clear guides
    alert('Clear Guides - Coming soon');
  }

  // Workspace presets
  setWorkspace(preset: string): void {
    // TODO: Implement workspace layouts
    alert(`Switch to ${preset} workspace - Coming soon`);
  }

  // Preferences
  showPreferences(): void {
    // TODO: Implement preferences dialog
    alert('Preferences - Coming soon');
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