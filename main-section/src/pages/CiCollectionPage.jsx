import React from 'react';
import LiteraryCollectionPage from '../components/literary/LiteraryCollectionPage';
import { APP_ROUTES, buildAppUrl } from '../config/site';
import { ciPieces } from '../data/poetryData';

const TEXT = {
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
    translateHint: 'tap a phrase to translate',
  },
};

function getContextText(piece, lang) {
  return lang === 'zh' ? piece.context : piece.contextEn;
}

function getClaudeText(piece, lang) {
  return lang === 'zh' ? piece.claudeZh : piece.claudeEn;
}

function buildCopyText(piece) {
  const titleLine = piece.tune
    ? `《${piece.title}》（${piece.tune}）`
    : `《${piece.title}》`;

  return `${titleLine}\n${piece.lines.join('\n')}`;
}

function buildAiPrompt(piece, lang) {
  const titleLine = piece.tune
    ? `《${piece.title}》（${piece.tune}）`
    : `《${piece.title}》`;

  return lang === 'zh'
    ? `请翻译以下这首词，并对其进行详细赏析，涵盖主题、情感基调、艺术手法等方面：\n\n${titleLine}\n${piece.lines.join('\n')}`
    : `Please translate this Chinese ci poem into English and provide a detailed commentary, covering themes, emotional tone, and literary techniques:\n\n${titleLine}\n${piece.lines.join('\n')}`;
}

function renderCiTitle(piece) {
  return (
    <>
      《{piece.title}》
      {piece.tune ? (
        <span
          style={{
            fontWeight: 300,
            fontSize: '0.75em',
            opacity: 0.45,
            marginLeft: '0.45em',
            letterSpacing: '0.03em',
          }}
        >
          {piece.tune}
        </span>
      ) : null}
    </>
  );
}

const CiCollectionPage = ({ lang = 'zh' }) => (
  <LiteraryCollectionPage
    buildAiPrompt={buildAiPrompt}
    buildCopyText={buildCopyText}
    emptyState={{
      title: TEXT[lang].emptyTitle,
      text: TEXT[lang].emptyText,
    }}
    getClaudeText={getClaudeText}
    getContextText={getContextText}
    items={ciPieces}
    lang={lang}
    renderTitle={renderCiTitle}
    seo={{
      title: lang === 'zh' ? '词 — Alex Gao' : 'Ci Poetry — Alex Gao',
      description: 'Ci poetry by Alex Gao (alexgaoth).',
      keywords: ['Alex Gao', 'alexgaoth', 'ci poetry', '词', 'Chinese lyric poetry'],
      path: lang === 'zh' ? APP_ROUTES.ci : APP_ROUTES.ciEn,
      backPath: APP_ROUTES.art,
      alternates: [
        { hrefLang: 'zh', href: buildAppUrl(APP_ROUTES.ci) },
        { hrefLang: 'en', href: buildAppUrl(APP_ROUTES.ciEn) },
        { hrefLang: 'x-default', href: buildAppUrl(APP_ROUTES.ci) },
      ],
    }}
    text={TEXT[lang]}
    togglePath={lang === 'zh' ? APP_ROUTES.ciEn : APP_ROUTES.ci}
  />
);

export default CiCollectionPage;
