# Article Smasher V2 Test Suite

This test suite is designed to verify the functionality of the AI-powered article generation system in Article Smasher V2. It tests each stage of the workflow, the admin interface, and various edge cases to ensure the system works correctly and produces high-quality content.

## Features Tested

The test suite covers the following areas:

### Article Creation Workflow
- Article type selection
- Topic generation and selection
- Keyword research and selection
- Outline generation
- Content creation
- Image selection
- Publishing and SEO optimization
- Complete article view

### Admin Interface
- Prompt template listing
- Creating new prompt templates
- Editing existing prompt templates
- Testing prompts with sample inputs
- Managing settings

### Edge Cases
- Empty or minimal user inputs
- Very long inputs
- Special characters or unusual inputs
- Different article types

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- A running instance of the Article Smasher V2 application (default: http://localhost:5173)

## Installation

1. Navigate to the test directory:
   ```
   cd src/tools/article-smasherv2
   ```

2. Install the dependencies:
   ```
   npm install --save-dev puppeteer
   ```
   or
   ```
   npm install -f test-package.json
   ```

## Running the Tests

1. Make sure the Article Smasher V2 application is running:
   ```
   npm run dev
   ```

2. In a separate terminal, run the tests:
   ```
   node test-article-smasher.js
   ```

## Test Output

The test script generates the following outputs:

1. **Console logs**: Real-time progress and results are displayed in the console.

2. **Log files**: Detailed logs are saved in the `test-logs` directory with timestamps.

3. **Screenshots**: Screenshots of each step are saved in the `test-screenshots` directory for visual verification.

## Configuration

You can modify the configuration in the `test-article-smasher.js` file:

```javascript
const config = {
  baseUrl: 'http://localhost:5173', // Adjust based on your development server
  headless: false, // Set to true for headless testing
  slowMo: 50, // Slow down operations for better visibility during testing
  timeout: 30000, // Default timeout for operations
  logDir: path.join(__dirname, 'test-logs'),
  screenshots: path.join(__dirname, 'test-screenshots'),
};
```

## Troubleshooting

If the tests fail, check the following:

1. Make sure the Article Smasher V2 application is running and accessible at the configured URL.
2. Check the log files for detailed error messages.
3. Review the screenshots to see where the test failed.
4. Adjust the timeouts if necessary for slower connections or processing.

## Known Limitations

- The test script assumes specific CSS selectors and UI elements. If the application UI changes, the selectors may need to be updated.
- AI-generated content may vary, so some tests may need adjustment based on the actual output.
- The script does not test actual integration with WordPress or other CMS systems.

## Extending the Tests

To add new tests:

1. Create a new test function in the `test-article-smasher.js` file.
2. Add the function call to the appropriate test suite.
3. Update the README to document the new test.