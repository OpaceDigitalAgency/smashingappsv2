/**
 * Test Report Generator for Article Smasher V2
 * 
 * This script generates an HTML report from the test logs and screenshots.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const config = {
  templatePath: path.join(__dirname, 'test-report-template.html'),
  logsDir: path.join(__dirname, 'test-logs'),
  screenshotsDir: path.join(__dirname, 'test-screenshots'),
  outputPath: path.join(__dirname, 'test-report.html')
};

/**
 * Generate a test report from the logs and screenshots
 */
function generateReport() {
  console.log('Generating test report...');
  
  // Read the template
  const template = fs.readFileSync(config.templatePath, 'utf8');
  
  // Get the latest log file
  const logFiles = fs.readdirSync(config.logsDir)
    .filter(file => file.endsWith('.log'))
    .map(file => ({
      name: file,
      path: path.join(config.logsDir, file),
      time: fs.statSync(path.join(config.logsDir, file)).mtime.getTime()
    }))
    .sort((a, b) => b.time - a.time);
  
  if (logFiles.length === 0) {
    console.error('No log files found in', config.logsDir);
    return;
  }
  
  const latestLog = logFiles[0];
  console.log(`Using latest log file: ${latestLog.name}`);
  
  // Read the log file
  const logContent = fs.readFileSync(latestLog.path, 'utf8');
  
  // Parse the log file
  const testResults = parseLogFile(logContent);
  
  // Get screenshots
  const screenshots = fs.readdirSync(config.screenshotsDir)
    .filter(file => file.endsWith('.png'))
    .map(file => ({
      name: file,
      path: path.relative(path.dirname(config.outputPath), path.join(config.screenshotsDir, file)),
      time: fs.statSync(path.join(config.screenshotsDir, file)).mtime.getTime()
    }))
    .sort((a, b) => a.time - b.time);
  
  // Generate the report HTML
  let reportHtml = template;
  
  // Replace placeholders
  reportHtml = reportHtml.replace('{{TEST_DATE}}', new Date(latestLog.time).toLocaleString());
  reportHtml = reportHtml.replace('{{TOTAL_TESTS}}', testResults.totalTests);
  reportHtml = reportHtml.replace('{{PASSED_TESTS}}', testResults.passedTests);
  reportHtml = reportHtml.replace('{{WARNING_TESTS}}', testResults.warningTests);
  reportHtml = reportHtml.replace('{{FAILED_TESTS}}', testResults.failedTests);
  reportHtml = reportHtml.replace('{{TEST_DURATION}}', testResults.duration);
  
  // Generate test sections HTML
  const testSectionsHtml = generateTestSectionsHtml(testResults.sections, screenshots);
  reportHtml = reportHtml.replace('{{TEST_SECTIONS}}', testSectionsHtml);
  
  // Write the report
  fs.writeFileSync(config.outputPath, reportHtml);
  console.log(`Report generated: ${config.outputPath}`);
  
  return config.outputPath;
}

/**
 * Parse the log file to extract test results
 */
function parseLogFile(logContent) {
  const lines = logContent.split('\n');
  const sections = [];
  let currentSection = null;
  let currentTest = null;
  
  // Stats
  let totalTests = 0;
  let passedTests = 0;
  let warningTests = 0;
  let failedTests = 0;
  
  // Start and end times
  let startTime = null;
  let endTime = null;
  
  for (const line of lines) {
    // Extract timestamp
    const timestampMatch = line.match(/\[(.*?)\]/);
    if (timestampMatch) {
      const timestamp = new Date(timestampMatch[1]);
      
      if (!startTime || timestamp < startTime) {
        startTime = timestamp;
      }
      if (!endTime || timestamp > endTime) {
        endTime = timestamp;
      }
    }
    
    // Check for section headers
    if (line.includes('='.repeat(80))) {
      const nextLine = lines[lines.indexOf(line) + 1];
      if (nextLine && !nextLine.includes('='.repeat(80))) {
        if (currentSection) {
          sections.push(currentSection);
        }
        currentSection = {
          title: nextLine.trim(),
          tests: [],
          status: 'success'
        };
        currentTest = null;
      }
      continue;
    }
    
    // Check for test cases
    if (line.includes('[INFO]') && currentSection) {
      const testMatch = line.match(/\[INFO\]\s+(Testing\s+.*?)$/);
      if (testMatch) {
        if (currentTest) {
          currentSection.tests.push(currentTest);
          totalTests++;
          if (currentTest.status === 'success') passedTests++;
          if (currentTest.status === 'warning') warningTests++;
          if (currentTest.status === 'error') failedTests++;
        }
        currentTest = {
          title: testMatch[1],
          logs: [],
          status: 'success'
        };
        continue;
      }
    }
    
    // Check for success messages
    if (line.includes('[SUCCESS]') && currentTest) {
      currentTest.logs.push(line);
      continue;
    }
    
    // Check for warning messages
    if (line.includes('[WARNING]') && currentTest) {
      currentTest.logs.push(line);
      currentTest.status = 'warning';
      currentSection.status = currentSection.status === 'error' ? 'error' : 'warning';
      continue;
    }
    
    // Check for error messages
    if (line.includes('[ERROR]') && currentTest) {
      currentTest.logs.push(line);
      currentTest.status = 'error';
      currentSection.status = 'error';
      continue;
    }
    
    // Add log line to current test
    if (currentTest && line.trim()) {
      currentTest.logs.push(line);
    }
  }
  
  // Add the last test and section
  if (currentTest) {
    currentSection.tests.push(currentTest);
    totalTests++;
    if (currentTest.status === 'success') passedTests++;
    if (currentTest.status === 'warning') warningTests++;
    if (currentTest.status === 'error') failedTests++;
  }
  if (currentSection) {
    sections.push(currentSection);
  }
  
  // Calculate duration
  let duration = 'Unknown';
  if (startTime && endTime) {
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);
    duration = `${minutes}m ${seconds}s`;
  }
  
  return {
    totalTests,
    passedTests,
    warningTests,
    failedTests,
    duration,
    sections
  };
}

/**
 * Generate HTML for test sections
 */
function generateTestSectionsHtml(sections, screenshots) {
  let html = '';
  
  for (const section of sections) {
    html += `
      <div class="test-section">
        <div class="section-header">
          <h2>${section.title}</h2>
          <div class="status-icon status-${section.status}"></div>
        </div>
        <div class="section-content">
    `;
    
    for (const test of section.tests) {
      html += `
        <div class="test-case">
          <h3>
            <div class="status-icon status-${test.status}"></div>
            <span>${test.title}</span>
          </h3>
          <div class="test-details">
      `;
      
      // Add logs
      if (test.logs.length > 0) {
        html += `<div class="test-log">${test.logs.join('\n')}</div>`;
      }
      
      // Add screenshots
      const testScreenshots = screenshots.filter(s => {
        const testName = test.title.toLowerCase().replace(/testing\s+/i, '').replace(/\s+/g, '-');
        return s.name.toLowerCase().includes(testName);
      });
      
      if (testScreenshots.length > 0) {
        for (const screenshot of testScreenshots) {
          html += `
            <div class="screenshot">
              <img src="${screenshot.path}" alt="${screenshot.name}" />
              <p>${screenshot.name}</p>
            </div>
          `;
        }
      }
      
      html += `
          </div>
        </div>
      `;
    }
    
    html += `
        </div>
      </div>
    `;
  }
  
  return html;
}

// Run the report generator
const reportPath = generateReport();
console.log(`To view the report, open: ${reportPath}`);

// If running in a browser environment, open the report
if (typeof window !== 'undefined') {
  window.open(reportPath, '_blank');
}