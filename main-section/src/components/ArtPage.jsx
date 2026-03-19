import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import SEO from './SEO';
import '../styles/art.css';

const PORTALS = [
  { num: '一', zh: '诗', label: 'poetry',             path: '/poetry'   },
  { num: '二', zh: '词', label: 'ci',                  path: '/ci'       },
  { num: '三', zh: '像', label: 'regents of my mind',  path: '/regents'  },
];

const ArtPage = () => (
  <>
    <SEO
      title="Art — Alex Gao"
      description="The artistic pages of Alex Gao — poetry, ci, and figures of mind."
      keywords="Alex Gao, poetry, ci, regents, 诗, 词"
      url="https://app.alexgaoth.com/art"
    />

    <div className="art-page">
      {/* paper grain */}
      <div className="art-grain" aria-hidden="true" />

      {/* back */}
      <Link to="/" state={{ skipParallax: true }} className="art-back">
        <ArrowLeft size={13} strokeWidth={1} />
        <span>back</span>
      </Link>

      {/* ghost watermark */}
      <span className="art-watermark" aria-hidden="true">文</span>

      {/* portals */}
      <main className="art-portals">
        {PORTALS.map(({ num, zh, label, path }) => (
          <Link key={path} to={path} className="art-portal">
            <span className="art-num">{num}</span>
            <span className="art-zh">{zh}</span>
            <span className="art-label">{label}</span>
            <span className="art-arrow" aria-hidden="true">→</span>
          </Link>
        ))}
      </main>
    </div>
  </>
);

export default ArtPage;
