import React from 'react';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';
import { APP_ROUTES } from '../config/site';

// ── Data ─────────────────────────────────────────────────────────
// Fallback used while profile.json is loading or if the fetch fails.
const NOW_FALLBACK = {
  date: 'may 16, 2026',
  location: 'la jolla, california',
  why: 'home for summer · sdx @ ucsd',
  tz: 'pdt',
  building: [
    { name: 'signalor.app', detail: 'v0.3 · google analytics for brands · in production', tag: 'live' },
    { name: 'sdx @ ucsd', detail: 'design-engineering club · 3 brand pitches this week', tag: 'wip' },
    { name: 'this very site', detail: 'preview rail redesign · the page you are on', tag: 'wip' },
  ],
  learning: [
    { name: 'rust', detail: 'borrow checker, finally' },
    { name: 'தமிழ் / tamil', detail: 'reading aloud, slowly' },
    { name: 'writing more clearly', detail: 'fewer words, harder meaning' },
  ],
  consuming: [
    { kind: 'sound', val: 'soldier of heaven — sabaton', meta: 'on repeat' },
    { kind: 'read', val: 'the undiscovered self — c.g. jung', meta: 'ch. 4 of 7' },
    { kind: 'watch', val: 'xavier: renegade angel', meta: 's2' },
    { kind: 'play', val: 'none actually', meta: '—' },
  ],
  writing: [
    { state: 'wip', val: 'a note on metaphor as compression' },
    { state: 'open', val: 'the politics of attention' },
    { state: 'stuck', val: 'a story about the fall of nineveh' },
  ],
  quickThoughts: [
    { thought: 'the borrow checker is just the compiler asking you to think about ownership explicitly. it\'s not hard, it\'s unfamiliar.', date: 'may 15, 2026' },
    { thought: 'every abstraction is a lie that happens to be useful.', date: 'may 12, 2026' },
  ],
};

// Context so cards can read live data without prop-drilling
const NowCtx = React.createContext(NOW_FALLBACK);

// ── Helpers ───────────────────────────────────────────────────────
function fmtStamp(ts) {
  const d = new Date(ts);
  const months = ['jan','feb','mar','apr','may','jun','jul','aug','sep','oct','nov','dec'];
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())} ${months[d.getMonth()]} ${String(d.getFullYear()).slice(-2)} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const LAYOUT_KEY = 'now_board_layout_v1';
const SLIPS_KEY  = 'now_board_slips_v1';

const NB = {
  paper: '#efe9d6',
  card:  '#fbf7e8',
  ink:   '#1c1a14',
  fade:  'rgba(28, 26, 20, 0.55)',
  rule:  'rgba(28, 26, 20, 0.14)',
  hair:  'rgba(28, 26, 20, 0.08)',
  red:   '#9b2a1e',
};

// ── Layout context ────────────────────────────────────────────────
const LayoutCtx = React.createContext(null);

