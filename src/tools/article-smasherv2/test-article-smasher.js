/**
 * Test Script for Article Smasher V2
 *
 * This script tests the AI-powered article generation system to ensure it works correctly
 * and produces high-quality content. It tests each stage of the workflow, the admin interface,
 * and various edge cases.
 */

// Import required modules
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const testData = require('./load-test-data');

// Configuration
const config = {
  baseUrl: 'http://localhost:5173', // Adjust based on your development server
  headless: false, // Set to true for headless testing
  slowMo: 50, // Slow down operations for better visibility during testing
  timeout: 30000, // Default timeout for operations
  logDir: path.join(__dirname, 'test-logs'),
  screenshots: path.join(__dirname, 'test-screenshots'),
};

// Ensure log directories exist
if (!fs.existsSync(config.logDir)) {
  fs.mkdirSync(config.logDir, { recursive: true });
}
if (!fs.existsSync(config.screenshots)) {
  fs.mkdirSync(config.screenshots, { recursive: true });
}

// Logger
const logger = {
  logFile: path.join(config.logDir, `test-run-${new Date().toISOString().replace(/:/g, '-')}.log`),
  
  init() {
    fs.writeFileSync(this.logFile, `Article Smasher V2 Test Run - ${new Date().toISOString()}\n\n`);
    console.log(`Logging to ${this.logFile}`);
  },
  
  log(message, type = 'INFO') {
    const logMessage = `[${new Date().toISOString()}] [${type}] ${message}\n`;
    fs.appendFileSync(this.logFile, logMessage);
    console.log(message);
  },
  
  error(message, error) {
    const errorDetails = error ? `\nError: ${error.message}\n${error.stack}` : '';
    this.log(`${message}${errorDetails}`, 'ERROR');
  },
  
  success(message) {
    this.log(message, 'SUCCESS');
  },
  
  section(title) {
    const separator = '='.repeat(80);
    const message = `\n${separator}\n${title}\n${separator}\n`;
    fs.appendFileSync(this.logFile, message);
    console.log(`\n${title}`);
  }
};

// Load test data
const articleTypes = testData.getArticleTypes();
const testPromptVariables = testData.getTestPromptVariables();
const edgeCases = testData.getEdgeCases();

// Test runner
async function runTests() {
  logger.init();
  logger.section('Starting Article Smasher V2 Tests');
  
  const browser = await puppeteer.launch({
    headless: config.headless,
    slowMo: config.slowMo,
    defaultViewport: { width: 1280, height: 800 },
    args: ['--window-size=1280,800']
  });
  
  const page = await browser.newPage();
  page.setDefaultTimeout(config.timeout);
  
  try {
    // Set up console log capture
    page.on('console', message => {
      logger.log(`Browser Console: ${message.text()}`, 'CONSOLE');
    });
    
    // Run the test suites
    await testArticleWorkflow(page);
    await testAdminInterface(page);
    await testEdgeCases(page);
    
    logger.section('All Tests Completed Successfully');
  } catch (error) {
    logger.error('Test execution failed', error);
    await takeScreenshot(page, 'test-failure');
  } finally {
    await browser.close();
  }
}

/**
 * Test the article creation workflow
 */
async function testArticleWorkflow(page) {
  logger.section('Testing Article Creation Workflow');
  
  try {
    // Navigate to the wizard
    logger.log('Navigating to the article wizard');
    await page.goto(`${config.baseUrl}/wizard`);
    await takeScreenshot(page, 'wizard-initial');
    
    // Test Step 1: Topic Selection
    await testTopicStep(page);
    
    // Test Step 2: Keyword Research
    await testKeywordStep(page);
    
    // Test Step 3: Outline Generation
    await testOutlineStep(page);
    
    // Test Step 4: Content Creation
    await testContentStep(page);
    
    // Test Step 5: Image Selection
    await testImageStep(page);
    
    // Test Step 6: Publish
    await testPublishStep(page);
    
    // Test Complete Article View
    await testCompleteArticle(page);
    
    logger.success('Article workflow testing completed successfully');
  } catch (error) {
    logger.error('Article workflow testing failed', error);
    throw error;
  }
}

