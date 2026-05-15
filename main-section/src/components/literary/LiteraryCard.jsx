import { Check, Clipboard } from 'lucide-react';
import LiteraryLines from './LiteraryLines';
import { AI_SERVICES } from './aiServices';

const LiteraryCard = ({
  buildAiPrompt,
  buildCopyText,
  copiedId,
  getClaudeText,
  getContextText,
  isExpanded,
  isSegmentRevealed,
  item,
  lang,
  onCopy,
  onToggleClause,
  onToggleSegment,
  onUseAi,
  renderTitle,
  text,
}) => {
  const isCopied = copiedId === item.id;
  const claudeText = getClaudeText(item, lang);
  const contextText = getContextText(item, lang);

  return (
    <article className="poetry-card">
      <div className="poetry-card-header">
        <div>
          <h2 className="poetry-title">{renderTitle(item)}</h2>
          {lang === 'en' && text.translateHint ? (
            <span className="poetry-translate-hint">{text.translateHint}</span>
          ) : null}
        </div>
        <div className="poetry-card-actions">
          <button
            className={`poetry-icon-btn${isCopied ? ' copied' : ''}`}
            onClick={() => onCopy(item, buildCopyText(item))}
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
              onClick={() => onUseAi(service, buildAiPrompt(item, lang))}
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
        <LiteraryLines
          item={item}
          lang={lang}
          isSegmentRevealed={isSegmentRevealed}
          onToggleSegment={onToggleSegment}
        />
      </div>

      {claudeText ? (
        <div className="poetry-claude">
          <button
            className="poetry-claude-toggle"
            onClick={() => onToggleClause(item.id)}
          >
            {text.claudeLabel}
            <span className={`poetry-claude-arrow${isExpanded ? ' open' : ''}`}>▾</span>
          </button>
          <div className={`poetry-claude-body${isExpanded ? ' open' : ''}`}>
            <p className="poetry-claude-text">{claudeText}</p>
          </div>
        </div>
      ) : null}

      {contextText ? (
        <div className="poetry-context">
          <span className="poetry-context-label">{text.contextLabel}</span>
          <p className="poetry-context-text">{contextText}</p>
        </div>
      ) : null}
    </article>
  );
};

export default LiteraryCard;
