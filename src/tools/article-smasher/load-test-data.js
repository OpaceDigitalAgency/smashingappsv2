/**
 * Test Data Loader for Article Smasher V2
 * 
 * This script loads test data from the test-data.json file and makes it available
 * for use in the test scripts.
 */

const fs = require('fs');
const path = require('path');

/**
 * Load test data from the JSON file
 */
function loadTestData() {
  try {
    const dataPath = path.join(__dirname, 'test-data.json');
    const rawData = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error loading test data:', error);
    return null;
  }
}

/**
 * Get article types from test data
 */
function getArticleTypes() {
  const data = loadTestData();
  return data ? data.articleTypes : [];
}

/**
 * Get topics for a specific article type
 */
function getTopics(articleType) {
  const data = loadTestData();
  if (!data || !data.topics) return [];
  
  return data.topics[articleType] || data.topics['blog-post'] || [];
}

/**
 * Get keywords from test data
 */
function getKeywords() {
  const data = loadTestData();
  if (!data || !data.keywords) return [];
  
  return Object.values(data.keywords);
}

/**
 * Get prompt templates from test data
 */
function getPromptTemplates() {
  const data = loadTestData();
  return data ? data.promptTemplates : [];
}

/**
 * Get test prompt variables
 */
function getTestPromptVariables() {
  const data = loadTestData();
  return data ? data.testPromptVariables : {};
}

/**
 * Get edge cases for testing
 */
function getEdgeCases() {
  const data = loadTestData();
  return data ? data.edgeCases : {};
}

/**
 * Get a random item from an array
 */
function getRandomItem(array) {
  if (!array || array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Get a random topic for a specific article type
 */
function getRandomTopic(articleType) {
  const topics = getTopics(articleType);
  return getRandomItem(topics);
}

/**
 * Get random keywords (specified number or 3 by default)
 */
function getRandomKeywords(count = 3) {
  const keywords = getKeywords();
  if (!keywords || keywords.length === 0) return [];
  
  const shuffled = [...keywords].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, keywords.length));
}

/**
 * Get a prompt template by category
 */
function getPromptTemplateByCategory(category) {
  const templates = getPromptTemplates();
  return templates.find(template => template.category === category) || null;
}

module.exports = {
  loadTestData,
  getArticleTypes,
  getTopics,
  getKeywords,
  getPromptTemplates,
  getTestPromptVariables,
  getEdgeCases,
  getRandomItem,
  getRandomTopic,
  getRandomKeywords,
  getPromptTemplateByCategory
};

// If this script is run directly, print the test data
if (require.main === module) {
  const data = loadTestData();
  console.log('Test data loaded:');
  console.log('Article Types:', data.articleTypes.length);
  console.log('Topics:', Object.keys(data.topics).length);
  console.log('Keywords:', Object.keys(data.keywords).length);
  console.log('Prompt Templates:', data.promptTemplates.length);
  console.log('Test Prompt Variables:', Object.keys(data.testPromptVariables).length);
  console.log('Edge Cases:', Object.keys(data.edgeCases).length);
}