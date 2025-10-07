import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Group, Text, Line, Image as KonvaImage, Ellipse } from 'react-konva';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useCanvasInteraction, type BrushStroke, type Shape } from '../../hooks/useCanvasInteraction';
import useImage from 'use-image';
import ContextMenu from '../overlays/ContextMenu';

// Move BackgroundLayer outside to avoid hooks issues
const BackgroundLayer: React.FC<{ layer: any; docWidth: number; docHeight: number; docBg: string }> = ({ layer, docWidth, docHeight, docBg }) => {
  const imageUrl = layer.metadata?.imageUrl as string | undefined;
  const [image] = useImage(imageUrl || '');

  if (imageUrl && image) {
    return (
      <KonvaImage
        key={layer.id}
        x={0}
        y={0}
        width={docWidth}
        height={docHeight}
        image={image}
        listening={false}
      />
    );
  }

  return (
    <Rect
      key={layer.id}
      x={0}
      y={0}
      width={docWidth}
      height={docHeight}
      fill={(layer.metadata?.fill as string) ?? docBg}
      listening={false}
    />
  );
};

const CanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeDocument = useActiveDocument();
  const setViewport = useGraphicsStore((state) => state.setViewport);
  const settings = useGraphicsStore((state) => state.settings);
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);

  const {
    isDrawing,
    currentStroke,
    currentShape,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleMouseLeave
  } = useCanvasInteraction();

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateSize = () => {
      const { clientWidth, clientHeight } = node;
      setSize({ width: clientWidth, height: clientHeight });
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const handleWheel = useCallback(
    (event: any) => {
      if (!activeDocument) {
        return;
      }
      event.evt.preventDefault();

      const scaleBy = 1.05;
      const oldScale = activeDocument.viewport.zoom;
      const pointer = event.target.getStage().getPointerPosition();
      if (!pointer) {
        return;
      }

      const mousePointTo = {
        x: (pointer.x - activeDocument.viewport.panX) / oldScale,
        y: (pointer.y - activeDocument.viewport.panY) / oldScale
      };

      const direction = event.evt.deltaY > 0 ? -1 : 1;
      const newScale = direction > 0 ? oldScale * scaleBy : oldScale / scaleBy;
      const clampedScale = Math.min(Math.max(newScale, 0.2), 8);

      const newPos = {
        panX: pointer.x - mousePointTo.x * clampedScale,
        panY: pointer.y - mousePointTo.y * clampedScale
      };

      setViewport(activeDocument.id, {
        zoom: clampedScale,
        panX: newPos.panX,
        panY: newPos.panY
      });
    },
    [activeDocument, setViewport]
  );

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY });
  }, []);

  const renderLayers = useMemo(() => {
    if (!activeDocument) {
      return null;
    }

    return activeDocument.layers.map((layer, index) => {
      const isBackground = index === 0;
      if (isBackground) {
        return (
          <BackgroundLayer
            key={layer.id}
            layer={layer}
            docWidth={activeDocument.width}
            docHeight={activeDocument.height}
            docBg={activeDocument.background}
          />
        );
      }

      // Get saved strokes and shapes from layer metadata
      const savedStrokes = (layer.metadata?.strokes as BrushStroke[]) || [];
      const savedShapes = (layer.metadata?.shapes as Shape[]) || [];
      const layerFill = layer.metadata?.fill as string | undefined;
      const hasContent = savedStrokes.length > 0 || savedShapes.length > 0 || layerFill;

      return (
        <Group
          key={layer.id}
          opacity={layer.opacity}
          visible={layer.visible}
          x={layer.transform.x}
          y={layer.transform.y}
          rotation={layer.transform.rotation}
          scaleX={layer.transform.scaleX}
          scaleY={layer.transform.scaleY}
          listening={!layer.locked}
        >
          {/* Layer fill if present */}
          {layerFill && (
            <Rect
              width={activeDocument.width}
              height={activeDocument.height}
              fill={layerFill}
            />
          )}

          {/* Render saved strokes */}
          {savedStrokes.map((stroke, strokeIndex) => (
            <Line
              key={`stroke-${strokeIndex}`}
              points={stroke.points}
              stroke={stroke.color}
              strokeWidth={stroke.size}
              opacity={stroke.opacity}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={stroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          ))}

          {/* Render saved shapes */}
          {savedShapes.map((shape, shapeIndex) => {
            if (shape.type === 'rectangle' && shape.width && shape.height) {
              return (
                <Rect
                  key={`shape-${shapeIndex}`}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill || 'transparent'}
                  stroke={shape.stroke || '#000000'}
                  strokeWidth={shape.strokeWidth || 1}
                />
              );
            } else if (shape.type === 'ellipse' && shape.width && shape.height) {
              return (
                <Ellipse
                  key={`shape-${shapeIndex}`}
                  x={shape.x + shape.width / 2}
                  y={shape.y + shape.height / 2}
                  radiusX={Math.abs(shape.width) / 2}
                  radiusY={Math.abs(shape.height) / 2}
                  fill={shape.fill || 'transparent'}
                  stroke={shape.stroke || '#000000'}
                  strokeWidth={shape.strokeWidth || 1}
                />
              );
            }
            return null;
          })}

          {/* Layer placeholder visual - only show if no content */}
          {!hasContent && (
            <>
              <Rect
                width={activeDocument.width * 0.4}
                height={activeDocument.height * 0.4}
                fill="rgba(99,102,241,0.12)"
                stroke="rgba(79,70,229,0.8)"
                dash={[6, 6]}
                cornerRadius={12}
              />
              <Text
                text={layer.name}
                fontSize={16}
                fill="#1f2937"
                padding={12}
              />
            </>
          )}
        </Group>
      );
    });
  }, [activeDocument]);

  if (!activeDocument) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-slate-500">
        Select or create a document to begin editing.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full overflow-hidden bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200"
      onContextMenu={handleContextMenu}
    >
      {/* Zoom indicator */}
      <div className="absolute left-4 top-4 z-10 flex items-center gap-2 rounded-lg border border-slate-300 bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-lg backdrop-blur-sm">
        <span>{Math.round(activeDocument.viewport.zoom * 100)}%</span>
        <div className="h-3 w-px bg-slate-300" />
        <button
          onClick={() => setViewport(activeDocument.id, { zoom: Math.max(0.2, activeDocument.viewport.zoom - 0.1) })}
          className="text-slate-500 hover:text-slate-700"
          title="Zoom out"
        >
          −
        </button>
        <button
          onClick={() => setViewport(activeDocument.id, { zoom: Math.min(8, activeDocument.viewport.zoom + 0.1) })}
          className="text-slate-500 hover:text-slate-700"
          title="Zoom in"
        >
          +
        </button>
      </div>

      {/* Canvas stage */}
      <Stage
        width={size.width}
        height={size.height}
        scaleX={activeDocument.viewport.zoom}
        scaleY={activeDocument.viewport.zoom}
        x={activeDocument.viewport.panX}
        y={activeDocument.viewport.panY}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseLeave}
        style={{ cursor: activeTool === 'hand' ? 'grab' : activeTool === 'zoom' ? 'zoom-in' : 'crosshair' }}
      >
        <KonvaLayer listening={false}>
          <Rect
            x={-4000}
            y={-4000}
            width={8000}
            height={8000}
            fillPatternImage={undefined}
            fill="#f1f5f9"
          />
        </KonvaLayer>
        <KonvaLayer>
          {/* Document boundary with shadow */}
          <Rect
            x={-5}
            y={-5}
            width={activeDocument.width + 10}
            height={activeDocument.height + 10}
            fill="rgba(0,0,0,0.1)"
            shadowBlur={20}
            shadowColor="rgba(0,0,0,0.3)"
            shadowOffsetX={0}
            shadowOffsetY={4}
          />
          {renderLayers}

          {/* Current brush stroke */}
          {currentStroke && (
            <Line
              points={currentStroke.points}
              stroke={currentStroke.color}
              strokeWidth={currentStroke.size}
              opacity={currentStroke.opacity}
              tension={0.5}
              lineCap="round"
              lineJoin="round"
              globalCompositeOperation={currentStroke.tool === 'eraser' ? 'destination-out' : 'source-over'}
            />
          )}

          {/* Current shape being drawn */}
          {currentShape && currentShape.type === 'rectangle' && (
            <Rect
              x={currentShape.x}
              y={currentShape.y}
              width={currentShape.width || 0}
              height={currentShape.height || 0}
              fill={currentShape.fill}
              stroke={currentShape.stroke}
              strokeWidth={currentShape.strokeWidth}
            />
          )}
          {currentShape && currentShape.type === 'ellipse' && (
            <Ellipse
              x={currentShape.x + (currentShape.width || 0) / 2}
              y={currentShape.y + (currentShape.height || 0) / 2}
              radiusX={Math.abs((currentShape.width || 0) / 2)}
              radiusY={Math.abs((currentShape.height || 0) / 2)}
              fill={currentShape.fill}
              stroke={currentShape.stroke}
              strokeWidth={currentShape.strokeWidth}
            />
          )}
        </KonvaLayer>
      </Stage>

      {/* Grid overlay */}
      {settings.snapToGrid && activeDocument.viewport.showGrid && (
        <div
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.08)_1px,transparent_1px)]"
          style={{
            backgroundSize: `${(activeDocument.viewport.gridSize ?? 32) * activeDocument.viewport.zoom}px ${(activeDocument.viewport.gridSize ?? 32) * activeDocument.viewport.zoom}px`
          }}
        />
      )}

      {/* Guides overlay */}
      {settings.snapToGuides && activeDocument.viewport.showGuides && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-full w-px bg-indigo-400/50 shadow-sm"></div>
          <div className="absolute left-0 top-1/2 w-full border-t border-indigo-400/50 shadow-sm"></div>
        </div>
      )}

      {/* Rulers (placeholder) */}
      {activeDocument.viewport.showRulers && (
        <>
          <div className="pointer-events-none absolute left-0 top-0 h-6 w-full border-b border-slate-300 bg-white/80 backdrop-blur-sm" />
          <div className="pointer-events-none absolute left-0 top-0 h-full w-6 border-r border-slate-300 bg-white/80 backdrop-blur-sm" />
        </>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}
    </div>
  );
};

export default CanvasViewport;
