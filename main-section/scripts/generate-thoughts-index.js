const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// Paths
const THOUGHTS_DIR = path.join(__dirname, '../src/data/thoughts');
const OUTPUT_FILE = path.join(__dirname, '../src/data/thoughtsIndex.js');

// Common stopwords to filter out from tags
const STOPWORDS = new Set([
  '0o', '0s', '3a', '3b', '3d', '6b', '6o', 'a', 'a1', 'a2', 'a3', 'a4', 'ab', 'able', 'about', 'above', 'abst', 'ac', 'accordance', 'according', 'accordingly', 'across', 'act', 'actually', 'ad', 'added', 'adj', 'ae', 'af', 'affected', 'affecting', 'affects', 'after', 'afterwards', 'ag', 'again', 'against', 'ah', 'ain', 'ain\'t', 'aj', 'al', 'all', 'allow', 'allows', 'almost', 'alone', 'along', 'already', 'also', 'although', 'always', 'am', 'among', 'amongst', 'amoungst', 'amount', 'an', 'and', 'announce', 'another', 'any', 'anybody', 'anyhow', 'anymore', 'anyone', 'anything', 'anyway', 'anyways', 'anywhere', 'ao', 'ap', 'apart', 'apparently', 'appear', 'appreciate', 'appropriate', 'approximately', 'ar', 'are', 'aren', 'arent', 'aren\'t', 'arise', 'around', 'as', 'a\'s', 'aside', 'ask', 'asking', 'associated', 'at', 'au', 'auth', 'av', 'available', 'aw', 'away', 'awfully', 'ax', 'ay', 'az', 'b', 'b1', 'b2', 'b3', 'ba', 'back', 'bc', 'bd', 'be', 'became', 'because', 'become', 'becomes', 'becoming', 'been', 'before', 'beforehand', 'begin', 'beginning', 'beginnings', 'begins', 'behind', 'being', 'believe', 'below', 'beside', 'besides', 'best', 'better', 'between', 'beyond', 'bi', 'bill', 'biol', 'bj', 'bk', 'bl', 'bn', 'both', 'bottom', 'bp', 'br', 'brief', 'briefly', 'bs', 'bt', 'bu', 'but', 'bx', 'by', 'c', 'c1', 'c2', 'c3', 'ca', 'call', 'came', 'can', 'cannot', 'cant', 'can\'t', 'cause', 'causes', 'cc', 'cd', 'ce', 'certain', 'certainly', 'cf', 'cg', 'ch', 'changes', 'ci', 'cit', 'cj', 'cl', 'clearly', 'cm', 'c\'mon', 'cn', 'co', 'com', 'come', 'comes', 'con', 'concerning', 'consequently', 'consider', 'considering', 'contain', 'containing', 'contains', 'corresponding', 'could', 'couldn', 'couldnt', 'couldn\'t', 'course', 'cp', 'cq', 'cr', 'cry', 'cs', 'c\'s', 'ct', 'cu', 'currently', 'cv', 'cx', 'cy', 'cz', 'd', 'd2', 'da', 'date', 'dc', 'dd', 'de', 'definitely', 'describe', 'described', 'despite', 'detail', 'df', 'di', 'did', 'didn', 'didn\'t', 'different', 'dj', 'dk', 'dl', 'do', 'does', 'doesn', 'doesn\'t', 'doing', 'don', 'done', 'don\'t', 'down', 'downwards', 'dp', 'dr', 'ds', 'dt', 'du', 'due', 'during', 'dx', 'dy', 'e', 'e2', 'e3', 'ea', 'each', 'ec', 'ed', 'edu', 'ee', 'ef', 'effect', 'eg', 'ei', 'eight', 'eighty', 'either', 'ej', 'el', 'eleven', 'else', 'elsewhere', 'em', 'empty', 'en', 'end', 'ending', 'enough', 'entirely', 'eo', 'ep', 'eq', 'er', 'es', 'especially', 'est', 'et', 'et-al', 'etc', 'eu', 'ev', 'even', 'ever', 'every', 'everybody', 'everyone', 'everything', 'everywhere', 'ex', 'exactly', 'example', 'except', 'ey', 'f', 'f2', 'fa', 'far', 'fc', 'few', 'ff', 'fi', 'fifteen', 'fifth', 'fify', 'fill', 'find', 'fire', 'first', 'five', 'fix', 'fj', 'fl', 'fn', 'fo', 'followed', 'following', 'follows', 'for', 'former', 'formerly', 'forth', 'forty', 'found', 'four', 'fr', 'from', 'front', 'fs', 'ft', 'fu', 'full', 'further', 'furthermore', 'fy', 'g', 'ga', 'gave', 'ge', 'get', 'gets', 'getting', 'gi', 'give', 'given', 'gives', 'giving', 'gj', 'gl', 'go', 'goes', 'going', 'gone', 'got', 'gotten', 'gr', 'greetings', 'gs', 'gy', 'h', 'h2', 'h3', 'had', 'hadn', 'hadn\'t', 'happens', 'hardly', 'has', 'hasn', 'hasnt', 'hasn\'t', 'have', 'haven', 'haven\'t', 'having', 'he', 'hed', 'he\'d', 'he\'ll', 'hello', 'help', 'hence', 'her', 'here', 'hereafter', 'hereby', 'herein', 'heres', 'here\'s', 'hereupon', 'hers', 'herself', 'hes', 'he\'s', 'hh', 'hi', 'hid', 'him', 'himself', 'his', 'hither', 'hj', 'ho', 'home', 'hopefully', 'how', 'howbeit', 'however', 'how\'s', 'hr', 'hs', 'http', 'hu', 'hundred', 'hy', 'i', 'i2', 'i3', 'i4', 'i6', 'i7', 'i8', 'ia', 'ib', 'ibid', 'ic', 'id', 'i\'d', 'ie', 'if', 'ig', 'ignored', 'ih', 'ii', 'ij', 'il', 'i\'ll', 'im', 'i\'m', 'immediate', 'immediately', 'importance', 'important', 'in', 'inasmuch', 'inc', 'indeed', 'index', 'indicate', 'indicated', 'indicates', 'information', 'inner', 'insofar', 'instead', 'interest', 'into', 'invention', 'inward', 'io', 'ip', 'iq', 'ir', 'is', 'isn', 'isn\'t', 'it', 'itd', 'it\'d', 'it\'ll', 'its', 'it\'s', 'itself', 'iv', 'i\'ve', 'ix', 'iy', 'iz', 'j', 'jj', 'jr', 'js', 'jt', 'ju', 'just', 'k', 'ke', 'keep', 'keeps', 'kept', 'kg', 'kj', 'km', 'know', 'known', 'knows', 'ko', 'l', 'l2', 'la', 'largely', 'last', 'lately', 'later', 'latter', 'latterly', 'lb', 'lc', 'le', 'least', 'les', 'less', 'lest', 'let', 'lets', 'let\'s', 'lf', 'like', 'liked', 'likely', 'line', 'little', 'lj', 'll', 'll', 'ln', 'lo', 'look', 'looking', 'looks', 'los', 'lr', 'ls', 'lt', 'ltd', 'm', 'm2', 'ma', 'made', 'mainly', 'make', 'makes', 'many', 'may', 'maybe', 'me', 'mean', 'means', 'meantime', 'meanwhile', 'merely', 'mg', 'might', 'mightn', 'mightn\'t', 'mill', 'million', 'mine', 'miss', 'ml', 'mn', 'mo', 'more', 'moreover', 'most', 'mostly', 'move', 'mr', 'mrs', 'ms', 'mt', 'mu', 'much', 'mug', 'must', 'mustn', 'mustn\'t', 'my', 'myself', 'n', 'n2', 'na', 'name', 'namely', 'nay', 'nc', 'nd', 'ne', 'near', 'nearly', 'necessarily', 'necessary', 'need', 'needn', 'needn\'t', 'needs', 'neither', 'never', 'nevertheless', 'new', 'next', 'ng', 'ni', 'nine', 'ninety', 'nj', 'nl', 'nn', 'no', 'nobody', 'non', 'none', 'nonetheless', 'noone', 'nor', 'normally', 'nos', 'not', 'noted', 'nothing', 'novel', 'now', 'nowhere', 'nr', 'ns', 'nt', 'ny', 'o', 'oa', 'ob', 'obtain', 'obtained', 'obviously', 'oc', 'od', 'of', 'off', 'often', 'og', 'oh', 'oi', 'oj', 'ok', 'okay', 'ol', 'old', 'om', 'omitted', 'on', 'once', 'one', 'ones', 'only', 'onto', 'oo', 'op', 'oq', 'or', 'ord', 'os', 'ot', 'other', 'others', 'otherwise', 'ou', 'ought', 'our', 'ours', 'ourselves', 'out', 'outside', 'over', 'overall', 'ow', 'owing', 'own', 'ox', 'oz', 'p', 'p1', 'p2', 'p3', 'page', 'pagecount', 'pages', 'par', 'part', 'particular', 'particularly', 'pas', 'past', 'pc', 'pd', 'pe', 'per', 'perhaps', 'pf', 'ph', 'pi', 'pj', 'pk', 'pl', 'placed', 'please', 'plus', 'pm', 'pn', 'po', 'poorly', 'possible', 'possibly', 'potentially', 'pp', 'pq', 'pr', 'predominantly', 'present', 'presumably', 'previously', 'primarily', 'probably', 'promptly', 'proud', 'provides', 'ps', 'pt', 'pu', 'put', 'py', 'q', 'qj', 'qu', 'que', 'quickly', 'quite', 'qv', 'r', 'r2', 'ra', 'ran', 'rather', 'rc', 'rd', 're', 'readily', 'really', 'reasonably', 'recent', 'recently', 'ref', 'refs', 'regarding', 'regardless', 'regards', 'related', 'relatively', 'research', 'research-articl', 'respectively', 'resulted', 'resulting', 'results', 'rf', 'rh', 'ri', 'right', 'rj', 'rl', 'rm', 'rn', 'ro', 'rq', 'rr', 'rs', 'rt', 'ru', 'run', 'rv', 'ry', 's', 's2', 'sa', 'said', 'same', 'saw', 'say', 'saying', 'says', 'sc', 'sd', 'se', 'sec', 'second', 'secondly', 'section', 'see', 'seeing', 'seem', 'seemed', 'seeming', 'seems', 'seen', 'self', 'selves', 'sensible', 'sent', 'serious', 'seriously', 'seven', 'several', 'sf', 'shall', 'shan', 'shan\'t', 'she', 'shed', 'she\'d', 'she\'ll', 'shes', 'she\'s', 'should', 'shouldn', 'shouldn\'t', 'should\'ve', 'show', 'showed', 'shown', 'showns', 'shows', 'si', 'side', 'significant', 'significantly', 'similar', 'similarly', 'since', 'sincere', 'six', 'sixty', 'sj', 'sl', 'slightly', 'sm', 'sn', 'so', 'some', 'somebody', 'somehow', 'someone', 'somethan', 'something', 'sometime', 'sometimes', 'somewhat', 'somewhere', 'soon', 'sorry', 'sp', 'specifically', 'specified', 'specify', 'specifying', 'sq', 'sr', 'ss', 'st', 'still', 'stop', 'strongly', 'sub', 'substantially', 'successfully', 'such', 'sufficiently', 'suggest', 'sup', 'sure', 'sy', 'system', 'sz', 't', 't1', 't2', 't3', 'take', 'taken', 'taking', 'tb', 'tc', 'td', 'te', 'tell', 'ten', 'tends', 'tf', 'th', 'than', 'thank', 'thanks', 'thanx', 'that', 'that\'ll', 'thats', 'that\'s', 'that\'ve', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'thence', 'there', 'thereafter', 'thereby', 'thered', 'therefore', 'therein', 'there\'ll', 'thereof', 'therere', 'theres', 'there\'s', 'thereto', 'thereupon', 'there\'ve', 'these', 'they', 'theyd', 'they\'d', 'they\'ll', 'theyre', 'they\'re', 'they\'ve', 'thickv', 'thin', 'think', 'third', 'this', 'thorough', 'thoroughly', 'those', 'thou', 'though', 'thoughh', 'thousand', 'three', 'throug', 'through', 'throughout', 'thru', 'thus', 'ti', 'til', 'tip', 'tj', 'tl', 'tm', 'tn', 'to', 'together', 'too', 'took', 'top', 'toward', 'towards', 'tp', 'tq', 'tr', 'tried', 'tries', 'truly', 'try', 'trying', 'ts', 't\'s', 'tt', 'tv', 'twelve', 'twenty', 'twice', 'two', 'tx', 'u', 'u201d', 'ue', 'ui', 'uj', 'uk', 'um', 'un', 'under', 'unfortunately', 'unless', 'unlike', 'unlikely', 'until', 'unto', 'uo', 'up', 'upon', 'ups', 'ur', 'us', 'use', 'used', 'useful', 'usefully', 'usefulness', 'uses', 'using', 'usually', 'ut', 'v', 'va', 'value', 'various', 'vd', 've', 've', 'very', 'via', 'viz', 'vj', 'vo', 'vol', 'vols', 'volumtype', 'vq', 'vs', 'vt', 'vu', 'w', 'wa', 'want', 'wants', 'was', 'wasn', 'wasnt', 'wasn\'t', 'way', 'we', 'wed', 'we\'d', 'welcome', 'well', 'we\'ll', 'well-b', 'went', 'were', 'we\'re', 'weren', 'werent', 'weren\'t', 'we\'ve', 'what', 'whatever', 'what\'ll', 'whats', 'what\'s', 'when', 'whence', 'whenever', 'when\'s', 'where', 'whereafter', 'whereas', 'whereby', 'wherein', 'wheres', 'where\'s', 'whereupon', 'wherever', 'whether', 'which', 'while', 'whim', 'whither', 'who', 'whod', 'whoever', 'whole', 'who\'ll', 'whom', 'whomever', 'whos', 'who\'s', 'whose', 'why', 'why\'s', 'wi', 'widely', 'will', 'willing', 'wish', 'with', 'within', 'without', 'wo', 'won', 'wonder', 'wont', 'won\'t', 'words', 'world', 'would', 'wouldn', 'wouldnt', 'wouldn\'t', 'www', 'x', 'x1', 'x2', 'x3', 'xf', 'xi', 'xj', 'xk', 'xl', 'xn', 'xo', 'xs', 'xt', 'xv', 'xx', 'y', 'y2', 'yes', 'yet', 'yj', 'yl', 'you', 'youd', 'you\'d', 'you\'ll', 'your', 'youre', 'you\'re', 'yours', 'yourself', 'yourselves', 'you\'ve', 'yr', 'ys', 'yt', 'z', 'zero', 'zi', 'zz'
]);

// Calculate reading time based on word count
function calculateReadTime(content) {
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 225); // avg reading speed
  return `${minutes} min read`;
}

// Generate URL-friendly slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
      slug: generateSlug(data.title),
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
    slug: "${article.slug}",
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