/**
 * Test the topic selection step
 */
async function testTopicStep(page) {
  logger.log('Testing Topic Step');
  
  // Verify we're on the topic step
  await verifyCurrentStep(page, 1);
  
  // Test article type selection - use data from test data
  const articleType = testData.getRandomItem(articleTypes);
  await page.click(`button:has-text("${articleType.name}")`);
  logger.log(`Selected article type: ${articleType.name}`);
  
  // Test topic generation
  await page.click('button:has-text("Generate Topics")');
  logger.log('Clicked Generate Topics button');
  
  // Wait for topics to be generated
  await page.waitForSelector('.topic-suggestion', { timeout: config.timeout });
  logger.log('Topics generated successfully');
  
  // Select a topic
  const topicElements = await page.$$('.topic-suggestion');
  if (topicElements.length > 0) {
    await topicElements[0].click();
    logger.log('Selected the first topic');
  } else {
    throw new Error('No topic suggestions found');
  }
  
  // Verify topic selection
  const selectedTopic = await page.$eval('.selected-topic', el => el.textContent);
  logger.log(`Selected topic: ${selectedTopic}`);
  
  // Take screenshot
  await takeScreenshot(page, 'topic-step-complete');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  logger.success('Topic step completed successfully');
}

/**
 * Test the keyword research step
 */
async function testKeywordStep(page) {
  logger.log('Testing Keyword Step');
  
  // Verify we're on the keyword step
  await verifyCurrentStep(page, 2);
  
  // Wait for keywords to be generated
  await page.waitForSelector('.keyword-item', { timeout: config.timeout });
  logger.log('Keywords generated successfully');
  
  // Select some keywords
  const keywordCheckboxes = await page.$$('.keyword-checkbox');
  for (let i = 0; i < Math.min(3, keywordCheckboxes.length); i++) {
    await keywordCheckboxes[i].click();
    logger.log(`Selected keyword ${i+1}`);
  }
  
  // Take screenshot
  await takeScreenshot(page, 'keyword-step-complete');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  logger.success('Keyword step completed successfully');
}

/**
 * Test the outline generation step
 */
async function testOutlineStep(page) {
  logger.log('Testing Outline Step');
  
  // Verify we're on the outline step
  await verifyCurrentStep(page, 3);
  
  // Wait for outline to be generated
  await page.waitForSelector('.outline-item', { timeout: config.timeout });
  logger.log('Outline generated successfully');
  
  // Verify outline structure
  const outlineItems = await page.$$('.outline-item');
  logger.log(`Outline contains ${outlineItems.length} sections`);
  
  // Take screenshot
  await takeScreenshot(page, 'outline-step-complete');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  logger.success('Outline step completed successfully');
}

/**
 * Test the content creation step
 */
async function testContentStep(page) {
  logger.log('Testing Content Step');
  
  // Verify we're on the content step
  await verifyCurrentStep(page, 4);
  
  // Wait for content to be generated
  await page.waitForSelector('.article-content', { timeout: config.timeout * 2 }); // Double timeout for content generation
  logger.log('Content generated successfully');
  
  // Verify content sections
  const contentSections = await page.$$('.content-section');
  logger.log(`Content contains ${contentSections.length} sections`);
  
  // Take screenshot
  await takeScreenshot(page, 'content-step-complete');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  logger.success('Content step completed successfully');
}

/**
 * Test the image selection step
 */
async function testImageStep(page) {
  logger.log('Testing Image Step');
  
  // Verify we're on the image step
  await verifyCurrentStep(page, 5);
  
  // Wait for images to be generated
  await page.waitForSelector('.image-item', { timeout: config.timeout });
  logger.log('Images generated successfully');
  
  // Select an image
  const imageItems = await page.$$('.image-item');
  if (imageItems.length > 0) {
    await imageItems[0].click();
    logger.log('Selected the first image');
  } else {
    throw new Error('No images found');
  }
  
  // Take screenshot
  await takeScreenshot(page, 'image-step-complete');
  
  // Move to next step
  await page.click('button:has-text("Next")');
  logger.success('Image step completed successfully');
}

