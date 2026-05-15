import React from 'react';
import LiteraryCollectionPage from '../components/literary/LiteraryCollectionPage';
import { APP_ROUTES, buildAppUrl } from '../config/site';
import { poems } from '../data/poetryData';

const TEXT = {
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
    translateHint: 'tap a phrase to translate',
  },
};

function getContextText(poem, lang) {
  return lang === 'zh' ? poem.context : poem.contextEn;
}

function getClaudeText(poem, lang) {
  return lang === 'zh' ? poem.claudeZh : poem.claudeEn;
}

function buildCopyText(poem) {
  return `《${poem.title}》\n${poem.lines.join('\n')}`;
}

function buildAiPrompt(poem, lang) {
  return lang === 'zh'
    ? `请翻译以下这首诗，并对其进行详细赏析，涵盖主题、情感基调、艺术手法、文化背景等方面：\n\n《${poem.title}》\n${poem.lines.join('\n')}`
    : `Please translate this Chinese poem into English and provide a detailed commentary, covering themes, emotional tone, literary techniques, and cultural context:\n\n《${poem.title}》\n${poem.lines.join('\n')}`;
}

function renderPoetryTitle(poem) {
  return <>《{poem.title}》</>;
}

const PoetryCollectionPage = ({ lang = 'zh' }) => (
  <LiteraryCollectionPage
    buildAiPrompt={buildAiPrompt}
    buildCopyText={buildCopyText}
    getClaudeText={getClaudeText}
    getContextText={getContextText}
    items={poems}
    lang={lang}
    renderTitle={renderPoetryTitle}
    seo={{
      title: lang === 'zh' ? '诗 — Alex Gao' : 'Poetry — Alex Gao',
      description: 'Poetry by Alex Gao (alexgaoth).',
      keywords: ['Alex Gao', 'alexgaoth', 'poetry', '诗', 'Chinese poetry'],
      path: lang === 'zh' ? APP_ROUTES.poetry : APP_ROUTES.poetryEn,
      backPath: APP_ROUTES.art,
      alternates: [
        { hrefLang: 'zh', href: buildAppUrl(APP_ROUTES.poetry) },
        { hrefLang: 'en', href: buildAppUrl(APP_ROUTES.poetryEn) },
        { hrefLang: 'x-default', href: buildAppUrl(APP_ROUTES.poetry) },
      ],
    }}
    text={TEXT[lang]}
    togglePath={lang === 'zh' ? APP_ROUTES.poetryEn : APP_ROUTES.poetry}
  />
);

export default PoetryCollectionPage;
