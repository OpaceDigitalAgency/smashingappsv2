const fs = require('fs');

// Test the home-chores page
const htmlPath = '/Users/davidbryan/Dropbox/Opace-Sales-Marketing/AI Tools/smashing-apps-oop/dist/tools/task-smasher/home-chores/index.html';
const html = fs.readFileSync(htmlPath, 'utf8');

console.log('🔍 SEO Verification for Home Chores Page');
console.log('==========================================');

// Check title tag
const titleMatch = html.match(/<title>([^<]*)<\/title>/);
if (titleMatch) {
  console.log('✅ Title:', titleMatch[1]);
} else {
  console.log('❌ Title: NOT FOUND');
}

// Check meta description
const descMatch = html.match(/<meta name="description" content="([^"]*)"/);
if (descMatch) {
  console.log('✅ Description:', descMatch[1]);
} else {
  console.log('❌ Description: NOT FOUND');
}

// Check canonical URL
const canonicalMatch = html.match(/<link rel="canonical" href="([^"]*)"/);
if (canonicalMatch) {
  console.log('✅ Canonical:', canonicalMatch[1]);
} else {
  console.log('❌ Canonical: NOT FOUND');
}

// Check Open Graph title
const ogTitleMatch = html.match(/<meta property="og:title" content="([^"]*)"/);
if (ogTitleMatch) {
  console.log('✅ OG Title:', ogTitleMatch[1]);
} else {
  console.log('❌ OG Title: NOT FOUND');
}

// Check Twitter Card title
const twitterTitleMatch = html.match(/<meta name="twitter:title" content="([^"]*)"/);
if (twitterTitleMatch) {
  console.log('✅ Twitter Title:', twitterTitleMatch[1]);
} else {
  console.log('❌ Twitter Title: NOT FOUND');
}

// Check structured data
const structuredDataMatch = html.match(/<script type="application\/ld\+json">\s*({[\s\S]*?})\s*<\/script>/);
if (structuredDataMatch) {
  try {
    const data = JSON.parse(structuredDataMatch[1]);
    console.log('✅ Structured Data:', data['@type'], '-', data.name || 'No name');
  } catch (e) {
    console.log('❌ Structured Data: INVALID JSON');
  }
} else {
  console.log('❌ Structured Data: NOT FOUND');
}

// Check fallback content
const fallbackMatch = html.match(/<h1>([^<]*)<\/h1>/);
if (fallbackMatch) {
  console.log('✅ Fallback H1:', fallbackMatch[1]);
} else {
  console.log('❌ Fallback H1: NOT FOUND');
}

console.log('\n🎉 SEO verification complete!');
