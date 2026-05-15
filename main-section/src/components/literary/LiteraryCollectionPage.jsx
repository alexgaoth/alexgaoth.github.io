import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import SEO from '../SEO';
import '../../styles/art.css';
import '../../styles/poetry.css';
import LiteraryCard from './LiteraryCard';

const LiteraryCollectionPage = ({
  buildAiPrompt,
  buildCopyText,
  emptyState,
  getClaudeText,
  getContextText,
  items,
  lang = 'zh',
  renderTitle,
  seo,
  text,
  togglePath,
}) => {
  const [copiedId, setCopiedId] = useState(null);
  const [aiToast, setAiToast] = useState(false);
  const [expandedIds, setExpandedIds] = useState(() => {
    const first = items.find((item) => getClaudeText(item, lang));
    return first ? new Set([first.id]) : new Set();
  });
  const [revealedSegments, setRevealedSegments] = useState(new Set());

  const toggleClause = (id) => {
    setExpandedIds((previous) => {
      const next = new Set(previous);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleSegment = (itemId, lineIndex, segmentIndex) => {
    const key = `${itemId}-${lineIndex}-${segmentIndex}`;
    setRevealedSegments((previous) => {
      const next = new Set(previous);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const isSegmentRevealed = (itemId, lineIndex, segmentIndex) =>
    revealedSegments.has(`${itemId}-${lineIndex}-${segmentIndex}`);

  const handleCopy = async (item, textToCopy) => {
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedId(item.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (_) {}
  };

  const handleUseAi = async (service, prompt) => {
    try {
      await navigator.clipboard.writeText(prompt);
    } catch (_) {}

    setAiToast(true);
    setTimeout(() => setAiToast(false), 3000);
    window.open(service.urlTemplate(prompt), '_blank');
  };

  return (
    <>
      <SEO
        title={seo.title}
        description={seo.description}
        keywords={seo.keywords}
        path={seo.path}
        alternates={seo.alternates}
      />
      <Link to={seo.backPath} className="art-back">
        <ArrowLeft size={13} strokeWidth={1} />
        <span>art</span>
      </Link>
      <div className="poetry-page">
        <div className="page-container">
          <div className="content-wrapper-narrow">
            <div className="poetry-page-header">
              <h1 className="poetry-page-title">{text.pageTitle}</h1>
              <Link to={togglePath} className="poetry-lang-toggle">
                {text.langToggle}
              </Link>
            </div>

            <p className="poetry-abstract">{text.abstract}</p>

            {items.length === 0 && emptyState ? (
              <div className="poetry-empty">
                <p className="poetry-empty-index">——</p>
                <h2 className="poetry-empty-title">{emptyState.title}</h2>
                <p className="poetry-empty-text">{emptyState.text}</p>
              </div>
            ) : (
              <>
                <div className="poetry-list">
                  {items.map((item) => (
                    <LiteraryCard
                      key={item.id}
                      buildAiPrompt={buildAiPrompt}
                      buildCopyText={buildCopyText}
                      copiedId={copiedId}
                      getClaudeText={getClaudeText}
                      getContextText={getContextText}
                      isExpanded={expandedIds.has(item.id)}
                      isSegmentRevealed={isSegmentRevealed}
                      item={item}
                      lang={lang}
                      onCopy={handleCopy}
                      onToggleClause={toggleClause}
                      onToggleSegment={toggleSegment}
                      onUseAi={handleUseAi}
                      renderTitle={renderTitle}
                      text={text}
                    />
                  ))}
                </div>

                <p className="poetry-footer">{text.footerNote}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {aiToast ? <div className="poetry-toast">{text.aiToastMsg}</div> : null}
    </>
  );
};

export default LiteraryCollectionPage;
