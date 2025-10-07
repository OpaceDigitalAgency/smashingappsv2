import { useEffect, useState } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';

export type AIFeature =
  | 'generative-fill'
  | 'generative-expand'
  | 'harmonise'
  | 'background-removal'
  | 'object-cleanup'
  | 'upscale'
  | 'magic-replace'
  | 'style-transfer';

export interface AIFeatureStatus {
  feature: AIFeature;
  available: boolean;
  provider?: string;
  latency?: number;
  notes?: string;
}

export function useAIFeatureStatus(): AIFeatureStatus[] {
  const [status, setStatus] = useState<AIFeatureStatus[]>([]);
  const setWorkerStatus = useGraphicsStore((state) => state.setWorkerStatus);

  useEffect(() => {
    let cancelled = false;
    setWorkerStatus('ai', 'initializing');

    async function bootstrap() {
      const features: AIFeatureStatus[] = [
        { feature: 'generative-fill', available: false, notes: 'Provider integration pending' },
        { feature: 'generative-expand', available: false, notes: 'Requires tiling model' },
        { feature: 'harmonise', available: false, notes: 'Colour matching model stub' },
        { feature: 'background-removal', available: false, notes: 'Edge refine worker stubbed' },
        { feature: 'object-cleanup', available: false, notes: 'Cleanup pipeline planned' },
        { feature: 'upscale', available: false, notes: '2× super-resolution requires WASM model' },
        { feature: 'magic-replace', available: false, notes: 'Vector-aware replacement pending' },
        { feature: 'style-transfer', available: false, notes: 'Fast style adaptation not yet wired' }
      ];

      if (!cancelled) {
        setStatus(features);
        setWorkerStatus('ai', 'ready');
      }
    }

    bootstrap().catch((error) => {
      console.error('Failed to bootstrap AI features', error);
      if (!cancelled) {
        setWorkerStatus('ai', 'error');
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setWorkerStatus]);

  return status;
}
