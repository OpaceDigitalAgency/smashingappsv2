/**
 * Command types and interfaces for the Graphics Smasher command system
 */

export type CommandId =
  // File commands
  | 'file.new'
  | 'file.open'
  | 'file.save'
  | 'file.saveAs'
  | 'file.saveProject'
  | 'file.export.png'
  | 'file.export.jpeg'
  | 'file.export.webp'
  | 'file.export.svg'
  | 'file.close'
  | 'file.closeAll'
  // Edit commands
  | 'edit.undo'
  | 'edit.redo'
  | 'edit.cut'
  | 'edit.copy'
  | 'edit.paste'
  | 'edit.delete'
  | 'edit.selectAll'
  | 'edit.deselect'
  | 'edit.transform.free'
  | 'edit.transform.scale'
  | 'edit.transform.rotate'
  | 'edit.transform.skew'
  // Image commands
  | 'image.size'
  | 'image.canvasSize'
  | 'image.crop'
  | 'image.trim'
  | 'image.rotate.cw90'
  | 'image.rotate.ccw90'
  | 'image.rotate.180'
  | 'image.flip.horizontal'
  | 'image.flip.vertical'
  // Layer commands
  | 'layer.new'
  | 'layer.duplicate'
  | 'layer.delete'
  | 'layer.mergeDown'
  | 'layer.mergeVisible'
  | 'layer.flatten'
  | 'layer.moveUp'
  | 'layer.moveDown'
  | 'layer.lock'
  | 'layer.unlock'
  | 'layer.show'
  | 'layer.hide'
  | 'layer.group'
  | 'layer.ungroup'
  // Select commands
  | 'select.all'
  | 'select.deselect'
  | 'select.reselect'
  | 'select.inverse'
  | 'select.modify.expand'
  | 'select.modify.contract'
  | 'select.modify.feather'
  | 'select.modify.border'
  | 'select.modify.smooth'
  | 'select.fromLayerAlpha'
  | 'select.grow'
  | 'select.similar'
  | 'select.transform'
  | 'select.save'
  | 'select.load'
  // Filter commands
  | 'filter.blur.gaussian'
  | 'filter.blur.motion'
  | 'filter.sharpen.unsharp'
  | 'filter.sharpen.smart'
  | 'filter.adjust.desaturate'
  | 'filter.adjust.brightness'
  | 'filter.adjust.contrast'
  | 'filter.adjust.levels'
  | 'filter.adjust.curves'
  | 'filter.adjust.hue'
  | 'filter.distort.pinch'
  | 'filter.distort.twirl'
  | 'filter.distort.wave'
  | 'filter.stylise.emboss'
  | 'filter.stylise.findEdges'
  // View commands
  | 'view.zoomIn'
  | 'view.zoomOut'
  | 'view.zoomFit'
  | 'view.zoomActual'
  | 'view.toggleGrid'
  | 'view.toggleGuides'
  | 'view.toggleRulers'
  | 'view.toggleSnapGrid'
  | 'view.toggleSnapGuides'
  // Window commands
  | 'window.toggleLayers'
  | 'window.toggleAdjustments'
  | 'window.toggleHistory'
  | 'window.toggleProperties'
  // Tool commands
  | 'tool.move'
  | 'tool.marqueeRect'
  | 'tool.marqueeEllipse'
  | 'tool.lassoFree'
  | 'tool.lassoPoly'
  | 'tool.lassoMagnetic'
  | 'tool.magicWand'
  | 'tool.crop'
  | 'tool.eyedropper'
  | 'tool.brush'
  | 'tool.eraser'
  | 'tool.text'
  | 'tool.shape'
  | 'tool.pen'
  | 'tool.zoom'
  | 'tool.hand'
  // Document commands
  | 'document.duplicate'
  // Help commands
  | 'help.shortcuts'
  | 'help.about';

export interface CommandContext {
  documentId: string | null;
  activeLayerId: string | null;
  hasSelection: boolean;
  hasClipboard: boolean;
  canUndo: boolean;
  canRedo: boolean;
  layerCount: number;
  isLayerLocked: boolean;
}

export interface Command {
  id: CommandId;
  label: string;
  shortcut?: string;
  category: 'file' | 'edit' | 'image' | 'layer' | 'select' | 'filter' | 'view' | 'window' | 'tool' | 'document' | 'help';
  run: (context: CommandContext) => void | Promise<void>;
  isEnabled?: (context: CommandContext) => boolean;
  isVisible?: (context: CommandContext) => boolean;
  icon?: string;
  description?: string;
}

export interface CommandRegistryState {
  commands: Map<CommandId, Command>;
  context: CommandContext;
}

