import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import ArtBackground from '../components/ArtBackground';
import SEO from '../components/SEO';
import '../styles/art.css';
import { APP_ROUTES } from '../config/site';

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
      keywords={['Alex Gao', 'poetry', 'ci', 'regents', '诗', '词']}
      path={APP_ROUTES.art}
    />

    <div className="art-page">
      {/* ink flow canvas */}
      <ArtBackground />

      {/* paper grain over canvas */}
      <div className="art-grain" aria-hidden="true" />

      {/* back */}
      <Link to={APP_ROUTES.home} state={{ skipParallax: true }} className="art-back">
        <ArrowLeft size={13} strokeWidth={1} />
        <span>back</span>
      </Link>

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
