/**
 * Response Formatter Utility
 *
 * Handles cleaning and formatting AI responses from different models
 * to ensure consistent output across GPT-5, GPT-4, O-series, Claude, etc.
 *
 * This utility addresses issues where different models return responses with:
 * - Different formatting (bullets, numbers, asterisks, quotes)
 * - Prompt echoes mixed with results
 * - Inconsistent line breaks and separators
 */

/**
 * Common acronyms and technical terms that should be uppercase
 */
const COMMON_ACRONYMS = [
  'AI', 'SEO', 'API', 'URL', 'HTML', 'CSS', 'JS', 'PHP', 'SQL', 'CMS',
  'UI', 'UX', 'CTA', 'ROI', 'KPI', 'B2B', 'B2C', 'SaaS', 'PaaS', 'IaaS',
  'CRM', 'ERP', 'FAQ', 'PDF', 'JSON', 'XML', 'HTTP', 'HTTPS', 'FTP',
  'SSH', 'SSL', 'TLS', 'DNS', 'CDN', 'VPN', 'IP', 'TCP', 'UDP',
  'AWS', 'GCP', 'Azure', 'iOS', 'Android', 'macOS', 'Windows', 'Linux',
  'WordPress', 'WooCommerce', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis'
];

/**
 * Preserve proper capitalisation for common acronyms and technical terms
 */
const preserveAcronymCapitalisation = (text: string): string => {
  let result = text;

  COMMON_ACRONYMS.forEach(acronym => {
    // Create a case-insensitive regex to match the acronym as a whole word
    const regex = new RegExp(`\\b${acronym}\\b`, 'gi');
    result = result.replace(regex, acronym);
  });

  return result;
};

/**
 * Clean AI response text by removing common formatting artifacts
 * and prompt echoes that some models include in their responses
 */
