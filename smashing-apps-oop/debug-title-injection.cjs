const fs = require('fs');

// Read the HTML file
const htmlPath = '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/task-smasher/home-chores/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('Original HTML head section:');
console.log(html.substring(0, 200));

// Test the regex pattern
const title = 'Home Chores | Free AI Planner & Magic To-Do Lists - TaskSmasher';
const regex = /(<head[^>]*>)/;
const match = html.match(regex);

console.log('\nRegex match result:');
console.log('Match found:', !!match);
if (match) {
  console.log('Matched text:', JSON.stringify(match[1]));
  console.log('Match index:', match.index);
}

// Try the replacement
const newHtml = html.replace(regex, `$1\n    <title>${title}</title>`);

console.log('\nAfter replacement, head section:');
console.log(newHtml.substring(0, 300));

// Check if title was added
const hasTitle = newHtml.includes('<title>');
console.log('\nTitle tag added:', hasTitle);

if (hasTitle) {
  const titleMatch = newHtml.match(/<title>([^<]*)<\/title>/);
  if (titleMatch) {
    console.log('Title content:', titleMatch[1]);
  }
}
