import type { Layer } from '../../types';
import { createId } from '../id';

export function createBaseLayer(name = 'Background'): Layer {
  return {
    id: createId('layer'),
    name,
    kind: 'raster',
    visible: true,
    locked: false,
    opacity: 1,
    blendMode: 'normal',
    masks: [],
    transform: {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      rotation: 0,
      skewX: 0,
      skewY: 0
    },
    metadata: {
      generator: 'graphics-smasher',
      editable: false
    }
  };
}

export function createAdjustmentLayer(name: string, adjustmentType: string): Layer {
  return {
    ...createBaseLayer(name),
    kind: 'adjustment',
    metadata: {
      type: adjustmentType,
      editable: true
    }
  };
}