function LayoutProvider({ defaults, children }) {
  const boardRef = React.useRef(null);
  const [layout, setLayout] = React.useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(LAYOUT_KEY) || '{}');
      return { ...defaults, ...stored };
    } catch (e) { return defaults; }
  });
  const maxZRef = React.useRef(
    Object.values(layout).reduce((m, p) => Math.max(m, (p && p.z) || 1), 1)
  );

  const persist = (next) => {
    try { localStorage.setItem(LAYOUT_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const update = React.useCallback((id, patch) => {
    setLayout((prev) => {
      const next = { ...prev, [id]: { ...(prev[id] || { x: 0, y: 0, z: 1 }), ...patch } };
      persist(next);
      return next;
    });
  }, []);

  const bringToFront = React.useCallback((id) => {
    maxZRef.current += 1;
    update(id, { z: maxZRef.current });
  }, [update]);

  const reset = React.useCallback(() => {
    try { localStorage.removeItem(LAYOUT_KEY); } catch (e) {}
    setLayout(defaults);
    maxZRef.current = Object.values(defaults).reduce((m, p) => Math.max(m, (p && p.z) || 1), 1);
  }, [defaults]);

  return (
    <LayoutCtx.Provider value={{ layout, update, bringToFront, reset, boardRef }}>
      {children}
    </LayoutCtx.Provider>
  );
}

// ── Draggable wrapper ─────────────────────────────────────────────
function Draggable({ id, defaultPos, width, children }) {
  const { layout, update, bringToFront, boardRef } = React.useContext(LayoutCtx);
  const pos = layout[id] || defaultPos || { x: 0, y: 0, z: 1 };
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const onPointerDown = (e) => {
    if (!e.target.closest('[data-drag-handle]')) return;
    if (e.target.closest('[data-no-drag]')) return;
    e.preventDefault();
    bringToFront(id);
    setDragging(true);
    const startX = e.clientX, startY = e.clientY;
    const startPos = { x: pos.x, y: pos.y };
    const boardRect = boardRef.current ? boardRef.current.getBoundingClientRect() : null;
    const cardRect  = ref.current     ? ref.current.getBoundingClientRect()     : null;

    const onMove = (ev) => {
      let nx = startPos.x + (ev.clientX - startX);
      let ny = startPos.y + (ev.clientY - startY);
      if (boardRect && cardRect) {
        nx = Math.max(0, Math.min(boardRect.width  - cardRect.width,  nx));
        ny = Math.max(0, Math.min(boardRect.height - cardRect.height, ny));
      }
      update(id, { x: nx, y: ny });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      style={{
        position: 'absolute',
        left: 0, top: 0,
        width,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: dragging ? 9999 : (pos.z || 1),
        transition: dragging ? 'none' : 'box-shadow 0.18s ease',
        filter: dragging
          ? 'drop-shadow(0 14px 24px rgba(0,0,0,0.18))'
          : 'drop-shadow(0 2px 8px rgba(0,0,0,0.06))',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  );
}

// ── Card shell ────────────────────────────────────────────────────
function Card({ eyebrow, title, subtitle, children, count, closable, onClose, dense }) {
  return (
    <div style={{
      background: NB.card,
      border: `1px solid ${NB.ink}`,
      fontFamily: "'Space Mono', monospace",
      color: NB.ink,
      display: 'flex', flexDirection: 'column',
    }}>
      <div data-drag-handle style={{
        cursor: 'grab',
        touchAction: 'none',
        padding: dense ? '10px 14px 8px 14px' : '14px 16px 10px 16px',
        borderBottom: `1px solid ${NB.hair}`,
        position: 'relative',
        userSelect: 'none',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ fontSize: 9.5, letterSpacing: '0.28em', textTransform: 'uppercase', color: NB.fade, marginBottom: 3 }}>
              {eyebrow}
            </div>
            <h3 style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600, fontSize: dense ? 18 : 22, margin: 0,
              letterSpacing: '-0.015em', textTransform: 'lowercase', lineHeight: 1.1,
            }}>{title}</h3>
            {subtitle && (
              <div style={{ fontSize: 10.5, color: NB.fade, marginTop: 3, lineHeight: 1.4 }}>{subtitle}</div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 2 }}>
            {count != null && (
              <span style={{ fontSize: 9.5, letterSpacing: '0.18em', textTransform: 'uppercase', color: NB.fade, whiteSpace: 'nowrap' }}>
                {count}
              </span>
            )}
            <span aria-hidden style={{
              fontFamily: "'Space Mono', monospace",
              color: NB.fade, fontSize: 14, letterSpacing: '-0.05em',
              lineHeight: 1, paddingTop: 2,
            }}>⠿</span>
            {closable && (
              <button
                data-no-drag
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                title="remove slip"
                style={{
                  background: 'none', border: 'none', color: NB.fade,
                  fontFamily: "'Space Mono', monospace", fontSize: 13,
                  cursor: 'pointer', padding: '0 2px', lineHeight: 1,
                }}>✕</button>
            )}
          </div>
        </div>
      </div>
      <div style={{ padding: dense ? '10px 14px 12px 14px' : '14px 16px 16px 16px' }}>
        {children}
      </div>
    </div>
  );
}

// ── Row primitives ────────────────────────────────────────────────
function Row({ leading, trailing, children, borderless }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: `${leading ? 'auto ' : ''}1fr${trailing ? ' auto' : ''}`,
      gap: 10, alignItems: 'baseline',
      padding: '7px 0',
      borderBottom: borderless ? 'none' : `1px dotted ${NB.rule}`,
      fontSize: 13, lineHeight: 1.45,
    }}>
      {leading && <span style={{ minWidth: 0 }}>{leading}</span>}
      <span style={{ overflow: 'hidden' }}>{children}</span>
      {trailing && <span style={{ color: NB.fade, fontSize: 11, whiteSpace: 'nowrap' }}>{trailing}</span>}
    </div>
  );
}

