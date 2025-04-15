# SmashingApps Verification Tools

This directory contains tools to verify that all fixes for the SmashingApps unified application are working correctly. These tools specifically check:

1. Article Smasher usage data tracking and display in both summary metrics and detailed table
2. Task Smasher usage data tracking and display in both summary metrics and detailed table
3. Correct model name display for Task Smasher (e.g., "gpt-4o" instead of "4o")
4. Changes made in admin settings are properly saved and reflected in the UI

## Verification Scripts

There are two verification scripts available:

### 1. Node.js Script (`verify-fixes.js`)

This script is designed to be run in a Node.js environment. It directly imports the necessary modules from the SmashingApps codebase and runs tests against them.

#### How to Run

```bash
# From the project root directory
node verify-fixes.js
```

#### Requirements

- Node.js must be installed
- The script must be run from the SmashingApps project root directory
- The SmashingApps application must be built

### 2. Browser-Based Tool (`verify-fixes-browser.html`)

This is an HTML file with embedded JavaScript that can be opened in a browser. It's designed to be used directly on the SmashingApps website to test the live application.

#### How to Use

1. Open the SmashingApps website in your browser (https://smashingapps.ai)
2. Open the browser's developer tools (F12 or right-click and select "Inspect")
3. Go to the Console tab
4. Copy and paste the contents of the HTML file into the console, or load it as a snippet
5. Alternatively, you can save the HTML file and open it in a new tab while on the SmashingApps website

#### Features

The browser tool provides a user-friendly interface with buttons to:
- Clear existing usage data
- Simulate API requests for both Article Smasher and Task Smasher
- Verify usage data tracking
- Verify admin settings persistence
- Run all tests in sequence

## Test Results

Both tools will output detailed logs of the verification process and a summary of the results. The verification is considered successful if:

1. Total request count matches the expected value (6)
2. Article Smasher requests are tracked correctly (3)
3. Task Smasher requests are tracked correctly (3)
4. Model names are displayed correctly (e.g., "gpt-4o" instead of "4o")
5. Admin settings are properly persisted

## Troubleshooting

If the verification fails, check the following:

1. Make sure you're running the latest version of the SmashingApps application
2. Check that all required services are running
3. Verify that you have the necessary permissions to access the admin settings
4. Check the browser console for any JavaScript errors
5. Try clearing your browser cache and local storage before running the tests again

## Notes

- The browser-based tool must be run on the SmashingApps website to access the required functions
- The Node.js script requires direct access to the SmashingApps codebase
- Both tools will clear existing usage data before running tests, so make sure to back up any important data first