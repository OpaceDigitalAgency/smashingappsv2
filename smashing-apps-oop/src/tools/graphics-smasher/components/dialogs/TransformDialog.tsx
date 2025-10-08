import React, { useState, useEffect } from 'react';
import { useGraphicsStore } from '../../state/graphicsStore';

interface TransformDialogProps {
  documentId: string;
  layerId: string;
  onClose: () => void;
}

const TransformDialog: React.FC<TransformDialogProps> = ({ documentId, layerId, onClose }) => {
  const { documents, updateLayer } = useGraphicsStore();
  const document = documents.find(d => d.id === documentId);
  const layer = document?.layers.find(l => l.id === layerId);

  const [scaleX, setScaleX] = useState(layer?.transform.scaleX || 1);
  const [scaleY, setScaleY] = useState(layer?.transform.scaleY || 1);
  const [rotation, setRotation] = useState(layer?.transform.rotation || 0);
  const [maintainAspect, setMaintainAspect] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        handleApply();
      } else if (e.key === 'Escape') {
        handleCancel();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [scaleX, scaleY, rotation]);

  const handleScaleXChange = (value: number) => {
    setScaleX(value);
    if (maintainAspect) {
      setScaleY(value);
    }
  };

  const handleScaleYChange = (value: number) => {
    setScaleY(value);
    if (maintainAspect) {
      setScaleX(value);
    }
  };

  const handleApply = () => {
    if (layer) {
      updateLayer(documentId, layerId, (l) => ({
        ...l,
        transform: {
          ...l.transform,
          scaleX,
          scaleY,
          rotation
        }
      }));
    }
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  if (!layer) return null;

  return (
    <div className="fixed inset-0 z-[10001] flex items-center justify-center bg-black/50">
      <div className="w-96 rounded-lg bg-[#2a2a2a] p-6 shadow-2xl">
        <h2 className="mb-4 text-xl font-semibold text-white">Free Transform</h2>
        
        <div className="space-y-4">
          {/* Scale X */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Scale X (%)</label>
            <input
              type="number"
              value={Math.round(scaleX * 100)}
              onChange={(e) => handleScaleXChange(parseFloat(e.target.value) / 100)}
              className="w-full rounded bg-[#3a3a3a] px-3 py-2 text-white"
              step="1"
            />
          </div>

          {/* Scale Y */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Scale Y (%)</label>
            <input
              type="number"
              value={Math.round(scaleY * 100)}
              onChange={(e) => handleScaleYChange(parseFloat(e.target.value) / 100)}
              className="w-full rounded bg-[#3a3a3a] px-3 py-2 text-white"
              step="1"
            />
          </div>

          {/* Maintain Aspect Ratio */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="maintainAspect"
              checked={maintainAspect}
              onChange={(e) => setMaintainAspect(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="maintainAspect" className="text-sm text-gray-300">
              Maintain aspect ratio
            </label>
          </div>

          {/* Rotation */}
          <div>
            <label className="mb-1 block text-sm text-gray-300">Rotation (degrees)</label>
            <input
              type="number"
              value={rotation}
              onChange={(e) => setRotation(parseFloat(e.target.value))}
              className="w-full rounded bg-[#3a3a3a] px-3 py-2 text-white"
              step="1"
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button
            onClick={handleCancel}
            className="rounded bg-[#3a3a3a] px-4 py-2 text-white hover:bg-[#4a4a4a]"
          >
            Cancel (Esc)
          </button>
          <button
            onClick={handleApply}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-500"
          >
            Apply (Enter)
          </button>
        </div>
      </div>
    </div>
  );
};

export default TransformDialog;