/**
 * Test the publish step
 */
async function testPublishStep(page) {
  logger.log('Testing Publish Step');
  
  // Verify we're on the publish step
  await verifyCurrentStep(page, 6);
  
  // Verify SEO elements
  await page.waitForSelector('.seo-preview', { timeout: config.timeout });
  logger.log('SEO preview loaded successfully');
  
  // Take screenshot
  await takeScreenshot(page, 'publish-step-complete');
  
  // Complete the article
  await page.click('button:has-text("Complete")');
  logger.success('Publish step completed successfully');
}

/**
 * Test the complete article view
 */
async function testCompleteArticle(page) {
  logger.log('Testing Complete Article View');
  
  // Verify we're on the complete article view
  await page.waitForSelector('.complete-article', { timeout: config.timeout });
  logger.log('Complete article view loaded successfully');
  
  // Verify article elements
  const title = await page.$eval('.article-title', el => el.textContent);
  logger.log(`Article title: ${title}`);
  
  // Take screenshot
  await takeScreenshot(page, 'complete-article');
  
  logger.success('Complete article testing completed successfully');
}

/**
 * Test the admin interface
 */
async function testAdminInterface(page) {
  logger.section('Testing Admin Interface');
  
  try {
    // Navigate to the admin dashboard
    logger.log('Navigating to the admin dashboard');
    await page.goto(`${config.baseUrl}/admin`);
    await takeScreenshot(page, 'admin-initial');
    
    // Test prompt list
    await testPromptList(page);
    
    // Test creating a new prompt
    await testCreatePrompt(page);
    
    // Test editing an existing prompt
    await testEditPrompt(page);
    
    // Test prompt testing
    await testPromptTesting(page);
    
    // Test settings
    await testSettings(page);
    
    logger.success('Admin interface testing completed successfully');
  } catch (error) {
    logger.error('Admin interface testing failed', error);
    throw error;
  }
}

/**
 * Test the prompt list
 */
async function testPromptList(page) {
  logger.log('Testing Prompt List');
  
  // Verify prompt list is displayed
  await page.waitForSelector('.prompt-list', { timeout: config.timeout });
  
  // Count prompts
  const promptItems = await page.$$('.prompt-item');
  logger.log(`Found ${promptItems.length} prompts in the list`);
  
  // Take screenshot
  await takeScreenshot(page, 'prompt-list');
  
  logger.success('Prompt list testing completed successfully');
}

/**
 * Test creating a new prompt
 */
async function testCreatePrompt(page) {
  logger.log('Testing Create Prompt');
  
  // Click create new prompt button
  await page.click('button:has-text("Create New Prompt")');
  logger.log('Clicked Create New Prompt button');
  
  // Fill in prompt details using test data
  const promptTemplate = testData.getPromptTemplateByCategory('topic');
  await page.type('#name', promptTemplate ? promptTemplate.name : 'Test Prompt');
  await page.select('#category', 'topic');
  await page.type('#description', promptTemplate ? promptTemplate.description : 'A test prompt for automated testing');
  await page.type('#systemPrompt', promptTemplate ? promptTemplate.systemPrompt : 'You are a helpful assistant that generates article topics.');
  await page.type('#userPromptTemplate', promptTemplate ? promptTemplate.userPromptTemplate : 'Generate 5 article topics about {{topic}} for a {{audience}} audience.');
  await page.type('#temperature', '0.7');
  await page.type('#maxTokens', '1000');
  
  // Take screenshot
  await takeScreenshot(page, 'create-prompt-form');
  
  // Save the prompt
  await page.click('button:has-text("Create Prompt")');
  logger.log('Clicked Create Prompt button');
  
  // Wait for success message
  await page.waitForFunction(() => {
    return window.alert !== undefined;
  });
  
  logger.success('Create prompt testing completed successfully');
}

