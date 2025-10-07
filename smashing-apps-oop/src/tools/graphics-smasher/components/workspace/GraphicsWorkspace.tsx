import React, { useMemo } from 'react';
import MenuBar from '../menus/MenuBar';
import DocumentTabs from './DocumentTabs';
import PrimaryToolbar from '../toolbar/PrimaryToolbar';
import CanvasViewport from '../canvas/CanvasViewport';
import PanelTabs from '../panels/PanelTabs';
import LayersPanel from '../panels/LayersPanel';
import AdjustmentsPanel from '../panels/AdjustmentsPanel';
import HistoryPanel from '../panels/HistoryPanel';
import PropertiesPanel from '../panels/PropertiesPanel';
import AssetsPanel from '../panels/AssetsPanel';
import CommandPaletteOverlay from '../overlays/CommandPaletteOverlay';
import { useActiveDocument, useActiveDocumentId } from '../../hooks/useGraphicsStore';
import { useGraphicsStore } from '../../state/graphicsStore';
import { useGraphicsShortcuts } from '../../hooks/useGraphicsShortcuts';
import { useCanvasEngineBootstrap } from '../../services/rendering/canvasEngine';
import { useImageWorkerBootstrap } from '../../services/workers/workerBridge';

const GraphicsWorkspace: React.FC = () => {
  const activePanel = useGraphicsStore((state) => state.activePanel);
  const activeDocument = useActiveDocument();
  const activeDocumentId = useActiveDocumentId();
  const engineStatus = useGraphicsStore((state) => state.canvasEngine);
  const activeTool = useGraphicsStore((state) => state.activeTool);

  useGraphicsShortcuts(activeDocumentId);
  useCanvasEngineBootstrap();
  useImageWorkerBootstrap();

  const panelContent = useMemo(() => {
    switch (activePanel) {
      case 'layers':
        return <LayersPanel />;
      case 'adjustments':
        return <AdjustmentsPanel />;
      case 'history':
        return <HistoryPanel />;
      case 'properties':
        return <PropertiesPanel />;
      case 'assets':
        return <AssetsPanel />;
      default:
        return null;
    }
  }, [activePanel]);

  return (
    <div className="graphics-smasher-container flex h-screen flex-col bg-slate-50">
      <MenuBar />
      <DocumentTabs />
      <div className="flex flex-1 overflow-hidden">
        <PrimaryToolbar />
        <div className="flex flex-1 flex-col">
          <div className="flex flex-1 overflow-hidden">
            <div className="relative flex flex-1 bg-slate-200">
              <CanvasViewport />
            </div>
            <aside className="flex w-80 flex-col border-l border-slate-200 bg-white shadow-lg">
              <PanelTabs />
              <div className="flex-1 overflow-y-auto">{panelContent}</div>
            </aside>
          </div>
          <footer className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-500 shadow-inner">
            {activeDocument ? (
              <>
                <span className="font-medium">
                  {activeDocument.name} • {activeDocument.width}×{activeDocument.height}px •{' '}
                  {activeDocument.layers.length} layers
                </span>
                <span>
                  GPU:{' '}
                  {engineStatus.webgpuAvailable
                    ? 'WebGPU ready'
                    : engineStatus.webglAvailable
                      ? 'WebGL ready'
                      : 'Canvas 2D'}{' '}
                  • Tool: {activeTool.toUpperCase()}
                </span>
              </>
            ) : (
              <span>Create a document to begin editing.</span>
            )}
          </footer>
        </div>
      </div>
      <CommandPaletteOverlay />
    </div>
  );
};

export default GraphicsWorkspace;
