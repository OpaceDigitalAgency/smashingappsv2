# App Identification and Usage Tracking Fixes

## Problem Identified

We identified three critical issues with app identification that were causing usage tracking problems:

1. **Article Smasher Issue**: The app was clearing all identification flags (including its own) during initialization, creating a race condition where API calls could be misidentified.

2. **Task Smasher Issue**: The app wasn't setting any identification flags at all, potentially causing its usage to be attributed to Article Smasher or not tracked properly.

3. **Shared Services Issue**: The shared services weren't properly recognizing the high-priority app identification flags (`FORCE_APP_ID` and `current_app`), causing them to fall back to less reliable identification methods.

## Fixes Implemented

### 1. Article Smasher Fix (commit 19c6ee2)

In `src/tools/article-smasher/ArticleSmasherApp.tsx`, we changed:

```javascript
// First, clear any existing app flags to prevent incorrect identification
localStorage.removeItem('task_list_state');
localStorage.removeItem('FORCE_APP_ID');
localStorage.removeItem('current_app');
localStorage.removeItem('article_smasher_app');
localStorage.removeItem('article_wizard_state');
```

To:

```javascript
// Only clear other app flags, not our own
localStorage.removeItem('task_list_state');
```

This prevents the race condition where Article Smasher temporarily has no identification.

### 2. Task Smasher Fix (commit c6cb4a6)

In `src/tools/task-smasher/TaskSmasherApp.tsx`, we added proper app identification:

```javascript
// Set app identification flags when component mounts
useEffect(() => {
  const initializeApp = async () => {
    console.log('TaskSmasherApp: Starting initialization');
    
    try {
      // First, clear any Article Smasher flags to prevent incorrect identification
      localStorage.removeItem('article_smasher_app');
      localStorage.removeItem('article_wizard_state');
      
      // Set high-priority flags for Task Smasher
      localStorage.setItem('FORCE_APP_ID', 'task-smasher');
      localStorage.setItem('current_app', 'task-smasher');
      localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
      
      console.log('TaskSmasherApp: App identification flags set successfully');
    } catch (error) {
      console.error('Error during TaskSmasher initialization:', error);
    }
  };

  // Run initialization
  initializeApp();
  
  // Set a periodic check to ensure the app ID flags remain set
  const intervalId = setInterval(() => {
    // Force app ID flags with every check
    localStorage.setItem('FORCE_APP_ID', 'task-smasher');
    localStorage.setItem('current_app', 'task-smasher');
    localStorage.setItem('task_list_state', JSON.stringify({ initialized: true }));
  }, 5000); // Check every 5 seconds
  
  // Cleanup function
  return () => {
    clearInterval(intervalId);
    console.log('TaskSmasherApp: Component unmounting, but keeping app ID flags');
  };
}, []); // Run only once on mount
```

This ensures Task Smasher properly identifies itself for usage tracking.

### 3. Shared Services Fix (commit e214eb3)

In `src/shared/services/aiServices.ts`, we updated the app identification logic to properly recognize the high-priority flags:

```javascript
// Get the current app ID from localStorage or URL
let appId = 'unknown-app';

// Check for app identification flags in priority order
// 1. FORCE_APP_ID has highest priority
const forcedAppId = localStorage.getItem('FORCE_APP_ID');
if (forcedAppId) {
  console.log(`[APP IDENTIFICATION] Using forced app ID: ${forcedAppId}`);
  appId = forcedAppId;
}
// 2. current_app has second priority
else if (localStorage.getItem('current_app')) {
  appId = localStorage.getItem('current_app') || 'unknown-app';
  console.log(`[APP IDENTIFICATION] Using current_app: ${appId}`);
}
// 3. App-specific flags have third priority
else if (localStorage.getItem('article_smasher_app') || localStorage.getItem('article_wizard_state')) {
  appId = 'article-smasher';
  console.log('[APP IDENTIFICATION] Using article-smasher based on app-specific flags');
} else if (localStorage.getItem('task_list_state')) {
  appId = 'task-smasher';
  console.log('[APP IDENTIFICATION] Using task-smasher based on app-specific flags');
}
// 4. URL path has lowest priority
else {
  // Check URL path as a fallback
  const path = window.location.pathname;
  if (path.includes('/article-smasher') || path.includes('/tools/article-smasher')) {
    appId = 'article-smasher';
    console.log('[APP IDENTIFICATION] Using article-smasher based on URL path');
  } else if (path.includes('/task-smasher') || path.includes('/tools/task-smasher')) {
    appId = 'task-smasher';
    console.log('[APP IDENTIFICATION] Using task-smasher based on URL path');
  } else {
    console.log(`[APP IDENTIFICATION] Using default app ID: ${appId}`);
  }
}
```

We also made similar updates to `src/shared/services/aiServiceWrapper.ts` to ensure consistent app identification throughout the system.

## How App Identification Works

The app identification system uses several localStorage flags:

1. `FORCE_APP_ID`: Highest priority flag that directly specifies which app is making API calls
2. `current_app`: Secondary flag that specifies the current app
3. App-specific flags:
   - Article Smasher: `article_smasher_app` and `article_wizard_state`
   - Task Smasher: `task_list_state`

The usage tracking system in `src/shared/services/aiServiceWrapper.ts` and `src/shared/services/usageTrackingService.ts` uses these flags to determine which app to attribute API calls to.

## Testing the Fix

1. Clear all usage data in the Debug tab
2. Use Article Smasher to generate content
3. Check the Usage tab - Article Smasher should appear with the correct usage
4. Use Task Smasher to generate content
5. Check the Usage tab - Task Smasher should appear with the correct usage

Each app should now correctly track its own usage without mixing up the attribution.

## Diagnostic Tools

We've also created diagnostic tools to help troubleshoot any remaining issues:

1. `console-fix-article-smasher-v2.js`: A console script that can be run in the browser to diagnose and fix usage tracking issues
2. `fix-article-smasher-tracking.html` and `fix-article-smasher-tracking.js`: Browser-based diagnostic tools

These tools can help diagnose and fix any remaining issues with usage tracking.