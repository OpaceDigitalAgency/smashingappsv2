import React, { useState, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { FilterService, type FilterOptions } from '../../services/filters/FilterService';

interface FilterDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (options: FilterOptions) => void;
  filterName: string;
  imageUrl?: string;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
  isOpen,
  onClose,
  onApply,
  filterName,
  imageUrl
}) => {
  const [options, setOptions] = useState<FilterOptions>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Initialize default options based on filter type
  useEffect(() => {
    if (!isOpen) return;

    switch (filterName.toLowerCase()) {
      case 'gaussian blur':
        setOptions({ radius: 5 });
        break;
      case 'sharpen':
      case 'unsharp mask':
        setOptions({ amount: 1 });
        break;
      case 'brightness':
        setOptions({ brightness: 0 });
        break;
      case 'contrast':
        setOptions({ contrast: 0 });
        break;
      case 'brightness/contrast':
        setOptions({ brightness: 0, contrast: 0 });
        break;
      case 'levels':
        setOptions({
          levels: {
            inputMin: 0,
            inputMax: 255,
            outputMin: 0,
            outputMax: 255
          }
        });
        break;
      default:
        setOptions({});
    }
  }, [isOpen, filterName]);

  // Update preview when options change
  useEffect(() => {
    if (!isOpen || !imageUrl || !canvasRef.current) return;

    const updatePreview = async () => {
      try {
        const img = new Image();
        img.onload = async () => {
          const canvas = canvasRef.current;
          if (!canvas) return;

          // Scale down for preview if image is large
          const maxSize = 400;
          const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
          canvas.width = img.width * scale;
          canvas.height = img.height * scale;

          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          // Apply filter to preview
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const filterService = FilterService.getInstance();
          const filteredData = await (filterService as any).applyFilterToImageData(
            imageData,
            filterName,
            options
          );
          ctx.putImageData(filteredData, 0, 0);

          setPreviewUrl(canvas.toDataURL());
        };
        img.src = imageUrl;
      } catch (error) {
        console.error('Failed to update preview:', error);
      }
    };

    updatePreview();
  }, [isOpen, imageUrl, filterName, options]);

  const handleApply = () => {
    onApply(options);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
          <h2 className="text-lg font-semibold text-slate-900">{filterName}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-slate-100 transition-colours"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Preview */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700">Preview</label>
              <div className="border border-slate-200 rounded-lg p-4 bg-slate-50 flex items-center justify-center min-h-[300px]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-w-full max-h-[400px] object-contain" />
                ) : (
                  <canvas ref={canvasRef} className="max-w-full max-h-[400px]" />
                )}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-slate-700">Options</label>
              
              {filterName.toLowerCase() === 'gaussian blur' && (
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Radius: {options.radius}px
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={options.radius || 5}
                    onChange={(e) => setOptions({ ...options, radius: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {(filterName.toLowerCase() === 'sharpen' || filterName.toLowerCase() === 'unsharp mask') && (
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Amount: {options.amount?.toFixed(1)}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="3"
                    step="0.1"
                    value={options.amount || 1}
                    onChange={(e) => setOptions({ ...options, amount: parseFloat(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {filterName.toLowerCase() === 'brightness' && (
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Brightness: {options.brightness}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={options.brightness || 0}
                    onChange={(e) => setOptions({ ...options, brightness: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {filterName.toLowerCase() === 'contrast' && (
                <div>
                  <label className="block text-sm text-slate-600 mb-2">
                    Contrast: {options.contrast}
                  </label>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={options.contrast || 0}
                    onChange={(e) => setOptions({ ...options, contrast: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              {filterName.toLowerCase() === 'brightness/contrast' && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Brightness: {options.brightness}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={options.brightness || 0}
                      onChange={(e) => setOptions({ ...options, brightness: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Contrast: {options.contrast}
                    </label>
                    <input
                      type="range"
                      min="-100"
                      max="100"
                      value={options.contrast || 0}
                      onChange={(e) => setOptions({ ...options, contrast: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {filterName.toLowerCase() === 'levels' && options.levels && (
                <>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Input Min: {options.levels.inputMin}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={options.levels.inputMin}
                      onChange={(e) => setOptions({
                        ...options,
                        levels: { ...options.levels!, inputMin: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Input Max: {options.levels.inputMax}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={options.levels.inputMax}
                      onChange={(e) => setOptions({
                        ...options,
                        levels: { ...options.levels!, inputMax: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Output Min: {options.levels.outputMin}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={options.levels.outputMin}
                      onChange={(e) => setOptions({
                        ...options,
                        levels: { ...options.levels!, outputMin: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-600 mb-2">
                      Output Max: {options.levels.outputMax}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="255"
                      value={options.levels.outputMax}
                      onChange={(e) => setOptions({
                        ...options,
                        levels: { ...options.levels!, outputMax: parseInt(e.target.value) }
                      })}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {filterName.toLowerCase() === 'desaturate' && (
                <p className="text-sm text-slate-600">
                  This filter converts the image to grayscale. No options available.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colours"
          >
            Cancel
          </button>
          <button
            onClick={handleApply}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colours"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

