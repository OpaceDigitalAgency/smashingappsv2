import type { DocumentState, Layer } from '../../types';
import type { BrushStroke, Shape } from '../../hooks/useCanvasInteraction';

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = 'anonymous';
    image.onload = () => resolve(image);
    image.onerror = (err) => reject(err);
    image.src = src;
  });

const drawStrokes = (ctx: CanvasRenderingContext2D, strokes: BrushStroke[]) => {
  strokes.forEach((stroke) => {
    if (!stroke.points || stroke.points.length < 4) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = stroke.opacity;
    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0], stroke.points[1]);
    for (let i = 2; i < stroke.points.length; i += 2) {
      ctx.lineTo(stroke.points[i], stroke.points[i + 1]);
    }
    ctx.stroke();
    ctx.restore();
  });
};

const drawShapes = (ctx: CanvasRenderingContext2D, shapes: Shape[]) => {
  shapes.forEach((shape) => {
    if ((shape as any).text) {
      const fontSize = (shape as any).fontSize || 16;
      const font = (shape as any).font || 'Arial';
      const fontBold = (shape as any).fontBold ? 'bold ' : '';
      const fontItalic = (shape as any).fontItalic ? 'italic ' : '';
      ctx.font = `${fontBold}${fontItalic}${fontSize}px ${font}`;
      ctx.fillStyle = (shape as any).fontColor || '#000000';
      if ((shape as any).fontUnderline) {
        const textWidth = ctx.measureText((shape as any).text).width;
        ctx.strokeStyle = (shape as any).fontColor || '#000000';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(shape.x, shape.y + fontSize + 2);
        ctx.lineTo(shape.x + textWidth, shape.y + fontSize + 2);
        ctx.stroke();
      }
      ctx.fillText((shape as any).text, shape.x, shape.y + fontSize);
    } else if (shape.type === 'rectangle' && shape.width && shape.height) {
      if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
      }
      if (shape.stroke && shape.strokeWidth) {
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth;
        ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      }
    } else if (shape.type === 'ellipse' && shape.width && shape.height) {
      const radiusX = Math.abs(shape.width) / 2;
      const radiusY = Math.abs(shape.height) / 2;
      const centerX = shape.x + radiusX;
      const centerY = shape.y + radiusY;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radiusX, radiusY, 0, 0, Math.PI * 2);
      if (shape.fill && shape.fill !== 'transparent') {
        ctx.fillStyle = shape.fill;
        ctx.fill();
      }
      if (shape.stroke && shape.strokeWidth) {
        ctx.strokeStyle = shape.stroke;
        ctx.lineWidth = shape.strokeWidth;
        ctx.stroke();
      }
      ctx.closePath();
    }
  });
};

const drawLayer = (
  ctx: CanvasRenderingContext2D,
  layer: Layer,
  documentSize: { width: number; height: number },
  imageCache: Map<string, HTMLImageElement>
) => {
  if (!layer.visible || layer.opacity === 0) {
    return;
  }

  ctx.save();
  ctx.globalAlpha = layer.opacity;

  ctx.translate(layer.transform.x, layer.transform.y);
  ctx.rotate(toRadians(layer.transform.rotation));
  ctx.scale(layer.transform.scaleX, layer.transform.scaleY);

  const metadata = layer.metadata ?? {};
  const fill = metadata.fill as string | undefined;
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fillRect(0, 0, documentSize.width, documentSize.height);
  }

  const imageUrl = metadata.imageUrl as string | undefined;
  if (imageUrl && imageCache.has(imageUrl)) {
    const image = imageCache.get(imageUrl)!;
    const imageWidth = (metadata.imageWidth as number | undefined) ?? documentSize.width;
    const imageHeight = (metadata.imageHeight as number | undefined) ?? documentSize.height;
    ctx.drawImage(image, 0, 0, imageWidth, imageHeight);
  }

  const fillImageUrl = metadata.fillImageUrl as string | undefined;
  if (fillImageUrl && imageCache.has(fillImageUrl)) {
    const image = imageCache.get(fillImageUrl)!;
    ctx.drawImage(image, 0, 0, documentSize.width, documentSize.height);
  }

  const strokes = (metadata.strokes as BrushStroke[]) || [];
  const shapes = (metadata.shapes as Shape[]) || [];

  drawStrokes(ctx, strokes);
  drawShapes(ctx, shapes);

  ctx.restore();
};

const collectImageUrls = (layers: Layer[]): string[] => {
  const urls: string[] = [];
  layers.forEach((layer) => {
    const imageUrl = layer.metadata?.imageUrl as string | undefined;
    if (imageUrl) {
      urls.push(imageUrl);
    }
    const fillImageUrl = layer.metadata?.fillImageUrl as string | undefined;
    if (fillImageUrl) {
      urls.push(fillImageUrl);
    }
  });
  return Array.from(new Set(urls));
};

export const renderDocumentToCanvas = async (doc: DocumentState): Promise<HTMLCanvasElement> => {
  if (typeof document === 'undefined') {
    throw new Error('Canvas rendering is only available in the browser environment.');
  }

  const imageCache = new Map<string, HTMLImageElement>();
  const imageUrls = collectImageUrls(doc.layers);

  if (imageUrls.length > 0) {
    await Promise.all(
      imageUrls.map(async (url) => {
        try {
          const image = await loadImage(url);
          imageCache.set(url, image);
        } catch (error) {
          console.warn(`Failed to load image "${url}" for export:`, error);
        }
      })
    );
  }

  const canvas = document.createElement('canvas');
  canvas.width = doc.width;
  canvas.height = doc.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to acquire 2D rendering context.');
  }

  ctx.fillStyle = doc.background ?? '#ffffff';
  ctx.fillRect(0, 0, doc.width, doc.height);

  doc.layers.forEach((layer) => drawLayer(ctx, layer, { width: doc.width, height: doc.height }, imageCache));

  return canvas;
};
