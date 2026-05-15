import React from 'react';

function splitSegments(line) {
  return line.split('，').filter((segment) => segment.trim());
}

const LiteraryLines = ({
  item,
  lang,
  isSegmentRevealed,
  onToggleSegment,
}) => {
  if (lang !== 'en') {
    return item.lines.map((line, lineIndex) => (
      <p key={lineIndex} className="poetry-line">{line}</p>
    ));
  }

  return item.lines.map((line, lineIndex) => {
    const segments = splitSegments(line);
    const segmentTranslations = item.linesEn?.[lineIndex] || [];
    const anyRevealed = segments.some((_, segmentIndex) =>
      isSegmentRevealed(item.id, lineIndex, segmentIndex)
    );

    return (
      <div key={lineIndex} className="poetry-line-group">
        <p className="poetry-line poetry-line-translatable">
          {segments.map((segment, segmentIndex) => {
            const revealed = isSegmentRevealed(item.id, lineIndex, segmentIndex);

            return (
              <React.Fragment key={segmentIndex}>
                <span
                  className={`poetry-seg${revealed ? ' poetry-seg-active' : ''}`}
                  onClick={() => onToggleSegment(item.id, lineIndex, segmentIndex)}
                  title="tap to translate"
                >
                  {segment}
                </span>
                {segmentIndex < segments.length - 1 && (
                  <span className="poetry-seg-comma">，</span>
                )}
              </React.Fragment>
            );
          })}
        </p>
        {anyRevealed && (
          <div className="poetry-line-trans">
            {segments.map((_, segmentIndex) => {
              if (!isSegmentRevealed(item.id, lineIndex, segmentIndex)) {
                return null;
              }

              const translation = segmentTranslations[segmentIndex] ?? segmentTranslations.join(' ');
              return (
                <span key={segmentIndex} className="poetry-seg-en">{translation}</span>
              );
            })}
          </div>
        )}
      </div>
    );
  });
};

export default LiteraryLines;
