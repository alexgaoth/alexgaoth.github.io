import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Clipboard, Check } from 'lucide-react';
import NavigationBar from './NavigationBar';
import SEO from './SEO';
import { ciPieces } from '../data/poetryData';
import '../styles/poetry.css';

const AI_SERVICES = [
  {
    id: 'chatgpt',
    label: 'ChatGPT',
    url: 'https://chatgpt.com/',
    favicon: 'https://www.google.com/s2/favicons?domain=chatgpt.com&sz=32',
  },
  {
    id: 'gemini',
    label: 'Gemini',
    url: 'https://gemini.google.com/',
    favicon: 'https://www.google.com/s2/favicons?domain=gemini.google.com&sz=32',
  },
  {
    id: 'claude',
    label: 'Claude',
    url: 'https://claude.ai/new',
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
    contextLabel: 'Context & Notes',
    contextPlaceholder: 'To be written…',
    claudeLabel: 'What Claude thinks',
    aiToastMsg: 'Prompt copied. Opening AI…',
    footerNote: 'Clicking an AI icon copies a translation & commentary prompt to your clipboard. Paste it after the tab opens.',
    emptyTitle: 'No Content Yet',
    emptyText: 'Ci pieces are being compiled. Check back soon.',
  },
};

const CiCollectionPage = ({ lang = 'zh' }) => {
  const t = TEXT[lang];
  const [copiedId, setCopiedId] = useState(null);
  const [aiToast, setAiToast] = useState(false);
  const [expandedIds, setExpandedIds] = useState(new Set());

  const toggleClause = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
    window.open(service.url, '_blank');
  };

  return (
    <>
      <SEO
        title={t.seoTitle}
        description="Ci poetry by Alex Gao (alexgaoth)."
        keywords="Alex Gao, alexgaoth, ci poetry, 词, Chinese lyric poetry"
        url={t.seoUrl}
      />
      <NavigationBar />
      <div className="page-container">
        <div className="content-wrapper-narrow">

          <div className="poetry-page-header">
            <h1 className="poetry-page-title">{t.pageTitle}</h1>
            <Link to={t.langTogglePath} className="poetry-lang-toggle">
              {t.langToggle}
            </Link>
          </div>

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
                      <div className="poetry-card-inner">

                        <div className="poetry-card-content">
                          <span className="poetry-index">
                            {String(index + 1).padStart(2, '0')}
                          </span>
                          <h2 className="poetry-title">
                            《{piece.title}》
                            {piece.tune && (
                              <span style={{ fontWeight: 400, fontSize: '0.78em', opacity: 0.4, marginLeft: '0.4em' }}>
                                {piece.tune}
                              </span>
                            )}
                          </h2>
                          <div className="poetry-body">
                            {piece.lines.map((line, li) => (
                              <p key={li} className="poetry-line">{line}</p>
                            ))}
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

                          <div className="poetry-context">
                            <span className="poetry-context-label">{t.contextLabel}</span>
                            <p className={`poetry-context-text${!contextText ? ' poetry-context-placeholder' : ''}`}>
                              {contextText || t.contextPlaceholder}
                            </p>
                          </div>
                        </div>

                        <div className="poetry-card-actions">
                          <button
                            className={`poetry-icon-btn${isCopied ? ' copied' : ''}`}
                            onClick={() => handleCopy(piece)}
                            title="Copy poem"
                          >
                            {isCopied ? <Check size={15} strokeWidth={1.75} /> : <Clipboard size={15} strokeWidth={1.75} />}
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
                    </article>
                  );
                })}
              </div>

              <p className="poetry-footer">{t.footerNote}</p>
            </>
          )}

        </div>
      </div>

      {aiToast && (
        <div className="poetry-toast">{t.aiToastMsg}</div>
      )}
    </>
  );
};

export default CiCollectionPage;
