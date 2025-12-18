const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Paths
const THOUGHTS_DIR = path.join(__dirname, '../src/data/thoughts');
const OUTPUT_FILE = path.join(__dirname, '../src/data/thoughtsIndex.js');

// Common stopwords to filter out from tags
const STOPWORDS = new Set([
  'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from', 'has', 'he',
  'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the', 'to', 'was', 'will',
  'with', 'this', 'but', 'they', 'have', 'had', 'what', 'when', 'where', 'who',
  'which', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
  'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so',
  'than', 'too', 'very', 'can', 'could', 'should', 'would', 'may', 'might',
  'must', 'shall', 'been', 'being', 'do', 'does', 'did', 'doing', 'or', 'if',
  'because', 'while', 'during', 'before', 'after', 'above', 'below', 'between',
  'through', 'into', 'out', 'over', 'under', 'again', 'further', 'then', 'once'
]);

// Calculate reading time based on word count
function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 225); // avg reading speed
  return `${minutes} min read`;
}

// Extract title from first # heading
function extractTitle(content) {
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : 'Untitled';
}

// Extract first paragraph after first heading as excerpt
function extractExcerpt(content) {
  // Remove the first heading
  const withoutTitle = content.replace(/^#\s+.+$/m, '').trim();
  // Get first non-empty paragraph
  const paragraphs = withoutTitle.split(/\n\n+/).filter(p => p.trim() && !p.trim().startsWith('#'));
  return paragraphs[0] ? paragraphs[0].trim().substring(0, 200) : 'No excerpt available';
}

// Extract top N most common non-stopwords as tags
function extractTags(content, n = 3) {
  const words = content.toLowerCase()
    .replace(/[^a-z\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 3 && !STOPWORDS.has(word));

  // Count word frequencies
  const freq = {};
  words.forEach(word => {
    freq[word] = (freq[word] || 0) + 1;
  });

  // Sort by frequency and get top N
  const topWords = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));

  return topWords.length > 0 ? topWords : ['Uncategorized'];
}

// Auto-generate frontmatter for files without it
function ensureFrontmatter(filePath, fileContent) {
  const parsed = matter(fileContent);

  // If frontmatter exists and has all required fields, return as-is
  if (parsed.data.title && parsed.data.date && parsed.data.excerpt && parsed.data.image && parsed.data.tags) {
    return { data: parsed.data, content: parsed.content };
  }

  // Generate missing frontmatter
  const content = parsed.content || fileContent;
  const generatedData = {
    title: parsed.data.title || extractTitle(content),
    date: parsed.data.date || new Date().toISOString().split('T')[0],
    excerpt: parsed.data.excerpt || extractExcerpt(content),
    image: parsed.data.image || '/resources/default.jpg',
    tags: parsed.data.tags || extractTags(content)
  };

  // Merge with any existing frontmatter
  const finalData = { ...generatedData, ...parsed.data };

  // Write the updated file with frontmatter
  const updatedContent = matter.stringify(content, finalData);
  fs.writeFileSync(filePath, updatedContent, 'utf-8');

  console.log(`   ✏️  Auto-generated frontmatter for ${path.basename(filePath)}`);

  return { data: finalData, content };
}

// Generate the thoughtsIndex.js file
function generateThoughtsIndex() {
  console.log(' Scanning for markdown files...');

  // Read all .md files from the thoughts directory
  const files = fs.readdirSync(THOUGHTS_DIR)
    .filter(file => file.endsWith('.md'))
    .sort();

  if (files.length === 0) {
    console.warn('  No markdown files found in', THOUGHTS_DIR);
    return;
  }

  console.log(` Found ${files.length} article(s)`);

  // Parse each markdown file
  const articles = files.map(filename => {
    const filePath = path.join(THOUGHTS_DIR, filename);
    const fileContent = fs.readFileSync(filePath, 'utf-8');

    // Ensure frontmatter exists (auto-generate if missing)
    const { data, content } = ensureFrontmatter(filePath, fileContent);

    // Calculate read time
    const readTime = calculateReadTime(content);

    // Create sanitized variable name from filename
    const varName = filename
      .replace('.md', '')
      .replace(/[^a-zA-Z0-9]/g, '_')
      .replace(/^(\d)/, '_$1'); // Prefix with _ if starts with number

    return {
      filename,
      varName,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      image: data.image,
      tags: data.tags,
      readTime,
      content
    };
  });

  // Sort articles by date (newest first)
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Generate article objects with metadata and embedded content
  const articleObjects = articles.map(article => {
    const tagsStr = JSON.stringify(article.tags);
    // Escape backticks and ${} in the markdown content for template literal
    const escapedContent = article.content
      .replace(/\\/g, '\\\\')
      .replace(/`/g, '\\`')
      .replace(/\$/g, '\\$');

    return `  {
    title: "${article.title}",
    date: "${article.date}",
    excerpt: "${article.excerpt}",
    image: "${article.image}",
    readTime: "${article.readTime}",
    tags: ${tagsStr},
    articleFile: { content: \`${escapedContent}\` }
  }`;
  }).join(',\n');

  // Generate the output file
  const output = `// AUTO-GENERATED FILE - DO NOT EDIT MANUALLY
// This file is generated by scripts/generate-thoughts-index.js
// Run 'npm run generate-thoughts' to regenerate

export const thoughtsIndex = [
${articleObjects}
];

export const getLatestThought = () => {
  return thoughtsIndex[0];
};
`;

  // Write the file
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');

  console.log('✅ Successfully generated thoughtsIndex.js');
  console.log(`   - ${articles.length} article(s) indexed`);
  console.log(`   - Latest: "${articles[0].title}" (${articles[0].date})`);
}

// Run the generator
try {
  generateThoughtsIndex();
} catch (error) {
  console.error('❌ Error generating thoughts index:', error);
  process.exit(1);
}
