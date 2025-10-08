import { useGraphicsStore } from '../../state/graphicsStore';
import type { DocumentState, Layer } from '../../types';

export interface FilterOptions {
  radius?: number;
  amount?: number;
  threshold?: number;
  brightness?: number;
  contrast?: number;
  levels?: {
    inputMin: number;
    inputMax: number;
    outputMin: number;
    outputMax: number;
  };
}

export class FilterService {
  private static instance: FilterService;
  private lastFilter: { name: string; options: FilterOptions } | null = null;

  private constructor() {}

  static getInstance(): FilterService {
    if (!FilterService.instance) {
      FilterService.instance = new FilterService();
    }
    return FilterService.instance;
  }

  /**
   * Apply a filter to the active layer
   */
  async applyFilter(
    documentId: string,
    layerId: string,
    filterName: string,
    options: FilterOptions = {}
  ): Promise<void> {
    const { documents, updateLayer } = useGraphicsStore.getState();
    const document = documents.find(d => d.id === documentId);
    if (!document) return;

    const layer = document.layers.find(l => l.id === layerId);
    if (!layer) return;

    // Store last filter for "repeat last filter" functionality
    this.lastFilter = { name: filterName, options };

    // Get the layer's image data
    const imageUrl = layer.metadata?.imageUrl as string | undefined;
    if (!imageUrl) {
      console.warn('Layer has no image data to filter');
      return;
    }

    try {
      // Load the image
      const img = await this.loadImage(imageUrl);
      
      // Create a canvas to apply the filter
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the original image
      ctx.drawImage(img, 0, 0);

      // Get image data
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      // Apply the filter
      const filteredData = await this.applyFilterToImageData(imageData, filterName, options);

      // Put the filtered data back
      ctx.putImageData(filteredData, 0, 0);

      // Convert to data URL
      const filteredUrl = canvas.toDataURL('image/png');

      // Update the layer with the filtered image
      updateLayer(documentId, layerId, (l) => ({
        ...l,
        metadata: {
          ...l.metadata,
          imageUrl: filteredUrl
        }
      }));
    } catch (error) {
      console.error('Failed to apply filter:', error);
      throw error;
    }
  }

  /**
   * Apply the last used filter again
   */
  async applyLastFilter(documentId: string, layerId: string): Promise<void> {
    if (!this.lastFilter) {
      console.warn('No last filter to apply');
      return;
    }
    await this.applyFilter(documentId, layerId, this.lastFilter.name, this.lastFilter.options);
  }

  /**
   * Apply filter to ImageData
   */
  private async applyFilterToImageData(
    imageData: ImageData,
    filterName: string,
    options: FilterOptions
  ): Promise<ImageData> {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;

    switch (filterName.toLowerCase()) {
      case 'gaussian blur':
        return this.gaussianBlur(imageData, options.radius || 5);
      
      case 'sharpen':
      case 'unsharp mask':
        return this.sharpen(imageData, options.amount || 1);
      
      case 'desaturate':
      case 'grayscale':
        return this.desaturate(imageData);
      
      case 'brightness':
        return this.adjustBrightness(imageData, options.brightness || 0);
      
      case 'contrast':
        return this.adjustContrast(imageData, options.contrast || 0);
      
      case 'brightness/contrast':
        let result = this.adjustBrightness(imageData, options.brightness || 0);
        result = this.adjustContrast(result, options.contrast || 0);
        return result;
      
      case 'levels':
        return this.adjustLevels(imageData, options.levels || {
          inputMin: 0,
          inputMax: 255,
          outputMin: 0,
          outputMax: 255
        });
      
      default:
        console.warn(`Unknown filter: ${filterName}`);
        return imageData;
    }
  }

