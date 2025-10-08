import type { DocumentState, Layer } from '../../types';
import { renderDocumentToCanvas } from '../../utils/export/renderDocumentToCanvas';
import { useGraphicsStore } from '../../state/graphicsStore';
import { ClipboardService } from '../clipboard/ClipboardService';
import { ProjectService } from '../filesystem/ProjectService';
import { ExportDialogService } from '../dialogs/ExportDialog';
import { ImageSizeDialogService } from '../dialogs/ImageSizeDialog';

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
    // For now, save as PNG. In future, could check if project file exists
    await this.exportAs(document, 'png');
  }

  async saveAs(document: DocumentState | null): Promise<void> {
    if (!document) return;
    await this.exportAs(document, 'png');
  }

  async saveProject(document: DocumentState | null): Promise<void> {
    if (!document) return;
    await ProjectService.saveProject(document);
  }

  async loadProject(): Promise<void> {
    const document = await ProjectService.loadProject();
    if (document) {
      const { documents, setActiveDocument } = useGraphicsStore.getState();
      // Add the loaded document to the store
      // For now, we'll need to create a new document and copy the data
      // This is a simplified implementation
      const { createDocument } = useGraphicsStore.getState();
      const newId = createDocument({
        name: document.name,
        width: document.width,
        height: document.height
      });
      setActiveDocument(newId);
      // TODO: Properly restore all document state including layers
    }
  }

  async exportAs(document: DocumentState | null, format: 'png' | 'jpeg' | 'webp' | 'svg', quality?: number): Promise<void> {
    if (!document) return;

    // Get quality setting for JPEG/WebP if not provided
    let exportQuality = quality;
    if (!exportQuality) {
      if (format === 'jpeg') {
        const options = await ExportDialogService.showJpegExportDialog();
        if (options.cancelled) return;
        exportQuality = options.quality;
      } else if (format === 'webp') {
        const options = await ExportDialogService.showWebPExportDialog();
        if (options.cancelled) return;
        exportQuality = options.quality;
      }
    }

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
      const qualityValue = exportQuality ? exportQuality / 100 : (format === 'jpeg' ? 0.95 : 0.9);

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
      }, mimeType, format === 'jpeg' || format === 'webp' ? qualityValue : undefined);
    } catch (error) {
      console.error('Failed to export document:', error);
    }
  }

  async closeDocument(documentId: string | null): Promise<void> {
    if (!documentId) return;

    const { documents, closeDocument } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);

    if (document) {
      // Check for unsaved changes and prompt if needed
      const canClose = await ProjectService.promptSaveBeforeClose(document);
      if (canClose) {
        closeDocument(documentId);
      }
    } else {
      closeDocument(documentId);
    }
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

  async resizeDocument(documentId: string | null): Promise<void> {
    if (!documentId) return;

    const { documents, resizeDocument } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const options = await ImageSizeDialogService.showImageSizeDialog(document.width, document.height);
    if (!options.cancelled) {
      resizeDocument(documentId, options.width, options.height);
    }
  }

  async resizeCanvas(documentId: string | null): Promise<void> {
    if (!documentId) return;

    const { documents, resizeDocument } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const options = await ImageSizeDialogService.showCanvasSizeDialog(document.width, document.height);
    if (!options.cancelled) {
      // For canvas size, we don't scale layers, just change document dimensions
      // Layers stay in their current positions
      resizeDocument(documentId, options.width, options.height);
    }
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
    // Transform dialog will be shown by the component that calls this
    // For now, we'll use a simple prompt-based approach
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    const layer = document?.layers.find(l => l.id === activeLayerId);

    if (!layer) return;

    if (type === 'scale') {
      const scaleInput = prompt('Enter scale percentage (e.g., 150 for 150%):', '100');
      if (scaleInput) {
        const scale = parseFloat(scaleInput) / 100;
        if (!isNaN(scale)) {
          updateLayer(documentId, activeLayerId, (l) => ({
            ...l,
            transform: {
              ...l.transform,
              scaleX: scale,
              scaleY: scale
            }
          }));
        }
      }
    } else if (type === 'rotate') {
      const rotateInput = prompt('Enter rotation in degrees:', '0');
      if (rotateInput) {
        const rotation = parseFloat(rotateInput);
        if (!isNaN(rotation)) {
          updateLayer(documentId, activeLayerId, (l) => ({
            ...l,
            transform: {
              ...l.transform,
              rotation
            }
          }));
        }
      }
    }
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
  async showImageSizeDialog(documentId: string | null): Promise<void> {
    if (!documentId) return;
    await this.resizeDocument(documentId);
  }

  async showCanvasSizeDialog(documentId: string | null): Promise<void> {
    if (!documentId) return;
    await this.resizeCanvas(documentId);
  }

  showArbitraryRotateDialog(documentId: string | null): void {
    if (!documentId) return;
    const degrees = prompt('Enter rotation angle in degrees:', '45');
    if (!degrees) return;
    
    this.rotateCanvas(documentId, parseFloat(degrees));
  }

  // Trim functionality
  async trim(documentId: string | null): Promise<void> {
    if (!documentId) return;

    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    try {
      // Render document to canvas to analyze
      const { renderDocumentToCanvas } = await import('../../utils/export/renderDocumentToCanvas');
      const canvas = await renderDocumentToCanvas(document);
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      // Find bounds of non-transparent pixels
      let minX = canvas.width;
      let minY = canvas.height;
      let maxX = 0;
      let maxY = 0;

      for (let y = 0; y < canvas.height; y++) {
        for (let x = 0; x < canvas.width; x++) {
          const alpha = data[(y * canvas.width + x) * 4 + 3];
          if (alpha > 0) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
        }
      }

      if (minX <= maxX && minY <= maxY) {
        const newWidth = maxX - minX + 1;
        const newHeight = maxY - minY + 1;

        // Crop to the trimmed bounds
        this.cropToSelection(documentId, {
          tool: 'crop',
          layerId: document.activeLayerId || '',
          shape: {
            type: 'rect',
            x: minX,
            y: minY,
            width: newWidth,
            height: newHeight
          }
        });
      } else {
        alert('No content to trim');
      }
    } catch (error) {
      console.error('Failed to trim:', error);
      alert('Failed to trim document');
    }
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