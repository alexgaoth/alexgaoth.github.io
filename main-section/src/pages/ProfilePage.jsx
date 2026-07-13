import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import ContentPage from '../components/layout/ContentPage';
import { APP_ROUTES, SITE, buildAppUrl } from '../config/site';
import { profileData } from '../data/profileData';

const MONO = "'Space Mono', monospace";
const GROTESK = "'Space Grotesk', sans-serif";

const profileStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${SITE.name} (${SITE.handle})`,
    url: buildAppUrl(APP_ROUTES.about),
    mainEntity: {
      '@type': 'Person',
      name: SITE.name,
      alternateName: profileData.aliases,
      url: SITE.rootUrl,
      sameAs: SITE.socialProfiles,
      description: SITE.description,
    },
  },
];

const DOORS = [
  { path: APP_ROUTES.resume, label: '/resume', desc: 'the formal record' },
  { path: APP_ROUTES.projects, label: '/projects', desc: 'things i made' },
  { path: APP_ROUTES.thoughts, label: '/thoughts', desc: 'history, lacan, ai' },
  { path: APP_ROUTES.art, label: '/art', desc: 'poetry, ci, regents' },
  { path: APP_ROUTES.gallery, label: '/gallery', desc: 'photographs' },
  { path: APP_ROUTES.now, label: '/now', desc: 'this month, live', live: true },
];

// ── atoms ────────────────────────────────────────────────────────────────────

function Eyebrow({ children, color = '#888' }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        fontWeight: 400,
      }}
    >
      {children}
    </span>
  );
}

function ElsewhereRow({ link, isMobile }) {
  const [hover, setHover] = useState(false);
  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr auto',
        gap: 10,
        padding: isMobile ? '11px 6px' : '7px 6px',
        borderBottom: '1px solid #eee',
        alignItems: 'baseline',
        textDecoration: 'none',
        background: hover ? '#000' : 'transparent',
        color: hover ? '#fff' : '#000',
        transition: 'background 0.12s, color 0.12s',
        fontFamily: MONO,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: hover ? 'rgba(255,255,255,0.6)' : '#999',
          whiteSpace: 'nowrap',
        }}
      >
        {link.label}
      </span>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{link.handle}</span>
      <span style={{ fontSize: 12 }}>→</span>
    </a>
  );
}

function FactRow({ fact }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '96px 1fr',
        gap: 10,
        padding: '6px 6px',
        borderBottom: '1px solid rgba(0,0,0,0.12)',
        alignItems: 'baseline',
        fontFamily: MONO,
      }}
    >
      <span
        style={{
          fontSize: 9.5,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: '#999',
        }}
      >
        {fact.label}
      </span>
      <span style={{ fontSize: 11.5, lineHeight: 1.4 }}>{fact.value}</span>
    </div>
  );
}

function DoorCard({ door }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={door.path}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: '1px solid #000',
        padding: '12px 14px',
        background: hover ? '#000' : 'transparent',
        color: hover ? '#fff' : '#000',
        transition: 'background 0.15s, color 0.15s',
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        fontFamily: MONO,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'baseline',
          gap: 8,
        }}
      >
        <span
          style={{
            fontFamily: GROTESK,
            fontWeight: 600,
            fontSize: 15,
            letterSpacing: '-0.015em',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 7,
          }}
        >
          {door.label}
          {door.live && (
            <span
              className="rail-pulse"
              style={{
                display: 'inline-block',
                width: 5,
                height: 5,
                background: hover ? '#0f6' : '#0a7',
                borderRadius: '50%',
              }}
            />
          )}
        </span>
        <span style={{ fontSize: 12 }}>→</span>
      </div>
      <span
        style={{
          fontSize: 10,
          letterSpacing: '0.04em',
          color: hover ? 'rgba(255,255,255,0.6)' : '#888',
        }}
      >
        {door.desc}
      </span>
    </Link>
  );
}

function Block({ label, children, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', ...style }}>
      <div style={{ marginBottom: 7 }}>
        <Eyebrow>{'// '}{label}</Eyebrow>
      </div>
      {children}
    </div>
  );
}

// ── page ─────────────────────────────────────────────────────────────────────

const ProfilePage = () => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return (
  <>
    <SEO
      title="About — Alex Gao (alexgaoth)"
      description="Alex Gao (alexgaoth) — Math-CS at UC San Diego. Who he is, what he builds and writes, and where to find him."
      keywords={[...profileData.searchableQueries, 'about', 'profile', 'Tianhao Gao']}
      path={APP_ROUTES.about}
      structuredData={profileStructuredData}
    />
    <ContentPage wrapperClassName="content-wrapper">
      <div style={{ fontFamily: MONO, color: '#000' }}>
        {/* header stack: eyebrow → mega title → sub */}
        <header style={{ marginBottom: 'clamp(1.6rem, 3vw, 2.6rem)' }}>
          <div style={{ marginBottom: '0.6rem' }}>
            <Eyebrow>{'// who'}</Eyebrow>
          </div>
          <h1
            style={{
              fontFamily: GROTESK,
              fontWeight: 600,
              fontSize: 'clamp(2rem, 5.2vw, 3.8rem)',
              letterSpacing: '-0.035em',
              lineHeight: 0.95,
              margin: '0 0 0.9rem',
            }}
          >
            ALEX GAO<span style={{ color: '#ccc' }}>.</span>
          </h1>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.55rem',
              maxWidth: '62ch',
            }}
          >
            {profileData.intro.map((paragraph) => (
              <p
                key={paragraph}
                style={{
                  margin: 0,
                  fontSize: 'clamp(0.72rem, 0.9vw, 0.85rem)',
                  lineHeight: 1.7,
                  color: '#555',
                  letterSpacing: '0.02em',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        </header>

        {/* two columns on desktop, one on mobile */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 320px), 1fr))',
            gap: 'clamp(1.6rem, 3vw, 2.6rem)',
            alignItems: 'start',
          }}
        >
          {/* left — focus + doors */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.4rem, 2.4vw, 2rem)' }}>
            <Block label="focus">
              <div style={{ borderTop: '1px solid #000' }}>
                {profileData.focus.map((item, i) => (
                  <div
                    key={item}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'baseline',
                      padding: '7px 6px',
                      borderBottom: '1px solid rgba(0,0,0,0.12)',
                    }}
                  >
                    <span style={{ color: '#bbb', fontSize: 10, minWidth: 16 }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={{ fontSize: 12, lineHeight: 1.4 }}>{item}</span>
                  </div>
                ))}
              </div>
            </Block>

            <Block label="doors">
              {/* Full-width tap bars on mobile — two 150px columns get cramped. */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: isMobile
                    ? '1fr'
                    : 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 8,
                }}
              >
                {DOORS.map((door) => (
                  <DoorCard key={door.path} door={door} />
                ))}
              </div>
            </Block>
          </div>

          {/* right — elsewhere + record */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'clamp(1.4rem, 2.4vw, 2rem)' }}>
            <Block label="elsewhere">
              <div style={{ borderTop: '1px solid #000' }}>
                {profileData.links.map((link) => (
                  <ElsewhereRow key={link.href} link={link} isMobile={isMobile} />
                ))}
              </div>
            </Block>

            <Block label="on record">
              <div style={{ borderTop: '1px solid #000' }}>
                {profileData.facts.map((fact) => (
                  <FactRow key={fact.label} fact={fact} />
                ))}
              </div>
            </Block>

            <Block label="also answers to">
              <p
                style={{
                  margin: 0,
                  fontSize: 11.5,
                  lineHeight: 1.7,
                  letterSpacing: '0.02em',
                  textTransform: 'lowercase',
                }}
              >
                {profileData.aliases.map((alias, i) => (
                  <span key={alias} style={{ whiteSpace: 'nowrap' }}>
                    {alias}
                    {i < profileData.aliases.length - 1 && (
                      <span style={{ color: '#bbb' }}> &nbsp;·&nbsp; </span>
                    )}
                  </span>
                ))}
              </p>
            </Block>
          </div>
        </div>

        {/* footer rail */}
        <footer
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            gap: 12,
            marginTop: 'clamp(2rem, 4vw, 3.2rem)',
            paddingTop: '0.45rem',
            borderTop: '1px solid rgba(0,0,0,0.08)',
          }}
        >
          <span
            style={{
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: '#888',
            }}
          >
            {profileData.mirrors.map((m, i) => (
              <span key={m.href} style={{ whiteSpace: 'nowrap' }}>
                <a
                  href={m.href}
                  style={{ color: 'inherit', textDecoration: 'none' }}
                >
                  {m.label}
                </a>
                {i < profileData.mirrors.length - 1 && ' · '}
              </span>
            ))}
          </span>
          <Link
            to={APP_ROUTES.home}
            style={{
              fontSize: 11,
              color: '#000',
              letterSpacing: '0.04em',
              textDecoration: 'none',
              opacity: 0.85,
              whiteSpace: 'nowrap',
            }}
          >
            / →
          </Link>
        </footer>
      </div>
    </ContentPage>
  </>
  );
};

export default ProfilePage;
