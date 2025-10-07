import React, { useState, useRef, useEffect } from 'react';
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
  Hand,
  Pipette,
  GripVertical
} from 'lucide-react';
import { useGraphicsStore } from '../../state/graphicsStore';
import type { GraphicsToolId } from '../../types';

interface Tool {
  id: GraphicsToolId;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  shortcut?: string;
}

interface ToolGroup {
  primary: Tool;
  alternatives?: Tool[];
}

const TOOL_GROUPS: ToolGroup[] = [
  {
    primary: { id: 'move', icon: Move, label: 'Move Tool', shortcut: 'V' }
  },
  {
    primary: { id: 'marquee-rect', icon: Square, label: 'Rectangular Marquee Tool', shortcut: 'M' },
    alternatives: [
      { id: 'marquee-ellipse', icon: Circle, label: 'Elliptical Marquee Tool', shortcut: 'M' }
    ]
  },
  {
    primary: { id: 'lasso-free', icon: Lasso, label: 'Lasso Tool', shortcut: 'L' },
    alternatives: [
      { id: 'lasso-poly', icon: MousePointer2, label: 'Polygonal Lasso Tool', shortcut: 'L' },
      { id: 'lasso-magnetic', icon: Sparkles, label: 'Magnetic Lasso Tool', shortcut: 'L' }
    ]
  },
  {
    primary: { id: 'magic-wand', icon: Wand2, label: 'Magic Wand Tool', shortcut: 'W' },
    alternatives: [
      { id: 'object-select', icon: MousePointer2, label: 'Object Selection Tool', shortcut: 'W' }
    ]
  },
  {
    primary: { id: 'crop', icon: Crop, label: 'Crop Tool', shortcut: 'C' }
  },
  {
    primary: { id: 'brush', icon: Paintbrush, label: 'Brush Tool', shortcut: 'B' }
  },
  {
    primary: { id: 'eraser', icon: Eraser, label: 'Eraser Tool', shortcut: 'E' }
  },
  {
    primary: { id: 'clone-stamp', icon: Stamp, label: 'Clone Stamp Tool', shortcut: 'S' },
    alternatives: [
      { id: 'healing-brush', icon: Sparkles, label: 'Healing Brush Tool', shortcut: 'J' }
    ]
  },
  {
    primary: { id: 'gradient', icon: GripVertical, label: 'Gradient Tool', shortcut: 'G' },
    alternatives: [
      { id: 'paint-bucket', icon: PaintBucket, label: 'Paint Bucket Tool', shortcut: 'G' }
    ]
  },
  {
    primary: { id: 'pen', icon: PenTool, label: 'Pen Tool', shortcut: 'P' }
  },
  {
    primary: { id: 'text', icon: Type, label: 'Horizontal Type Tool', shortcut: 'T' }
  },
  {
    primary: { id: 'shape', icon: Shapes, label: 'Rectangle Tool', shortcut: 'U' }
  },
  {
    primary: { id: 'hand', icon: Hand, label: 'Hand Tool', shortcut: 'H' }
  },
  {
    primary: { id: 'zoom', icon: ZoomIn, label: 'Zoom Tool', shortcut: 'Z' }
  }
];

