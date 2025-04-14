#!/bin/bash

# Article Smasher V2 Test Runner Script

# Create directories for logs and screenshots if they don't exist
mkdir -p test-logs
mkdir -p test-screenshots

# Check if puppeteer is installed
if ! npm list puppeteer > /dev/null 2>&1; then
  echo "Puppeteer is not installed. Installing now..."
  npm install --save-dev puppeteer
fi

# Check if the application is running
echo "Checking if Article Smasher V2 is running..."
if ! curl -s http://localhost:5173 > /dev/null; then
  echo "WARNING: Article Smasher V2 doesn't seem to be running at http://localhost:5173"
  echo "Make sure to start the application with 'npm run dev' before running tests."
  
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Exiting. Please start the application and try again."
    exit 1
  fi
fi

# Run the tests
echo "Running Article Smasher V2 tests..."
node test-article-smasher.js
TEST_EXIT_CODE=$?

# Generate HTML report
echo "Generating HTML test report..."
node generate-report.js

# Open the report in the default browser
if [ -f "test-report.html" ]; then
  echo "Opening test report in browser..."
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    open test-report.html
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    xdg-open test-report.html
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "cygwin" || "$OSTYPE" == "win32" ]]; then
    # Windows
    start test-report.html
  else
    echo "Could not automatically open the report. Please open test-report.html manually."
  fi
fi

# Check the exit code
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "Tests completed successfully!"
  echo "Check the test-logs directory for detailed logs."
  echo "Check the test-screenshots directory for screenshots of each step."
  echo "A detailed HTML report has been generated at test-report.html"
else
  echo "Tests failed. Check the logs and HTML report for details."
fi

exit $TEST_EXIT_CODE