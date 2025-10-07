import type { Layer } from '../../types';

export function cloneLayers(layers: Layer[]): Layer[] {
  if (typeof structuredClone === 'function') {
    return structuredClone(layers);
  }

  return layers.map((layer) => ({
    ...layer,
    masks: layer.masks.map((mask) => ({ ...mask })),
    transform: { ...layer.transform },
    metadata: layer.metadata ? { ...layer.metadata } : undefined
  }));
}