function Tag({ children, color = NB.ink }) {
  return (
    <span style={{
      fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase',
      border: `1px solid ${color}`, color, padding: '1px 5px',
      whiteSpace: 'nowrap',
    }}>{children}</span>
  );
}

function Kind({ children }) {
  return (
    <span style={{
      fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase',
      color: NB.fade, minWidth: 50, display: 'inline-block',
    }}>{children}</span>
  );
}

// ── Content cards ─────────────────────────────────────────────────
function BuildingCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 01" title="building" subtitle="projects with the lamp on" count={`${now.building.length} active`}>
      {now.building.map((b, i) => (
        <Row key={i} leading={<Tag color={b.tag === 'live' ? NB.red : NB.ink}>{b.tag}</Tag>} borderless={i === now.building.length - 1}>
          <span style={{ fontWeight: 500 }}>{b.name}</span>
          <span style={{ color: NB.fade }}> — {b.detail}</span>
        </Row>
      ))}
    </Card>
  );
}

function ConsumingCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 02" title="consuming" subtitle="inputs · sound, read, watch, play" count={`${now.consuming.length} streams`}>
      {now.consuming.map((c, i) => (
        <Row key={i} leading={<Kind>{c.kind}</Kind>} trailing={c.meta} borderless={i === now.consuming.length - 1}>
          {c.val}
        </Row>
      ))}
    </Card>
  );
}

function LearningCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 03" title="learning" subtitle="slow burns · cognitive load" count={`${now.learning.length} open`}>
      {now.learning.map((l, i) => (
        <Row key={i} borderless={i === now.learning.length - 1}>
          <span style={{ fontWeight: 500 }}>{l.name}</span>
          <span style={{ color: NB.fade }}> — {l.detail}</span>
        </Row>
      ))}
    </Card>
  );
}

function WritingCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 04" title="writing" subtitle="drafts in flight" count={`${now.writing.length} drafts`}>
      {now.writing.map((w, i) => (
        <Row
          key={i} borderless={i === now.writing.length - 1}
          leading={<Tag color={w.state === 'stuck' ? NB.red : NB.ink}>{w.state}</Tag>}
        >
          {w.val}
        </Row>
      ))}
    </Card>
  );
}

function QuickThoughtsCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 05" title="quick thoughts" subtitle="raw — not essays" count={`${now.quickThoughts.length} notes`}>
      {now.quickThoughts.map((t, i) => (
        <Row key={i} trailing={t.date} borderless={i === now.quickThoughts.length - 1}>
          {t.thought}
        </Row>
      ))}
    </Card>
  );
}

function LocationCard() {
  const now = React.useContext(NowCtx);
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const fmt = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  return (
    <Card eyebrow="// at" title={now.location} subtitle={now.why} count={`${fmt} ${now.tz}`}>
      <div style={{ fontSize: 12, color: NB.fade, lineHeight: 1.6 }}>
        {`// tracking ${now.tz.toLowerCase()}. on campus most days. dm me if you're nearby.`}
      </div>
    </Card>
  );
}

// ── Patron form + slip card ───────────────────────────────────────
const SLIP_KINDS = ['read', 'sound', 'watch', 'play', 'thought'];

