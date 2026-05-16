import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { APP_ROUTES } from '../../config/site';

// ── Static data for the preview rail ──────────────────────────────────────────

const SHIPS = [
  {
    year: '2026', name: 'signalor.app', tech: 'svelte · py · docker · ts',
    status: 'live', featured: true,
    desc: 'google analytics for brands. transparent, holistic, in production.',
    img: '/resources/signalor.png', link: 'https://signalor.app',
  },
  { year: '2025', name: 'ucsd_crimes',       tech: 'react · py · selenium',    status: 'live',      link: 'https://alexgaoth.com/UCSD_Crimes/' },
  { year: '2025', name: 'dont-hallucinate',  tech: 'py · powershell · bash',   status: 'pypi',      link: 'https://pypi.org/project/dont-hallucinate/' },
  { year: '2024', name: '3d julia set sim',  tech: 'unity · c# · math',        status: 'live',      link: 'https://alexgaoth.com/JuliaSetFractal/' },
  { year: '2024', name: 'radians.co.uk',     tech: 'react · node · mongo',     status: 'shipped' },
  { year: '2024', name: 'speech classifier', tech: 'py · linear algebra',      status: '98.9% acc' },
  { year: '2023', name: 'pixel platformer',  tech: 'godot · gdscript',         status: 'playable' },
  { year: '2022', name: 'alexgaoth.com v0',  tech: 'html · css · js',          status: 'live' },
];

const TROPHIES = [
  { stamp: 'GOLD',    label: 'British Mathematical Olympiad I',             year: '2024' },
  { stamp: 'GOLD',    label: 'British Informatics Olympiad',                year: '2025' },
  { stamp: 'A*A*A*A', label: 'A-Levels · Math, Further Math, Physics, CS', year: '2023–25' },
];

const WRITINGS = [
  {
    pull: 'history is very rarely about what actually happened, but how events are interpreted',
    title: 'Winning the Battle of Manzikert',
    date: '2025.08', tag: 'history', read: '5m',
    slug: 'winning-the-battle-of-manzikert',
  },
  {
    pull: 'without others, hell has no meaning',
    title: 'Submitting to the Symbolic Order',
    date: '2025.11', tag: 'lacan', read: '2m',
    slug: 'submitting-to-the-symbolic-order',
  },
  {
    pull: 'inventing a nation and defending it in the same historical moment',
    title: 'Chinese Modernisation',
    date: '2024.09', tag: 'history', read: '2m',
    slug: 'chinese-nationalization-modernization-is-actually-quite-intersting',
  },
];

const DOMAINS = ['mathematics', 'computer science', 'history', 'linguistics', 'grand strategy', 'crocheting'];
const TONGUES  = ['english (native)', '中文 (native)', 'தமிழ் (learning)'];

const NOWDATA = {
  building: ['signalor.app · v0.3', 'sdx @ ucsd', 'this very site'],
  learning: ['rust', 'tamil', 'writing more clearly'],
  consuming: [
    { kind: 'sound', val: 'soldier of heaven — sabaton' },
    { kind: 'read',  val: 'the undiscovered self — jung' },
    { kind: 'watch', val: 'xavier renegade angel' },
    { kind: 'play',  val: 'none actually' },
  ],
  location: ['la jolla, california', 'ucsd campus · home for summer'],
  writing: [
    { state: 'wip',   val: 'a note on metaphor as compression' },
    { state: 'open',  val: 'the politics of attention' },
    { state: 'stuck', val: 'a story about the fall of nineveh' },
  ],
  thisWeek: [
    { day: 'mon', val: 'signalor v0.3.2 shipped',        tag: '+340 −120' },
    { day: 'tue', val: 'sdx pitches · 3 brands',         tag: '4 hrs' },
    { day: 'wed', val: 'jung — finished chapter 4',       tag: 'read' },
    { day: 'thu', val: 'this site preview rail redesign', tag: 'wip' },
    { day: 'fri', val: 'open',                            tag: '—' },
  ],
};

// ── Shared atoms ────────────────────────────────────────────────────────────

const MONO = "'Space Mono', monospace";
const GROTESK = "'Space Grotesk', sans-serif";

function Eyebrow({ children, color = '#888', extraStyle }) {
  return (
    <span style={{
      fontFamily: MONO, fontSize: 11, letterSpacing: '0.22em',
      textTransform: 'uppercase', color, fontWeight: 400, ...extraStyle,
    }}>
      {children}
    </span>
  );
}

