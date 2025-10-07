import { useEffect } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';

export function useCanvasEngineBootstrap() {
  const setCanvasEngineStatus = useGraphicsStore((state) => state.setCanvasEngineStatus);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      const webglAvailable = isWebGLAvailable();
      const webgpuAvailable = await isWebGPUAvailable();

      if (!cancelled) {
        setCanvasEngineStatus({
          webglAvailable,
          webgpuAvailable,
          renderer: webgpuAvailable ? 'webgpu' : webglAvailable ? 'webgl' : '2d',
          initialized: true
        });
      }
    }

    detect().catch((error) => {
      console.error('Failed to initialize canvas engine', error);
      if (!cancelled) {
        setCanvasEngineStatus({
          webglAvailable: false,
          webgpuAvailable: false,
          renderer: '2d',
          initialized: true
        });
      }
    });

    return () => {
      cancelled = true;
    };
  }, [setCanvasEngineStatus]);
}

function isWebGLAvailable(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      canvas.getContext('webgl2') ??
      canvas.getContext('webgl') ??
      canvas.getContext('experimental-webgl');
    return Boolean(gl);
  } catch (error) {
    console.warn('WebGL detection error', error);
    return false;
  }
}

async function isWebGPUAvailable(): Promise<boolean> {
  if (typeof navigator === 'undefined') {
    return false;
  }
  try {
    // @ts-expect-error Experimental API detection
    return Boolean(navigator.gpu);
  } catch {
    return false;
  }
}
