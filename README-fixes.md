# SmashingApps Fixes

This document summarizes the fixes for the issues with model selection and usage tracking in the SmashingApps application.

## Issues Fixed

1. **Model Selection Not Persisting**
   - Changes to the model in admin settings were not immediately reflected in the Task Smasher UI
   - The Task Smasher UI only updated after a 30-second interval or when the page was refreshed

2. **Usage Data Not Updating**
   - Article Smasher usage data was not properly displayed in the admin dashboard
   - Task Smasher usage data was correctly tracked but showed incorrect model names

3. **ReCAPTCHA Warnings**
   - Console warnings about missing ReCAPTCHA site key were displayed

## Root Causes

1. **Model Selection Issue**
   - Two different localStorage keys were being used for global settings:
     - `global-settings` - Used by the GlobalSettingsProvider
     - `smashingapps-global-settings` - Used by the globalSettingsService
   - When admin settings were updated, they were saved to `global-settings`, but Task Smasher was reading from `smashingapps-global-settings`

2. **Usage Data Issue**
   - The usage tracking service was not properly updating the UI when new data was added
   - Model names were being truncated in some cases

3. **ReCAPTCHA Issue**
   - The ReCAPTCHA hook was showing warnings when no site key was provided

## Fixes Implemented

### 1. Temporary Fixes

We've created several scripts to temporarily fix these issues:

- `fix-model-sync.js` - Synchronizes the model between admin settings and Task Smasher
- `fix-global-settings-keys.js` - Synchronizes the two localStorage keys for global settings
- `verify-fixes-v2.js` - Verifies that all fixes are working correctly

And HTML interfaces for these scripts:

- `model-sync-fix.html` - Interface for the model sync fix
- `fix-global-settings.html` - Interface for the global settings keys fix
- `verify-fixes-standalone.html` - Interface for the verification script

### 2. Permanent Fixes

For a permanent solution, we've documented the necessary code changes in:

- `permanent-fix.md` - Detailed instructions for implementing a permanent fix for the global settings synchronization issue

The permanent fix involves:

1. Modifying the GlobalSettings context to use the same localStorage key as the globalSettingsService
2. Adding a migration function to handle existing data
3. Updating the event name for settings changes
4. Adding event listeners to ensure immediate updates when settings change

### 3. Code Changes

We've also made direct code changes to fix specific issues:

1. Modified `src/shared/hooks/useReCaptcha.ts` to handle missing site key more gracefully
2. Fixed model override in `src/shared/services/AIService.ts` to respect the user's selected model
3. Enhanced `forceRefreshUsageData` in `src/shared/utils/usageDebugUtils.ts` to ensure proper UI updates

## How to Apply the Fixes

### Temporary Fix (Quick Solution)

1. Open `fix-global-settings.html` in your browser
2. Click the "Apply Fix" button
3. The script will synchronize the two localStorage keys and refresh the page

### Permanent Fix (Recommended)

Follow the instructions in `permanent-fix.md` to implement the code changes for a permanent solution.

### Verification

To verify that all fixes are working correctly:

1. Open `verify-fixes-standalone.html` in your browser
2. Follow the instructions to run the verification tests
3. Check the results to ensure all issues have been resolved

## Testing Procedure

After applying the fixes, test the application by:

1. Changing the model in the admin settings
2. Verifying that the change is immediately reflected in the Task Smasher UI
3. Creating tasks in both Task Smasher and Article Smasher
4. Checking the admin dashboard to ensure usage data is correctly displayed for both applications
5. Verifying that model names are displayed correctly in the usage data

## Future Recommendations

1. Implement a more robust state management solution (like Redux or Context API) to handle global settings across the application
2. Add more comprehensive error handling and logging
3. Implement automated tests to catch these types of issues before they reach production
4. Consider adding a visual indicator in the Task Smasher UI to show which model is currently active