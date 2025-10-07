import React, { useState } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';
import { Slider } from '../../../shared/components/Slider';

const ToolOptionsBar: React.FC = () => {
  const activeTool = useGraphicsStore((state) => state.activeTool);
  const [brushSize, setBrushSize] = useState(25);
  const [brushOpacity, setBrushOpacity] = useState(100);
  const [brushColor, setBrushColor] = useState('#000000');

  const renderBrushOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Size:</label>
        <input
          type="range"
          min="1"
          max="500"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="h-1 w-32 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <input
          type="number"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">px</span>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Colour:</label>
        <input
          type="color"
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Opacity:</label>
        <input
          type="range"
          min="0"
          max="100"
          value={brushOpacity}
          onChange={(e) => setBrushOpacity(Number(e.target.value))}
          className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <span className="text-xs text-slate-500">{brushOpacity}%</span>
      </div>
    </div>
  );

  const renderSelectionOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Feather:</label>
        <input
          type="number"
          defaultValue="0"
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
        <select className="rounded border border-slate-300 px-2 py-1 text-xs">
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
          defaultValue="16"
          className="w-16 rounded border border-slate-300 px-2 py-1 text-xs"
        />
        <span className="text-xs text-slate-500">pt</span>
      </div>
      <div className="flex items-center gap-1">
        <button className="rounded border border-slate-300 px-2 py-1 text-xs font-bold hover:bg-slate-100">
          B
        </button>
        <button className="rounded border border-slate-300 px-2 py-1 text-xs italic hover:bg-slate-100">
          I
        </button>
        <button className="rounded border border-slate-300 px-2 py-1 text-xs underline hover:bg-slate-100">
          U
        </button>
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Colour:</label>
        <input type="color" defaultValue="#000000" className="h-6 w-12 cursor-pointer rounded border" />
      </div>
    </div>
  );

  const renderShapeOptions = () => (
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Fill:</label>
        <input type="color" defaultValue="#4f46e5" className="h-6 w-12 cursor-pointer rounded border" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Stroke:</label>
        <input type="color" defaultValue="#000000" className="h-6 w-12 cursor-pointer rounded border" />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Stroke Width:</label>
        <input
          type="number"
          defaultValue="2"
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
          value={brushColor}
          onChange={(e) => setBrushColor(e.target.value)}
          className="h-6 w-12 cursor-pointer rounded border"
        />
      </div>
      <div className="flex items-center gap-2">
        <label className="text-xs font-medium text-slate-600">Tolerance:</label>
        <input
          type="range"
          min="0"
          max="255"
          defaultValue="32"
          className="h-1 w-24 cursor-pointer appearance-none rounded-lg bg-slate-200"
        />
        <span className="text-xs text-slate-500">32</span>
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
    <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-2 shadow-sm">
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