export const cleanAIResponse = (text: string): string => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  let cleaned = text;

  // Remove common prompt echoes that models sometimes include
  // These patterns match phrases like "Here are 5 SEO-friendly..." or "Certainly! Here are..."
  const promptEchoes = [
    /^(Here are|Here's|Certainly!?\s*Here are|Sure!?\s*Here are|Below are|I've created|I've generated|I'll provide|Let me provide)\s+\d*\s*(engaging|SEO-friendly|comprehensive|detailed)?\s*(blog post|article|topic)?\s*(ideas?|suggestions?|titles?|topics?)[\s:]+/gim,
    /^(Certainly|Sure|Of course|Absolutely|Great|Excellent)!?\s*/gim,
    /^(Here are|Below are|I've created|I've generated)\s+/gim,
  ];

  promptEchoes.forEach(pattern => {
    cleaned = cleaned.replace(pattern, '');
  });

  // Remove markdown code blocks if present
  cleaned = cleaned.replace(/```[\w]*\n?/g, '');

  // Remove excessive whitespace but preserve intentional line breaks
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n');

  // Remove Unicode quotes and special characters that some models add
  // Replace curly quotes with straight quotes, then remove them
  cleaned = cleaned.replace(/[\u201C\u201D\u201E\u201F\u2033\u2036]/g, '"'); // Double curly quotes
  cleaned = cleaned.replace(/[\u2018\u2019\u201A\u201B\u2032\u2035]/g, "'"); // Single curly quotes

  return cleaned.trim();
};

/**
 * Parse a list from AI response text
 * Handles various formats:
 * - Numbered lists (1. 2. 3.)
 * - Bullet points (- * •)
 * - Quoted items ("item" or 'item')
 * - Plain lines separated by newlines
 * - Mixed formats from GPT-5 and other models
 */
export const parseListFromResponse = (text: string, options: {
  maxItems?: number;
  minLength?: number;
  removeFormatting?: boolean;
} = {}): string[] => {
  const {
    maxItems = 10,
    minLength = 3,
    removeFormatting = true
  } = options;

  if (!text || typeof text !== 'string') {
    return [];
  }

  // First, clean the response
  const cleaned = cleanAIResponse(text);

  // Split by various separators
  // Handle both \n and \\n (escaped newlines that some models return)
  let lines = cleaned
    .replace(/\\n/g, '\n')  // Convert escaped newlines to actual newlines
    .split(/\n+/)
    .map(line => line.trim())
    .filter(line => line.length > 0);

  const items: string[] = [];

  for (const line of lines) {
    // Skip lines that look like section headers or instructions
    if (
      /^(keywords?|topics?|titles?|suggestions?|ideas?|primary keyword)[\s:]/i.test(line) ||
      /^(step \d+|section \d+|part \d+)/i.test(line)
    ) {
      continue;
    }

    let item = line;

    // Remove various list markers and formatting
    if (removeFormatting) {
      // Remove numbered list markers (1. 2. 3. or 1) 2) 3))
      item = item.replace(/^\d+[\.\)]\s*/, '');

      // Remove bullet points (-, *, •, ◦, ▪, ▫)
      item = item.replace(/^[\-\*•◦▪▫]\s*/, '');

      // Remove markdown bold/italic markers (**text** or *text* or __text__)
      item = item.replace(/^\*\*(.+?)\*\*$/, '$1');
      item = item.replace(/^__(.+?)__$/, '$1');
      item = item.replace(/^\*(.+?)\*$/, '$1');
      item = item.replace(/^_(.+?)_$/, '$1');

      // Remove surrounding quotes (both single, double, and curly quotes)
      item = item.replace(/^["'\u201C\u201D\u2018\u2019](.+?)["'\u201C\u201D\u2018\u2019]$/g, '$1');

      // Remove quotes at the beginning or end even if not paired
      item = item.replace(/^["'\u201C\u201D\u2018\u2019]+/, '');
      item = item.replace(/["'\u201C\u201D\u2018\u2019]+$/, '');

      // Remove "Primary keyword:" or similar prefixes
      item = item.replace(/^(Primary keyword|Keyword|Topic|Title)[\s:]+/i, '');

      // Remove asterisks used for emphasis (not already caught by markdown removal)
      item = item.replace(/\*\*/g, '');
      item = item.replace(/\*/g, '');

      // Clean up any remaining excessive whitespace
      item = item.replace(/\s+/g, ' ').trim();
    }

    // Only add items that meet minimum length requirement
    if (item.length >= minLength) {
      items.push(item);
    }

    // Stop if we've reached max items
    if (items.length >= maxItems) {
      break;
    }
  }

  return items;
};

/**
 * Parse topics specifically from AI response
 * This is a specialized version of parseListFromResponse for topic generation
 */
export const parseTopicsFromResponse = (text: string, maxTopics: number = 5): string[] => {
  const topics = parseListFromResponse(text, {
    maxItems: maxTopics,
    minLength: 10, // Topics should be reasonably descriptive
    removeFormatting: true
  });

  // Additional cleaning specific to topics
  return topics.map(topic => {
    // Remove any remaining "Primary keyword:" annotations that might be on the same line
    let cleaned = topic.split(/\n/)[0]; // Take only first line if multi-line

    // Remove trailing metadata like "(Primary keyword: xyz)" or "Keywords: xyz"
    cleaned = cleaned.replace(/\s*\([^)]*keyword[^)]*\)\s*$/i, '');
    cleaned = cleaned.replace(/\s*Keywords?:\s*.+$/i, '');

    // Remove any remaining quotes (curly or straight)
    cleaned = cleaned.replace(/^["'\u201C\u201D\u2018\u2019]+/, '');
    cleaned = cleaned.replace(/["'\u201C\u201D\u2018\u2019]+$/, '');

    // Remove asterisks and other markdown formatting
    cleaned = cleaned.replace(/\*\*/g, '');
    cleaned = cleaned.replace(/\*/g, '');
    cleaned = cleaned.replace(/__/g, '');
    cleaned = cleaned.replace(/_/g, '');

    // Preserve proper capitalisation for acronyms
    cleaned = preserveAcronymCapitalisation(cleaned);

    return cleaned.trim();
  }).filter(topic => topic.length >= 10); // Ensure minimum length after cleaning
};

/**
 * Parse keywords from AI response
 * Handles both simple lists and structured keyword data
 */
export const parseKeywordsFromResponse = (text: string): Array<{
  keyword: string;
  volume?: number;
  difficulty?: number;
  cpc?: number;
}> => {
  const cleaned = cleanAIResponse(text);
  const lines = cleaned.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  
  const keywords: Array<{
    keyword: string;
    volume?: number;
    difficulty?: number;
    cpc?: number;
  }> = [];
  
  let currentKeyword: {
    keyword: string;
    volume?: number;
    difficulty?: number;
    cpc?: number;
  } | null = null;

  for (const line of lines) {
    // Skip obvious headers
    if (/^(keywords?|search terms?|seo keywords?)[\s:]/i.test(line)) {
      continue;
    }

    // Try to match a keyword line (numbered, bulleted, or bold)
    const keywordMatch = line.match(/^(?:\d+[\.\)]\s*)?(?:[\-\*•]\s*)?(?:\*\*)?([^*\n]+?)(?:\*\*)?$/);

    if (keywordMatch) {
      let potentialKeyword = keywordMatch[1].trim();

      // Remove any inline metadata that might be on the same line
      // e.g., "keyword | Volume: High | Difficulty: 8/10 | CPC: $5.50"
      potentialKeyword = potentialKeyword.split(/\s*\|\s*/)[0].trim();

      // Remove trailing metadata in parentheses or brackets
      potentialKeyword = potentialKeyword.replace(/\s*[\(\[].*?[\)\]]\s*$/g, '');

      // Remove quotes
      potentialKeyword = potentialKeyword.replace(/^["'\u201C\u201D\u2018\u2019]+/, '');
      potentialKeyword = potentialKeyword.replace(/["'\u201C\u201D\u2018\u2019]+$/, '');

      // Check if this looks like metadata (volume, difficulty, cpc)
      const isMetadata = /^(search volume|difficulty|cpc|volume|score)/i.test(potentialKeyword);

      if (!isMetadata && potentialKeyword.length > 2 && potentialKeyword.length < 100) {
        // Save previous keyword if exists
        if (currentKeyword) {
          keywords.push(currentKeyword);
        }

        // Start new keyword
        currentKeyword = {
          keyword: potentialKeyword,
          volume: 500,
          difficulty: 5,
          cpc: 3.0
        };
      }
    }
    
    // Try to extract metadata for current keyword
    if (currentKeyword) {
      const volumeMatch = line.match(/(?:search\s+)?volume[\s:]+(\w+|\d+)/i);
      if (volumeMatch) {
        const vol = volumeMatch[1].toLowerCase();
        currentKeyword.volume = vol === 'high' ? 1000 : vol === 'medium' ? 500 : vol === 'low' ? 100 : parseInt(vol) || 500;
      }
      
      const difficultyMatch = line.match(/difficulty(?:\s+score)?[\s:]+(\d+)/i);
      if (difficultyMatch) {
        currentKeyword.difficulty = parseInt(difficultyMatch[1]) || 5;
      }
      
      const cpcMatch = line.match(/cpc(?:\s+value)?[\s:]+\$?(\d+\.?\d*)/i);
      if (cpcMatch) {
        currentKeyword.cpc = parseFloat(cpcMatch[1]) || 3.0;
      }
    }
  }
  
  // Don't forget the last keyword
  if (currentKeyword) {
    keywords.push(currentKeyword);
  }
  
  return keywords;
};

/**
 * Parse outline items from AI response
 * Handles markdown headings and various outline formats
 */
export const parseOutlineFromResponse = (text: string): Array<{
  id: string;
  title: string;
  level: number;
  children: any[];
}> => {
  const cleaned = cleanAIResponse(text);
  const lines = cleaned.split(/\n+/).map(l => l.trim()).filter(l => l.length > 0);
  
  const outline: Array<{
    id: string;
    title: string;
    level: number;
    children: any[];
  }> = [];
  
  const stack: Array<{
    id: string;
    title: string;
    level: number;
    children: any[];
  }> = [];
  
  lines.forEach((line, index) => {
    // Skip lines that don't look like outline items
    if (line.length < 3) return;
    
    let level = 1;
    let title = line;
    
    // Check for markdown headings (# ## ###)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      level = headingMatch[1].length;
      title = headingMatch[2];
    } else {
      // Check for numbered outlines (1. A. i.)
      const numberedMatch = line.match(/^([IVXivx]+|\d+|[A-Za-z])[\.\)]\s+(.+)$/);
      if (numberedMatch) {
        const marker = numberedMatch[1];
        title = numberedMatch[2];
        
        // Determine level based on marker type
        if (/^[IVX]+$/.test(marker)) level = 1;
        else if (/^[ivx]+$/.test(marker)) level = 3;
        else if (/^\d+$/.test(marker)) level = 1;
        else if (/^[A-Z]$/.test(marker)) level = 2;
        else if (/^[a-z]$/.test(marker)) level = 3;
      } else {
        // Check for bullet points
        const bulletMatch = line.match(/^[\-\*•]\s+(.+)$/);
        if (bulletMatch) {
          title = bulletMatch[1];
          level = stack.length > 0 ? stack[stack.length - 1].level + 1 : 2;
        }
      }
    }
    
    // Clean the title
    title = title.replace(/^\*\*(.+?)\*\*$/, '$1').trim();

    // Remove quotes
    title = title.replace(/^["'\u201C\u201D\u2018\u2019]+/, '');
    title = title.replace(/["'\u201C\u201D\u2018\u2019]+$/, '');

    // Preserve proper capitalisation for common acronyms and technical terms
    title = preserveAcronymCapitalisation(title);

    const item = {
      id: `outline-${Date.now()}-${index}`,
      title,
      level,
      children: []
    };
    
    // Add to appropriate parent based on level
    if (level === 1) {
      outline.push(item);
      stack.length = 0;
      stack.push(item);
    } else {
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
      }
      
      if (stack.length === 0) {
        outline.push(item);
      } else {
        stack[stack.length - 1].children.push(item);
      }
      
      stack.push(item);
    }
  });
  
  return outline;
};

