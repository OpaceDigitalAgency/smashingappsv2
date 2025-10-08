import React, { useState } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';

const ToolOptionsBar: React.FC = () => {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const toolOptions = useGraphicsStore((state) => state.toolOptions);
  const setToolOptions = useGraphicsStore((state) => state.setToolOptions);
  const [tolerance, setTolerance] = useState(32);

  const renderBrushOptions = () => (
    <div className="flex items-center gap-6">
      {(() => {
        const targetTool =
          activeTool === 'eraser' ? 'eraser' : 'brush';
        const options = toolOptions[targetTool];
        const opacityPercent = Math.round(options.opacity * 100);
        return (
          <>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Size:</label>
        <input
          type="range"
          min="1"
          max="500"
          value={options.size}
          onChange={(e) => setToolOptions(targetTool as 'brush' | 'eraser', { size: Number(e.target.value) })}
          className="h-1 w-32 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <input
          type="number"
          value={options.size}
          onChange={(e) => setToolOptions(targetTool as 'brush' | 'eraser', { size: Number(e.target.value) })}
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">px</span>
      </div>
      {activeTool !== 'eraser' && (
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-600">Colour:</label>
          <input
            type="color"
            value={toolOptions.brush.color}
            onChange={(e) => setToolOptions('brush', { color: e.target.value })}
            className="h-6 w-12 cursor-pointer rounded border"
          />
        </div>
      )}
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Opacity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={opacityPercent}
          onChange={(e) => setToolOptions(targetTool as 'brush' | 'eraser', { opacity: Number(e.target.value) / 100 })}
          className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <span className="text-xs text-slate-500">{opacityPercent}%</span>
      </div>
        </>
        );
      })()}
    </div>
  );

  const renderSelectionOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Feather:</label>
        <input
          type="number"
          value={toolOptions.selection.feather}
          onChange={(e) => setToolOptions('selection', { feather: Number(e.target.value) })}
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">px</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="anti-alias" defaultChecked className="rounded" />
        <label htmlFor="anti-alias" className="text-xs font-medium text-slate-600">
          Anti-alias
        </label>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Mode:</label>
        <select className="rounded border border-slate-300 px-2 py-1 text-xs">
          <option>New Selection</option>
          <option>Add to Selection</option>
          <option>Subtract from Selection</option>
          <option>Intersect with Selection</option>
        </select>
      </div>
    </div>
  );

  const renderTextOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Font:</label>
        <select
          value={toolOptions.text.font}
          onChange={(e) => setToolOptions('text', { font: e.target.value })}
          className="rounded border border-slate-300 px-2 py-1 text-xs"
        >
          <option>Arial</option>
          <option>Helvetica</option>
          <option>Times New Roman</option>
          <option>Georgia</option>
          <option>Courier New</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Size:</label>
        <input
          type="number"
          value={toolOptions.text.size}
          onChange={(e) => setToolOptions('text', { size: Number(e.target.value) })}
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">pt</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          onClick={() => setToolOptions('text', { bold: !toolOptions.text.bold })}
          className={`rounded border border-slate-300 px-2 py-1 text-xs font-bold hover:bg-slate-100 ${
            toolOptions.text.bold ? 'bg-slate-200' : ''
          }`}
        >
          B
        </button>
        <button
          onClick={() => setToolOptions('text', { italic: !toolOptions.text.italic })}
          className={`rounded border border-slate-300 px-2 py-1 text-xs italic hover:bg-slate-100 ${
            toolOptions.text.italic ? 'bg-slate-200' : ''
          }`}
        >
          I
        </button>
        <button
          onClick={() => setToolOptions('text', { underline: !toolOptions.text.underline })}
          className={`rounded border border-slate-300 px-2 py-1 text-xs underline hover:bg-slate-100 ${
            toolOptions.text.underline ? 'bg-slate-200' : ''
          }`}
        >
          U
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Colour:</label>
        <input
          type="color"
          value={toolOptions.text.color}
          onChange={(e) => setToolOptions('text', { color: e.target.value })}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
    </div>
  );

  const renderShapeOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Fill:</label>
        <input
          type="color"
          value={toolOptions.shape.fill}
          onChange={(e) => setToolOptions('shape', { fill: e.target.value })}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Stroke:</label>
        <input
          type="color"
          value={toolOptions.shape.stroke}
          onChange={(e) => setToolOptions('shape', { stroke: e.target.value })}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Stroke Width:</label>
        <input
          type="number"
          value={toolOptions.shape.strokeWidth}
          onChange={(e) => setToolOptions('shape', { strokeWidth: Number(e.target.value) })}
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">px</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="constrain-proportions" className="rounded" />
        <label htmlFor="constrain-proportions" className="text-xs font-medium text-slate-600">
          Constrain Proportions
        </label>
      </div>
    </div>
  );

  const renderCropOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Aspect Ratio:</label>
        <select className="rounded border border-slate-300 px-2 py-1 text-xs">
          <option>Original</option>
          <option>1:1 (Square)</option>
          <option>4:3</option>
          <option>16:9</option>
          <option>3:2</option>
          <option>Custom</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="delete-cropped" className="rounded" />
        <label htmlFor="delete-cropped" className="text-xs font-medium text-slate-600">
          Delete Cropped Pixels
        </label>
      </div>
      <button className="rounded bg-indigo-600 px-3 py-1 text-xs font-medium text-white hover:bg-indigo-700">
        Apply
      </button>
      <button className="rounded border border-slate-300 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100">
        Cancel
      </button>
    </div>
  );

  const renderDefaultOptions = () => (
    <div className="flex items-center gap-4">
      <span className="text-xs text-slate-500">
        Select a tool to see options
      </span>
    </div>
  );

  const renderPaintBucketOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Fill Colour:</label>
        <input
          type="color"
          value={toolOptions.brush.color}
          onChange={(e) => setToolOptions('brush', { color: e.target.value })}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Tolerance:</label>
        <input
          type="range"
          min="0"
          max="255"
          value={tolerance}
          onChange={(e) => setTolerance(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <span className="text-xs text-slate-500">{tolerance}</span>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="contiguous" defaultChecked className="rounded" />
        <label htmlFor="contiguous" className="text-xs font-medium text-slate-600">
          Contiguous
        </label>
      </div>
    </div>
  );

  const getToolOptions = () => {
    switch (activeTool) {
      case 'brush':
      case 'eraser':
      case 'clone-stamp':
      case 'healing-brush':
        return renderBrushOptions();
      case 'paint-bucket':
      case 'eyedropper':
        return renderPaintBucketOptions();
      case 'marquee-rect':
      case 'marquee-ellipse':
      case 'lasso-free':
      case 'lasso-poly':
      case 'lasso-magnetic':
      case 'magic-wand':
      case 'object-select':
        return renderSelectionOptions();
      case 'text':
        return renderTextOptions();
      case 'shape':
      case 'pen':
        return renderShapeOptions();
      case 'crop':
        return renderCropOptions();
      default:
        return renderDefaultOptions();
    }
  };

  return (
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-1.5 shadow-sm flex-shrink-0">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {activeTool.replace(/-/g, ' ')}
        </span>
        <div className="h-4 w-px bg-slate-300" />
        {getToolOptions()}
      </div>
    </div>
  );
};

export default ToolOptionsBar;
