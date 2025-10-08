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

    this.clipboardData = {
      type: 'selection',
      selection: {
        shape: selection.shape,
        layerId: selection.layerId,
        metadata: layer.metadata
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
      // Clear the selection area by creating an eraser effect
      const { clearSelection } = useGraphicsStore.getState();
      clearSelection();
      console.log('Cut selection to clipboard');
    }
    return success;
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
    const { addLayer, updateLayer, documents } = useGraphicsStore.getState();
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
      updateLayer(documentId, newLayerId, (l) => ({
        ...l,
        metadata: { ...selection.metadata }
      }));
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