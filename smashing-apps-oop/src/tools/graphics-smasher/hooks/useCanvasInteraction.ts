import { useCallback, useRef, useState } from 'react';
import type Konva from 'konva';
import { useGraphicsStore } from '../state/graphicsStore';
import { useActiveDocument } from './useGraphicsStore';
import type { SelectionState } from '../types';

interface Point {
  x: number;
  y: number;
}

export interface BrushStroke {
  tool: string;
  points: number[];
  color: string;
  size: number;
  opacity: number;
}

export interface Shape {
  type: 'rectangle' | 'ellipse' | 'line';
  x: number;
  y: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  text?: string;
  font?: string;
  fontSize?: number;
  fontColor?: string;
  fontBold?: boolean;
  fontItalic?: boolean;
  fontUnderline?: boolean;
}

export function useCanvasInteraction() {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const activeDocument = useActiveDocument();
  const updateLayer = useGraphicsStore((state) => state.updateLayer);
  const toolOptions = useGraphicsStore((state) => state.toolOptions);
  const setSelection = useGraphicsStore((state) => state.setSelection);
  const clearSelection = useGraphicsStore((state) => state.clearSelection);
  const cropDocument = useGraphicsStore((state) => state.cropDocument);
  const canvasStage = useGraphicsStore((state) => state.canvasStage);
  const setToolOptions = useGraphicsStore((state) => state.setToolOptions);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [currentShape, setCurrentShape] = useState<Shape | null>(null);
  const [selectionPreview, setSelectionPreview] = useState<SelectionState['shape'] | null>(null);
  const lastPointRef = useRef<Point | null>(null);
  const shapeStartRef = useRef<Point | null>(null);
  const selectionStartRef = useRef<Point | null>(null);
  const lassoPointsRef = useRef<number[]>([]);

  const getPointerPosition = useCallback((stage: Konva.Stage): Point | null => {
    const pos = stage.getPointerPosition();
    if (!pos || !activeDocument) return null;

    // Transform pointer position to canvas coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pos);
  }, [activeDocument]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    // Ignore right-click (button 2) and middle-click (button 1)
    if (e.evt.button !== 0) return;

    if (!activeDocument) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getPointerPosition(stage);
    if (!pos) return;

    const brushSettings = toolOptions.brush;
    const eraserSettings = toolOptions.eraser;
    const shapeSettings = toolOptions.shape;

    switch (activeTool) {
      case 'move': {
        const selection = useGraphicsStore.getState().selection;
        if (selection) {
          selectionStartRef.current = pos;
          setIsDrawing(true);
          return;
        }
        return;
      }
      case 'hand':
        clearSelection();
        return;
      case 'eyedropper': {
        const stage = canvasStage;
        if (stage) {
          const canvas = stage.toCanvas();
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const pixelData = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            const hexColor = `#${((1 << 24) + (pixelData[0] << 16) + (pixelData[1] << 8) + pixelData[2]).toString(16).slice(1)}`;
            setToolOptions('brush', { color: hexColor });
            console.log('Picked color:', hexColor);
          }
        }
        setIsDrawing(false);
        return;
      }
      case 'paint-bucket': {
        if (canvasStage && activeDocument.activeLayerId) {
          const canvas = canvasStage.toCanvas();
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const targetPixel = ctx.getImageData(pos.x, pos.y, 1, 1).data;
            const fillColor = brushSettings.color;
            
            // Convert hex to RGB
            const r = parseInt(fillColor.slice(1, 3), 16);
            const g = parseInt(fillColor.slice(3, 5), 16);
            const b = parseInt(fillColor.slice(5, 7), 16);
            
            // Simple flood fill (for small areas)
            const floodFill = (x: number, y: number) => {
              const stack: Point[] = [{ x, y }];
              const visited = new Set<string>();
              
              while (stack.length > 0) {
                const point = stack.pop()!;
                const key = `${point.x},${point.y}`;
                
                if (visited.has(key) || point.x < 0 || point.y < 0 ||
                    point.x >= canvas.width || point.y >= canvas.height) {
                  continue;
                }
                
                visited.add(key);
                const idx = (point.y * canvas.width + point.x) * 4;
                
                if (imageData.data[idx] === targetPixel[0] &&
                    imageData.data[idx + 1] === targetPixel[1] &&
                    imageData.data[idx + 2] === targetPixel[2] &&
                    imageData.data[idx + 3] === targetPixel[3]) {
                  imageData.data[idx] = r;
                  imageData.data[idx + 1] = g;
                  imageData.data[idx + 2] = b;
                  imageData.data[idx + 3] = 255;
                  
                  if (visited.size < 10000) { // Limit to prevent browser hang
                    stack.push({ x: point.x + 1, y: point.y });
                    stack.push({ x: point.x - 1, y: point.y });
                    stack.push({ x: point.x, y: point.y + 1 });
                    stack.push({ x: point.x, y: point.y - 1 });
                  }
                }
              }
            };
            
            floodFill(Math.floor(pos.x), Math.floor(pos.y));
            
            // Create a temporary canvas to store the filled image
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = canvas.width;
            tempCanvas.height = canvas.height;
            const tempCtx = tempCanvas.getContext('2d')!;
            tempCtx.putImageData(imageData, 0, 0);
            
            // Store as a shape/image in the layer
            const activeLayer = activeDocument.layers.find(l => l.id === activeDocument.activeLayerId);
            const existingShapes = (activeLayer?.metadata?.shapes as Shape[]) || [];
            
            updateLayer(activeDocument.id, activeDocument.activeLayerId, (layer) => ({
              ...layer,
              metadata: {
                ...layer.metadata,
                fillImageUrl: tempCanvas.toDataURL(),
                shapes: existingShapes
              }
            }));
          }
        }
        setIsDrawing(false);
        return;
      }
      case 'text': {
        const textSettings = toolOptions.text;
        const textContent = prompt('Enter text:');
        if (textContent && activeDocument.activeLayerId) {
          const activeLayer = activeDocument.layers.find(l => l.id === activeDocument.activeLayerId);
          const existingShapes = (activeLayer?.metadata?.shapes as Shape[]) || [];
          
          updateLayer(activeDocument.id, activeDocument.activeLayerId, (layer) => ({
            ...layer,
            metadata: {
              ...layer.metadata,
              shapes: [...existingShapes, {
                type: 'rectangle' as const,
                x: pos.x,
                y: pos.y,
                width: 0,
                height: 0,
                fill: 'transparent',
                stroke: 'transparent',
                strokeWidth: 0,
                text: textContent,
                font: textSettings.font,
                fontSize: textSettings.size,
                fontColor: textSettings.color,
                fontBold: textSettings.bold,
                fontItalic: textSettings.italic,
                fontUnderline: textSettings.underline
              }]
            }
          }));
        }
        setIsDrawing(false);
        return;
      }
      case 'magic-wand': {
        if (canvasStage && activeDocument.activeLayerId) {
          const canvas = canvasStage.toCanvas();
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const clickedPixel = ctx.getImageData(Math.floor(pos.x), Math.floor(pos.y), 1, 1).data;
            const tolerance = 32;
            
            const selectedPoints: number[] = [];
            const visited = new Set<string>();
            const stack: Point[] = [{ x: Math.floor(pos.x), y: Math.floor(pos.y) }];
            
            const colorMatch = (x: number, y: number): boolean => {
              const idx = (y * canvas.width + x) * 4;
              const r = Math.abs(imageData.data[idx] - clickedPixel[0]);
              const g = Math.abs(imageData.data[idx + 1] - clickedPixel[1]);
              const b = Math.abs(imageData.data[idx + 2] - clickedPixel[2]);
              return r <= tolerance && g <= tolerance && b <= tolerance;
            };
            
            while (stack.length > 0 && visited.size < 10000) {
              const point = stack.pop()!;
              const key = `${point.x},${point.y}`;
              
              if (visited.has(key) || point.x < 0 || point.y < 0 ||
                  point.x >= canvas.width || point.y >= canvas.height) {
                continue;
              }
              
              if (!colorMatch(point.x, point.y)) {
                continue;
              }
              
              visited.add(key);
              selectedPoints.push(point.x, point.y);
              
              stack.push({ x: point.x + 1, y: point.y });
              stack.push({ x: point.x - 1, y: point.y });
              stack.push({ x: point.x, y: point.y + 1 });
              stack.push({ x: point.x, y: point.y - 1 });
            }
            
            if (selectedPoints.length > 0) {
              setSelection({
                tool: 'magic-wand',
                shape: { type: 'lasso', points: selectedPoints },
                layerId: activeDocument.activeLayerId
              });
              console.log('Magic wand selected', visited.size, 'pixels');
            }
          }
        }
        setIsDrawing(false);
        return;
      }
      default:
        break;
    }

    clearSelection();
    setIsDrawing(true);
    lastPointRef.current = pos;

    switch (activeTool) {
      case 'brush':
      case 'clone-stamp':
      case 'healing-brush':
        setCurrentStroke({
          tool: activeTool,
          points: [pos.x, pos.y],
          color: brushSettings.color,
          size: brushSettings.size,
          opacity: brushSettings.opacity
        });
        break;
      case 'eraser':
        setCurrentStroke({
          tool: 'eraser',
          points: [pos.x, pos.y],
          color: '#ffffff',
          size: eraserSettings.size,
          opacity: eraserSettings.opacity
        });
        break;
      case 'shape':
        shapeStartRef.current = pos;
        setCurrentShape({
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: shapeSettings.fill,
          stroke: shapeSettings.stroke,
          strokeWidth: shapeSettings.strokeWidth
        });
        break;
      case 'pen': {
        shapeStartRef.current = pos;
        const penSettings = toolOptions.pen;
        setCurrentShape({
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: penSettings.stroke,
          strokeWidth: penSettings.strokeWidth
        });
        break;
      }
      case 'marquee-rect':
      case 'crop':
      case 'marquee-ellipse':
        selectionStartRef.current = pos;
        setSelectionPreview({
          type: 'rect',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0
        });
        break;
      case 'lasso-free':
      case 'lasso-poly':
      case 'lasso-magnetic':
        selectionStartRef.current = pos;
        lassoPointsRef.current = [pos.x, pos.y];
        setSelectionPreview({
          type: 'lasso',
          points: [pos.x, pos.y]
        });
        break;
      default:
        setIsDrawing(false);
        break;
    }
  }, [activeDocument, activeTool, getPointerPosition, toolOptions, updateLayer, clearSelection]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !activeDocument) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getPointerPosition(stage);
    if (!pos) return;

    switch (activeTool) {
      case 'move': {
        const selection = useGraphicsStore.getState().selection;
        if (selection && selectionStartRef.current) {
          const deltaX = pos.x - selectionStartRef.current.x;
          const deltaY = pos.y - selectionStartRef.current.y;
          
          if (selection.shape.type === 'rect') {
            setSelection({
              ...selection,
              shape: {
                ...selection.shape,
                x: selection.shape.x + deltaX,
                y: selection.shape.y + deltaY
              }
            });
          } else if (selection.shape.type === 'lasso') {
            const movedPoints = selection.shape.points.map((val, idx) =>
              idx % 2 === 0 ? val + deltaX : val + deltaY
            );
            setSelection({
              ...selection,
              shape: {
                ...selection.shape,
                points: movedPoints
              }
            });
          }
          
          selectionStartRef.current = pos;
        }
        break;
      }
      case 'brush':
      case 'clone-stamp':
      case 'healing-brush':
      case 'eraser':
        if (currentStroke) {
          setCurrentStroke({
            ...currentStroke,
            points: [...currentStroke.points, pos.x, pos.y]
          });
        }
        break;
      case 'shape':
      case 'pen':
        if (shapeStartRef.current && currentShape) {
          const width = pos.x - shapeStartRef.current.x;
          const height = pos.y - shapeStartRef.current.y;
          setCurrentShape({
            ...currentShape,
            width,
            height
          });
        }
        break;
      case 'marquee-rect':
      case 'marquee-ellipse':
      case 'crop':
        if (selectionStartRef.current) {
          setSelectionPreview({
            type: 'rect',
            x: selectionStartRef.current.x,
            y: selectionStartRef.current.y,
            width: pos.x - selectionStartRef.current.x,
            height: pos.y - selectionStartRef.current.y
          });
        }
        break;
      case 'lasso-free':
      case 'lasso-poly':
      case 'lasso-magnetic':
        if (selectionStartRef.current) {
          lassoPointsRef.current = [...lassoPointsRef.current, pos.x, pos.y];
          setSelectionPreview({
            type: 'lasso',
            points: [...lassoPointsRef.current]
          });
        }
        break;
      default:
        break;
    }

    lastPointRef.current = pos;
  }, [isDrawing, activeDocument, activeTool, currentStroke, currentShape, getPointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;

    const lastPoint = lastPointRef.current;

    if (activeTool === 'move' && selectionStartRef.current) {
      selectionStartRef.current = null;
      setIsDrawing(false);
      return;
    }

    setIsDrawing(false);
    lastPointRef.current = null;
    shapeStartRef.current = null;

    if (selectionStartRef.current && selectionPreview && activeDocument) {
      if (selectionPreview.type === 'rect') {
        const start = selectionStartRef.current;
        const end = lastPoint ?? start;
        const rect = {
          x: Math.min(start.x, end.x),
          y: Math.min(start.y, end.y),
          width: Math.abs(end.x - start.x),
          height: Math.abs(end.y - start.y)
        };

        if (rect.width > 1 && rect.height > 1) {
          if (activeTool === 'crop') {
            cropDocument(activeDocument.id, rect);
          } else {
            setSelection({
              tool: activeTool === 'marquee-ellipse' ? 'marquee-rect' : (activeTool as SelectionState['tool']),
              shape: {
                type: 'rect',
                ...rect
              },
              layerId: activeDocument.activeLayerId
            });
          }
        }
      } else if (selectionPreview.type === 'lasso' && selectionPreview.points.length > 4 && activeDocument) {
        const points = [...selectionPreview.points];
        if (lastPoint) {
          points.push(lastPoint.x, lastPoint.y);
        }
        setSelection({
          tool: 'lasso-free',
          shape: {
            type: 'lasso',
            points
          },
          layerId: activeDocument.activeLayerId
        });
      }

      selectionStartRef.current = null;
      lassoPointsRef.current = [];
      setSelectionPreview(null);
    }

    // Commit the stroke to the active layer
    if (currentStroke && activeDocument && currentStroke.points.length > 2) {
      const activeLayerId = activeDocument.activeLayerId;
      if (activeLayerId) {
        const activeLayer = activeDocument.layers.find(l => l.id === activeLayerId);
        const existingStrokes = (activeLayer?.metadata?.strokes as BrushStroke[]) || [];

        updateLayer(activeDocument.id, activeLayerId, (layer) => ({
          ...layer,
          metadata: {
            ...layer.metadata,
            strokes: [...existingStrokes, currentStroke]
          }
        }));

        console.log('Stroke saved to layer:', currentStroke);
      }
      setCurrentStroke(null);
    } else {
      setCurrentStroke(null);
    }

    // Commit the shape to the active layer
    if (currentShape && activeDocument && (currentShape.width !== 0 || currentShape.height !== 0)) {
      const activeLayerId = activeDocument.activeLayerId;
      if (activeLayerId) {
        const activeLayer = activeDocument.layers.find(l => l.id === activeLayerId);
        const existingShapes = (activeLayer?.metadata?.shapes as Shape[]) || [];

        updateLayer(activeDocument.id, activeLayerId, (layer) => ({
          ...layer,
          metadata: {
            ...layer.metadata,
            shapes: [...existingShapes, currentShape]
          }
        }));

        console.log('Shape saved to layer:', currentShape);
      }
      setCurrentShape(null);
    } else {
      setCurrentShape(null);
    }
  }, [isDrawing, selectionPreview, activeDocument, currentStroke, currentShape, activeTool, cropDocument, setSelection, updateLayer]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  return {
    isDrawing,
    currentStroke,
    currentShape,
    selectionPreview,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
}