/**
 * Test editing an existing prompt
 */
async function testEditPrompt(page) {
  logger.log('Testing Edit Prompt');
  
  // Select the first prompt in the list
  const promptItems = await page.$$('.prompt-item');
  if (promptItems.length > 0) {
    await promptItems[0].click();
    logger.log('Selected the first prompt for editing');
  } else {
    throw new Error('No prompts found to edit');
  }
  
  // Modify prompt details
  await page.evaluate(() => document.getElementById('description').value = '');
  await page.type('#description', 'Updated description for testing');
  
  // Take screenshot
  await takeScreenshot(page, 'edit-prompt-form');
  
  // Save the prompt
  await page.click('button:has-text("Update Prompt")');
  logger.log('Clicked Update Prompt button');
  
  // Wait for success message
  await page.waitForFunction(() => {
    return window.alert !== undefined;
  });
  
  logger.success('Edit prompt testing completed successfully');
}

/**
 * Test prompt testing functionality
 */
async function testPromptTesting(page) {
  logger.log('Testing Prompt Testing');
  
  // Click test prompt button
  await page.click('button:has-text("Test Prompt")');
  logger.log('Clicked Test Prompt button');
  
  // Wait for tester to appear
  await page.waitForSelector('.prompt-tester', { timeout: config.timeout });
  
  // Fill in test variables using test data
  const variableInputs = await page.$$('.prompt-tester input[type="text"]');
  for (const input of variableInputs) {
    const name = await input.evaluate(el => el.name);
    const value = testPromptVariables[name] ? testPromptVariables[name].value : 'test value for ' + name;
    await input.type(value);
    logger.log(`Filled test value for variable: ${name} = ${value}`);
  }
  
  // Take screenshot
  await takeScreenshot(page, 'prompt-tester');
  
  // Run the test
  await page.click('button:has-text("Run Test")');
  logger.log('Clicked Run Test button');
  
  // Wait for result
  await page.waitForSelector('.prompt-tester pre', { timeout: config.timeout * 2 });
  
  // Verify result
  const resultText = await page.$eval('.prompt-tester pre', el => el.textContent);
  logger.log(`Test result length: ${resultText.length} characters`);
  
  // Take screenshot of result
  await takeScreenshot(page, 'prompt-test-result');
  
  logger.success('Prompt testing completed successfully');
}

/**
 * Test settings management
 */
async function testSettings(page) {
  logger.log('Testing Settings Management');
  
  // Switch to settings tab
  await page.click('button:has-text("Settings")');
  logger.log('Switched to Settings tab');
  
  // Wait for settings form
  await page.waitForSelector('.settings-form', { timeout: config.timeout });
  
  // Modify settings
  await page.select('#defaultModel', 'gpt-4o');
  await page.evaluate(() => document.getElementById('defaultTemperature').value = '');
  await page.type('#defaultTemperature', '0.8');
  
  // Take screenshot
  await takeScreenshot(page, 'settings-form');
  
  // Save settings
  await page.click('button:has-text("Save Settings")');
  logger.log('Clicked Save Settings button');
  
  // Wait for success message
  await page.waitForFunction(() => {
    return window.alert !== undefined;
  });
  
  logger.success('Settings testing completed successfully');
}

/**
 * Test edge cases
 */
async function testEdgeCases(page) {
  logger.section('Testing Edge Cases');
  
  try {
    // Navigate back to the wizard
    logger.log('Navigating to the article wizard for edge case testing');
    await page.goto(`${config.baseUrl}/wizard`);
    
    // Test empty inputs using edge case data
    await testEmptyInputs(page);
    
    // Test very long inputs
    await testLongInputs(page);
    
    // Test special characters
    await testSpecialCharacters(page);
    
    // Test different article types
    await testDifferentArticleTypes(page);
    
    logger.success('Edge case testing completed successfully');
  } catch (error) {
    logger.error('Edge case testing failed', error);
    throw error;
  }
}

/**
 * Test empty inputs
 */
