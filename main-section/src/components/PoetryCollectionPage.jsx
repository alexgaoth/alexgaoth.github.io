import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clipboard, Check, ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import '../styles/art.css';
import { poems } from '../data/poetryData';
import '../styles/poetry.css';

const AI_SERVICES = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    urlTemplate: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    urlTemplate: (p) => `https://gemini.google.com/app?q=${encodeURIComponent(p)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32',
  },
  {
    id: 'claude',
    label: 'Claude',
    urlTemplate: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
    favicon: 'https://www.google.com/s2/favicons?domain=claude.ai&sz=32',
  },
];

const TEXT = {
  zh: {
    pageTitle: '诗',
    seoTitle: '诗 — Alex Gao',
    seoUrl: 'https://app.alexgaoth.com/poetry',
    langToggle: 'English →',
    langTogglePath: '/poetry/en',
    abstract: '诗者，心之声也；今者，尘之扰也。以声涤尘，可得片刻真我。此辑主要收录我舞勺之年前后所作。 拙作待正。',
    contextLabel: '背景与感想',
    contextPlaceholder: '待填写……',
    claudeLabel: 'Claude 评',
    aiToastMsg: 'AI提示词已复制，正在跳转……',
    footerNote: '点击AI图标后，将自动复制提示词，打开对应模型后粘贴即可。',
  },
  en: {
    pageTitle: 'Poetry',
    seoTitle: 'Poetry — Alex Gao',
    seoUrl: 'https://app.alexgaoth.com/poetry/en',
    langToggle: '中文 →',
    langTogglePath: '/poetry',
    abstract: 'These poems were written in the space between exile and belonging — the loneliness of living abroad, the homeland glimpsed in dreams, the weight of family and the reach of personal ambition. The form is classical; the feeling is entirely present.',
    transCallout: 'Each line is divided at its natural pauses. Click any dotted-underlined phrase to reveal its English translation inline — one phrase at a time, or the whole line at once.',
    contextLabel: 'Context & Notes',
    contextPlaceholder: 'To be written…',
    claudeLabel: 'What Claude thinks',
    aiToastMsg: 'Prompt copied. Opening AI…',
    footerNote: 'Clicking an AI icon copies a translation & commentary prompt to your clipboard. Paste it after the tab opens.',
    translateHint: 'tap a phrase to translate',
  },
};

// Split a Chinese line on ，, filter empty strings
const splitSegments = (line) => line.split('，').filter(s => s.trim());

const PoetryCollectionPage = ({ lang = 'zh' }) => {
  const t = TEXT[lang];
  const [copiedId, setCopiedId] = useState(null);
  const [aiToast, setAiToast] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => {
    const first = poems.find(p => lang === 'zh' ? p.claudeZh : p.claudeEn);
    return first ? new Set([first.id]) : new Set();
  });
  const [revealedSegs, setRevealedSegs] = useState(new Set());

  const toggleClause = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSeg = (poemId, lineIdx, segIdx) => {
    const key = `${poemId}-${lineIdx}-${segIdx}`;
    setRevealedSegs(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isSegRevealed = (poemId, lineIdx, segIdx) =>
    revealedSegs.has(`${poemId}-${lineIdx}-${segIdx}`);

  const handleCopy = async (poem) => {
    const text = `《${poem.title}》\n${poem.lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(poem.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  const handleAi = async (poem, service) => {
    const prompt =
      lang === 'zh'
        ? `请翻译以下这首诗，并对其进行详细赏析，涵盖主题、情感基调、艺术手法、文化背景等方面：\n\n《${poem.title}》\n${poem.lines.join('\n')}`
        : `Please translate this Chinese poem into English and provide a detailed commentary, covering themes, emotional tone, literary techniques, and cultural context:\n\n《${poem.title}》\n${poem.lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (_) {}
    setAiToast(true);
    setTimeout(() => setAiToast(false), 3000);
    window.open(service.urlTemplate(prompt), '_blank');
  };

  const renderLines = (poem) => {
    if (lang !== 'en') {
      return poem.lines.map((line, li) => (
        <p key={li} className="poetry-line">{line}</p>
      ));
    }

    return poem.lines.map((line, li) => {
      const segments = splitSegments(line);
      const segTrans = poem.linesEn?.[li] || [];
      const anyRevealed = segments.some((_, si) => isSegRevealed(poem.id, li, si));

      return (
        <div key={li} className="poetry-line-group">
          <p className="poetry-line poetry-line-translatable">
            {segments.map((seg, si) => {
              const revealed = isSegRevealed(poem.id, li, si);
              return (
                <React.Fragment key={si}>
                  <span
                    className={`poetry-seg${revealed ? ' poetry-seg-active' : ''}`}
                    onClick={() => toggleSeg(poem.id, li, si)}
                    title="tap to translate"
                  >
                    {seg}
                  </span>
                  {si < segments.length - 1 && (
                    <span className="poetry-seg-comma">，</span>
                  )}
                </React.Fragment>
              );
            })}
          </p>
          {anyRevealed && (
            <div className="poetry-line-trans">
              {segments.map((_, si) => {
                if (!isSegRevealed(poem.id, li, si)) return null;
                const t = segTrans[si] ?? segTrans.join(' ');
                return (
                  <span key={si} className="poetry-seg-en">{t}</span>
                );
              })}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <>
      <SEO
        title={t.seoTitle}
        description="Poetry by Alex Gao (alexgaoth)."
        keywords="Alex Gao, alexgaoth, poetry, 诗, Chinese poetry"
        url={t.seoUrl}
      />
      <Link to="/art" className="art-back">
        <ArrowLeft size={13} strokeWidth={1} />
        <span>art</span>
      </Link>
      <div className="poetry-page">
        <div className="page-container">
          <div className="content-wrapper-narrow">

            <div className="poetry-page-header">
              <h1 className="poetry-page-title">{t.pageTitle}</h1>
              <Link to={t.langTogglePath} className="poetry-lang-toggle">
                {t.langToggle}
              </Link>
            </div>

            <p className="poetry-abstract">{t.abstract}</p>

            {lang === 'en' && (
              <div className="poetry-trans-callout">
                <span className="poetry-trans-callout-dot">· · ·</span>
                <p className="poetry-trans-callout-text">{t.transCallout}</p>
              </div>
            )}

            <div className="poetry-list">
              {poems.map((poem, index) => {
                const isCopied = copiedId === poem.id;
                const isExpanded = expandedIds.has(poem.id);
                const contextText = lang === 'zh' ? poem.context : poem.contextEn;
                const claudeText = lang === 'zh' ? poem.claudeZh : poem.claudeEn;

                return (
                  <article key={poem.id} className="poetry-card">

                    <div className="poetry-card-header">
                      <div>
                        <h2 className="poetry-title">《{poem.title}》</h2>
                        {lang === 'en' && (
                          <span className="poetry-translate-hint">{t.translateHint}</span>
                        )}
                      </div>
                      <div className="poetry-card-actions">
                        <button
                          className={`poetry-icon-btn${isCopied ? ' copied' : ''}`}
                          onClick={() => handleCopy(poem)}
                          title="Copy poem"
                        >
                          {isCopied
                            ? <Check size={15} strokeWidth={1.5} />
                            : <Clipboard size={15} strokeWidth={1.5} />}
                        </button>
                        <span className="poetry-actions-sep" />
                        {AI_SERVICES.map((service) => (
                          <button
                            key={service.id}
                            className="poetry-ai-icon-btn"
                            onClick={() => handleAi(poem, service)}
                            title={service.label}
                          >
                            <img
                              src={service.favicon}
                              alt={service.label}
                              className="poetry-ai-favicon"
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="poetry-body">
                      {renderLines(poem)}
                    </div>

                    {claudeText && (
                      <div className="poetry-claude">
                        <button
                          className="poetry-claude-toggle"
                          onClick={() => toggleClause(poem.id)}
                        >
                          {t.claudeLabel}
                          <span className={`poetry-claude-arrow${isExpanded ? ' open' : ''}`}>▾</span>
                        </button>
                        <div className={`poetry-claude-body${isExpanded ? ' open' : ''}`}>
                          <p className="poetry-claude-text">{claudeText}</p>
                        </div>
                      </div>
                    )}

                    {contextText && (
                      <div className="poetry-context">
                        <span className="poetry-context-label">{t.contextLabel}</span>
                        <p className="poetry-context-text">{contextText}</p>
                      </div>
                    )}

                  </article>
                );
              })}
            </div>

            <p className="poetry-footer">{t.footerNote}</p>

          </div>
        </div>
      </div>

      {aiToast && (
        <div className="poetry-toast">{t.aiToastMsg}</div>
      )}
    </>
  );
};

export default PoetryCollectionPage;
