/**
 * Export dialog service for getting export options from user
 */

export interface ExportOptions {
  format: 'png' | 'jpeg' | 'webp';
  quality?: number; // 0-100, for JPEG and WebP
  cancelled: boolean;
}

class ExportDialogServiceClass {
  /**
   * Show export options dialog for JPEG
   */
  async showJpegExportDialog(): Promise<ExportOptions> {
    const quality = prompt('Enter JPEG quality (0-100):', '95');
    
    if (quality === null) {
      return { format: 'jpeg', cancelled: true };
    }

    const qualityNum = parseInt(quality, 10);
    if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      alert('Invalid quality value. Using default (95).');
      return { format: 'jpeg', quality: 95, cancelled: false };
    }

    return { format: 'jpeg', quality: qualityNum, cancelled: false };
  }

  /**
   * Show export options dialog for WebP
   */
  async showWebPExportDialog(): Promise<ExportOptions> {
    const quality = prompt('Enter WebP quality (0-100):', '90');
    
    if (quality === null) {
      return { format: 'webp', cancelled: true };
    }

    const qualityNum = parseInt(quality, 10);
    if (isNaN(qualityNum) || qualityNum < 0 || qualityNum > 100) {
      alert('Invalid quality value. Using default (90).');
      return { format: 'webp', quality: 90, cancelled: false };
    }

    return { format: 'webp', quality: qualityNum, cancelled: false };
  }

  /**
   * Show export options dialog for PNG (no options needed)
   */
  async showPngExportDialog(): Promise<ExportOptions> {
    return { format: 'png', cancelled: false };
  }
}

export const ExportDialogService = new ExportDialogServiceClass();

