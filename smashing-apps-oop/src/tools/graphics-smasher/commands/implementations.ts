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
    id: 'file.saveProject',
    label: 'Save Project...',
    category: 'file',
    run: async (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      await menuHandlers.saveProject(document ?? null);
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
  },
  {
    id: 'layer.moveUp',
    label: 'Move Layer Up',
    shortcut: '⌘]',
    category: 'layer',
    run: (context) => {
      menuHandlers.moveLayerUp(context.documentId, context.activeLayerId);
    },
    isEnabled: (context) => context.activeLayerId !== null
  },
  {
    id: 'layer.moveDown',
    label: 'Move Layer Down',
    shortcut: '⌘[',
    category: 'layer',
    run: (context) => {
      menuHandlers.moveLayerDown(context.documentId, context.activeLayerId);
    },
    isEnabled: (context) => context.activeLayerId !== null
  },
  {
    id: 'layer.toggleVisibility',
    label: 'Toggle Layer Visibility',
    category: 'layer',
    run: (context) => {
      menuHandlers.toggleLayerVisibility(context.documentId, context.activeLayerId);
    },
    isEnabled: (context) => context.activeLayerId !== null
  },
  {
    id: 'layer.toggleLock',
    label: 'Toggle Layer Lock',
    category: 'layer',
    run: (context) => {
      menuHandlers.toggleLayerLock(context.documentId, context.activeLayerId);
    },
    isEnabled: (context) => context.activeLayerId !== null
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
    run: async (context) => {
      await menuHandlers.showImageSizeDialog(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'image.canvasSize',
    label: 'Canvas Size...',
    shortcut: '⌥⌘C',
    category: 'image',
    run: async (context) => {
      await menuHandlers.showCanvasSizeDialog(context.documentId);
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
  },
  {
    id: 'select.modify.expand',
    label: 'Expand...',
    category: 'select',
    run: (context) => {
      menuHandlers.modifySelection('expand', context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.modify.contract',
    label: 'Contract...',
    category: 'select',
    run: (context) => {
      menuHandlers.modifySelection('contract', context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.modify.feather',
    label: 'Feather...',
    category: 'select',
    run: (context) => {
      menuHandlers.modifySelection('feather', context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.modify.border',
    label: 'Border...',
    category: 'select',
    run: (context) => {
      menuHandlers.modifySelection('border', context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.modify.smooth',
    label: 'Smooth...',
    category: 'select',
    run: (context) => {
      menuHandlers.modifySelection('smooth', context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.fromLayerAlpha',
    label: 'From Layer Alpha',
    category: 'select',
    run: (context) => {
      menuHandlers.fromLayerAlpha(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'select.grow',
    label: 'Grow...',
    category: 'select',
    run: (context) => {
      menuHandlers.growSelection(context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.save',
    label: 'Save Selection...',
    category: 'select',
    run: (context) => {
      menuHandlers.saveSelection(context.documentId);
    },
    isEnabled: (context) => context.hasSelection
  },
  {
    id: 'select.load',
    label: 'Load Selection...',
    category: 'select',
    run: () => {
      menuHandlers.loadSelection();
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// ============================================================================
// FILTER COMMANDS
// ============================================================================

export const filterCommands: Command[] = [
  {
    id: 'filter.lastFilter',
    label: 'Last Filter',
    shortcut: '⌘F',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Last Filter', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.blur.gaussian',
    label: 'Gaussian Blur...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Gaussian Blur', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.sharpen.unsharp',
    label: 'Sharpen (Unsharp Mask)...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Unsharp Mask', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.adjust.desaturate',
    label: 'Desaturate',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Desaturate', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.adjust.brightness',
    label: 'Brightness...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Brightness', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.adjust.contrast',
    label: 'Contrast...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Contrast', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.adjust.brightnessContrast',
    label: 'Brightness/Contrast...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Brightness/Contrast', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
  },
  {
    id: 'filter.adjust.levels',
    label: 'Levels...',
    category: 'filter',
    run: async (context) => {
      await menuHandlers.applyFilter('Levels', context.documentId);
    },
    isEnabled: (context) => context.documentId !== null && context.activeLayerId !== null
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
      menuHandlers.zoomIn(context.documentId, document ?? null);
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
      menuHandlers.zoomOut(context.documentId, document ?? null);
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
      menuHandlers.actualPixels(context.documentId);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.toggleGrid',
    label: 'Show Grid',
    shortcut: '⌘\'',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.toggleGrid(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.toggleRulers',
    label: 'Show Rulers',
    shortcut: '⌘R',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.toggleRulers(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  },
  {
    id: 'view.toggleGuides',
    label: 'Show Guides',
    shortcut: '⌘;',
    category: 'view',
    run: (context) => {
      const document = useGraphicsStore.getState().documents.find(d => d.id === context.documentId);
      menuHandlers.toggleGuides(context.documentId, document ?? null);
    },
    isEnabled: (context) => context.documentId !== null
  }
];

// ============================================================================
// WINDOW COMMANDS
// ============================================================================

export const windowCommands: Command[] = [
  {
    id: 'window.toggleLayers',
    label: 'Toggle Layers Panel',
    category: 'window',
    run: () => {
      menuHandlers.togglePanel('layers');
    }
  },
  {
    id: 'window.toggleAdjustments',
    label: 'Toggle Adjustments Panel',
    category: 'window',
    run: () => {
      menuHandlers.togglePanel('adjustments');
    }
  },
  {
    id: 'window.toggleHistory',
    label: 'Toggle History Panel',
    category: 'window',
    run: () => {
      menuHandlers.togglePanel('history');
    }
  },
  {
    id: 'window.toggleProperties',
    label: 'Toggle Properties Panel',
    category: 'window',
    run: () => {
      menuHandlers.togglePanel('properties');
    }
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
  ...filterCommands,
  ...viewCommands,
  ...windowCommands,
  ...toolCommands,
  ...documentCommands
];

