import { useEffect } from 'react';
import { GlobalSettings, DEFAULT_SETTINGS } from '../types/globalSettings';
import { useGlobalSettings } from '../contexts/GlobalSettingsContext';

const SETTINGS_VERSION = 1; // Increment this when making breaking changes

interface VersionedSettings extends GlobalSettings {
  _version?: number;
}

export function useSettingsMigration() {
  const { settings, updateSettings } = useGlobalSettings();

  useEffect(() => {
    const versionedSettings = settings as VersionedSettings;
    
    // If no version or old version, run migrations
    if (!versionedSettings._version || versionedSettings._version < SETTINGS_VERSION) {
      const migratedSettings = migrateSettings(versionedSettings);
      updateSettings({
        ...migratedSettings,
        _version: SETTINGS_VERSION
      });
    }
  }, [settings, updateSettings]);
}

function migrateSettings(oldSettings: VersionedSettings): GlobalSettings {
  // Start with current defaults
  const newSettings = { ...DEFAULT_SETTINGS };
  
  // No version means these are first-time settings
  if (!oldSettings._version) {
    return {
      ...newSettings,
      // Preserve any existing valid settings
      ...sanitizeSettings(oldSettings)
    };
  }

  // Handle migrations based on version
  switch (oldSettings._version) {
    // Add cases here when breaking changes are made
    // case 0:
    //   // Migrate from version 0 to 1
    //   break;
    default:
      return sanitizeSettings(oldSettings);
  }
}

function sanitizeSettings(settings: Partial<GlobalSettings>): GlobalSettings {
  const sanitized = { ...DEFAULT_SETTINGS };

  // Safely copy over existing settings, using type checking
  if (settings.aiProvider) {
    if (typeof settings.aiProvider.provider === 'string' &&
        ['openai', 'anthropic', 'openrouter'].includes(settings.aiProvider.provider)) {
      sanitized.aiProvider.provider = settings.aiProvider.provider;
    }
    if (typeof settings.aiProvider.apiKey === 'string') {
      sanitized.aiProvider.apiKey = settings.aiProvider.apiKey;
    }
    if (typeof settings.aiProvider.defaultModel === 'string') {
      sanitized.aiProvider.defaultModel = settings.aiProvider.defaultModel;
    }
    if (typeof settings.aiProvider.defaultSystemPrompt === 'string') {
      sanitized.aiProvider.defaultSystemPrompt = settings.aiProvider.defaultSystemPrompt;
    }
    if (settings.aiProvider.defaultOptions) {
      sanitized.aiProvider.defaultOptions = {
        ...sanitized.aiProvider.defaultOptions,
        ...settings.aiProvider.defaultOptions
      };
    }
  }

  if (settings.ui) {
    if (settings.ui.theme && ['light', 'dark', 'system'].includes(settings.ui.theme)) {
      sanitized.ui.theme = settings.ui.theme;
    }
    if (typeof settings.ui.sidebarExpanded === 'boolean') {
      sanitized.ui.sidebarExpanded = settings.ui.sidebarExpanded;
    }
    if (settings.ui.fontSize && ['sm', 'md', 'lg'].includes(settings.ui.fontSize)) {
      sanitized.ui.fontSize = settings.ui.fontSize;
    }
  }

  if (settings.rateLimit) {
    if (typeof settings.rateLimit.enabled === 'boolean') {
      sanitized.rateLimit.enabled = settings.rateLimit.enabled;
    }
    if (typeof settings.rateLimit.maxRequestsPerMinute === 'number') {
      sanitized.rateLimit.maxRequestsPerMinute = settings.rateLimit.maxRequestsPerMinute;
    }
    if (typeof settings.rateLimit.maxTokensPerDay === 'number') {
      sanitized.rateLimit.maxTokensPerDay = settings.rateLimit.maxTokensPerDay;
    }
  }

  if (settings.features) {
    if (typeof settings.features.voiceToText === 'boolean') {
      sanitized.features.voiceToText = settings.features.voiceToText;
    }
    if (typeof settings.features.dragAndDrop === 'boolean') {
      sanitized.features.dragAndDrop = settings.features.dragAndDrop;
    }
    if (typeof settings.features.autoSave === 'boolean') {
      sanitized.features.autoSave = settings.features.autoSave;
    }
  }

  return sanitized;
}