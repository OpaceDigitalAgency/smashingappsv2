export interface DocumentPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  unit: 'px' | 'in' | 'mm';
  category: 'social' | 'print' | 'web' | 'mobile';
  description?: string;
}

export const DOCUMENT_PRESETS: DocumentPreset[] = [
  {
    id: 'instagram-square',
    label: 'Instagram Post',
    width: 1080,
    height: 1080,
    unit: 'px',
    category: 'social',
    description: '1:1 square post optimised for Instagram feed'
  },
  {
    id: 'youtube-thumbnail',
    label: 'YouTube Thumbnail',
    width: 1920,
    height: 1080,
    unit: 'px',
    category: 'social',
    description: '16:9 thumbnail size with HD resolution'
  },
  {
    id: 'a4-print',
    label: 'A4 Print',
    width: 2480,
    height: 3508,
    unit: 'px',
    category: 'print',
    description: '300 DPI portrait layout for professional printing'
  },
  {
    id: 'web-hero',
    label: 'Web Hero',
    width: 1600,
    height: 900,
    unit: 'px',
    category: 'web',
    description: 'Responsive hero image for landing pages'
  },
  {
    id: 'mobile-wallpaper',
    label: 'Mobile Wallpaper',
    width: 1440,
    height: 3120,
    unit: 'px',
    category: 'mobile',
    description: '18:9 high resolution wallpaper size'
  }
];
