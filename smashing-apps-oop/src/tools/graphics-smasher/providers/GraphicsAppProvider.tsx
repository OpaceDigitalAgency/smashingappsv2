import React, { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import type { i18n } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { getGraphicsI18n } from '../utils/i18n';
import { useGraphicsStore } from '../state/graphicsStore';
import CommandPaletteOverlay from '../components/overlays/CommandPaletteOverlay';

interface GraphicsAppProviderProps {
  children: ReactNode;
}

const GraphicsAppProvider: React.FC<GraphicsAppProviderProps> = ({ children }) => {
  const [i18nInstance, setI18nInstance] = useState<i18n | null>(null);
  const locale = useGraphicsStore((state) => state.settings.locale);
  const theme = useGraphicsStore((state) => state.settings.theme);
  const highContrast = useGraphicsStore((state) => state.settings.highContrast);

  useEffect(() => {
    let mounted = true;
    getGraphicsI18n().then((instance) => {
      if (mounted) {
        setI18nInstance(instance);
      }
    });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!i18nInstance) {
      return;
    }
    i18nInstance.changeLanguage(locale).catch((error: unknown) => {
      console.error('Failed to change Graphics Smasher locale', error);
    });
  }, [i18nInstance, locale]);

  useEffect(() => {
    if (!i18nInstance) {
      return;
    }
    const direction = i18nInstance.dir();
    document.documentElement.setAttribute('data-graphics-dir', direction);
  }, [i18nInstance]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-graphics-theme', theme);
    root.setAttribute('data-graphics-contrast', highContrast ? 'high' : 'normal');
  }, [theme, highContrast]);

  if (!i18nInstance) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-500">
        Loading Graphics Smasher…
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18nInstance}>
      {children}
      <CommandPaletteOverlay />
    </I18nextProvider>
  );
};

export default GraphicsAppProvider;
