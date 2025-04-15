import React from 'react';
import { 
  GlobalSettingsProvider as GlobalSettingsContextProvider,
  GlobalSettingsErrorBoundary,
  useGlobalSettings
} from '../../contexts/GlobalSettingsContext';
import { useSettingsMigration } from '../../hooks/useSettingsMigration';

function SettingsMigrationWrapper({ children }: { children: React.ReactNode }) {
  useSettingsMigration();
  return <>{children}</>;
}

function GlobalSettingsProvider({ children }: { children: React.ReactNode }) {
  return (
    <GlobalSettingsErrorBoundary>
      <GlobalSettingsContextProvider>
        <SettingsMigrationWrapper>
          {children}
        </SettingsMigrationWrapper>
      </GlobalSettingsContextProvider>
    </GlobalSettingsErrorBoundary>
  );
}

// Export the provider as default and re-export the hook
export default GlobalSettingsProvider;
export { useGlobalSettings };
export type { GlobalSettings } from '../../types/globalSettings';