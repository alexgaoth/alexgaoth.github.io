import React, { useState } from 'react';
import SEO from './SEO';
import ThoughtsSidebar from './ThoughtsSidebar';
import CompactViewButton from './CompactViewButton';
import NavigationBar from './NavigationBar';
import ThoughtCard from './thoughts/ThoughtCard';
import { APP_ROUTES } from '../config/site';
import { getCompactGridDimensions } from '../utils/compactGrid';

const ThoughtsPage = ({ data }) => {
  const [progress, setProgress] = useState(0);
  const totalCards = data.content.length;
  const { columns, rows } = getCompactGridDimensions(totalCards);

  return (
    <>
      <SEO
        title="Thoughts — Alex Gao"
        description="Writing by Alex Gao (alexgaoth)."
        keywords={['Alex Gao', 'alexgaoth', 'writing', 'thoughts']}
        path={APP_ROUTES.thoughts}
      />
      <NavigationBar />
      <div className="thoughts-page-layout">
      <ThoughtsSidebar articles={data.content} />

      <div className="thoughts-page-content">
        <div className="page-container">
          <div className="content-wrapper-narrow">

        <h1 className="title-page">Thoughts</h1>

        <CompactViewButton progress={progress} setProgress={setProgress} />

        <div
          className={`space-y-medium thoughts-compact-container ${progress > 0 ? 'compacting' : ''}`}
          style={{
            '--columns': columns,
            '--rows': rows
          }}
        >
          {data.content.map((thought, index) => (
            <ThoughtCard key={thought.slug || index} thought={thought} />
          ))}
        </div>
      </div>
    </div>
      </div>
    </div>
    </>
  );
};

export default ThoughtsPage;