function PatronFormCard({ onSubmit }) {
  const [draft, setDraft] = React.useState('');
  const [name, setName]   = React.useState('');
  const [kind, setKind]   = React.useState('read');

  const submit = (e) => {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    onSubmit({ name: (name.trim() || 'anon.').slice(0, 24), kind, text: trimmed.slice(0, 160) });
    setDraft('');
  };

  const inputStyle = {
    background: 'transparent', border: 'none', borderBottom: `1px solid ${NB.ink}`,
    padding: '6px 2px', fontFamily: "'Space Mono', monospace",
    fontSize: 12.5, color: NB.ink, outline: 'none', width: '100%',
  };

  return (
    <Card
      eyebrow="// guests"
      title="leave a slip"
      subtitle="recommend something for me. it lands on the board — drag it where you want."
    >
      <form onSubmit={submit} onPointerDown={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
          {SLIP_KINDS.map((k) => (
            <button
              type="button" key={k}
              data-no-drag
              onPointerDown={(e) => e.stopPropagation()}
              onClick={() => setKind(k)}
              style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: 10.5, letterSpacing: '0.18em', textTransform: 'uppercase',
                padding: '4px 10px',
                background: kind === k ? NB.ink : 'transparent',
                color: kind === k ? NB.card : NB.ink,
                border: `1px solid ${NB.ink}`,
                cursor: 'pointer',
              }}
            >{k}</button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '70px 1fr', gap: 12, alignItems: 'baseline', marginBottom: 12 }}>
          <span style={{ fontSize: 9.5, letterSpacing: '0.22em', color: NB.fade, textTransform: 'uppercase' }}>signed</span>
          <input
            data-no-drag
            type="text" placeholder="your name (or anon.)" maxLength={24}
            value={name} onChange={(e) => setName(e.target.value)} style={inputStyle}
          />
          <span style={{ fontSize: 9.5, letterSpacing: '0.22em', color: NB.fade, textTransform: 'uppercase', alignSelf: 'flex-start', paddingTop: 8 }}>rec.</span>
          <textarea
            data-no-drag rows={2} maxLength={160}
            placeholder="title — one line of why"
            value={draft} onChange={(e) => setDraft(e.target.value)}
            style={{ ...inputStyle, resize: 'none', lineHeight: 1.5 }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 6 }}>
          <span style={{ fontSize: 9.5, letterSpacing: '0.18em', color: NB.fade, textTransform: 'uppercase' }}>
            {draft.length}/160 · stays on your device
          </span>
          <button
            type="submit"
            data-no-drag
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              background: NB.ink, color: NB.card, border: `1px solid ${NB.ink}`,
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '8px 20px', cursor: 'pointer',
            }}
          >file →</button>
        </div>
      </form>
    </Card>
  );
}

function SlipCardBody({ slip, onClose }) {
  return (
    <Card
      eyebrow={`// slip · ${slip.kind || 'rec'}`}
      title={slip.name}
      dense
      closable
      onClose={onClose}
      count={fmtStamp(slip._ts || slip.ts).split(' · ')[0]}
    >
      <div style={{ fontSize: 12.5, color: NB.ink, lineHeight: 1.5 }}>
        {slip.text}
      </div>
    </Card>
  );
}

// ── Page header ───────────────────────────────────────────────────
function PageHeader({ onReset, slipCount, onBack }) {
  const now = React.useContext(NowCtx);
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  const fmt = time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }).toLowerCase();
  return (
    <header style={{
      background: NB.paper, color: NB.ink,
      fontFamily: "'Space Mono', monospace",
      padding: '28px 40px 18px 40px',
      borderBottom: `1px solid ${NB.ink}`,
    }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: NB.fade, marginBottom: 8,
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none', border: 'none', color: NB.fade,
            fontFamily: "'Space Mono', monospace", fontSize: 10,
            letterSpacing: '0.28em', textTransform: 'uppercase',
            cursor: 'pointer', padding: 0,
          }}
        >← alexgaoth.com</button>
        <span>now</span>
        <span>{fmt} {now.tz}</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 30, alignItems: 'flex-end' }}>
        <div>
          <h1 style={{
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600, fontSize: 72, margin: 0,
            letterSpacing: '-0.035em', lineHeight: 0.95,
            textTransform: 'lowercase',
          }}>the now page<span style={{ color: NB.red }}>.</span></h1>
          <p style={{ fontSize: 12.5, color: NB.fade, margin: '8px 0 0 0', maxWidth: '68ch', lineHeight: 1.55 }}>
            {`// a periodic record of what i'm building, learning, consuming, and where i'm doing it from. drag cards around. leave a slip with a recommendation — it lands on the board with the rest.`}
          </p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, fontSize: 11 }}>
          <span style={{ letterSpacing: '0.18em', color: NB.fade, textTransform: 'uppercase' }}>
            updated {now.date}
          </span>
          <span style={{ letterSpacing: '0.06em', color: NB.fade }}>
            {slipCount} visitor slip{slipCount === 1 ? '' : 's'} on board
          </span>
          <button
            onClick={onReset}
            style={{
              background: 'transparent', color: NB.ink,
              border: `1px solid ${NB.ink}`,
              fontFamily: "'Space Mono', monospace", fontSize: 10,
              letterSpacing: '0.2em', textTransform: 'uppercase',
              padding: '5px 12px', cursor: 'pointer', marginTop: 4,
            }}
          >↺ reset layout</button>
        </div>
      </div>
    </header>
  );
}

