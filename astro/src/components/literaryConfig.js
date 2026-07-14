// Static-port mirror of the per-collection config in
// main-section/src/pages/PoetryCollectionPage.jsx and CiCollectionPage.jsx:
// UI strings plus the copy-text / AI-prompt builders each page hands to
// LiteraryCollectionPage. Kept in one module so /poetry and /poetry/en (and
// /ci and /ci/en) cannot drift apart.
//
// Note: the CRA English pages also carry a `translateHint` string ("tap a
// phrase to translate") for the JS tap-to-reveal translations. The static
// pages render every translation expanded in the source HTML, so that hint
// would describe an interaction that no longer exists and is omitted here.

export const POETRY_TEXT = {
  zh: {
    pageTitle: '诗',
    langToggle: 'English →',
    abstract: '诗者，心之声也；今者，尘之扰也。以声涤尘，可得片刻真我。此辑主要收录我舞勺之年前后所作。 拙作待正。',
    contextLabel: '背景与感想',
    claudeLabel: 'Claude 评',
    aiToastMsg: 'AI提示词已复制，正在跳转……',
    footerNote: '点击AI图标后，将自动复制提示词，打开对应模型后粘贴即可。',
  },
  en: {
    pageTitle: 'Poetry',
    langToggle: '中文 →',
    abstract: 'Most of these Poems I wrote around age 15, the overarching context is mostly: covid, abroad in the UK, has way too much free time on my hands.',
    contextLabel: 'Context & Notes',
    claudeLabel: 'What Claude thinks',
    aiToastMsg: 'Prompt copied. Opening AI…',
    footerNote: 'Clicking an AI icon copies a translation & commentary prompt to your clipboard. Paste it after the tab opens.',
  },
};

export const CI_TEXT = {
  zh: {
    pageTitle: '词',
    langToggle: 'English →',
    abstract: '词体以长短句为形，宜于抒怀、叙事与议论。此辑主要收录我舞勺之年前后所作。 由此呈上。',
    contextLabel: '背景与感想',
    claudeLabel: 'Claude 评',
    aiToastMsg: 'AI提示词已复制，正在跳转……',
    footerNote: '点击AI图标后，将自动复制提示词，打开对应模型后粘贴即可。',
    emptyTitle: '暂无内容',
    emptyText: '词作整理中，敬请期待。',
  },
  en: {
    pageTitle: 'Ci Poetry',
    langToggle: '中文 →',
    abstract: 'Ci is a classical Chinese form with varying line lengths, historically composed to music. This collection spans philosophical argument, dynastic panorama, and wuxia narrative. It is also mostly written around when I am 15, it carries generally a more nuanced message compared to the poems.',
    contextLabel: 'Context & Notes',
    claudeLabel: 'What Claude thinks',
    aiToastMsg: 'Prompt copied. Opening AI…',
    footerNote: 'Clicking an AI icon copies a translation & commentary prompt to your clipboard. Paste it after the tab opens.',
    emptyTitle: 'No Content Yet',
    emptyText: 'Ci pieces are being compiled. Check back soon.',
  },
};

export function buildPoetryCopyText(poem) {
  return `《${poem.title}》\n${poem.lines.join('\n')}`;
}

export function buildPoetryAiPrompt(poem, lang) {
  return lang === 'zh'
    ? `请翻译以下这首诗，并对其进行详细赏析，涵盖主题、情感基调、艺术手法、文化背景等方面：\n\n《${poem.title}》\n${poem.lines.join('\n')}`
    : `Please translate this Chinese poem into English and provide a detailed commentary, covering themes, emotional tone, literary techniques, and cultural context:\n\n《${poem.title}》\n${poem.lines.join('\n')}`;
}

function ciTitleLine(piece) {
  return piece.tune ? `《${piece.title}》（${piece.tune}）` : `《${piece.title}》`;
}

export function buildCiCopyText(piece) {
  return `${ciTitleLine(piece)}\n${piece.lines.join('\n')}`;
}

export function buildCiAiPrompt(piece, lang) {
  return lang === 'zh'
    ? `请翻译以下这首词，并对其进行详细赏析，涵盖主题、情感基调、艺术手法等方面：\n\n${ciTitleLine(piece)}\n${piece.lines.join('\n')}`
    : `Please translate this Chinese ci poem into English and provide a detailed commentary, covering themes, emotional tone, and literary techniques:\n\n${ciTitleLine(piece)}\n${piece.lines.join('\n')}`;
}

// CreativeWork JSON-LD for the literary collection pages (SEO-PLAN 3.5).
// Boring and truthful: mirrors only what the page itself shows.
export function buildCollectionSchema({ name, description, url, inLanguage, genre }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name,
    description,
    url,
    inLanguage,
    genre,
    author: {
      '@type': 'Person',
      name: 'Alex Gao',
      alternateName: 'alexgaoth',
      url: 'https://alexgaoth.com',
    },
  };
}
