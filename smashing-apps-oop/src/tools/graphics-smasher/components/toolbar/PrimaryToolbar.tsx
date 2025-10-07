import React from 'react';
import {
  Move,
  Crop,
  SquareDashed,
  CircleDashed,
  Lasso,
  MousePointer2,
  Wand2,
  Paintbrush,
  Eraser,
  Stamp,
  Sparkles,
  PaintBucket,
  Type,
  Shapes,
  PenTool,
  ZoomIn,
  Hand
} from 'lucide-react';
import { useGraphicsStore } from '../../state/graphicsStore';
import type { GraphicsToolId } from '../../types';
import { useTranslation } from 'react-i18next';

interface ToolConfig {
  id: GraphicsToolId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  labelKey: string;
  shortcut?: string;
}

const TOOL_GROUPS: ToolConfig[][] = [
  [
    { id: 'move', icon: Move, labelKey: 'toolbar.move', shortcut: 'V' },
    { id: 'marquee-rect', icon: SquareDashed, labelKey: 'toolbar.marquee-rect', shortcut: 'M' },
    { id: 'marquee-ellipse', icon: CircleDashed, labelKey: 'toolbar.marquee-ellipse' },
    { id: 'lasso-free', icon: Lasso, labelKey: 'toolbar.lasso-free', shortcut: 'L' },
    { id: 'lasso-poly', icon: MousePointer2, labelKey: 'toolbar.lasso-poly' },
    { id: 'lasso-magnetic', icon: Sparkles, labelKey: 'toolbar.lasso-magnetic' },
    { id: 'object-select', icon: MousePointer2, labelKey: 'toolbar.object-select' },
    { id: 'magic-wand', icon: Wand2, labelKey: 'toolbar.magic-wand', shortcut: 'W' },
    { id: 'crop', icon: Crop, labelKey: 'toolbar.crop' }
  ],
  [
    { id: 'brush', icon: Paintbrush, labelKey: 'toolbar.brush', shortcut: 'B' },
    { id: 'eraser', icon: Eraser, labelKey: 'toolbar.eraser', shortcut: 'E' },
    { id: 'clone-stamp', icon: Stamp, labelKey: 'toolbar.clone-stamp' },
    { id: 'healing-brush', icon: Sparkles, labelKey: 'toolbar.healing-brush' },
    { id: 'gradient', icon: Sparkles, labelKey: 'toolbar.gradient' },
    { id: 'paint-bucket', icon: PaintBucket, labelKey: 'toolbar.paint-bucket' }
  ],
  [
    { id: 'text', icon: Type, labelKey: 'toolbar.text', shortcut: 'T' },
    { id: 'shape', icon: Shapes, labelKey: 'toolbar.shape', shortcut: 'U' },
    { id: 'pen', icon: PenTool, labelKey: 'toolbar.pen', shortcut: 'P' },
    { id: 'zoom', icon: ZoomIn, labelKey: 'toolbar.zoom' },
    { id: 'hand', icon: Hand, labelKey: 'toolbar.hand', shortcut: 'H' }
  ]
];

const PrimaryToolbar: React.FC = () => {
  const { t } = useTranslation();
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const setActiveTool = useGraphicsStore((state) => state.setActiveTool);

  return (
    <nav className="flex h-full flex-col gap-4 border-r border-slate-200 bg-white/90 p-3 shadow-sm">
      {TOOL_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-2">
          {group.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`flex h-12 w-12 items-center justify-center rounded-md border text-slate-600 transition ${
                  isActive
                    ? 'border-indigo-400 bg-indigo-100 text-indigo-700 shadow-inner'
                    : 'border-transparent hover:border-slate-300 hover:bg-slate-100'
                }`}
                title={t(tool.labelKey)}
                aria-pressed={isActive}
              >
                <Icon size={18} />
              </button>
            );
          })}
          {groupIndex < TOOL_GROUPS.length - 1 && <div className="h-px bg-slate-200"></div>}
        </div>
      ))}
    </nav>
  );
};

export default PrimaryToolbar;
