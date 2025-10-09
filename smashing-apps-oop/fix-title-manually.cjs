const fs = require('fs');

// Read the HTML file
const htmlPath = '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/task-smasher/home-chores/index.html';
let html = fs.readFileSync(htmlPath, 'utf8');

console.log('Before fix - has title tag:', html.includes('<title>'));

// Add title tag
const title = 'Home Chores | Free AI Planner & Magic To-Do Lists - TaskSmasher';
const regex = /(<head[^>]*>)/;
const newHtml = html.replace(regex, `$1\n    <title>${title}</title>`);

console.log('After fix - has title tag:', newHtml.includes('<title>'));

// Write back to file
fs.writeFileSync(htmlPath, newHtml);
console.log('File updated successfully');

// Verify the fix
const verifyHtml = fs.readFileSync(htmlPath, 'utf8');
console.log('Verification - has title tag:', verifyHtml.includes('<title>'));

if (verifyHtml.includes('<title>')) {
  const titleMatch = verifyHtml.match(/<title>([^<]*)<\/title>/);
  if (titleMatch) {
    console.log('Title content:', titleMatch[1]);
  }
}
