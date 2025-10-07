import { createId } from '../../utils/id';
import type { DocumentState } from '../../types';

export interface FileOpenResult {
  document: DocumentState;
  fileHandle?: FileSystemFileHandle;
}

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp' | 'avif' | 'pdf' | 'svg' | 'proj';
  quality?: number;
  includeMetadata?: boolean;
  keepExif?: boolean;
}

export async function openFileWithPicker(): Promise<FileOpenResult | null> {
  if (!('showOpenFilePicker' in window)) {
    console.warn('File System Access API not available; falling back to input element.');
    return null;
  }

  const [handle] = await window.showOpenFilePicker({
    types: [
      {
        description: 'Images & Projects',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'],
          'image/gif': ['.gif'],
          'image/avif': ['.avif'],
          'image/svg+xml': ['.svg'],
          'application/json': ['.proj', '.json']
        }
      }
    ],
    allowMultiple: false
  });

  const file = await handle.getFile();
  const arrayBuffer = await file.arrayBuffer();
  const document: DocumentState = {
    id: createId('doc'),
    name: file.name.replace(/\.[^/.]+$/, ''),
    width: 1024,
    height: 1024,
    background: '#ffffff',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    layers: [],
    history: { past: [], future: [] },
    activeLayerId: null,
    viewport: {
      zoom: 1,
      panX: 0,
      panY: 0,
      gridSize: 32,
      showGrid: true,
      showRulers: true,
      showGuides: true
    },
    metadata: {
      sourceFileType: file.type,
      rawData: arrayBuffer
    }
  };

  return { document, fileHandle: handle };
}

export async function saveDocumentAs(
  document: DocumentState,
  options: ExportOptions
): Promise<void> {
  if (!('showSaveFilePicker' in window)) {
    console.warn('File System Access API not available; implement fallback export.');
    return;
  }

  const handle = await window.showSaveFilePicker({
    suggestedName: `${document.name}.${options.format}`,
    types: [
      {
        description: 'Export formats',
        accept: {
          'image/png': ['.png'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/webp': ['.webp'],
          'image/avif': ['.avif'],
          'application/pdf': ['.pdf'],
          'image/svg+xml': ['.svg'],
          'application/json': ['.proj']
        }
      }
    ]
  });

  const writable = await handle.createWritable();
  const blob = await createPlaceholderExportBlob(document, options);
  await writable.write(blob);
  await writable.close();
}

async function createPlaceholderExportBlob(
  document: DocumentState,
  options: ExportOptions
): Promise<Blob> {
  if (options.format === 'proj') {
    const projectPayload = {
      id: document.id,
      name: document.name,
      width: document.width,
      height: document.height,
      background: document.background,
      layers: document.layers,
      metadata: document.metadata,
      exportedAt: new Date().toISOString(),
      options
    };

    return new Blob([JSON.stringify(projectPayload, null, 2)], { type: 'application/json' });
  }

  // Placeholder image export; integrate with renderer pipeline later
  if (typeof document === 'undefined') {
    return new Blob();
  }

  const canvas = document.createElement('canvas');
  canvas.width = document.width;
  canvas.height = document.height;
  const context = canvas.getContext('2d');
  if (context) {
    context.fillStyle = document.background;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#1f2937';
    context.font = '24px sans-serif';
    context.fillText('Graphics Smasher Export Placeholder', 32, 64);
  }

  const mime: Record<string, string> = {
    png: 'image/png',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    avif: 'image/avif',
    pdf: 'application/pdf',
    svg: 'image/svg+xml',
    proj: 'application/json'
  };

  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => resolve(blob ?? new Blob()),
      mime[options.format],
      options.quality ?? 0.92
    );
  });
}
