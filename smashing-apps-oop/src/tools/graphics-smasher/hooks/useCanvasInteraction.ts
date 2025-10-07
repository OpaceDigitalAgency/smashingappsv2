import { useCallback, useRef, useState } from 'react';
import type Konva from 'konva';
import { useGraphicsStore } from '../state/graphicsStore';
import { useActiveDocument } from './useGraphicsStore';

interface Point {
  x: number;
  y: number;
}

interface BrushStroke {
  tool: string;
  points: number[];
  color: string;
  size: number;
  opacity: number;
}

export function useCanvasInteraction() {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const activeDocument = useActiveDocument();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<BrushStroke | null>(null);
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
          color: activeTool === 'brush' ? '#000000' : '#ffffff',
          size: 5,
          opacity: 1
        });
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
  }, [activeDocument, activeTool, getPointerPosition]);

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

    // Commit the stroke to the layer
    if (currentStroke && activeDocument) {
      console.log('Commit stroke:', currentStroke);
      // TODO: Add stroke to active layer
      // This would involve updating the layer's image data
      setCurrentStroke(null);
    }
  }, [isDrawing, currentStroke, activeDocument]);

  const handleMouseLeave = useCallback(() => {
    if (isDrawing) {
      handleMouseUp();
    }
  }, [isDrawing, handleMouseUp]);

  return {
    isDrawing,
    currentStroke,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  };
}

