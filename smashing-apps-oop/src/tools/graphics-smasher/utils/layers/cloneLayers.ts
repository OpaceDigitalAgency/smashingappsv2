import type { Layer } from '../../types';

export function cloneLayers(layers: Layer[]): Layer[] {
  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(layers);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('structuredClone failed for layer snapshot, falling back to manual clone', error);
      }
    }
  }

  return layers.map((layer) => ({
    ...layer,
    masks: layer.masks.map((mask) => ({ ...mask })),
    transform: { ...layer.transform },
    metadata: layer.metadata ? { ...layer.metadata } : undefined
  }));
}
