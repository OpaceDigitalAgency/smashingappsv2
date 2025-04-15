# Usage Tracking Fixes

This document explains the issues with usage tracking in SmashingApps and the fixes that have been implemented.

## Issues Identified

1. **Admin Dashboard Error**: The admin dashboard shows an error "Cannot read properties of undefined (reading 'forEach')" when trying to display usage data.
2. **Missing App Data**: Article Smasher usage data is not properly displayed in the admin dashboard.
3. **Task Smasher Model Display**: Task Smasher still shows "4o" as the model at the top even though the settings are defaulted to "3.5-turbo".

## Root Causes

1. **Usage Data Structure**: The usage data structure is missing or has incomplete app-specific tracking objects (requestsByApp, tokensByApp, etc.).
2. **App Identification**: Article Smasher is not properly identified when making API requests, causing its usage to not be tracked correctly.
3. **Model Synchronization**: The model selected in admin settings is not being properly synchronized with the model displayed in Task Smasher.

## Fixes Implemented

### 1. Usage Data Structure Fix

The `fix-usage-tracking.js` script fixes the usage data structure by:

- Ensuring all required data structures exist (requestsByApp, tokensByApp, etc.)
- Recalculating app-specific stats from the usage history
- Ensuring both Task Smasher and Article Smasher exist in the app stats
- Dispatching events to update the UI with the fixed data

### 2. App Identification Fix

The script also fixes app identification by:

- Setting app identification flags for both Task Smasher and Article Smasher
- Providing simulation functions for both apps to test tracking
- Ensuring app IDs are properly set in the usage history

### 3. Testing Tools

The `usage-tests.html` file provides a user interface for:

- Running tests to verify usage tracking for both apps
- Inspecting localStorage for model settings
- Examining console output for model-related messages
- Applying fixes to the usage data

## How to Use

1. **Fix Usage Tracking**: Open `usage-tests.html` in your browser and click the "Run Fix" button to fix the usage tracking data.

2. **Test Task Smasher Usage**: Click the "Run Test 4" button to:
   - Clear all usage data
   - Simulate a Task Smasher API request
   - Verify that Task Smasher appears in the usage data

3. **Test Article Smasher Usage**: Click the "Run Test 5" button to:
   - Clear all usage data
   - Simulate an Article Smasher API request
   - Verify that Article Smasher appears in the usage data

4. **Inspect Console**: Click the "Run Test 6" button to:
   - Clear the console
   - Look for messages containing "model" or "override"
   - Display any model-related messages

5. **Inspect LocalStorage**: Click the "Run Test 7" button to:
   - Look for entries related to models or settings
   - Display the raw data in localStorage

## Verification

After running the fixes, you should:

1. Go to the Admin dashboard and check the Usage section
2. Verify that both Task Smasher and Article Smasher appear in the usage table
3. Verify that the model displayed in Task Smasher matches the model selected in admin settings

## Technical Details

### Usage Data Structure

The usage data is stored in localStorage under the key `smashingapps_usage_data` with the following structure:

```javascript
{
  totalRequests: number,
  totalTokens: number,
  totalInputTokens: number,
  totalOutputTokens: number,
  costEstimate: number,
  requestsByProvider: Record<AIProvider, number>,
  tokensByProvider: Record<AIProvider, number>,
  inputTokensByProvider: Record<AIProvider, number>,
  outputTokensByProvider: Record<AIProvider, number>,
  costByProvider: Record<AIProvider, number>,
  requestsByApp: Record<string, number>,
  tokensByApp: Record<string, number>,
  inputTokensByApp: Record<string, number>,
  outputTokensByApp: Record<string, number>,
  costByApp: Record<string, number>,
  usageHistory: Array<{
    timestamp: number,
    requests: number,
    tokens: number,
    inputTokens: number,
    outputTokens: number,
    cost: number,
    provider: AIProvider,
    app: string,
    model: string
  }>
}
```

The issue was that some of these objects (requestsByApp, tokensByApp, etc.) were missing or incomplete, causing errors when trying to display the usage data in the admin dashboard.

### App Identification

App identification is done through several flags in localStorage:

- `article_smasher_app`: Set to "true" for Article Smasher
- `article_wizard_state`: Contains initialization state for Article Smasher
- `task_list_state`: Contains initialization state for Task Smasher
- `current_app`: Set to the current app ID ("article-smasher" or "task-smasher")
- `FORCE_APP_ID`: Can be used to force a specific app ID

The issue was that these flags were not being properly set for Article Smasher, causing its usage to not be tracked correctly.

### Model Synchronization

Model settings are stored in several places:

- `global-settings`: Contains global settings including the AI provider and model
- `smashingapps-global-settings`: Contains global settings for SmashingApps
- `smashingapps_activeModel`: Contains the active model for SmashingApps
- `smashingapps_activeProvider`: Contains the active provider for SmashingApps

The issue was that these settings were not being properly synchronized, causing the model displayed in Task Smasher to not match the model selected in admin settings.