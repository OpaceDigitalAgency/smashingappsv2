import type { Layer } from '../../types';

// Deep clone function for nested objects and arrays
function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as T;
  }
  
  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as T;
  }
  
  if (obj instanceof ArrayBuffer) {
    return obj.slice(0) as T;
  }
  
  if (typeof obj === 'object') {
    const cloned = {} as T;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }
  
  return obj;
}

export function cloneLayers(layers: Layer[]): Layer[] {
  // Always use manual deep clone to avoid structuredClone issues with complex objects
  // structuredClone fails with certain canvas-related objects and nested arrays
  return layers.map((layer) => ({
    ...layer,
    masks: layer.masks.map((mask) => ({
      ...mask,
      data: mask.data ? mask.data.slice(0) : undefined
    })),
    transform: { ...layer.transform },
    metadata: layer.metadata ? deepClone(layer.metadata) : undefined
  }));
}
