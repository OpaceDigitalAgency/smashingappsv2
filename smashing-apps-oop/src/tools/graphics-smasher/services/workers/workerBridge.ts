import { useEffect, useRef } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';

type ImageWorker = Worker & {
  postMessage(message: unknown): void;
};

export function useImageWorkerBootstrap() {
  const workerRef = useRef<ImageWorker | null>(null);
  const setWorkerStatus = useGraphicsStore((state) => state.setWorkerStatus);

  useEffect(() => {
    setWorkerStatus('imageProcessing', 'initializing');
    try {
      const worker = new Worker(new URL('../../workers/imageProcessor.worker.ts', import.meta.url), {
        type: 'module'
      }) as ImageWorker;
      workerRef.current = worker;
      setWorkerStatus('imageProcessing', 'ready');
    } catch (error) {
      console.error('Failed to initialize image worker', error);
      setWorkerStatus('imageProcessing', 'error');
    }

    return () => {
      workerRef.current?.terminate();
      workerRef.current = null;
      setWorkerStatus('imageProcessing', 'idle');
    };
  }, [setWorkerStatus]);

  return workerRef.current;
}
