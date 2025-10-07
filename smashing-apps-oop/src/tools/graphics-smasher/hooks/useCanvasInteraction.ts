import { useCallback, useRef, useState } from 'react';
import type Konva from 'konva';
import { useGraphicsStore } from '../state/graphicsStore';
import { useActiveDocument } from './useGraphicsStore';

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

export function useCanvasInteraction() {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const activeDocument = useActiveDocument();
  const updateLayer = useGraphicsStore((state) => state.updateLayer);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
  const [brushSize, setBrushSize] = useState(5);
  const [brushColor, setBrushColor] = useState('#000000');
  const lastPointRef = useRef<Point | null>(null);

  const getPointerPosition = useCallback((stage: Konva.Stage): Point | null => {
    const pos = stage.getPointerPosition();
    if (!pos || !activeDocument) return null;

    // Transform pointer position to canvas coordinates
    const transform = stage.getAbsoluteTransform().copy().invert();
    return transform.point(pos);
  }, [activeDocument]);

  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!activeDocument) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getPointerPosition(stage);
    if (!pos) return;

    setIsDrawing(true);
    lastPointRef.current = pos;

    // Handle different tools
    switch (activeTool) {
      case 'brush':
      case 'eraser':
        setCurrentStroke({
          tool: activeTool,
          points: [pos.x, pos.y],
          color: activeTool === 'brush' ? brushColor : '#ffffff',
          size: brushSize,
          opacity: 1
        });
        break;
      case 'paint-bucket':
        // Fill the active layer with the current colour
        if (activeDocument.activeLayerId) {
          const activeLayer = activeDocument.layers.find(l => l.id === activeDocument.activeLayerId);
          updateLayer(activeDocument.id, activeDocument.activeLayerId, {
            metadata: {
              ...activeLayer?.metadata,
              fill: brushColor
            }
          });
        }
        setIsDrawing(false);
        break;
      case 'eyedropper':
        // TODO: Implement colour picking from canvas
        console.log('Eyedropper tool - pick colour at', pos);
        setIsDrawing(false);
        break;
      case 'marquee-rect':
      case 'marquee-ellipse':
        // Start selection
        console.log('Start selection at', pos);
        break;
      case 'move':
        // Start moving layer
        console.log('Start move at', pos);
        break;
      default:
        break;
    }
  }, [activeDocument, activeTool, getPointerPosition, brushColor, brushSize, updateLayer]);

  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !activeDocument) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getPointerPosition(stage);
    if (!pos) return;

    switch (activeTool) {
      case 'brush':
      case 'eraser':
        if (currentStroke) {
          setCurrentStroke({
            ...currentStroke,
            points: [...currentStroke.points, pos.x, pos.y]
          });
        }
        break;
      case 'marquee-rect':
      case 'marquee-ellipse':
        // Update selection
        console.log('Update selection to', pos);
        break;
      case 'move':
        // Update layer position
        console.log('Move to', pos);
        break;
      default:
        break;
    }

    lastPointRef.current = pos;
  }, [isDrawing, activeDocument, activeTool, currentStroke, getPointerPosition]);

  const handleMouseUp = useCallback(() => {
    if (!isDrawing) return;

    setIsDrawing(false);
    lastPointRef.current = null;

    // Commit the stroke to the active layer
    if (currentStroke && activeDocument && currentStroke.points.length > 2) {
      const activeLayerId = activeDocument.activeLayerId;
      if (activeLayerId) {
        // Get existing strokes from layer metadata
        const activeLayer = activeDocument.layers.find(l => l.id === activeLayerId);
        const existingStrokes = (activeLayer?.metadata?.strokes as BrushStroke[]) || [];

        // Add the new stroke
        updateLayer(activeDocument.id, activeLayerId, {
          metadata: {
            ...activeLayer?.metadata,
            strokes: [...existingStrokes, currentStroke]
          }
        });

        console.log('Stroke saved to layer:', currentStroke);
      }
      setCurrentStroke(null);
    } else {
      setCurrentStroke(null);
    }
  }, [isDrawing, currentStroke, activeDocument, updateLayer]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  return {
    isDrawing,
    currentStroke,
    brushSize,
    brushColor,
    setBrushSize,
    setBrushColor,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
}

