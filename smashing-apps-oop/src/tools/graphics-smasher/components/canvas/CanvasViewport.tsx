import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Stage, Layer as KonvaLayer, Rect, Group, Text } from 'react-konva';
import { useActiveDocument } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';

const CanvasViewport: React.FC = () => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const activeDocument = useActiveDocument();
  const setViewport = useGraphicsStore((state) => state.setViewport);
  const settings = useGraphicsStore((state) => state.settings);
  const [size, setSize] = useState({ width: 0, height: 0 });

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

  const renderLayers = useMemo(() => {
    if (!activeDocument) {
      return null;
    }

    return activeDocument.layers.map((layer, index) => {
      const isBackground = index === 0;
      if (isBackground) {
        return (
          <Rect
            key={layer.id}
            x={0}
            y={0}
            width={activeDocument.width}
            height={activeDocument.height}
            fill={(layer.metadata?.fill as string) ?? activeDocument.background}
            listening={false}
          />
        );
      }

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
    <div ref={containerRef} className="relative h-full w-full overflow-hidden bg-slate-200">
      <div className="absolute left-8 top-8 z-10 rounded-md bg-white/70 px-3 py-1 text-xs font-medium text-slate-600 shadow">
        {Math.round(activeDocument.viewport.zoom * 100)}%
      </div>
      <Stage
        width={size.width}
        height={size.height}
        scaleX={activeDocument.viewport.zoom}
        scaleY={activeDocument.viewport.zoom}
        x={activeDocument.viewport.panX}
        y={activeDocument.viewport.panY}
        onWheel={handleWheel}
      >
        <KonvaLayer listening={false}>
          <Rect
            x={-4000}
            y={-4000}
            width={8000}
            height={8000}
            fillPatternImage={undefined}
            fill="#f8fafc"
          />
        </KonvaLayer>
        <KonvaLayer>
          {renderLayers}
        </KonvaLayer>
      </Stage>
      {settings.snapToGrid && (
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.12)_1px,transparent_1px)]"
          style={{
            backgroundSize: `${(activeDocument.viewport.gridSize ?? 32) * activeDocument.viewport.zoom}px ${(activeDocument.viewport.gridSize ?? 32) * activeDocument.viewport.zoom}px`
          }}
        />
      )}
      {settings.snapToGuides && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-16 top-0 h-full w-px bg-blue-400/40"></div>
          <div className="absolute left-0 top-16 w-full border-t border-blue-400/40"></div>
        </div>
      )}
    </div>
  );
};

export default CanvasViewport;