async function testEmptyInputs(page) {
  logger.log('Testing Empty Inputs');
  
  // Try to proceed without selecting a topic
  await page.click('button:has-text("Next")');
  
  // Check for validation message
  const validationMessage = await page.$eval('.validation-message', el => el.textContent);
  logger.log(`Validation message: ${validationMessage}`);
  
  // Take screenshot
  await takeScreenshot(page, 'empty-input-validation');
  
  logger.success('Empty inputs testing completed successfully');
}

/**
 * Test very long inputs
 */
async function testLongInputs(page) {
  logger.log('Testing Long Inputs');
  
  // Generate a very long title from edge cases
  const longTitle = edgeCases.longInput.topic || ('Very '.repeat(100) + 'Long Title');
  
  // Enter custom title
  await page.click('button:has-text("Custom Title")');
  await page.type('#custom-title', longTitle);
  
  // Take screenshot
  await takeScreenshot(page, 'long-input');
  
  // Check if the input was truncated or handled properly
  const displayedTitle = await page.$eval('#custom-title', el => el.value);
  logger.log(`Long title length: ${displayedTitle.length} characters`);
  
  logger.success('Long inputs testing completed successfully');
}

/**
 * Test special characters
 */
async function testSpecialCharacters(page) {
  logger.log('Testing Special Characters');
  
  // Generate a title with special characters from edge cases
  const specialTitle = edgeCases.specialCharacters.topic || 'Special Characters: !@#$%^&*()_+{}|:"<>?~`-=[]\\;\',./';
  
  // Enter custom title
  await page.click('button:has-text("Custom Title")');
  await page.evaluate(() => document.getElementById('custom-title').value = '');
  await page.type('#custom-title', specialTitle);
  
  // Take screenshot
  await takeScreenshot(page, 'special-characters');
  
  // Check if the special characters were handled properly
  const displayedTitle = await page.$eval('#custom-title', el => el.value);
  logger.log(`Special characters title: ${displayedTitle}`);
  
  logger.success('Special characters testing completed successfully');
}

/**
 * Test different article types
 */
async function testDifferentArticleTypes(page) {
  logger.log('Testing Different Article Types');
  
  // Test each article type from test data
  const articleTypeNames = articleTypes.map(type => type.name).filter(name => name !== 'Blog Post');
  
  for (const type of articleTypeNames) {
    // Refresh the page to start fresh
    await page.reload();
    await page.waitForSelector('button:has-text("Blog Post")', { timeout: config.timeout });
    
    // Select the article type
    await page.click(`button:has-text("${type}")`);
    logger.log(`Selected article type: ${type}`);
    
    // Generate topics for this type
    await page.click('button:has-text("Generate Topics")');
    
    // Wait for topics to be generated
    await page.waitForSelector('.topic-suggestion', { timeout: config.timeout });
    
    // Take screenshot
    await takeScreenshot(page, `article-type-${type.toLowerCase().replace(/\s+/g, '-')}`);
    
    // Count topics
    const topicElements = await page.$$('.topic-suggestion');
    logger.log(`Generated ${topicElements.length} topics for ${type}`);
  }
  
  logger.success('Different article types testing completed successfully');
}

/**
 * Helper function to verify the current step
 */
async function verifyCurrentStep(page, expectedStep) {
  const currentStep = await page.$eval('.current-step', el => parseInt(el.getAttribute('data-step')));
  if (currentStep !== expectedStep) {
    throw new Error(`Expected to be on step ${expectedStep}, but found step ${currentStep}`);
  }
  logger.log(`Verified current step is ${expectedStep}`);
}

/**
 * Helper function to take a screenshot
 */
async function takeScreenshot(page, name) {
  const screenshotPath = path.join(config.screenshots, `${name}-${Date.now()}.png`);
  await page.screenshot({ path: screenshotPath, fullPage: true });
  logger.log(`Screenshot saved: ${screenshotPath}`);
}

// Run the tests
runTests().catch(error => {
  console.error('Test execution failed:', error);
  process.exit(1);
});