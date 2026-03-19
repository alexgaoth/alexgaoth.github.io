import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clipboard, Check, ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import '../styles/art.css';
import { ciPieces } from '../data/poetryData';
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
    pageTitle: '词',
    seoTitle: '词 — Alex Gao',
    seoUrl: 'https://app.alexgaoth.com/ci',
    langToggle: 'English →',
    langTogglePath: '/ci/en',
    abstract: '词体以长短句为形，宜于抒怀、叙事与议论。此辑主要收录我舞勺之年前后所作。 由此呈上。',
    contextLabel: '背景与感想',
    contextPlaceholder: '待填写……',
    claudeLabel: 'Claude 评',
    aiToastMsg: 'AI提示词已复制，正在跳转……',
    footerNote: '点击AI图标后，将自动复制提示词，打开对应模型后粘贴即可。',
    emptyTitle: '暂无内容',
    emptyText: '词作整理中，敬请期待。',
  },
  en: {
    pageTitle: 'Ci Poetry',
    seoTitle: 'Ci Poetry — Alex Gao',
    seoUrl: 'https://app.alexgaoth.com/ci/en',
    langToggle: '中文 →',
    langTogglePath: '/ci',
    abstract: 'Ci is a classical Chinese form with varying line lengths, historically composed to music. This collection spans philosophical argument, dynastic panorama, and wuxia narrative — different in register, unified by the rhythm of the language.',
    transCallout: 'Each line is divided at its natural pauses. Click any dotted-underlined phrase to reveal its English translation inline — one phrase at a time, or the whole line at once.',
    contextLabel: 'Context & Notes',
    contextPlaceholder: 'To be written…',
    claudeLabel: 'What Claude thinks',
    aiToastMsg: 'Prompt copied. Opening AI…',
    footerNote: 'Clicking an AI icon copies a translation & commentary prompt to your clipboard. Paste it after the tab opens.',
    emptyTitle: 'No Content Yet',
    emptyText: 'Ci pieces are being compiled. Check back soon.',
    translateHint: 'tap a phrase to translate',
  },
};

const splitSegments = (line) => line.split('，').filter(s => s.trim());

const CiCollectionPage = ({ lang = 'zh' }) => {
  const t = TEXT[lang];
  const [copiedId, setCopiedId] = useState(null);
  const [aiToast, setAiToast] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => {
    const first = ciPieces.find(p => lang === 'zh' ? p.claudeZh : p.claudeEn);
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

  const toggleSeg = (pieceId, lineIdx, segIdx) => {
    const key = `${pieceId}-${lineIdx}-${segIdx}`;
    setRevealedSegs(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isSegRevealed = (pieceId, lineIdx, segIdx) =>
    revealedSegs.has(`${pieceId}-${lineIdx}-${segIdx}`);

  const handleCopy = async (piece) => {
    const titleLine = piece.tune
      ? `《${piece.title}》（${piece.tune}）`
      : `《${piece.title}》`;
    const text = `${titleLine}\n${piece.lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(piece.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  const handleAi = async (piece, service) => {
    const titleLine = piece.tune
      ? `《${piece.title}》（${piece.tune}）`
      : `《${piece.title}》`;
    const prompt =
      lang === 'zh'
        ? `请翻译以下这首词，并对其进行详细赏析，涵盖主题、情感基调、艺术手法等方面：\n\n${titleLine}\n${piece.lines.join('\n')}`
        : `Please translate this Chinese ci poem into English and provide a detailed commentary, covering themes, emotional tone, and literary techniques:\n\n${titleLine}\n${piece.lines.join('\n')}`;
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (_) {}
    setAiToast(true);
    setTimeout(() => setAiToast(false), 3000);
    window.open(service.urlTemplate(prompt), '_blank');
  };

  const renderLines = (piece) => {
    if (lang !== 'en') {
      return piece.lines.map((line, li) => (
        <p key={li} className="poetry-line">{line}</p>
      ));
    }

    return piece.lines.map((line, li) => {
      const segments = splitSegments(line);
      const segTrans = piece.linesEn?.[li] || [];
      const anyRevealed = segments.some((_, si) => isSegRevealed(piece.id, li, si));

      return (
        <div key={li} className="poetry-line-group">
          <p className="poetry-line poetry-line-translatable">
            {segments.map((seg, si) => {
              const revealed = isSegRevealed(piece.id, li, si);
              return (
                <React.Fragment key={si}>
                  <span
                    className={`poetry-seg${revealed ? ' poetry-seg-active' : ''}`}
                    onClick={() => toggleSeg(piece.id, li, si)}
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
                if (!isSegRevealed(piece.id, li, si)) return null;
                const tr = segTrans[si] ?? segTrans.join(' ');
                return (
                  <span key={si} className="poetry-seg-en">{tr}</span>
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
        description="Ci poetry by Alex Gao (alexgaoth)."
        keywords="Alex Gao, alexgaoth, ci poetry, 词, Chinese lyric poetry"
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

            {ciPieces.length === 0 ? (
              <div className="poetry-empty">
                <p className="poetry-empty-index">——</p>
                <h2 className="poetry-empty-title">{t.emptyTitle}</h2>
                <p className="poetry-empty-text">{t.emptyText}</p>
              </div>
            ) : (
              <>
                <div className="poetry-list">
                  {ciPieces.map((piece, index) => {
                    const isCopied = copiedId === piece.id;
                    const isExpanded = expandedIds.has(piece.id);
                    const contextText = lang === 'zh' ? piece.context : piece.contextEn;
                    const claudeText = lang === 'zh' ? piece.claudeZh : piece.claudeEn;

                    return (
                      <article key={piece.id} className="poetry-card">

                        <div className="poetry-card-header">
                          <div>
                            <h2 className="poetry-title">
                              《{piece.title}》
                              {piece.tune && (
                                <span style={{
                                  fontWeight: 300,
                                  fontSize: '0.75em',
                                  opacity: 0.45,
                                  marginLeft: '0.45em',
                                  letterSpacing: '0.03em',
                                }}>
                                  {piece.tune}
                                </span>
                              )}
                            </h2>
                            {lang === 'en' && (
                              <span className="poetry-translate-hint">{t.translateHint}</span>
                            )}
                          </div>
                          <div className="poetry-card-actions">
                            <button
                              className={`poetry-icon-btn${isCopied ? ' copied' : ''}`}
                              onClick={() => handleCopy(piece)}
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
                                onClick={() => handleAi(piece, service)}
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
                          {renderLines(piece)}
                        </div>

                        {claudeText && (
                          <div className="poetry-claude">
                            <button
                              className="poetry-claude-toggle"
                              onClick={() => toggleClause(piece.id)}
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
              </>
            )}

          </div>
        </div>
      </div>

      {aiToast && (
        <div className="poetry-toast">{t.aiToastMsg}</div>
      )}
    </>
  );
};

export default CiCollectionPage;
