import type { Command, CommandContext } from './types';
import { useGraphicsStore } from '../state/graphicsStore';
import { menuHandlers } from '../services/menu/MenuHandlers';
import { ClipboardService } from '../services/clipboard/ClipboardService';
import { HistoryManager } from '../history/HistoryManager';

/**
 * All command implementations
 * These are registered with the CommandRegistry on app initialization
 */

// ============================================================================
// FILE COMMANDS
// ============================================================================

export const fileCommands: Command[] = [
  {
    id: 'file.new',
    label: 'New',
    shortcut: '⌘N',
    category: 'file',
    run: () => {
      menuHandlers.newDocument();
    }
  },
  {
    id: 'file.open',
    label: 'Open...',
    shortcut: '⌘O',
    category: 'file',
    run: async () => {
      await menuHandlers.openFile();
    }
  },
  {
    id: 'file.save',
    label: 'Save',
    shortcut: '⌘S',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.save(document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'file.saveAs',
    label: 'Save As...',
    shortcut: '⇧⌘S',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.saveAs(document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'file.export.png',
    label: 'Export as PNG...',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.exportAs(document ?? null, 'png');
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'file.export.jpeg',
    label: 'Export as JPEG...',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.exportAs(document ?? null, 'jpeg');
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'file.export.webp',
    label: 'Export as WebP...',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.exportAs(document ?? null, 'webp');
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'file.close',
    label: 'Close',
    shortcut: '⌘W',
    category: 'file',
    run: (context) => {
      if (context.documentId) {
        useGraphicsStore.getState().closeDocument(context.documentId);
      }
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// ============================================================================
// EDIT COMMANDS
// ============================================================================

export const editCommands: Command[] = [
  {
    id: 'edit.undo',
    label: 'Undo',
    shortcut: '⌘Z',
    category: 'edit',
    run: async (context) => {
      if (context.documentId) {
        await useGraphicsStore.getState().undo(context.documentId);
      }
    },
    isEnabled: (context) => context.canUndo
  },
  {
    id: 'edit.redo',
    label: 'Redo',
    shortcut: '⇧⌘Z',
    category: 'edit',
    run: async (context) => {
      if (context.documentId) {
        await useGraphicsStore.getState().redo(context.documentId);
      }
    },
    isEnabled: (context) => context.canRedo
  },
  {
    id: 'edit.cut',
    label: 'Cut',
    shortcut: '⌘X',
    category: 'edit',
    run: async (context) => {
      const selection = useGraphicsStore.getState().selection;
      await ClipboardService.cutSelection(selection, context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'edit.copy',
    label: 'Copy',
    shortcut: '⌘C',
    category: 'edit',
    run: async (context) => {
      const selection = useGraphicsStore.getState().selection;
      await ClipboardService.copySelection(selection, context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'edit.paste',
    label: 'Paste',
    shortcut: '⌘V',
    category: 'edit',
    run: async (context) => {
      await ClipboardService.paste(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'edit.selectAll',
    label: 'Select All',
    shortcut: '⌘A',
    category: 'edit',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.selectAll(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'edit.deselect',
    label: 'Deselect',
    shortcut: '⌘D',
    category: 'edit',
    run: () => {
      menuHandlers.deselect();
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'edit.transform.free',
    label: 'Free Transform',
    shortcut: '⌘T',
    category: 'edit',
    run: (context) => {
      menuHandlers.transformLayer(context.documentId, context.activeLayerId, 'scale');
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  }
];

// ============================================================================
// LAYER COMMANDS
// ============================================================================

export const layerCommands: Command[] = [
  {
    id: 'layer.new',
    label: 'New Layer',
    shortcut: '⇧⌘N',
    category: 'layer',
    run: (context) => {
      if (context.documentId) {
        const layerCount = context.layerCount;
        useGraphicsStore.getState().addLayer(context.documentId, { 
          name: `Layer ${layerCount + 1}` 
        });
      }
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'layer.duplicate',
    label: 'Duplicate Layer',
    shortcut: '⌘J',
    category: 'layer',
    run: (context) => {
      if (context.documentId && context.activeLayerId) {
        useGraphicsStore.getState().duplicateLayer(context.documentId, context.activeLayerId);
      }
    },
    isEnabled: (context) => context.activeLayerId !== null
  },
  {
    id: 'layer.delete',
    label: 'Delete Layer',
    category: 'layer',
    run: (context) => {
      if (context.documentId && context.activeLayerId) {
        useGraphicsStore.getState().removeLayer(context.documentId, context.activeLayerId);
      }
    },
    isEnabled: (context) => context.activeLayerId !== null && context.layerCount > 1
  },
  {
    id: 'layer.mergeDown',
    label: 'Merge Down',
    shortcut: '⌘E',
    category: 'layer',
    run: (context) => {
      menuHandlers.mergeDown(context.documentId, context.activeLayerId);
    },
    isEnabled: (context) => context.activeLayerId !== null && context.layerCount > 1
  }
];

// ============================================================================
// VIEW COMMANDS
// ============================================================================

export const viewCommands: Command[] = [
  {
    id: 'view.zoomIn',
    label: 'Zoom In',
    shortcut: '⌘+',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      if (document) {
        const newZoom = Math.min(8, document.viewport.zoom + 0.1);
        useGraphicsStore.getState().setViewport(document.id, { zoom: newZoom });
      }
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.zoomOut',
    label: 'Zoom Out',
    shortcut: '⌘-',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      if (document) {
        const newZoom = Math.max(0.1, document.viewport.zoom - 0.1);
        useGraphicsStore.getState().setViewport(document.id, { zoom: newZoom });
      }
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.zoomFit',
    label: 'Fit on Screen',
    shortcut: '⌘0',
    category: 'view',
    run: (context) => {
      menuHandlers.fitToScreen(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.zoomActual',
    label: 'Actual Pixels',
    shortcut: '⌘1',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      if (document) {
        useGraphicsStore.getState().setViewport(document.id, { zoom: 1 });
      }
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// ============================================================================
// IMAGE COMMANDS
// ============================================================================

export const imageCommands: Command[] = [
  {
    id: 'image.size',
    label: 'Image Size...',
    shortcut: '⌥⌘I',
    category: 'image',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.showImageSizeDialog(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.canvasSize',
    label: 'Canvas Size...',
    shortcut: '⌥⌘C',
    category: 'image',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.showCanvasSizeDialog(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.crop',
    label: 'Crop',
    category: 'image',
    run: (context) => {
      const selection = useGraphicsStore.getState().selection;
      menuHandlers.cropToSelection(context.documentId, selection);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'image.trim',
    label: 'Trim...',
    category: 'image',
    run: (context) => {
      menuHandlers.trim(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.rotate.cw90',
    label: 'Rotate 90° CW',
    category: 'image',
    run: (context) => {
      menuHandlers.rotateCanvas(context.documentId, 90);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.rotate.ccw90',
    label: 'Rotate 90° CCW',
    category: 'image',
    run: (context) => {
      menuHandlers.rotateCanvas(context.documentId, -90);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.rotate.180',
    label: 'Rotate 180°',
    category: 'image',
    run: (context) => {
      menuHandlers.rotateCanvas(context.documentId, 180);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.flip.horizontal',
    label: 'Flip Horizontal',
    category: 'image',
    run: (context) => {
      menuHandlers.flipCanvas(context.documentId, 'horizontal');
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.flip.vertical',
    label: 'Flip Vertical',
    category: 'image',
    run: (context) => {
      menuHandlers.flipCanvas(context.documentId, 'vertical');
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// ============================================================================
// SELECT COMMANDS
// ============================================================================

export const selectCommands: Command[] = [
  {
    id: 'select.all',
    label: 'Select All',
    shortcut: '⌘A',
    category: 'select',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.selectAll(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'select.deselect',
    label: 'Deselect',
    shortcut: '⌘D',
    category: 'select',
    run: () => {
      menuHandlers.deselect();
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.reselect',
    label: 'Reselect',
    shortcut: '⇧⌘D',
    category: 'select',
    run: (context) => {
      menuHandlers.reselect(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'select.inverse',
    label: 'Inverse',
    shortcut: '⇧⌘I',
    category: 'select',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.inverseSelection(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.hasSelection
  }
];

// ============================================================================
// TOOL COMMANDS
// ============================================================================

export const toolCommands: Command[] = [
  {
    id: 'tool.move',
    label: 'Move Tool',
    shortcut: 'V',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('move');
    }
  },
  {
    id: 'tool.marqueeRect',
    label: 'Rectangular Marquee Tool',
    shortcut: 'M',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('marquee-rect');
    }
  },
  {
    id: 'tool.lassoFree',
    label: 'Lasso Tool',
    shortcut: 'L',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('lasso-free');
    }
  },
  {
    id: 'tool.magicWand',
    label: 'Magic Wand Tool',
    shortcut: 'W',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('magic-wand');
    }
  },
  {
    id: 'tool.eyedropper',
    label: 'Eyedropper Tool',
    shortcut: 'I',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('eyedropper');
    }
  },
  {
    id: 'tool.brush',
    label: 'Brush Tool',
    shortcut: 'B',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('brush');
    }
  },
  {
    id: 'tool.eraser',
    label: 'Eraser Tool',
    shortcut: 'E',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('eraser');
    }
  },
  {
    id: 'tool.hand',
    label: 'Hand Tool',
    shortcut: 'H',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('hand');
    }
  },
  {
    id: 'tool.zoom',
    label: 'Zoom Tool',
    shortcut: 'Z',
    category: 'tool',
    run: () => {
      useGraphicsStore.getState().setActiveTool('zoom');
    }
  }
];

// ============================================================================
// DOCUMENT COMMANDS
// ============================================================================

export const documentCommands: Command[] = [
  {
    id: 'document.duplicate',
    label: 'Duplicate Document',
    category: 'document',
    run: (context) => {
      if (context.documentId) {
        useGraphicsStore.getState().duplicateDocument(context.documentId);
      }
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// Export all commands
export const allCommands: Command[] = [
  ...fileCommands,
  ...editCommands,
  ...layerCommands,
  ...imageCommands,
  ...selectCommands,
  ...viewCommands,
  ...toolCommands,
  ...documentCommands
];