  /**
   * Gaussian Blur filter
   */
  private gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);

    // Simple box blur approximation of Gaussian blur
    const r = Math.floor(radius);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r_sum = 0, g_sum = 0, b_sum = 0, a_sum = 0, count = 0;
        
        for (let dy = -r; dy <= r; dy++) {
          for (let dx = -r; dx <= r; dx++) {
            const nx = x + dx;
            const ny = y + dy;
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              r_sum += data[idx];
              g_sum += data[idx + 1];
              b_sum += data[idx + 2];
              a_sum += data[idx + 3];
              count++;
            }
          }
        }
        
        const idx = (y * width + x) * 4;
        output.data[idx] = r_sum / count;
        output.data[idx + 1] = g_sum / count;
        output.data[idx + 2] = b_sum / count;
        output.data[idx + 3] = a_sum / count;
      }
    }
    
    return output;
  }

  /**
   * Sharpen filter
   */
  private sharpen(imageData: ImageData, amount: number): ImageData {
    const data = imageData.data;
    const width = imageData.width;
    const height = imageData.height;
    const output = new ImageData(width, height);

    // Sharpening kernel
    const kernel = [
      0, -amount, 0,
      -amount, 1 + 4 * amount, -amount,
      0, -amount, 0
    ];

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = -1; ky <= 1; ky++) {
          for (let kx = -1; kx <= 1; kx++) {
            const idx = ((y + ky) * width + (x + kx)) * 4;
            const k = kernel[(ky + 1) * 3 + (kx + 1)];
            r += data[idx] * k;
            g += data[idx + 1] * k;
            b += data[idx + 2] * k;
          }
        }
        
        const idx = (y * width + x) * 4;
        output.data[idx] = Math.max(0, Math.min(255, r));
        output.data[idx + 1] = Math.max(0, Math.min(255, g));
        output.data[idx + 2] = Math.max(0, Math.min(255, b));
        output.data[idx + 3] = data[idx + 3];
      }
    }
    
    return output;
  }

  /**
   * Desaturate filter (convert to grayscale)
   */
  private desaturate(imageData: ImageData): ImageData {
    const data = imageData.data;
    const output = new ImageData(imageData.width, imageData.height);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
      output.data[i] = gray;
      output.data[i + 1] = gray;
      output.data[i + 2] = gray;
      output.data[i + 3] = data[i + 3];
    }
    
    return output;
  }

  /**
   * Adjust brightness
   */
  private adjustBrightness(imageData: ImageData, brightness: number): ImageData {
    const data = imageData.data;
    const output = new ImageData(imageData.width, imageData.height);
    
    for (let i = 0; i < data.length; i += 4) {
      output.data[i] = Math.max(0, Math.min(255, data[i] + brightness));
      output.data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + brightness));
      output.data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + brightness));
      output.data[i + 3] = data[i + 3];
    }
    
    return output;
  }

  /**
   * Adjust contrast
   */
  private adjustContrast(imageData: ImageData, contrast: number): ImageData {
    const data = imageData.data;
    const output = new ImageData(imageData.width, imageData.height);
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    
    for (let i = 0; i < data.length; i += 4) {
      output.data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128));
      output.data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128));
      output.data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128));
      output.data[i + 3] = data[i + 3];
    }
    
    return output;
  }

  /**
   * Adjust levels
   */
  private adjustLevels(imageData: ImageData, levels: FilterOptions['levels']): ImageData {
    if (!levels) return imageData;
    
    const data = imageData.data;
    const output = new ImageData(imageData.width, imageData.height);
    const { inputMin, inputMax, outputMin, outputMax } = levels;
    
    for (let i = 0; i < data.length; i += 4) {
      for (let j = 0; j < 3; j++) {
        const value = data[i + j];
        const normalized = (value - inputMin) / (inputMax - inputMin);
        const adjusted = normalized * (outputMax - outputMin) + outputMin;
        output.data[i + j] = Math.max(0, Math.min(255, adjusted));
      }
      output.data[i + 3] = data[i + 3];
    }
    
    return output;
  }

  /**
   * Load an image from a URL
   */
  private loadImage(url: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  }
}

