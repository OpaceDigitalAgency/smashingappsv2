/**
 * Dialog service for Image Size and Canvas Size operations
 */

export interface ImageSizeOptions {
  width: number;
  height: number;
  cancelled: boolean;
}

export interface CanvasSizeOptions {
  width: number;
  height: number;
  anchorX: 'left' | 'center' | 'right';
  anchorY: 'top' | 'center' | 'bottom';
  cancelled: boolean;
}

class ImageSizeDialogServiceClass {
  /**
   * Show Image Size dialog
   */
  async showImageSizeDialog(currentWidth: number, currentHeight: number): Promise<ImageSizeOptions> {
    const widthInput = prompt(`Enter new width (current: ${currentWidth}px):`, currentWidth.toString());
    
    if (widthInput === null) {
      return { width: currentWidth, height: currentHeight, cancelled: true };
    }

    const width = parseInt(widthInput, 10);
    if (isNaN(width) || width <= 0) {
      alert('Invalid width. Operation cancelled.');
      return { width: currentWidth, height: currentHeight, cancelled: true };
    }

    const heightInput = prompt(`Enter new height (current: ${currentHeight}px):`, currentHeight.toString());
    
    if (heightInput === null) {
      return { width: currentWidth, height: currentHeight, cancelled: true };
    }

    const height = parseInt(heightInput, 10);
    if (isNaN(height) || height <= 0) {
      alert('Invalid height. Operation cancelled.');
      return { width: currentWidth, height: currentHeight, cancelled: true };
    }

    return { width, height, cancelled: false };
  }

  /**
   * Show Canvas Size dialog
   */
  async showCanvasSizeDialog(currentWidth: number, currentHeight: number): Promise<CanvasSizeOptions> {
    const widthInput = prompt(`Enter new canvas width (current: ${currentWidth}px):`, currentWidth.toString());
    
    if (widthInput === null) {
      return { 
        width: currentWidth, 
        height: currentHeight, 
        anchorX: 'center', 
        anchorY: 'center', 
        cancelled: true 
      };
    }

    const width = parseInt(widthInput, 10);
    if (isNaN(width) || width <= 0) {
      alert('Invalid width. Operation cancelled.');
      return { 
        width: currentWidth, 
        height: currentHeight, 
        anchorX: 'center', 
        anchorY: 'center', 
        cancelled: true 
      };
    }

    const heightInput = prompt(`Enter new canvas height (current: ${currentHeight}px):`, currentHeight.toString());
    
    if (heightInput === null) {
      return { 
        width: currentWidth, 
        height: currentHeight, 
        anchorX: 'center', 
        anchorY: 'center', 
        cancelled: true 
      };
    }

    const height = parseInt(heightInput, 10);
    if (isNaN(height) || height <= 0) {
      alert('Invalid height. Operation cancelled.');
      return { 
        width: currentWidth, 
        height: currentHeight, 
        anchorX: 'center', 
        anchorY: 'center', 
        cancelled: true 
      };
    }

    // For now, default to center anchor
    // In a full implementation, this would show a 9-point anchor selector
    return { 
      width, 
      height, 
      anchorX: 'center', 
      anchorY: 'center', 
      cancelled: false 
    };
  }
}

export const ImageSizeDialogService = new ImageSizeDialogServiceClass();

