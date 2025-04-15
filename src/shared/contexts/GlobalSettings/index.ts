import { GlobalSettingsProvider, useGlobalSettings } from './context';
import { GlobalSettingsErrorBoundary } from './error-boundary';
import { GlobalSettingsTest } from './test';
import { GlobalSettings } from './types';

// Re-export everything
export {
  GlobalSettingsProvider,
  GlobalSettingsErrorBoundary,
  GlobalSettingsTest,
  useGlobalSettings
};

export type { GlobalSettings };