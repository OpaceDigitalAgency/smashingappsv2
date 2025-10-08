import { useGraphicsStore } from '../../state/graphicsStore';
import type { Layer, SelectionState, DocumentState } from '../../types';
import { cloneLayers } from '../../utils/layers/cloneLayers';
import { createId } from '../../utils/id';

interface ClipboardData {
  type: 'layer' | 'selection';
  layer?: Layer;
  selection?: {
    shape: SelectionState['shape'];
    layerId: string;
    metadata?: Record<string, unknown>;
  };
}

class ClipboardServiceClass {
  private clipboardData: ClipboardData | null = null;

  async copySelection(selection: SelectionState | null, documentId: string | null): Promise<boolean> {
    if (!selection || !documentId || !selection.layerId) {
      console.warn('No selection or document to copy');
      return false;
    }

    const { documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return false;

    const layer = document.layers.find(l => l.id === selection.layerId);
    if (!layer) return false;

    // Extract only the strokes and shapes within the selection bounds
    const extractedMetadata = this.extractSelectionContent(layer, selection.shape);

    this.clipboardData = {
      type: 'selection',
      selection: {
        shape: selection.shape,
        layerId: selection.layerId,
        metadata: extractedMetadata
      }
    };

    // Also store in system clipboard as JSON for cross-document support
    try {
      await navigator.clipboard.writeText(JSON.stringify(this.clipboardData));
      console.log('Copied selection to clipboard');
      return true;
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      return false;
    }
  }

  private extractSelectionContent(layer: Layer, shape: SelectionState['shape']): Record<string, unknown> {
    const metadata = layer.metadata || {};
    const strokes = (metadata.strokes as any[]) || [];
    const shapes = (metadata.shapes as any[]) || [];

    if (shape.type === 'rect') {
      // Extract strokes that intersect with the rectangle
      const extractedStrokes = strokes.filter(stroke => {
        if (!stroke.points || stroke.points.length < 2) return false;
        // Check if any point is within the rectangle
        for (let i = 0; i < stroke.points.length; i += 2) {
          const x = stroke.points[i];
          const y = stroke.points[i + 1];
          if (x >= shape.x && x <= shape.x + shape.width &&
              y >= shape.y && y <= shape.y + shape.height) {
            return true;
          }
        }
        return false;
      });

      // Extract shapes that intersect with the rectangle
      const extractedShapes = shapes.filter(s => {
        const sx = s.x || 0;
        const sy = s.y || 0;
        const sw = s.width || 0;
        const sh = s.height || 0;
        // Check if shape intersects with selection
        return !(sx + sw < shape.x || sx > shape.x + shape.width ||
                 sy + sh < shape.y || sy > shape.y + shape.height);
      });

      return {
        ...metadata,
        strokes: extractedStrokes,
        shapes: extractedShapes
      };
    } else if (shape.type === 'lasso') {
      // For lasso, check if points are inside the polygon
      const extractedStrokes = strokes.filter(stroke => {
        if (!stroke.points || stroke.points.length < 2) return false;
        // Check if any point is within the lasso polygon
        for (let i = 0; i < stroke.points.length; i += 2) {
          const x = stroke.points[i];
          const y = stroke.points[i + 1];
          if (this.isPointInPolygon(x, y, shape.points)) {
            return true;
          }
        }
        return false;
      });

      const extractedShapes = shapes.filter(s => {
        const sx = s.x || 0;
        const sy = s.y || 0;
        return this.isPointInPolygon(sx, sy, shape.points);
      });

      return {
        ...metadata,
        strokes: extractedStrokes,
        shapes: extractedShapes
      };
    }

    return metadata;
  }

  private isPointInPolygon(x: number, y: number, polygonPoints: number[]): boolean {
    let inside = false;
    for (let i = 0, j = polygonPoints.length - 2; i < polygonPoints.length; i += 2) {
      const xi = polygonPoints[i];
      const yi = polygonPoints[i + 1];
      const xj = polygonPoints[j];
      const yj = polygonPoints[j + 1];

      const intersect = ((yi > y) !== (yj > y)) &&
        (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;

      j = i;
    }
    return inside;
  }

  async copyLayer(layer: Layer): Promise<boolean> {
    if (!layer) return false;

    this.clipboardData = {
      type: 'layer',
      layer: cloneLayers([layer])[0]
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(this.clipboardData));
      console.log('Copied layer to clipboard');
      return true;
    } catch (error) {
      console.error('Failed to write to clipboard:', error);
      return false;
    }
  }

  async cutSelection(selection: SelectionState | null, documentId: string | null): Promise<boolean> {
    const success = await this.copySelection(selection, documentId);
    if (success && documentId && selection?.layerId) {
      // Delete the selected area from the layer
      await this.deleteSelection(selection, documentId);
      console.log('Cut selection to clipboard');
    }
    return success;
  }

  async deleteSelection(selection: SelectionState | null, documentId: string | null): Promise<boolean> {
    if (!selection || !documentId || !selection.layerId) {
      console.warn('No selection to delete');
      return false;
    }

    const { documents, updateLayer, clearSelection, pushHistory } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return false;

    const layer = document.layers.find(l => l.id === selection.layerId);
    if (!layer) return false;

    const metadata = layer.metadata || {};
    const strokes = (metadata.strokes as any[]) || [];
    const shapes = (metadata.shapes as any[]) || [];

    // Remove strokes and shapes that are within the selection
    if (selection.shape.type === 'rect') {
      const shape = selection.shape;
      const remainingStrokes = strokes.filter(stroke => {
        if (!stroke.points || stroke.points.length < 2) return true;
        // Keep stroke if no points are within the rectangle
        for (let i = 0; i < stroke.points.length; i += 2) {
          const x = stroke.points[i];
          const y = stroke.points[i + 1];
          if (x >= shape.x && x <= shape.x + shape.width &&
              y >= shape.y && y <= shape.y + shape.height) {
            return false; // Remove this stroke
          }
        }
        return true; // Keep this stroke
      });

      const remainingShapes = shapes.filter(s => {
        const sx = s.x || 0;
        const sy = s.y || 0;
        const sw = s.width || 0;
        const sh = s.height || 0;
        // Keep shape if it doesn't intersect with selection
        return (sx + sw < shape.x || sx > shape.x + shape.width ||
                sy + sh < shape.y || sy > shape.y + shape.height);
      });

      updateLayer(documentId, selection.layerId, (l) => ({
        ...l,
        metadata: {
          ...metadata,
          strokes: remainingStrokes,
          shapes: remainingShapes
        }
      }));
    } else if (selection.shape.type === 'lasso') {
      const shape = selection.shape;
      const remainingStrokes = strokes.filter(stroke => {
        if (!stroke.points || stroke.points.length < 2) return true;
        // Keep stroke if no points are within the lasso polygon
        for (let i = 0; i < stroke.points.length; i += 2) {
          const x = stroke.points[i];
          const y = stroke.points[i + 1];
          if (this.isPointInPolygon(x, y, shape.points)) {
            return false; // Remove this stroke
          }
        }
        return true; // Keep this stroke
      });

      const remainingShapes = shapes.filter(s => {
        const sx = s.x || 0;
        const sy = s.y || 0;
        return !this.isPointInPolygon(sx, sy, shape.points);
      });

      updateLayer(documentId, selection.layerId, (l) => ({
        ...l,
        metadata: {
          ...metadata,
          strokes: remainingStrokes,
          shapes: remainingShapes
        }
      }));
    }

    clearSelection();
    pushHistory(documentId, 'Delete selection');
    console.log('Deleted selection');
    return true;
  }

  async paste(documentId: string | null): Promise<boolean> {
    if (!documentId) {
      console.warn('No active document to paste into');
      return false;
    }

    // Try to get from system clipboard first
    try {
      const text = await navigator.clipboard.readText();
      const data = JSON.parse(text) as ClipboardData;
      
      if (data.type === 'layer' && data.layer) {
        return this.pasteLayer(data.layer, documentId);
      } else if (data.type === 'selection' && data.selection) {
        return this.pasteSelection(data.selection, documentId);
      }
    } catch (error) {
      console.log('Clipboard does not contain valid layer data, trying internal clipboard');
    }

    // Fallback to internal clipboard
    if (!this.clipboardData) {
      console.warn('No clipboard data available');
      return false;
    }

    if (this.clipboardData.type === 'layer' && this.clipboardData.layer) {
      return this.pasteLayer(this.clipboardData.layer, documentId);
    } else if (this.clipboardData.type === 'selection' && this.clipboardData.selection) {
      return this.pasteSelection(this.clipboardData.selection, documentId);
    }

    return false;
  }

  private pasteLayer(layer: Layer, documentId: string): boolean {
    const { addLayer, updateLayer, documents } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return false;

    const newLayerId = addLayer(documentId, {
      name: `${layer.name} (Copy)`,
      opacity: layer.opacity,
      blendMode: layer.blendMode,
      visible: layer.visible,
      locked: false
    });

    if (newLayerId && layer.metadata) {
      updateLayer(documentId, newLayerId, (l) => ({
        ...l,
        transform: { ...layer.transform },
        metadata: { ...layer.metadata }
      }));
    }

    console.log('Pasted layer:', newLayerId);
    return true;
  }

  private pasteSelection(selection: { shape: SelectionState['shape']; layerId: string; metadata?: Record<string, unknown> }, documentId: string): boolean {
    const { addLayer, updateLayer, documents, setSelection } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return false;

    const sourceLayer = document.layers.find(l => l.id === selection.layerId);
    if (!sourceLayer) return false;

    const newLayerId = addLayer(documentId, {
      name: `Selection (Copy)`,
      opacity: sourceLayer.opacity,
      blendMode: sourceLayer.blendMode,
      visible: true,
      locked: false
    });

    if (newLayerId && selection.metadata) {
      // Offset the pasted content by 20px to make it visible
      const offset = 20;
      const metadata = { ...selection.metadata };

      // Offset strokes if they exist
      if (metadata.strokes && Array.isArray(metadata.strokes)) {
        metadata.strokes = (metadata.strokes as any[]).map(stroke => ({
          ...stroke,
          points: stroke.points ? stroke.points.map((val: number, idx: number) =>
            idx % 2 === 0 ? val + offset : val + offset
          ) : stroke.points
        }));
      }

      // Offset shapes if they exist
      if (metadata.shapes && Array.isArray(metadata.shapes)) {
        metadata.shapes = (metadata.shapes as any[]).map(shape => ({
          ...shape,
          x: (shape.x || 0) + offset,
          y: (shape.y || 0) + offset
        }));
      }

      updateLayer(documentId, newLayerId, (l) => ({
        ...l,
        metadata
      }));

      // Create a selection around the pasted content
      if (selection.shape.type === 'rect') {
        setSelection({
          tool: 'marquee-rect',
          shape: {
            type: 'rect',
            x: selection.shape.x + offset,
            y: selection.shape.y + offset,
            width: selection.shape.width,
            height: selection.shape.height
          },
          layerId: newLayerId
        });
      }
    }

    console.log('Pasted selection as new layer:', newLayerId);
    return true;
  }

  hasClipboardData(): boolean {
    return this.clipboardData !== null;
  }

  clear(): void {
    this.clipboardData = null;
  }
}

export const ClipboardService = new ClipboardServiceClass();