// ── Default card positions ─────────────────────────────────────────
const CARDS = [
  { id: 'building',      w: 380, defaultPos: { x:  20, y:  20, z: 1 } },
  { id: 'consuming',     w: 420, defaultPos: { x: 420, y:  20, z: 2 } },
  { id: 'learning',      w: 360, defaultPos: { x: 860, y:  20, z: 3 } },
  { id: 'quickthoughts', w: 560, defaultPos: { x:  20, y: 320, z: 4 } },
  { id: 'writing',       w: 360, defaultPos: { x: 600, y: 320, z: 5 } },
  { id: 'location',      w: 360, defaultPos: { x: 600, y: 520, z: 6 } },
  { id: 'patron',        w: 460, defaultPos: { x:  20, y: 540, z: 7 } },
];

const DEFAULT_LAYOUT = CARDS.reduce((acc, c) => { acc[c.id] = c.defaultPos; return acc; }, {});

const SEED_SLIPS = (now) => [
  { id: 's-a', name: 'i. yelchin', kind: 'watch', text: 'koyaanisqatsi (1982). watch in one sitting, ideally late.', _ts: now - 3600e3 * 31, pos: { x: 500, y: 600, z: 10 } },
  { id: 's-b', name: 'a. mehta',   kind: 'read',  text: 'the master and his emissary — iain mcgilchrist. answers some of jung.', _ts: now - 3600e3 * 9, pos: { x: 820, y: 720, z: 11 } },
  { id: 's-c', name: 'anon.',      kind: 'sound', text: 'caroline polachek — desire, i want to turn into you. full album.', _ts: now - 3600e3 * 2, pos: { x: 530, y: 800, z: 12 } },
];