const ProfessionalToolbar: React.FC = () => {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const setActiveTool = useGraphicsStore((state) => state.setActiveTool);
  const [expandedGroup, setExpandedGroup] = useState<number | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setExpandedGroup(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToolClick = (tool: Tool, groupIndex: number) => {
    setActiveTool(tool.id);
    setExpandedGroup(null);
  };

  const handleGroupClick = (groupIndex: number, hasAlternatives: boolean) => {
    if (hasAlternatives) {
      setExpandedGroup(expandedGroup === groupIndex ? null : groupIndex);
    }
  };

  const getActiveTool = (group: ToolGroup): Tool => {
    if (group.primary.id === activeTool) return group.primary;
    if (group.alternatives) {
      const alt = group.alternatives.find(t => t.id === activeTool);
      if (alt) return alt;
    }
    return group.primary;
  };

  return (
    <nav ref={toolbarRef} className="relative flex h-full w-14 flex-col bg-[#2d2d2d] shadow-lg">
      {TOOL_GROUPS.map((group, groupIndex) => {
        const currentTool = getActiveTool(group);
        const Icon = currentTool.icon;
        const isActive = currentTool.id === activeTool;
        const hasAlternatives = group.alternatives && group.alternatives.length > 0;
        const isExpanded = expandedGroup === groupIndex;

        return (
          <div key={groupIndex} className="relative">
            <button
              onClick={() => {
                handleToolClick(currentTool, groupIndex);
                handleGroupClick(groupIndex, hasAlternatives);
              }}
              className={`group relative flex h-14 w-14 items-center justify-center transition-all ${
                isActive
                  ? 'bg-[#3d3d3d]'
                  : 'hover:bg-[#3a3a3a]'
              }`}
              title={`${currentTool.label} (${currentTool.shortcut})`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-[#b0b0b0]'} strokeWidth={isActive ? 2.5 : 2} />
              
              {hasAlternatives && (
                <div className="absolute bottom-1 right-1">
                  <svg width="6" height="6" viewBox="0 0 6 6" className={isActive ? 'fill-white' : 'fill-[#808080]'}>
                    <polygon points="6,0 6,6 0,6" />
                  </svg>
                </div>
              )}
              
              {/* Tooltip */}
              <div className="pointer-events-none absolute left-full top-0 z-[10000] ml-2 hidden whitespace-nowrap rounded bg-[#1a1a1a] px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                {currentTool.label}
                {currentTool.shortcut && (
                  <span className="ml-2 text-[#808080]">({currentTool.shortcut})</span>
                )}
              </div>
            </button>

            {/* Flyout menu for alternatives */}
            {hasAlternatives && isExpanded && (
              <div className="absolute left-full top-0 z-[10000] ml-1 flex flex-col bg-[#2d2d2d] shadow-xl">
                <button
                  onClick={() => handleToolClick(group.primary, groupIndex)}
                  className={`group flex h-14 w-14 items-center justify-center transition-all ${
                    group.primary.id === activeTool ? 'bg-[#3d3d3d]' : 'hover:bg-[#3a3a3a]'
                  }`}
                  title={`${group.primary.label} (${group.primary.shortcut})`}
                >
                  <group.primary.icon 
                    size={20} 
                    className={group.primary.id === activeTool ? 'text-white' : 'text-[#b0b0b0]'} 
                    strokeWidth={group.primary.id === activeTool ? 2.5 : 2}
                  />
                  
                  {/* Tooltip */}
                  <div className="pointer-events-none absolute left-full top-0 z-[10001] ml-2 hidden whitespace-nowrap rounded bg-[#1a1a1a] px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                    {group.primary.label}
                    {group.primary.shortcut && (
                      <span className="ml-2 text-[#808080]">({group.primary.shortcut})</span>
                    )}
                  </div>
                </button>
                
                {group.alternatives?.map((alt, altIndex) => {
                  const AltIcon = alt.icon;
                  return (
                    <button
                      key={altIndex}
                      onClick={() => handleToolClick(alt, groupIndex)}
                      className={`group flex h-14 w-14 items-center justify-center transition-all ${
                        alt.id === activeTool ? 'bg-[#3d3d3d]' : 'hover:bg-[#3a3a3a]'
                      }`}
                      title={`${alt.label} (${alt.shortcut})`}
                    >
                      <AltIcon 
                        size={20} 
                        className={alt.id === activeTool ? 'text-white' : 'text-[#b0b0b0]'} 
                        strokeWidth={alt.id === activeTool ? 2.5 : 2}
                      />
                      
                      {/* Tooltip */}
                      <div className="pointer-events-none absolute left-full top-0 z-[10001] ml-2 hidden whitespace-nowrap rounded bg-[#1a1a1a] px-2 py-1 text-xs text-white shadow-lg group-hover:block">
                        {alt.label}
                        {alt.shortcut && (
                          <span className="ml-2 text-[#808080]">({alt.shortcut})</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
      
      {/* Separator lines */}
      <style>{`
        .relative:nth-child(5)::after,
        .relative:nth-child(9)::after,
        .relative:nth-child(12)::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 8px;
          right: 8px;
          height: 1px;
          background: #404040;
        }
      `}</style>
    </nav>
  );
};

export default ProfessionalToolbar;

