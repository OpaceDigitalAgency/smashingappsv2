# Permanent Fix for Global Settings Synchronization

## Issue Description

There's an issue with model synchronization between the admin settings and the Task Smasher application. When you change the model in the admin settings (e.g., from gpt-3.5-turbo to gpt-4o), the change is not immediately reflected in the Task Smasher UI. The Task Smasher UI only updates after a 30-second interval or when the page is refreshed.

## Root Cause

After examining the code, I've identified that there are two different localStorage keys being used for global settings:

1. `global-settings` - Used by the GlobalSettingsProvider in `src/shared/contexts/GlobalSettings/context.tsx`
2. `smashingapps-global-settings` - Used by the globalSettingsService in `src/shared/services/globalSettingsService.ts`

When the admin settings are updated, they're being saved to `global-settings`, but the Task Smasher app is reading from `smashingapps-global-settings`. This explains why the changes aren't being reflected immediately.

## Temporary Fix

I've created two scripts to temporarily fix this issue:

1. `fix-global-settings-keys.js` - A script that synchronizes the two localStorage keys
2. `fix-global-settings.html` - A simple HTML page that runs the script with a user interface

To use the temporary fix:

1. Open `fix-global-settings.html` in your browser
2. Click the "Apply Fix" button
3. The script will synchronize the two localStorage keys and refresh the page

## Permanent Fix

For a permanent fix, we need to modify the GlobalSettings context to use the same localStorage key as the globalSettingsService. Here are the changes needed:

### 1. Modify `src/shared/contexts/GlobalSettings/context.tsx`

Change line 83 from:
```typescript
} = useLocalStorage<GlobalSettings>('global-settings', DEFAULT_SETTINGS);
```

To:
```typescript
} = useLocalStorage<GlobalSettings>('smashingapps-global-settings', DEFAULT_SETTINGS);
```

This ensures that both the GlobalSettingsProvider and the globalSettingsService are using the same localStorage key.

### 2. Add a migration function to handle existing data

Add the following function to the GlobalSettingsProvider component:

```typescript
// Migrate data from old key to new key
useEffect(() => {
  try {
    const oldSettings = localStorage.getItem('global-settings');
    if (oldSettings) {
      console.log('[GlobalSettings] Migrating settings from global-settings to smashingapps-global-settings');
      const parsedSettings = JSON.parse(oldSettings);
      setStoredSettings(parsedSettings);
      localStorage.removeItem('global-settings');
    }
  } catch (error) {
    console.error('[GlobalSettings] Error migrating settings:', error);
  }
}, []);
```

This function will migrate any existing data from the old key to the new key when the application starts.

### 3. Update the event name in `src/shared/services/globalSettingsService.ts`

Change line 61 from:
```typescript
const SETTINGS_CHANGED_EVENT = 'globalSettingsChanged';
```

To:
```typescript
const SETTINGS_CHANGED_EVENT = 'smashingapps-globalSettingsChanged';
```

And update all references to this event name in the file.

### 4. Add event listeners in `src/tools/task-smasher/hooks/useTasks.ts`

Add the following code to the useEffect that handles model changes:

```typescript
// Listen for global settings changes
const handleGlobalSettingsChanged = (event: CustomEvent) => {
  const newSettings = event.detail;
  if (newSettings && newSettings.aiProvider && newSettings.aiProvider.defaultModel) {
    console.log('Global settings changed, updating model to:', newSettings.aiProvider.defaultModel);
    setSelectedModel(newSettings.aiProvider.defaultModel);
    localStorage.setItem('smashingapps_activeModel', newSettings.aiProvider.defaultModel);
  }
};

window.addEventListener('smashingapps-globalSettingsChanged', handleGlobalSettingsChanged as EventListener);

return () => {
  window.removeEventListener('smashingapps-globalSettingsChanged', handleGlobalSettingsChanged as EventListener);
};
```

This will ensure that the Task Smasher app immediately updates when the global settings are changed.

## Testing the Fix

After implementing the permanent fix, you should test it by:

1. Changing the model in the admin settings
2. Verifying that the change is immediately reflected in the Task Smasher UI without requiring a page refresh

The fix should ensure that both the admin settings and the Task Smasher app are using the same localStorage key for global settings, and that changes to the global settings are immediately propagated to all parts of the application.