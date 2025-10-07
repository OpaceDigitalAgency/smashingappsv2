import React from 'react';
import {
  Move,
  Crop,
  Square,
  Circle,
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
    { id: 'marquee-rect', icon: Square, labelKey: 'toolbar.marquee-rect', shortcut: 'M' },
    { id: 'marquee-ellipse', icon: Circle, labelKey: 'toolbar.marquee-ellipse' },
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
    <nav className="flex h-full w-16 flex-col gap-3 border-r border-slate-200 bg-gradient-to-b from-slate-50 to-white p-2 shadow-md">
      {TOOL_GROUPS.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-1">
          {group.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.id === activeTool;
            return (
              <button
                key={tool.id}
                onClick={() => setActiveTool(tool.id)}
                className={`group relative flex h-11 w-11 items-center justify-center rounded-lg border transition-all duration-200 ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 hover:shadow-md'
                }`}
                title={t(tool.labelKey)}
                aria-pressed={isActive}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                {tool.shortcut && (
                  <span className="pointer-events-none absolute -right-1 -top-1 rounded bg-slate-800 px-1 text-[9px] font-bold text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {tool.shortcut}
                  </span>
                )}
              </button>
            );
          })}
          {groupIndex < TOOL_GROUPS.length - 1 && (
            <div className="my-2 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent"></div>
          )}
        </div>
      ))}
    </nav>
  );
};

export default PrimaryToolbar;