function MegaTitle({ children }) {
  return (
    <h2 style={{
      fontFamily: GROTESK, fontWeight: 600,
      fontSize: 'clamp(1.8rem, 4.8vw, 3.8rem)',
      letterSpacing: '-0.035em', lineHeight: 0.95, margin: 0, color: '#000',
    }}>
      {children}
    </h2>
  );
}

function PanelChrome({ idx, total, eyebrow, title, sub, children, background = '#fff', footerLeft, footerRight, footerLink }) {
  return (
    <div style={{
      width: '100%', height: '100%', background, color: '#000',
      boxSizing: 'border-box',
      padding: 'clamp(1.3rem,2.4vw,2.2rem) clamp(1.2rem,3vw,2.4rem) clamp(1rem,1.8vw,1.8rem)',
      display: 'flex', flexDirection: 'column',
      fontFamily: MONO, overflow: 'hidden',
    }}>
      <header style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginBottom: 'clamp(0.6rem,1.1vw,1.1rem)', flexShrink: 0,
      }}>
        <Eyebrow color="#888">{eyebrow}</Eyebrow>
        <Eyebrow color="#888">{String(idx).padStart(2,'0')} / {String(total).padStart(2,'0')}</Eyebrow>
      </header>

      <div style={{ marginBottom: '0.2rem', flexShrink: 0 }}>
        <MegaTitle>{title}</MegaTitle>
      </div>

      <p style={{
        fontSize: 'clamp(0.68rem,0.82vw,0.82rem)', color: '#888',
        margin: '0 0 clamp(0.65rem,1.1vw,1.1rem)',
        letterSpacing: '0.02em', maxWidth: '70ch', flexShrink: 0, lineHeight: 1.5,
      }}>
        {sub}
      </p>

      <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {children}
      </div>

      <footer style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        marginTop: 'clamp(0.5rem,0.9vw,0.9rem)', paddingTop: '0.45rem',
        borderTop: '1px solid rgba(0,0,0,0.08)', flexShrink: 0,
      }}>
        <Eyebrow color="#888" extraStyle={{ fontSize: 10 }}>{footerLeft}</Eyebrow>
        <Link to={footerLink} style={{
          fontSize: 11, color: '#000', letterSpacing: '0.04em',
          textDecoration: 'none', opacity: 0.85, fontFamily: MONO,
        }}>
          {footerRight}
        </Link>
      </footer>
    </div>
  );
}

// ── 01 BUILT ─────────────────────────────────────────────────────────────────

