const fs = require('fs');

const pages = [
  {
    name: 'Home Chores',
    path: '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/task-smasher/home-chores/index.html',
    expectedTitle: 'Home Chores | Free AI Planner & Magic To-Do Lists - TaskSmasher'
  },
  {
    name: 'Daily Organizer',
    path: '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/task-smasher/daily-organizer/index.html',
    expectedTitle: 'Daily Organizer | Free AI Planner & Magic To-Do Lists - TaskSmasher'
  },
  {
    name: 'Article Smasher',
    path: '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/article-smasher/index.html',
    expectedTitle: 'ArticleSmasher - AI Content Creator | Blog Posts, SEO Articles & Academic Papers'
  }
];

console.log('🔍 Multi-Page SEO Verification');
console.log('===============================\n');

pages.forEach(page => {
  console.log(`📄 Testing: ${page.name}`);
  
  if (!fs.existsSync(page.path)) {
    console.log('❌ File does not exist\n');
    return;
  }
  
  const html = fs.readFileSync(page.path, 'utf8');
  
  // Check title
  const titleMatch = html.match(/<title>([^<]*)<\/title>/);
  if (titleMatch && titleMatch[1] === page.expectedTitle) {
    console.log('✅ Title: CORRECT');
  } else {
    console.log('❌ Title:', titleMatch ? titleMatch[1] : 'NOT FOUND');
    console.log('   Expected:', page.expectedTitle);
  }
  
  // Check meta description exists
  const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
  console.log(descMatch ? '✅ Description: EXISTS' : '❌ Description: NOT FOUND');
  
  // Check canonical exists
  const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
  console.log(canonicalMatch ? '✅ Canonical: EXISTS' : '❌ Canonical: NOT FOUND');
  
  // Check structured data exists
  const structuredDataMatch = html.match(/<script type="application\/ld\+json">/);
  console.log(structuredDataMatch ? '✅ Structured Data: EXISTS' : '❌ Structured Data: NOT FOUND');
  
  console.log('');
});

console.log('🎉 Multi-page verification complete!');
