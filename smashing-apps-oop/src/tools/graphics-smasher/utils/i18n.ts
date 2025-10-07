import i18next, { type i18n } from 'i18next';
import { initReactI18next } from 'react-i18next';

let instance: i18n | null = null;
let initializing = false;

const resources = {
  en: {
    translation: {
      app: {
        title: 'Graphics Smasher',
        subtitle: 'Non-destructive browser image editor'
      },
      toolbar: {
        move: 'Move Tool',
        'marquee-rect': 'Rectangular Marquee',
        'marquee-ellipse': 'Elliptical Marquee',
        'lasso-free': 'Freehand Lasso',
        'lasso-poly': 'Polygonal Lasso',
        'lasso-magnetic': 'Magnetic Lasso',
        'object-select': 'Object Select',
        'magic-wand': 'Magic Wand',
        crop: 'Crop & Straighten',
        brush: 'Brush',
        eraser: 'Eraser',
        'clone-stamp': 'Clone Stamp',
        'healing-brush': 'Healing Brush',
        gradient: 'Gradient',
        'paint-bucket': 'Paint Bucket',
        text: 'Text',
        shape: 'Shape',
        pen: 'Pen',
        zoom: 'Zoom',
        hand: 'Hand'
      },
      panels: {
        layers: 'Layers',
        adjustments: 'Adjustments',
        history: 'History',
        properties: 'Properties',
        assets: 'Assets'
      },
      commands: {
        newDocument: 'New Document',
        duplicateDocument: 'Duplicate Document',
        closeDocument: 'Close Document',
        addLayer: 'Add Layer',
        export: 'Export',
        toggleGuides: 'Toggle Guides',
        toggleGrid: 'Toggle Grid',
        openSettings: 'Open Settings'
      },
      landing: {
        heroTitle: 'Accelerated browser-based image editing',
        heroDescription: 'Create, retouch, and publish visuals with non-destructive workflows, AI-assisted tools, and GPU acceleration.',
        ctaPrimary: 'Open Workspace',
        ctaSecondary: 'Create New Document'
      }
    }
  },
  es: {
    translation: {
      app: {
        title: 'Graphics Smasher',
        subtitle: 'Editor de imágenes en el navegador'
      },
      toolbar: {
        move: 'Mover',
        'marquee-rect': 'Selección rectangular',
        'marquee-ellipse': 'Selección elíptica',
        'lasso-free': 'Lazo libre',
        'lasso-poly': 'Lazo poligonal',
        'lasso-magnetic': 'Lazo magnético',
        'object-select': 'Selección de objeto',
        'magic-wand': 'Varita mágica',
        crop: 'Recortar',
        brush: 'Pincel',
        eraser: 'Borrador',
        'clone-stamp': 'Tampón de clonar',
        'healing-brush': 'Pincel corrector',
        gradient: 'Degradado',
        'paint-bucket': 'Bote de pintura',
        text: 'Texto',
        shape: 'Forma',
        pen: 'Pluma',
        zoom: 'Zoom',
        hand: 'Mano'
      },
      panels: {
        layers: 'Capas',
        adjustments: 'Ajustes',
        history: 'Historial',
        properties: 'Propiedades',
        assets: 'Biblioteca'
      },
      commands: {
        newDocument: 'Nuevo documento',
        duplicateDocument: 'Duplicar documento',
        closeDocument: 'Cerrar documento',
        addLayer: 'Añadir capa',
        export: 'Exportar',
        toggleGuides: 'Alternar guías',
        toggleGrid: 'Alternar cuadrícula',
        openSettings: 'Abrir ajustes'
      },
      landing: {
        heroTitle: 'Edición de imágenes acelerada en el navegador',
        heroDescription: 'Crea, retoca y publica imágenes con flujos no destructivos, herramientas asistidas por IA y aceleración GPU.',
        ctaPrimary: 'Abrir espacio de trabajo',
        ctaSecondary: 'Crear documento'
      }
    }
  }
};

export async function getGraphicsI18n(): Promise<i18n> {
  if (instance) {
    return instance;
  }

  if (initializing) {
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        if (instance) {
          clearInterval(checkInterval);
          resolve(instance);
        }
      }, 10);
    });
  }

  initializing = true;

  instance = i18next.createInstance();
  await instance
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'en',
      lng: typeof navigator !== 'undefined' ? navigator.language : 'en',
      supportedLngs: ['en', 'es'],
      interpolation: {
        escapeValue: false
      }
    })
    .catch((error) => {
      console.error('Failed to initialize Graphics Smasher i18n:', error);
    });

  initializing = false;
  return instance!;
}