function BuildLogRow({ ship }) {
  const [hover, setHover] = useState(false);
  const inner = (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 10,
        padding: '6px 6px', borderBottom: '1px solid #eee',
        background: hover ? '#000' : 'transparent',
        color: hover ? '#fff' : '#000',
        transition: 'background 0.12s, color 0.12s',
        cursor: 'pointer', alignItems: 'center',
      }}
    >
      <span style={{ fontSize: 10.5, fontWeight: 600, color: hover ? 'rgba(255,255,255,0.6)' : '#999' }}>
        {ship.year}
      </span>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 12.5, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ship.name}
        </div>
        <div style={{ fontSize: 9.5, color: hover ? 'rgba(255,255,255,0.55)' : '#888', letterSpacing: '0.02em', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {ship.tech}
        </div>
      </div>
      <span style={{
        fontSize: 8.5, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: hover ? '#fff' : '#000',
        border: `1px solid ${hover ? '#fff' : '#000'}`,
        padding: '2px 5px', whiteSpace: 'nowrap',
      }}>
        {ship.status}
      </span>
    </div>
  );

  if (ship.link) {
    return (
      <a href={ship.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
        {inner}
      </a>
    );
  }
  return (
    <Link to={APP_ROUTES.projects} style={{ textDecoration: 'none', color: 'inherit' }}>
      {inner}
    </Link>
  );
}

function BuiltPanel({ isMobile }) {
  const featured = SHIPS[0];
  const rest = SHIPS.slice(1);
  return (
    <PanelChrome
      idx={1} total={3}
      eyebrow="// 01 — what i ship"
      title={<>BUILT<span style={{ color: '#ccc' }}>.</span></>}
      sub="8 things shipped · 7 still live · most by hand, all in public. the latest is signalor."
      footerLeft="see them all · github.com/alexgaoth"
      footerRight="/projects →"
      footerLink={APP_ROUTES.projects}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1.35fr 1fr',
        gap: 'clamp(0.8rem,1.8vw,1.6rem)',
        flex: 1, minHeight: 0, overflow: 'hidden',
      }}>
        {/* Featured hero — desktop only */}
        {!isMobile && (
          <Link to={APP_ROUTES.projects} style={{
            display: 'flex', flexDirection: 'column', minHeight: 0,
            border: '1px solid #000', textDecoration: 'none', color: 'inherit', overflow: 'hidden',
          }}>
            <div style={{ flex: '1 1 auto', minHeight: 0, background: '#f4f1ea', position: 'relative', overflow: 'hidden' }}>
              <img
                src={process.env.PUBLIC_URL + featured.img}
                alt={featured.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div style={{
                position: 'absolute', top: 10, left: 10, background: '#000', color: '#fff',
                padding: '3px 8px', fontSize: 9, letterSpacing: '0.22em',
                display: 'flex', alignItems: 'center', gap: 6, fontFamily: MONO,
              }}>
                <span className="rail-pulse" style={{ display: 'inline-block', width: 5, height: 5, background: '#0f6', borderRadius: '50%' }} />
                LIVE
              </div>
            </div>
            <div style={{ flexShrink: 0, borderTop: '1px solid #000', background: '#fff', padding: '10px 14px 12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12, marginBottom: 4 }}>
                <h3 style={{ fontFamily: GROTESK, fontSize: 'clamp(0.92rem,1.3vw,1.2rem)', margin: 0, letterSpacing: '-0.015em', fontWeight: 600 }}>
                  {featured.name}
                </h3>
                <Eyebrow color="#888">v0.3 · since 2024</Eyebrow>
              </div>
              <p style={{ fontSize: 11.5, margin: '0 0 8px', lineHeight: 1.5, color: '#555' }}>
                {featured.desc}
              </p>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {featured.tech.split(' · ').map(t => (
                  <span key={t} style={{ background: '#000', color: '#fff', padding: '2px 7px', fontSize: 9.5, letterSpacing: '0.06em' }}>
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* Build log */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 5, flexShrink: 0 }}>
            <Eyebrow color="#666">// build log · {SHIPS.length} entries</Eyebrow>
            <Eyebrow color="#bbb">desc ↓</Eyebrow>
          </div>
          <div style={{
            display: 'grid', gridTemplateColumns: '44px 1fr auto', gap: 10,
            padding: '4px 6px', borderTop: '1px solid #000', borderBottom: '1px solid #000',
            fontSize: 9, letterSpacing: '0.18em', color: '#000', textTransform: 'uppercase',
            fontWeight: 500, flexShrink: 0,
          }}>
            <span>year</span><span>name · stack</span><span>status</span>
          </div>
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {(isMobile ? SHIPS : rest).map(s => <BuildLogRow key={s.name} ship={s} />)}
          </div>
        </div>
      </div>
    </PanelChrome>
  );
}

// ── 02 KNOWN ─────────────────────────────────────────────────────────────────

function WritingCard({ w }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`${APP_ROUTES.thoughts}/${w.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: '1px solid #000', padding: '10px 12px',
        background: hover ? '#000' : 'transparent',
        color: hover ? '#fff' : '#000',
        transition: 'background 0.15s, color 0.15s',
        textDecoration: 'none', display: 'flex', flexDirection: 'column',
        gap: 6, flex: 1, minHeight: 0, justifyContent: 'space-between',
      }}
    >
      <div style={{ fontStyle: 'italic', fontSize: 12, lineHeight: 1.5, fontFamily: MONO }}>
        "{w.pull}"
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 8 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 9.5, letterSpacing: '0.16em', textTransform: 'uppercase', fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {w.title}
          </div>
          <div style={{ fontSize: 9, opacity: 0.65, marginTop: 2, letterSpacing: '0.04em' }}>
            {w.date} · {w.tag} · {w.read}
          </div>
        </div>
        <span style={{ fontSize: 12 }}>→</span>
      </div>
    </Link>
  );
}

function KnownPanel({ isMobile }) {
  const BG   = '#ebe1c8';
  const DIM  = '#888';
  const FAINT = 'rgba(0,0,0,0.18)';
  return (
    <PanelChrome
      idx={2} total={3}
      background={BG}
      eyebrow="// 02 — what i know"
      title={<>KNOWN<span style={{ color: 'rgba(0,0,0,0.18)' }}>.</span></>}
      sub="2× olympiad gold · 4 working languages · math-cs @ ucsd · serious about ideas at 19."
      footerLeft="the long version is in /thoughts"
      footerRight="/thoughts →"
      footerLink={APP_ROUTES.thoughts}
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '0.85fr 1.5fr 0.85fr',
        gap: 'clamp(0.7rem,1.6vw,1.5rem)',
        flex: 1, minHeight: 0, overflow: 'hidden',
      }}>
        {/* Trophies — desktop only */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflow: 'hidden' }}>
            <Eyebrow color={DIM}>// trophies</Eyebrow>
            {TROPHIES.map(t => (
              <div key={t.label} style={{
                border: '1px solid #000', padding: '8px 10px',
                display: 'flex', flexDirection: 'column', gap: 2,
                flex: 1, minHeight: 0, justifyContent: 'center',
              }}>
                <div style={{
                  fontFamily: GROTESK, fontWeight: 600,
                  fontSize: t.stamp.length > 5 ? 'clamp(0.82rem,1.2vw,1.05rem)' : 'clamp(1rem,1.7vw,1.5rem)',
                  color: '#000', lineHeight: 1, marginBottom: 2,
                }}>
                  [{t.stamp}]
                </div>
                <div style={{ fontSize: 10.5, color: '#000', lineHeight: 1.35 }}>{t.label}</div>
                <div style={{ fontSize: 9, color: DIM, letterSpacing: '0.1em', marginTop: 1 }}>{t.year}</div>
              </div>
            ))}
          </div>
        )}

        {/* Writings */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, minHeight: 0, overflow: 'hidden' }}>
          <Eyebrow color={DIM}>// recent thinking</Eyebrow>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flex: 1, overflow: 'hidden' }}>
            {WRITINGS.map((w, i) => <WritingCard key={i} w={w} />)}
          </div>
        </div>

        {/* Domains + tongues — desktop only */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0, justifyContent: 'space-between', overflow: 'hidden' }}>
            <div>
              <Eyebrow color={DIM}>// domains of attention</Eyebrow>
              <ul style={{ listStyle: 'none', padding: 0, margin: '7px 0 0', fontSize: 11.5, lineHeight: 1.5 }}>
                {DOMAINS.map(d => (
                  <li key={d} style={{ borderBottom: `1px dotted ${FAINT}`, padding: '3px 0', color: '#000' }}>
                    <span style={{ color: DIM, marginRight: 5 }}>·</span>{d}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow color={DIM}>// tongues</Eyebrow>
              <ul style={{ listStyle: 'none', padding: 0, margin: '7px 0 0', fontSize: 11.5, lineHeight: 1.5 }}>
                {TONGUES.map(t => (
                  <li key={t} style={{ borderBottom: `1px dotted ${FAINT}`, padding: '3px 0', color: '#000' }}>
                    <span style={{ color: DIM, marginRight: 5 }}>·</span>{t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </PanelChrome>
  );
}

// ── 03 NOW ────────────────────────────────────────────────────────────────────

function NowItem({ idx, children }) {
  return (
    <div style={{ display: 'flex', gap: 10, alignItems: 'baseline' }}>
      <span style={{ color: '#bbb', fontSize: 10, minWidth: 16, letterSpacing: '0.02em', flexShrink: 0 }}>
        {String(idx).padStart(2, '0')}
      </span>
      <span style={{ fontSize: 12.5, lineHeight: 1.4 }}>{children}</span>
    </div>
  );
}

function NowCell({ label, live, children }) {
  return (
    <div style={{
      padding: '0.8rem 0.85rem 0.8rem 0',
      borderRight: '1px solid rgba(0,0,0,0.08)',
      borderBottom: '1px solid rgba(0,0,0,0.08)',
      display: 'flex', flexDirection: 'column', gap: 9,
      minWidth: 0, overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <Eyebrow>// {label}</Eyebrow>
        {live && (
          <span className="rail-pulse" style={{
            display: 'inline-block', width: 6, height: 6,
            background: '#0a7', borderRadius: '50%', flexShrink: 0,
          }} />
        )}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {children}
      </div>
    </div>
  );
}

function NowPanel({ isMobile }) {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const timeStr = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = time.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }).toLowerCase();

  return (
    <PanelChrome
      idx={3} total={3}
      eyebrow="// 03 — now()"
      title={<>NOW<span style={{ color: '#ccc' }}>.</span></>}
      sub={`live status · last sync ${timeStr} pdt`}
      footerLeft={`updated whenever i push · ${dateStr}`}
      footerRight="/now →"
      footerLink={APP_ROUTES.now}
    >
      <Link to={APP_ROUTES.now} style={{ textDecoration: 'none', color: 'inherit', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gridAutoRows: isMobile ? 'auto' : '1fr',
          flex: 1, minHeight: 0,
          borderTop: '1px solid rgba(0,0,0,0.18)',
          borderLeft: '1px solid rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          <NowCell label="building">
            {NOWDATA.building.map((b, i) => <NowItem key={i} idx={i + 1}>{b}</NowItem>)}
          </NowCell>

          {!isMobile && (
            <NowCell label="learning">
              {NOWDATA.learning.map((l, i) => <NowItem key={i} idx={i + 1}>{l}</NowItem>)}
            </NowCell>
          )}

          <NowCell label="consuming">
            {NOWDATA.consuming.map((c, i) => (
              <NowItem key={i} idx={i + 1}>
                <span style={{ color: '#999', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase', marginRight: 6 }}>
                  {c.kind}
                </span>
                {c.val}
              </NowItem>
            ))}
          </NowCell>

          {!isMobile && (
            <NowCell label="writing">
              {NOWDATA.writing.map((w, i) => (
                <NowItem key={i} idx={i + 1}>
                  <span style={{
                    fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
                    color: w.state === 'wip' ? '#000' : w.state === 'stuck' ? '#a33' : '#999',
                    border: '1px solid currentColor', padding: '1px 5px', marginRight: 7, whiteSpace: 'nowrap',
                  }}>
                    {w.state}
                  </span>
                  {w.val}
                </NowItem>
              ))}
            </NowCell>
          )}

          {!isMobile && (
            <NowCell label="this week">
              {NOWDATA.thisWeek.map((d, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto', gap: 8, alignItems: 'baseline' }}>
                  <span style={{ color: '#999', fontSize: 9.5, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{d.day}</span>
                  <span style={{ fontSize: 12 }}>{d.val}</span>
                  <span style={{ fontSize: 9.5, color: '#888', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{d.tag}</span>
                </div>
              ))}
            </NowCell>
          )}

          <NowCell label="location" live>
            {NOWDATA.location.map((l, i) => <NowItem key={i} idx={i + 1}>{l}</NowItem>)}
            <div style={{ fontSize: 10.5, color: '#999', letterSpacing: '0.04em', marginTop: 4 }}>
              local time · {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </NowCell>
        </div>
      </Link>
    </PanelChrome>
  );
}

// ── Panels ordered: BUILT → KNOWN → NOW ──────────────────────────────────────

const PANELS = [BuiltPanel, KnownPanel, NowPanel];
const SLIDE_COUNT = PANELS.length;

// Background colors per panel — used by MainPage for the scroll fade
export const PANEL_BACKGROUNDS = ['#ffffff', '#ebe1c8', '#ffffff'];

// ── Main component ────────────────────────────────────────────────────────────

const HomePreviewRail = ({ progress, style, isMobile }) => {
  const [viewportHeight, setViewportHeight] = useState(() => {
    const pad = window.innerWidth >= 768 ? 80 : 140;
    return Math.max(window.innerHeight - pad - 28, 420);
  });

  useEffect(() => {
    const update = () => {
      const pad = window.innerWidth >= 768 ? 80 : 140;
      setViewportHeight(Math.max(window.innerHeight - pad - 28, 420));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  const slideGap = window.innerWidth >= 768 ? 36 : 24;
  const totalTravel = (viewportHeight + slideGap) * (SLIDE_COUNT - 1);
  const translateY = progress * totalTravel;
  const activeIndex = progress * (SLIDE_COUNT - 1);

  const getSlideStyle = (index) => {
    const dist = Math.abs(activeIndex - index);
    return {
      opacity:   Math.max(0.26, 1 - dist * 0.55),
      transform: `scale(${1 - Math.min(dist * 0.08, 0.16)})`,
      filter:    `blur(${Math.min(dist * 1.4, 2.8)}px)`,
    };
  };

  return (
    <div className="cards-section-parallax home-preview-rail" style={style}>
      <div className="home-preview-viewport">
        <div
          className="home-preview-track"
          style={{ transform: `translateY(-${translateY}px)`, gap: `${slideGap}px` }}
        >
          {PANELS.map((Panel, i) => (
            <div
              key={i}
              className="home-preview-slide"
              style={{
                minHeight: `${viewportHeight}px`,
                height: `${viewportHeight}px`,
                overflow: 'hidden',
                ...getSlideStyle(i),
              }}
            >
              <Panel isMobile={isMobile} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HomePreviewRail;
