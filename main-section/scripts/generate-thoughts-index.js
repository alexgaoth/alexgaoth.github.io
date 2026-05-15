const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Paths
const THOUGHTS_DIR = path.join(__dirname, '../src/data/thoughts');
const OUTPUT_FILE = path.join(__dirname, '../src/data/thoughtsManifest.json');
const SITEMAP_FILE = path.join(__dirname, '../public/sitemap.xml');
const RSS_FILE = path.join(__dirname, '../public/rss.xml');
const PUBLIC_THOUGHTS_DIR = path.join(__dirname, '../public/content/thoughts');
const STATIC_ROUTES = require('../src/data/sitemapRoutes.json');
const APP_BASE_URL = 'https://alexgaoth.com';

function normaliseDateString(dateString) {
  const match = `${dateString}`.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (!match) {
    return `${dateString}`;
  }

  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

// Calculate reading time based on word count
function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 225); // avg reading speed
  return `${minutes} min read`;
}

function isValidExplicitDate(dateString) {
  if (typeof dateString !== 'string') {
    return false;
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
    return false;
  }

  const [year, month, day] = dateString.split('-').map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

function validateFrontmatter(filename, data, content) {
  const errors = [];

  if (!data || typeof data !== 'object') {
    return [`${filename}: frontmatter is missing or invalid.`];
  }

  if (typeof data.slug !== 'string' || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(data.slug)) {
    errors.push('`slug` must be a lowercase kebab-case string.');
  }

  if (typeof data.title !== 'string' || !data.title.trim()) {
    errors.push('`title` must be a non-empty string.');
  }

  if (!isValidExplicitDate(data.date)) {
    errors.push('`date` must use YYYY-MM-DD and be a valid calendar date.');
  }

  if (typeof data.excerpt !== 'string' || !data.excerpt.trim()) {
    errors.push('`excerpt` must be a non-empty string.');
  }

  if (typeof data.image !== 'string' || !data.image.startsWith('/')) {
    errors.push('`image` must be a root-relative path string.');
  }

  if (!Array.isArray(data.tags) || data.tags.length === 0 || data.tags.some((tag) => typeof tag !== 'string' || !tag.trim())) {
    errors.push('`tags` must be a non-empty array of strings.');
  }

  if (typeof content !== 'string' || !content.trim()) {
    errors.push('article body must not be empty.');
  }

  return errors.map((error) => `${filename}: ${error}`);
}

function escapeXml(value) {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toRfc822Date(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toUTCString();
}

function buildAbsoluteUrl(routePath) {
  return routePath === '/' ? `${APP_BASE_URL}/` : `${APP_BASE_URL}${routePath}`;
}

function writeManifest(articles) {
  fs.writeFileSync(OUTPUT_FILE, `${JSON.stringify(articles, null, 2)}\n`, 'utf-8');
  console.log('✅ Successfully generated thoughtsManifest.json');
  console.log(`   - ${articles.length} article(s) indexed`);
  console.log(`   - Latest: "${articles[0].title}" (${articles[0].date})`);
}

function writePublicThoughts(articles) {
  fs.rmSync(PUBLIC_THOUGHTS_DIR, { recursive: true, force: true });
  fs.mkdirSync(PUBLIC_THOUGHTS_DIR, { recursive: true });

  articles.forEach((article) => {
    fs.writeFileSync(
      path.join(PUBLIC_THOUGHTS_DIR, `${article.slug}.md`),
      article.content,
      'utf-8'
    );
  });

  console.log('✅ Successfully copied markdown files to public/content/thoughts');
}

function generateThoughtsArtifacts() {
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

    const { data, content } = matter(fileContent);
    const normalizedContent = `${content}`.replace(/^\n+/, '');
    const validationErrors = validateFrontmatter(filename, data, normalizedContent);

    if (validationErrors.length > 0) {
      throw new Error(validationErrors.join('\n'));
    }

    // Calculate read time
    const readTime = calculateReadTime(normalizedContent);

    return {
      filename,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      image: data.image,
      tags: data.tags,
      readTime,
      slug: data.slug,
      contentPath: `/content/thoughts/${data.slug}.md`,
      content: normalizedContent
    };
  });

  const slugSet = new Set();
  articles.forEach((article) => {
    if (slugSet.has(article.slug)) {
      throw new Error(`Duplicate slug detected: ${article.slug}`);
    }
    slugSet.add(article.slug);
  });

  // Sort articles by date (newest first)
  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  writeManifest(articles.map(({ content, ...article }) => article));
  writePublicThoughts(articles);
  generateSitemap(articles);
  generateRss(articles);
}

function generateSitemap(staticArticles) {
  const today = new Date().toISOString().split('T')[0];

  const staticEntries = STATIC_ROUTES.map((route) => `  <url>
    <loc>${buildAbsoluteUrl(route.path)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`);

  const thoughtEntries = staticArticles.map((article) => `  <url>
    <loc>${buildAbsoluteUrl(`/thoughts/${article.slug}`)}</loc>
    <lastmod>${normaliseDateString(article.date)}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...thoughtEntries].join('\n\n')}
</urlset>
`;

  fs.writeFileSync(SITEMAP_FILE, sitemap, 'utf-8');
  console.log(`✅ Successfully generated sitemap.xml`);
  console.log(`   - ${STATIC_ROUTES.length} static route(s)`);
  console.log(`   - ${staticArticles.length} thought route(s)`);
}

function generateRss(articles) {
  const items = articles.map((article) => {
    const articleUrl = buildAbsoluteUrl(`/thoughts/${article.slug}`);

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${toRfc822Date(article.date)}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Alex Gao Thoughts</title>
    <link>${buildAbsoluteUrl('/thoughts')}</link>
    <description>Writing by Alex Gao (alexgaoth).</description>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  fs.writeFileSync(RSS_FILE, rss, 'utf-8');
  console.log('✅ Successfully generated rss.xml');
}

// Run the generator
try {
  generateThoughtsArtifacts();
} catch (error) {
  console.error('❌ Error generating thoughts artifacts:', error);
  process.exit(1);
}