// ── Board surface ─────────────────────────────────────────────────
function BoardSurface({ slips, addSlip, removeSlip, ctx }) {
  const { boardRef } = ctx;
  const [bh, setBh] = React.useState(900);

  React.useEffect(() => {
    const heights = { building: 230, consuming: 260, learning: 200, quickthoughts: 200, writing: 200, location: 130, patron: 320 };
    const allIds = [...CARDS.map((c) => c.id), ...slips.map((s) => s.id)];
    let maxBottom = 0;
    allIds.forEach((id) => {
      const pos = ctx.layout[id] || {};
      const h = heights[id] || 160;
      const bottom = (pos.y || 0) + h;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    setBh(Math.max(900, maxBottom + 80));
  }, [ctx.layout, slips.length]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div style={{
      background: NB.paper,
      backgroundImage: `
        radial-gradient(rgba(80,60,30,0.05) 1px, transparent 1px),
        radial-gradient(rgba(80,60,30,0.03) 1px, transparent 1px)
      `,
      backgroundSize: '4px 4px, 9px 9px',
      backgroundPosition: '0 0, 2px 2px',
      minHeight: 'calc(100vh - 200px)',
      padding: '24px 0',
    }}>
      <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
        <div
          ref={boardRef}
          style={{
            position: 'relative',
            width: 1300,
            height: bh,
            margin: '0 auto',
            borderTop: `1px dashed ${NB.rule}`,
            borderBottom: `1px dashed ${NB.rule}`,
          }}
        >
          <Draggable id="building"  defaultPos={DEFAULT_LAYOUT.building}  width={380}><BuildingCard /></Draggable>
          <Draggable id="consuming" defaultPos={DEFAULT_LAYOUT.consuming} width={420}><ConsumingCard /></Draggable>
          <Draggable id="learning"  defaultPos={DEFAULT_LAYOUT.learning}  width={360}><LearningCard /></Draggable>
          <Draggable id="quickthoughts" defaultPos={DEFAULT_LAYOUT.quickthoughts} width={560}><QuickThoughtsCard /></Draggable>
          <Draggable id="writing"   defaultPos={DEFAULT_LAYOUT.writing}   width={360}><WritingCard /></Draggable>
          <Draggable id="location"  defaultPos={DEFAULT_LAYOUT.location}  width={360}><LocationCard /></Draggable>
          <Draggable id="patron"    defaultPos={DEFAULT_LAYOUT.patron}    width={460}>
            <PatronFormCard onSubmit={addSlip} />
          </Draggable>

          {slips.map((s) => (
            <Draggable key={s.id} id={s.id} defaultPos={s.pos || { x: 500, y: 600, z: 20 }} width={300}>
              <SlipCardBody slip={s} onClose={() => removeSlip(s.id)} />
            </Draggable>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer() {
  return (
    <footer style={{
      background: NB.paper, color: NB.fade,
      fontFamily: "'Space Mono', monospace",
      padding: '18px 40px 32px 40px',
      borderTop: `1px solid ${NB.ink}`,
      display: 'flex', justifyContent: 'space-between',
      fontSize: 10.5, letterSpacing: '0.22em', textTransform: 'uppercase',
    }}>
      <span>{`// derek sivers — /now movement`}</span>
      <span>set in space mono &amp; space grotesk</span>
      <span>kept locally · nothing leaves your device</span>
    </footer>
  );
}

// ── Root board component ──────────────────────────────────────────
function Board({ onBack, now }) {
  const [slips, setSlips] = React.useState(() => {
    try { return JSON.parse(localStorage.getItem(SLIPS_KEY) || '[]'); } catch (e) { return []; }
  });

  React.useEffect(() => {
    if (slips.length === 0) {
      const seed = SEED_SLIPS(Date.now());
      setSlips(seed);
      try { localStorage.setItem(SLIPS_KEY, JSON.stringify(seed)); } catch (e) {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistSlips = (next) => {
    setSlips(next);
    try { localStorage.setItem(SLIPS_KEY, JSON.stringify(next)); } catch (e) {}
  };

  const addSlip = (slip) => {
    const spawnX = 480 + Math.random() * 200;
    const spawnY = 620 + Math.random() * 140;
    const id = 's-' + Date.now();
    const z = 20 + slips.length;
    const next = [{ ...slip, id, _ts: Date.now(), pos: { x: spawnX, y: spawnY, z } }, ...slips].slice(0, 30);
    persistSlips(next);
  };

  const removeSlip = (id) => persistSlips(slips.filter((s) => s.id !== id));

  const slipDefaults = React.useMemo(
    () => slips.reduce((acc, s) => { acc[s.id] = s.pos || { x: 500, y: 600, z: 20 }; return acc; }, {}),
    [slips]
  );
  const defaults = React.useMemo(() => ({ ...DEFAULT_LAYOUT, ...slipDefaults }), [slipDefaults]);

  const handleReset = (ctx) => {
    ctx.reset();
    persistSlips([]);
  };

  return (
    <NowCtx.Provider value={now}>
    <LayoutProvider defaults={defaults}>
      <LayoutCtx.Consumer>
        {(ctx) => (
          <>
            <PageHeader
              slipCount={slips.length}
              onReset={() => handleReset(ctx)}
              onBack={onBack}
            />
            <BoardSurface
              slips={slips}
              addSlip={addSlip}
              removeSlip={removeSlip}
              ctx={ctx}
            />
            <Footer />
          </>
        )}
      </LayoutCtx.Consumer>
    </LayoutProvider>
    </NowCtx.Provider>
  );
}

// ── Page export ───────────────────────────────────────────────────
const NowPage = () => {
  const navigate = useNavigate();
  const [now, setNow] = React.useState(NOW_FALLBACK);

  React.useEffect(() => {
    fetch('/profile.json')
      .then((r) => r.json())
      .then((data) => { if (data.now) setNow(data.now); })
      .catch(() => {}); // keep fallback on error
  }, []);

  // swap body background to cream while on this page
  React.useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = NB.paper;
    return () => { document.body.style.background = prev; };
  }, []);

  return (
    <>
      <SEO
        title="Now — Alex Gao"
        description="What Alex Gao is doing now — building, learning, consuming."
        keywords={['Alex Gao', 'alexgaoth', 'now']}
        path={APP_ROUTES.now}
      />
      <div style={{ minHeight: '100vh', background: NB.paper }}>
        <Board onBack={() => navigate(APP_ROUTES.home)} now={now} />
      </div>
    </>
  );
};

export default NowPage;
