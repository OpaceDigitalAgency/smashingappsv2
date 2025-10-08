import type { DocumentState, Layer } from '../../types';
import { renderDocumentToCanvas } from '../../utils/export/renderDocumentToCanvas';
import { useGraphicsStore } from '../../state/graphicsStore';
import { ClipboardService } from '../clipboard/ClipboardService';
import { ProjectService } from '../filesystem/ProjectService';
import { ExportDialogService } from '../dialogs/ExportDialog';
import { ImageSizeDialogService } from '../dialogs/ImageSizeDialog';
import { FilterService, type FilterOptions } from '../filters/FilterService';

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

  moveLayerUp(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { documents, reorderLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const currentIndex = document.layers.findIndex(l => l.id === activeLayerId);
    if (currentIndex === -1 || currentIndex >= document.layers.length - 1) return;

    reorderLayer(documentId, activeLayerId, currentIndex + 1);
  }

  moveLayerDown(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { documents, reorderLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const currentIndex = document.layers.findIndex(l => l.id === activeLayerId);
    if (currentIndex <= 1) return; // Can't move below background layer

    reorderLayer(documentId, activeLayerId, currentIndex - 1);
  }

  toggleLayerVisibility(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { toggleLayerVisibility } = useGraphicsStore.getState();
    toggleLayerVisibility(documentId, activeLayerId);
  }

  toggleLayerLock(documentId: string | null, activeLayerId: string | null): void {
    if (!documentId || !activeLayerId) return;
    const { toggleLayerLock } = useGraphicsStore.getState();
    toggleLayerLock(documentId, activeLayerId);
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

  togglePanel(panel: 'layers' | 'history' | 'properties' | 'adjustments' | 'assets'): void {
    const { togglePanelVisibility } = useGraphicsStore.getState();
    togglePanelVisibility(panel);
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

    const { documents, updateLayer, resizeDocument } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const radians = (degrees * Math.PI) / 180;
    const normalizedDegrees = ((degrees % 360) + 360) % 360;

    // Helper function to rotate a point around origin
    const rotatePoint = (x: number, y: number, centerX: number, centerY: number, angle: number): { x: number; y: number } => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      const dx = x - centerX;
      const dy = y - centerY;
      return {
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos)
      };
    };

    const oldWidth = document.width;
    const oldHeight = document.height;
    const oldCenterX = oldWidth / 2;
    const oldCenterY = oldHeight / 2;

    // For 90/270 degree rotations, swap dimensions
    let newWidth = oldWidth;
    let newHeight = oldHeight;
    if (normalizedDegrees === 90 || normalizedDegrees === 270) {
      newWidth = oldHeight;
      newHeight = oldWidth;
    }

    const newCenterX = newWidth / 2;
    const newCenterY = newHeight / 2;

    // First, rotate all layer content before resizing
    document.layers.forEach(layer => {
      const metadata = layer.metadata || {};
      const strokes = (metadata.strokes as any[]) || [];
      const shapes = (metadata.shapes as any[]) || [];

      // Rotate stroke coordinates
      const rotatedStrokes = strokes.map((stroke: any) => {
        const rotatedPoints: number[] = [];
        for (let i = 0; i < stroke.points.length; i += 2) {
          const rotated = rotatePoint(
            stroke.points[i],
            stroke.points[i + 1],
            oldCenterX,
            oldCenterY,
            radians
          );
          // Adjust for new canvas center
          rotatedPoints.push(rotated.x - oldCenterX + newCenterX);
          rotatedPoints.push(rotated.y - oldCenterY + newCenterY);
        }
        return {
          ...stroke,
          points: rotatedPoints
        };
      });

      // Rotate shape coordinates
      const rotatedShapes = shapes.map((shape: any) => {
        const shapeX = shape.x || 0;
        const shapeY = shape.y || 0;
        const rotated = rotatePoint(shapeX, shapeY, oldCenterX, oldCenterY, radians);

        // For rectangles, also need to swap width/height for 90/270 rotations
        let newShapeWidth = shape.width;
        let newShapeHeight = shape.height;
        if (normalizedDegrees === 90 || normalizedDegrees === 270) {
          newShapeWidth = shape.height;
          newShapeHeight = shape.width;
        }

        return {
          ...shape,
          x: rotated.x - oldCenterX + newCenterX,
          y: rotated.y - oldCenterY + newCenterY,
          width: newShapeWidth,
          height: newShapeHeight
        };
      });

      // Update layer with rotated content
      updateLayer(documentId, layer.id, (l) => ({
        ...l,
        metadata: {
          ...l.metadata,
          strokes: rotatedStrokes,
          shapes: rotatedShapes
        },
        transform: {
          ...l.transform,
          // Reset layer transform since we've rotated the content itself
          rotation: 0
        }
      }));
    });

    // Update document dimensions
    resizeDocument(documentId, newWidth, newHeight);

    // Force a re-render
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
  private lastSelection: any = null;

  reselect(documentId: string | null): void {
    if (!documentId || !this.lastSelection) return;
    const { setSelection } = useGraphicsStore.getState();
    setSelection(this.lastSelection);
  }

  inverseSelection(documentId: string | null, document: DocumentState | null): void {
    if (!documentId || !document) return;
    const { selection, setSelection } = useGraphicsStore.getState();

    if (!selection || !document.activeLayerId) {
      // If no selection, select all
      this.selectAll(documentId, document);
      return;
    }

    // For rect selections, create an inverse by selecting the entire canvas
    // and marking the current selection as excluded
    // For simplicity, we'll just select the entire canvas minus the current selection
    if (selection.shape.type === 'rect') {
      // Store the current selection for potential reselect
      this.lastSelection = selection;

      // Create a full canvas selection
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
  }

  modifySelection(type: 'border' | 'smooth' | 'expand' | 'contract' | 'feather', documentId: string | null): void {
    if (!documentId) return;
    const { selection, setSelection } = useGraphicsStore.getState();
    if (!selection) return;

    const value = prompt(`Enter ${type} value (pixels):`, '10');
    if (!value) return;

    const pixels = parseInt(value, 10);
    if (isNaN(pixels) || pixels <= 0) return;

    // Store current selection for reselect
    this.lastSelection = { ...selection };

    if (selection.shape.type === 'rect') {
      const shape = selection.shape;
      let newShape = { ...shape };

      switch (type) {
        case 'expand':
          newShape = {
            ...shape,
            x: Math.max(0, shape.x - pixels),
            y: Math.max(0, shape.y - pixels),
            width: shape.width + pixels * 2,
            height: shape.height + pixels * 2
          };
          break;
        case 'contract':
          newShape = {
            ...shape,
            x: shape.x + pixels,
            y: shape.y + pixels,
            width: Math.max(1, shape.width - pixels * 2),
            height: Math.max(1, shape.height - pixels * 2)
          };
          break;
        case 'feather':
          // Feather is stored in tool options
          useGraphicsStore.getState().setToolOptions('selection', { feather: pixels });
          return;
        case 'border':
        case 'smooth':
          // These would require more complex implementation
          console.log(`${type} selection not yet fully implemented`);
          return;
      }

      setSelection({
        ...selection,
        shape: newShape
      });
    } else if (selection.shape.type === 'lasso') {
      // For lasso selections, expand/contract all points
      const points = selection.shape.points;
      const newPoints: number[] = [];

      if (type === 'expand' || type === 'contract') {
        const factor = type === 'expand' ? 1 + pixels / 100 : 1 - pixels / 100;

        // Calculate centroid
        let cx = 0, cy = 0;
        for (let i = 0; i < points.length; i += 2) {
          cx += points[i];
          cy += points[i + 1];
        }
        cx /= points.length / 2;
        cy /= points.length / 2;

        // Scale points from centroid
        for (let i = 0; i < points.length; i += 2) {
          const dx = points[i] - cx;
          const dy = points[i + 1] - cy;
          newPoints.push(cx + dx * factor);
          newPoints.push(cy + dy * factor);
        }

        setSelection({
          ...selection,
          shape: {
            type: 'lasso',
            points: newPoints
          }
        });
      }
    }
  }

  fromLayerAlpha(documentId: string | null): void {
    if (!documentId) return;
    const { documents, setSelection } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);

    if (!document || !document.activeLayerId) return;

    const activeLayer = document.layers.find(l => l.id === document.activeLayerId);
    if (!activeLayer) return;

    // For now, create a selection based on the layer's bounds
    // In a full implementation, this would analyze the alpha channel
    const imageUrl = activeLayer.metadata?.imageUrl as string | undefined;

    if (imageUrl) {
      // If layer has an image, select its bounds
      const width = (activeLayer.metadata?.imageWidth as number) || document.width;
      const height = (activeLayer.metadata?.imageHeight as number) || document.height;

      setSelection({
        tool: 'marquee-rect',
        layerId: activeLayer.id,
        shape: {
          type: 'rect',
          x: activeLayer.transform.x || 0,
          y: activeLayer.transform.y || 0,
          width: width * (activeLayer.transform.scaleX || 1),
          height: height * (activeLayer.transform.scaleY || 1)
        }
      });
    } else {
      // For layers without images, select the full canvas
      this.selectAll(documentId, document);
    }
  }

  growSelection(documentId: string | null): void {
    if (!documentId) return;
    this.modifySelection('expand', documentId);
  }

  similarSelection(documentId: string | null): void {
    if (!documentId) return;
    console.log('Similar Selection not yet implemented - would select similar colours');
  }

  transformSelection(documentId: string | null): void {
    if (!documentId) return;
    console.log('Transform Selection not yet implemented - would show transform handles');
  }

  saveSelection(documentId: string | null): void {
    if (!documentId) return;
    const { selection } = useGraphicsStore.getState();
    if (!selection) return;

    const name = prompt('Enter selection name:', 'Selection 1');
    if (!name) return;

    // Store in localStorage for now
    const saved = JSON.parse(localStorage.getItem('gs_saved_selections') || '{}');
    saved[name] = selection;
    localStorage.setItem('gs_saved_selections', JSON.stringify(saved));

    console.log(`Selection saved as "${name}"`);
  }

  loadSelection(): void {
    const saved = JSON.parse(localStorage.getItem('gs_saved_selections') || '{}');
    const names = Object.keys(saved);

    if (names.length === 0) {
      alert('No saved selections found');
      return;
    }

    const name = prompt(`Enter selection name to load:\n${names.join(', ')}`, names[0]);
    if (!name || !saved[name]) return;

    const { setSelection } = useGraphicsStore.getState();
    setSelection(saved[name]);
    console.log(`Selection "${name}" loaded`);
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
  private filterDialogState: {
    isOpen: boolean;
    filterName: string;
    imageUrl?: string;
    onApply?: (options: FilterOptions) => void;
  } = {
    isOpen: false,
    filterName: ''
  };

  async applyFilter(filter: string, documentId: string | null): Promise<void> {
    if (!documentId) return;

    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document || !document.activeLayerId) return;

    const activeLayer = document.layers.find(l => l.id === document.activeLayerId);
    if (!activeLayer) return;

    const imageUrl = activeLayer.metadata?.imageUrl as string | undefined;

    // For filters that need options, show dialog
    const needsDialog = [
      'Gaussian Blur',
      'Sharpen',
      'Unsharp Mask',
      'Brightness',
      'Contrast',
      'Brightness/Contrast',
      'Levels'
    ].some(f => filter.toLowerCase().includes(f.toLowerCase()));

    if (needsDialog && imageUrl) {
      // Show filter dialog (this would need to be handled by a React component)
      // For now, use prompts for simplicity
      const filterService = FilterService.getInstance();
      let options: FilterOptions = {};

      if (filter.toLowerCase().includes('blur')) {
        const radius = prompt('Enter blur radius (1-20):', '5');
        if (!radius) return;
        options.radius = parseInt(radius);
      } else if (filter.toLowerCase().includes('sharpen')) {
        const amount = prompt('Enter sharpen amount (0-3):', '1');
        if (!amount) return;
        options.amount = parseFloat(amount);
      } else if (filter.toLowerCase().includes('brightness') && filter.toLowerCase().includes('contrast')) {
        const brightness = prompt('Enter brightness (-100 to 100):', '0');
        if (brightness === null) return;
        const contrast = prompt('Enter contrast (-100 to 100):', '0');
        if (contrast === null) return;
        options.brightness = parseInt(brightness);
        options.contrast = parseInt(contrast);
      } else if (filter.toLowerCase().includes('brightness')) {
        const brightness = prompt('Enter brightness (-100 to 100):', '0');
        if (brightness === null) return;
        options.brightness = parseInt(brightness);
      } else if (filter.toLowerCase().includes('contrast')) {
        const contrast = prompt('Enter contrast (-100 to 100):', '0');
        if (contrast === null) return;
        options.contrast = parseInt(contrast);
      } else if (filter.toLowerCase().includes('levels')) {
        const inputMin = prompt('Enter input min (0-255):', '0');
        if (inputMin === null) return;
        const inputMax = prompt('Enter input max (0-255):', '255');
        if (inputMax === null) return;
        options.levels = {
          inputMin: parseInt(inputMin),
          inputMax: parseInt(inputMax),
          outputMin: 0,
          outputMax: 255
        };
      }

      await filterService.applyFilter(documentId, document.activeLayerId, filter, options);
    } else if (filter.toLowerCase() === 'last filter') {
      // Apply last filter
      const filterService = FilterService.getInstance();
      if (document.activeLayerId) {
        await filterService.applyLastFilter(documentId, document.activeLayerId);
      }
    } else {
      // Apply filter without options (e.g., Desaturate)
      const filterService = FilterService.getInstance();
      if (document.activeLayerId) {
        await filterService.applyFilter(documentId, document.activeLayerId, filter, {});
      }
    }
  }

  // Layer Operations
  async mergeDown(documentId: string | null, activeLayerId: string | null): Promise<void> {
    if (!documentId || !activeLayerId) return;
    const { documents, updateLayer, removeLayer, setActiveLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const currentIndex = document.layers.findIndex(l => l.id === activeLayerId);
    if (currentIndex <= 0) return; // Can't merge down from bottom layer

    const currentLayer = document.layers[currentIndex];
    const belowLayer = document.layers[currentIndex - 1];
    if (!belowLayer || !currentLayer) return;

    // Merge the current layer's content into the layer below
    // Combine strokes and shapes
    const currentStrokes = (currentLayer.metadata?.strokes as any[]) || [];
    const currentShapes = (currentLayer.metadata?.shapes as any[]) || [];
    const belowStrokes = (belowLayer.metadata?.strokes as any[]) || [];
    const belowShapes = (belowLayer.metadata?.shapes as any[]) || [];

    updateLayer(documentId, belowLayer.id, (layer) => ({
      ...layer,
      metadata: {
        ...layer.metadata,
        strokes: [...belowStrokes, ...currentStrokes],
        shapes: [...belowShapes, ...currentShapes]
      }
    }));

    // Remove the current layer
    removeLayer(documentId, activeLayerId);

    // Set the below layer as active
    setActiveLayer(documentId, belowLayer.id);
  }

  mergeVisible(documentId: string | null): void {
    if (!documentId) return;
    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const visibleLayers = document.layers.filter(l => l.visible);
    if (visibleLayers.length <= 1) {
      alert('Need at least 2 visible layers to merge');
      return;
    }

    // For now, just show a message
    alert(`Merge Visible - Would merge ${visibleLayers.length} visible layers`);
  }

  flattenImage(documentId: string | null): void {
    if (!documentId) return;
    if (!confirm('Flatten all layers into one? This cannot be undone.')) return;

    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    if (document.layers.length <= 1) {
      alert('Image already has only one layer');
      return;
    }

    // For now, just show a message
    alert(`Flatten Image - Would flatten ${document.layers.length} layers`);
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
    console.log(`Apply ${style} not yet implemented`);
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
    console.log(`Add Layer Mask: ${type} not yet implemented`);
  }

  // View Operations
  toggleSnap(): void {
    const { settings, setSetting } = useGraphicsStore.getState();
    setSetting('snapToGrid', !settings.snapToGrid);
  }

  lockGuides(): void {
    // TODO: Implement guide locking
    console.log('Lock Guides not yet implemented');
  }

  clearGuides(documentId: string | null): void {
    if (!documentId) return;
    // TODO: Implement clear guides
    console.log('Clear Guides not yet implemented');
  }

  // Workspace presets
  setWorkspace(preset: string): void {
    // TODO: Implement workspace layouts
    console.log(`Switch to ${preset} workspace not yet implemented`);
  }

  // Preferences
  showPreferences(): void {
    // TODO: Implement preferences dialog
    console.log('Preferences not yet implemented');
  }

  // Help Menu Handlers
  showHelp(): void {
    window.open('https://github.com/OpaceDigitalAgency/smashingappsv2', '_blank');
  }

  showKeyboardShortcuts(): void {
    // This will be handled by the component that calls it
    // The modal will be shown via state management
    console.log('Show keyboard shortcuts modal');
  }

  showAbout(): void {
    // This will be handled by the component that calls it
    // The modal will be shown via state management
    console.log('Show about modal');
  }
}

export const menuHandlers = MenuHandlers.getInstance();