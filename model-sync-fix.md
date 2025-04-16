# Model Synchronization Fix

## Issue Description

There's an issue with model synchronization between the admin settings and the Task Smasher application. When you change the model in the admin settings (e.g., from gpt-3.5-turbo to gpt-4o), the change is not immediately reflected in the Task Smasher UI. The Task Smasher UI only updates after a 30-second interval or when the page is refreshed.

## Root Cause

After examining the code in `src/tools/task-smasher/hooks/useTasks.ts`, I found two mechanisms for setting the model:

1. Initial model selection (lines 14-60): This correctly tries to get the model from global settings, localStorage, or falls back to a default.

2. Effect to update settings when global settings change (lines 189-274): This has a periodic check (every 30 seconds) to sync the model with global settings.

The issue is that there's no immediate way to detect changes to the global settings when they happen in the admin panel. The Task Smasher page only checks for changes every 30 seconds or when the page is refreshed.

## Temporary Fix

I've created a script called `fix-model-sync.js` that you can run in the browser console to manually trigger a model sync. This script:

1. Gets the current model from global settings
2. Updates the app-specific model setting
3. Dispatches a storage event to trigger the event listeners in useTasks.ts
4. Forces a page refresh to ensure the UI is updated

To use this temporary fix:

1. Make changes to the model in the admin settings
2. Go to the Task Smasher page
3. Open the browser console (F12)
4. Copy and paste the contents of `fix-model-sync.js` into the console
5. Press Enter to run the script

## Permanent Fix Recommendations

For a permanent fix, I recommend the following changes to `src/tools/task-smasher/hooks/useTasks.ts`:

1. Add a custom event listener for model changes:
   ```typescript
   // Add this to the imports
   import { eventBus } from '../../../shared/utils/eventBus';

   // Add this to the useEffect that handles model changes
   useEffect(() => {
     // ... existing code ...

     // Listen for model change events from the admin panel
     const handleModelChange = (event: CustomEvent) => {
       const { model } = event.detail;
       console.log('Model change event received:', model);
       setSelectedModel(model);
       localStorage.setItem('smashingapps_activeModel', model);
     };

     // Add event listener
     eventBus.addEventListener('modelChanged', handleModelChange);

     // Remove event listener on cleanup
     return () => {
       // ... existing cleanup code ...
       eventBus.removeEventListener('modelChanged', handleModelChange);
     };
   }, []);
   ```

2. Create an event bus utility in `src/shared/utils/eventBus.ts`:
   ```typescript
   // Simple event bus for cross-component communication
   class EventBus {
     addEventListener(event: string, callback: EventListenerOrEventListenerObject) {
       document.addEventListener(event, callback);
     }

     removeEventListener(event: string, callback: EventListenerOrEventListenerObject) {
       document.removeEventListener(event, callback);
     }

     dispatchEvent(event: string, detail: any) {
       document.dispatchEvent(new CustomEvent(event, { detail }));
     }
   }

   export const eventBus = new EventBus();
   ```

3. Modify the admin settings component to dispatch an event when the model is changed:
   ```typescript
   // In the admin settings component where the model is changed
   import { eventBus } from '../../shared/utils/eventBus';

   // After saving the model change
   eventBus.dispatchEvent('modelChanged', { model: selectedModel });
   ```

These changes would allow for immediate updates to the model selection across the application without requiring page refreshes or periodic checks.

## Additional Recommendations

1. Consider adding a visual indicator in the Task Smasher UI to show which model is currently active.

2. Add a "Sync Settings" button to the Task Smasher UI that allows users to manually trigger a sync with the global settings.

3. Implement a more robust state management solution (like Redux or Context API) to handle global settings across the application.