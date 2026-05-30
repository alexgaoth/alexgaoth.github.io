import React from "react";
import { useNavigate } from "react-router-dom";
import SEO from "../components/SEO";
import { APP_ROUTES } from "../config/site";
import { supabase } from "../lib/supabase";
import { NOW_FALLBACK } from "../data/nowData";

// Context so cards can read live data without prop-drilling
const NowCtx = React.createContext(NOW_FALLBACK);

const NB = {
  paper: "#efe9d6",
  card: "#fbf7e8",
  ink: "#1c1a14",
  fade: "rgba(28, 26, 20, 0.55)",
  rule: "rgba(28, 26, 20, 0.14)",
  hair: "rgba(28, 26, 20, 0.08)",
  red: "#9b2a1e",
};

// ── Layout context ────────────────────────────────────────────────
const LayoutCtx = React.createContext(null);

function LayoutProvider({ defaults, children }) {
  const boardRef = React.useRef(null);
  const [layout, setLayout] = React.useState(defaults);
  const maxZRef = React.useRef(
    Object.values(defaults).reduce((m, p) => Math.max(m, (p && p.z) || 1), 1),
  );

  const update = React.useCallback((id, patch) => {
    setLayout((prev) => ({
      ...prev,
      [id]: { ...(prev[id] || { x: 0, y: 0, z: 1 }), ...patch },
    }));
  }, []);

  const bringToFront = React.useCallback(
    (id) => {
      maxZRef.current += 1;
      update(id, { z: maxZRef.current });
    },
    [update],
  );

  return (
    <LayoutCtx.Provider value={{ layout, update, bringToFront, boardRef }}>
      {children}
    </LayoutCtx.Provider>
  );
}

// ── Draggable wrapper ─────────────────────────────────────────────
function Draggable({ id, width, children }) {
  const { layout, update, bringToFront, boardRef } =
    React.useContext(LayoutCtx);
  const pos = layout[id] || { x: 0, y: 0, z: 1 };
  const ref = React.useRef(null);
  const [dragging, setDragging] = React.useState(false);

  const onPointerDown = (e) => {
    if (!e.target.closest("[data-drag-handle]")) return;
    if (e.target.closest("[data-no-drag]")) return;
    e.preventDefault();
    bringToFront(id);
    setDragging(true);
    const startX = e.clientX,
      startY = e.clientY;
    const startPos = { x: pos.x, y: pos.y };
    const boardRect = boardRef.current
      ? boardRef.current.getBoundingClientRect()
      : null;
    const cardRect = ref.current ? ref.current.getBoundingClientRect() : null;

    const onMove = (ev) => {
      let nx = startPos.x + (ev.clientX - startX);
      let ny = startPos.y + (ev.clientY - startY);
      if (boardRect && cardRect) {
        nx = Math.max(0, Math.min(boardRect.width - cardRect.width, nx));
        ny = Math.max(0, Math.min(boardRect.height - cardRect.height, ny));
      }
      update(id, { x: nx, y: ny });
    };
    const onUp = () => {
      setDragging(false);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <div
      ref={ref}
      onPointerDown={onPointerDown}
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        transform: `translate(${pos.x}px, ${pos.y}px)`,
        zIndex: dragging ? 9999 : pos.z || 1,
        transition: dragging ? "none" : "box-shadow 0.18s ease",
        filter: dragging
          ? "drop-shadow(0 14px 24px rgba(0,0,0,0.18))"
          : "drop-shadow(0 2px 8px rgba(0,0,0,0.06))",
        willChange: "transform",
      }}
    >
      {children}
    </div>
  );
}

// ── Card shell ────────────────────────────────────────────────────
function Card({
  eyebrow,
  title,
  subtitle,
  children,
  count,
  closable,
  onClose,
  dense,
}) {
  return (
    <div
      style={{
        background: NB.card,
        border: `1px solid ${NB.ink}`,
        fontFamily: "'Space Mono', monospace",
        color: NB.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        data-drag-handle
        style={{
          cursor: "grab",
          touchAction: "none",
          padding: dense ? "10px 14px 8px 14px" : "14px 16px 10px 16px",
          borderBottom: `1px solid ${NB.hair}`,
          position: "relative",
          userSelect: "none",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 12,
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: "0.28em",
                textTransform: "uppercase",
                color: NB.fade,
                marginBottom: 3,
              }}
            >
              {eyebrow}
            </div>
            <h3
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontWeight: 600,
                fontSize: dense ? 18 : 22,
                margin: 0,
                letterSpacing: "-0.015em",
                textTransform: "lowercase",
                lineHeight: 1.1,
              }}
            >
              {title}
            </h3>
            {subtitle && (
              <div
                style={{
                  fontSize: 10.5,
                  color: NB.fade,
                  marginTop: 3,
                  lineHeight: 1.4,
                }}
              >
                {subtitle}
              </div>
            )}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              paddingTop: 2,
            }}
          >
            {count != null && (
              <span
                style={{
                  fontSize: 9.5,
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: NB.fade,
                  whiteSpace: "nowrap",
                }}
              >
                {count}
              </span>
            )}
            <span
              aria-hidden
              style={{
                fontFamily: "'Space Mono', monospace",
                color: NB.fade,
                fontSize: 14,
                letterSpacing: "-0.05em",
                lineHeight: 1,
                paddingTop: 2,
              }}
            >
              ⠿
            </span>
            {closable && (
              <button
                data-no-drag
                onPointerDown={(e) => e.stopPropagation()}
                onClick={onClose}
                title="remove slip"
                style={{
                  background: "none",
                  border: "none",
                  color: NB.fade,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 13,
                  cursor: "pointer",
                  padding: "0 2px",
                  lineHeight: 1,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>
      <div
        style={{
          padding: dense ? "10px 14px 12px 14px" : "14px 16px 16px 16px",
        }}
      >
        {children}
      </div>
    </div>
  );
}

// ── Row primitives ────────────────────────────────────────────────
function Row({ leading, trailing, children, borderless }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `${leading ? "auto " : ""}1fr${trailing ? " auto" : ""}`,
        gap: 10,
        alignItems: "baseline",
        padding: "7px 0",
        borderBottom: borderless ? "none" : `1px dotted ${NB.rule}`,
        fontSize: 13,
        lineHeight: 1.45,
      }}
    >
      {leading && <span style={{ minWidth: 0 }}>{leading}</span>}
      <span style={{ overflow: "hidden" }}>{children}</span>
      {trailing && (
        <span style={{ color: NB.fade, fontSize: 11, whiteSpace: "nowrap" }}>
          {trailing}
        </span>
      )}
    </div>
  );
}

function Tag({ children, color = NB.ink }) {
  return (
    <span
      style={{
        fontSize: 9,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        border: `1px solid ${color}`,
        color,
        padding: "1px 5px",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </span>
  );
}

function Kind({ children }) {
  return (
    <span
      style={{
        fontSize: 10,
        letterSpacing: "0.18em",
        textTransform: "uppercase",
        color: NB.fade,
        minWidth: 50,
        display: "inline-block",
      }}
    >
      {children}
    </span>
  );
}

// ── Content cards ─────────────────────────────────────────────────
function BuildingCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 01" title="building">
      {now.building.map((b, i) => (
        <Row
          key={i}
          leading={
            <Tag color={b.tag === "live" ? NB.red : NB.ink}>{b.tag}</Tag>
          }
          borderless={i === now.building.length - 1}
        >
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
    <Card eyebrow="// 02" title="consuming">
      {now.consuming.map((c, i) => (
        <Row
          key={i}
          leading={<Kind>{c.kind}</Kind>}
          trailing={c.meta}
          borderless={i === now.consuming.length - 1}
        >
          {c.val}
        </Row>
      ))}
    </Card>
  );
}

function LearningCard() {
  const now = React.useContext(NowCtx);
  return (
    <Card eyebrow="// 03" title="learning">
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
    <Card eyebrow="// 04" title="writing">
      {now.writing.map((w, i) => (
        <Row
          key={i}
          borderless={i === now.writing.length - 1}
          leading={
            <Tag color={w.state === "stuck" ? NB.red : NB.ink}>{w.state}</Tag>
          }
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
    <Card eyebrow="// 05" title="quick thoughts">
      {now.quickThoughts.map((t, i) => (
        <Row
          key={i}
          trailing={t.date}
          borderless={i === now.quickThoughts.length - 1}
        >
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
  const fmt = time
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    .toLowerCase();
  return (
    <Card
      eyebrow="// at"
      title={now.location}
      subtitle={now.why}
      count={`${fmt} ${now.tz}`}
    >
      <div style={{ fontSize: 12, color: NB.fade, lineHeight: 1.6 }}>
        {`// tracking ${now.tz.toLowerCase()}. on campus most days. dm me if you're nearby.`}
      </div>
    </Card>
  );
}

// ── Guest slip card (editable name + content, fixed label) ──────
function GuestSlipCard({ content, onUpdate }) {
  const { name = "", text = "" } = content || {};
  const taRef = React.useRef(null);

  React.useEffect(() => {
    const el = taRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  }, [text]);

  const baseInput = {
    background: "transparent",
    border: "none",
    outline: "none",
    fontFamily: "'Space Mono', monospace",
    color: NB.ink,
    width: "100%",
  };

  return (
    <div
      style={{
        background: NB.card,
        border: `1px solid ${NB.ink}`,
        fontFamily: "'Space Mono', monospace",
        color: NB.ink,
        display: "flex",
        flexDirection: "column",
        width: "100%",
      }}
    >
      {/* fixed drag handle — label cannot be changed */}
      <div
        data-drag-handle
        style={{
          cursor: "grab",
          touchAction: "none",
          userSelect: "none",
          padding: "10px 14px 8px 14px",
          borderBottom: `1px solid ${NB.hair}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            fontSize: 9.5,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: NB.fade,
          }}
        >
          {`// guest slip`}
        </div>
        <span
          aria-hidden
          style={{
            color: NB.fade,
            fontSize: 14,
            letterSpacing: "-0.05em",
            lineHeight: 1,
          }}
        >
          ⠿
        </span>
      </div>

      {/* editable name — styled like a card title */}
      <div
        style={{
          padding: "10px 14px 6px 14px",
          borderBottom: `1px solid ${NB.hair}`,
        }}
      >
        <input
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          type="text"
          maxLength={32}
          placeholder="your name"
          value={name}
          onChange={(e) => onUpdate({ name: e.target.value, text })}
          aria-label="your name"
          style={{
            ...baseInput,
            fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 600,
            fontSize: 18,
            letterSpacing: "-0.015em",
            textTransform: "lowercase",
          }}
        />
      </div>

      {/* editable content */}
      <div style={{ padding: "10px 14px 12px 14px" }}>
        <textarea
          ref={taRef}
          data-no-drag
          onPointerDown={(e) => e.stopPropagation()}
          rows={1}
          maxLength={200}
          value={text}
          onChange={(e) => onUpdate({ name, text: e.target.value })}
          aria-label="leave a note"
          style={{
            ...baseInput,
            resize: "none",
            overflow: "hidden",
            fontSize: 12.5,
            lineHeight: 1.55,
            minHeight: "2.6em",
            display: "block",
          }}
        />
        <div
          style={{
            fontSize: 9,
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: NB.fade,
            marginTop: 4,
          }}
        >
          {text.length}/200
        </div>
      </div>
    </div>
  );
}

// ── Page header ───────────────────────────────────────────────────
function PageHeader({ onBack }) {
  const now = React.useContext(NowCtx);
  const [time, setTime] = React.useState(new Date());
  React.useEffect(() => {
    // HH:MM display only — 60s interval is sufficient
    const id = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);
  const fmt = time
    .toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    .toLowerCase();
  return (
    <header
      style={{
        background: NB.paper,
        color: NB.ink,
        fontFamily: "'Space Mono', monospace",
        padding: "28px 40px 18px 40px",
        borderBottom: `1px solid ${NB.ink}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          fontSize: 10,
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: NB.fade,
          marginBottom: 8,
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: NB.fade,
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            cursor: "pointer",
            padding: 0,
          }}
        >
          ← alexgaoth.com
        </button>
        <span>now</span>
        <span>
          {fmt} {now.tz}
        </span>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr auto",
          gap: 30,
          alignItems: "flex-end",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 600,
              fontSize: 72,
              margin: 0,
              letterSpacing: "-0.035em",
              lineHeight: 0.95,
              textTransform: "lowercase",
            }}
          >
            me<span style={{ color: NB.red }}> - </span>rn
          </h1>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 6,
            fontSize: 11,
          }}
        >
          <span
            style={{
              letterSpacing: "0.18em",
              color: NB.fade,
              textTransform: "uppercase",
            }}
          >
            updated {now.date}
          </span>
        </div>
      </div>
    </header>
  );
}

// ── Dynamic layout — fresh random positions on every page load ────
const GUEST_IDS = ["gslip-1", "gslip-2", "gslip-3", "gslip-4", "gslip-5"];
const CONTENT_IDS = [
  "building",
  "consuming",
  "learning",
  "quickthoughts",
  "writing",
  "location",
];

function getBoardPadding() {
  const vw = window.innerWidth;
  if (vw >= 2560) return 200;
  if (vw >= 1920) return 140;
  if (vw >= 1440) return 100;
  if (vw >= 1024) return 60;
  return 40;
}

function generateLayout(W) {
  const clamp = (min, v, max) => Math.max(min, Math.min(max, v));
  const j = (amp) => (Math.random() - 0.5) * amp;

  const gslipW = clamp(160, Math.round(W * 0.14), 300);

  const cw = {
    building: clamp(240, Math.round(W * 0.22), 460),
    consuming: clamp(260, Math.round(W * 0.25), 500),
    learning: clamp(220, Math.round(W * 0.2), 420),
    quickthoughts: clamp(340, Math.round(W * 0.34), 640),
    writing: clamp(220, Math.round(W * 0.2), 420),
    location: clamp(220, Math.round(W * 0.2), 420),
    gslip: gslipW,
  };

  const gap = Math.round(W * 0.026);

  const r1w = cw.building + cw.consuming + cw.learning + gap * 2;
  const r1x = (W - r1w) / 2;
  const r1y = 28;

  const r2w = cw.quickthoughts + cw.writing + gap;
  const r2x = (W - r2w) / 2;
  const r2y = r1y + 260 + gap;

  const r3y = r2y + 210 + gap;

  const gw = cw.gslip;
  const guestTotal = 5 * gw + 4 * gap;
  const gx0 = (W - guestTotal) / 2;
  const r4y = r3y + 150 + gap;

  const layout = {};
  layout.building = { x: r1x + j(22), y: r1y + j(6), z: 1 };
  layout.consuming = { x: r1x + cw.building + gap + j(22), y: r1y + j(6), z: 2 };
  layout.learning = { x: r1x + cw.building + cw.consuming + gap * 2 + j(22), y: r1y + j(6), z: 3 };
  layout.quickthoughts = { x: r2x + j(22), y: r2y + j(6), z: 4 };
  layout.writing = { x: r2x + cw.quickthoughts + gap + j(22), y: r2y + j(6), z: 5 };
  layout.location = { x: r2x + cw.quickthoughts + gap + j(22), y: r3y + j(6), z: 6 };

  GUEST_IDS.forEach((id, i) => {
    layout[id] = {
      x: gx0 + i * (gw + gap) + j(18),
      y: r4y + (i % 2) * 48 + j(12),
      z: 8 + i,
    };
  });

  return { layout, cw };
}

// ── Mobile fallback — simple stacked list, no drag ────────────────
function MobileView({ guestContent, updateGuest }) {
  return (
    <div style={{ background: NB.paper, padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
      <BuildingCard />
      <LearningCard />
      <ConsumingCard />
      <WritingCard />
      <QuickThoughtsCard />
      <LocationCard />
      <div style={{ marginTop: "4px" }}>
        {GUEST_IDS.slice(0, 2).map(id => (
          <div key={id} style={{ marginBottom: "12px" }}>
            <GuestSlipCard content={guestContent[id]} onUpdate={val => updateGuest(id, val)} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Board surface ─────────────────────────────────────────────────
function BoardSurface({ guestContent, updateGuest, cw, ctx, boardPad }) {
  const { boardRef } = ctx;
  const [bh, setBh] = React.useState(1100);

  React.useEffect(() => {
    const heights = {
      building: 230,
      consuming: 260,
      learning: 200,
      quickthoughts: 210,
      writing: 200,
      location: 140,
    };
    let maxBottom = 0;
    [...CONTENT_IDS, ...GUEST_IDS].forEach((id) => {
      const pos = ctx.layout[id] || {};
      const h = heights[id] || 220;
      const bottom = (pos.y || 0) + h;
      if (bottom > maxBottom) maxBottom = bottom;
    });
    setBh(Math.max(1100, maxBottom + 80));
  }, [ctx.layout]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div
      style={{
        background: NB.paper,
        backgroundImage: `
        radial-gradient(rgba(80,60,30,0.05) 1px, transparent 1px),
        radial-gradient(rgba(80,60,30,0.03) 1px, transparent 1px)
      `,
        backgroundSize: "4px 4px, 9px 9px",
        backgroundPosition: "0 0, 2px 2px",
        minHeight: "calc(100vh - 200px)",
        padding: "24px 0",
      }}
    >
      <div style={{ padding: `0 ${boardPad}px`, boxSizing: "border-box" }}>
        <div
          ref={boardRef}
          style={{
            position: "relative",
            width: "100%",
            height: bh,
            borderTop: `1px dashed ${NB.rule}`,
            borderBottom: `1px dashed ${NB.rule}`,
          }}
        >
          <Draggable id="building" width={cw.building}>
            <BuildingCard />
          </Draggable>
          <Draggable id="consuming" width={cw.consuming}>
            <ConsumingCard />
          </Draggable>
          <Draggable id="learning" width={cw.learning}>
            <LearningCard />
          </Draggable>
          <Draggable id="quickthoughts" width={cw.quickthoughts}>
            <QuickThoughtsCard />
          </Draggable>
          <Draggable id="writing" width={cw.writing}>
            <WritingCard />
          </Draggable>
          <Draggable id="location" width={cw.location}>
            <LocationCard />
          </Draggable>

          {GUEST_IDS.map((id) => (
            <Draggable key={id} id={id} width={cw.gslip}>
              <GuestSlipCard
                content={guestContent[id]}
                onUpdate={(val) => updateGuest(id, val)}
              />
            </Draggable>
          ))}
        </div>
      </div>
    </div>
  );
}

function Footer({ syncStatus }) {
  const dot = { connecting: NB.fade, live: '#4a7c59', error: NB.red }[syncStatus];
  const label = { connecting: 'connecting', live: 'live', error: 'offline' }[syncStatus];
  return (
    <footer
      style={{
        background: NB.paper,
        color: NB.fade,
        fontFamily: "'Space Mono', monospace",
        padding: "18px 40px 32px 40px",
        borderTop: `1px solid ${NB.ink}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        fontSize: 10.5,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
      }}
    >
      <a
        href="https://nownownow.com/about"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: NB.fade, textDecoration: "none" }}
      >
        nownownow.com
      </a>
      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{
          width: 6, height: 6, borderRadius: '50%',
          background: dot, display: 'inline-block',
          transition: 'background 0.4s',
        }} />
        {label}
      </span>
    </footer>
  );
}

// ── Root board component ──────────────────────────────────────────
function Board({ onBack, now }) {
  // Combine mobile detection, board padding, and layout into one state so
  // a single resize event updates everything atomically.
  const [view, setView] = React.useState(() => {
    const pad = getBoardPadding();
    const mobile = window.innerWidth < 768;
    return { isMobile: mobile, boardPad: pad, ...generateLayout(window.innerWidth - pad * 2) };
  });
  const [guestContent, setGuestContent] = React.useState({});
  const [syncStatus, setSyncStatus] = React.useState('connecting');
  const debounceRef = React.useRef({});

  // Recompute layout on resize (debounced)
  React.useEffect(() => {
    let t;
    const onResize = () => {
      clearTimeout(t);
      t = setTimeout(() => {
        const pad = getBoardPadding();
        const mobile = window.innerWidth < 768;
        setView({ isMobile: mobile, boardPad: pad, ...generateLayout(window.innerWidth - pad * 2) });
      }, 150);
    };
    window.addEventListener('resize', onResize);
    return () => { clearTimeout(t); window.removeEventListener('resize', onResize); };
  }, []);

  React.useEffect(() => {
    supabase
      .from("guest_slips")
      .select("id, name, content")
      .then(({ data, error }) => {
        if (error) { setSyncStatus('error'); return; }
        if (!data) return;
        setGuestContent(
          data.reduce((acc, row) => {
            acc[row.id] = { name: row.name || "", text: row.content || "" };
            return acc;
          }, {})
        );
      });

    const channel = supabase
      .channel("guest_slips_sync")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "guest_slips" },
        (payload) => {
          const { id, name, content } = payload.new;
          setGuestContent((prev) => ({
            ...prev,
            [id]: { name: name || "", text: content || "" },
          }));
        },
      )
      .subscribe((status) => {
        if (status === "SUBSCRIBED") setSyncStatus("live");
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") setSyncStatus("error");
        else setSyncStatus("connecting");
      });

    const timers = debounceRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
      supabase.removeChannel(channel);
    };
  }, []);

  const updateGuest = React.useCallback((id, val) => {
    setGuestContent((prev) => ({ ...prev, [id]: val }));
    clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(async () => {
      const { error } = await supabase
        .from("guest_slips")
        .update({ name: val.name, content: val.text, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) setSyncStatus("error");
    }, 800);
  }, []);

  const { isMobile, boardPad, layout, cw } = view;

  return (
    <NowCtx.Provider value={now}>
      {isMobile ? (
        <>
          <PageHeader onBack={onBack} />
          <MobileView guestContent={guestContent} updateGuest={updateGuest} />
          <Footer syncStatus={syncStatus} />
        </>
      ) : (
        <LayoutProvider defaults={layout}>
          <LayoutCtx.Consumer>
            {(ctx) => (
              <>
                <PageHeader onBack={onBack} />
                <BoardSurface
                  guestContent={guestContent}
                  updateGuest={updateGuest}
                  cw={cw}
                  ctx={ctx}
                  boardPad={boardPad}
                />
                <Footer syncStatus={syncStatus} />
              </>
            )}
          </LayoutCtx.Consumer>
        </LayoutProvider>
      )}
    </NowCtx.Provider>
  );
}

// ── Page export ───────────────────────────────────────────────────
const NowPage = () => {
  const navigate = useNavigate();
  const [now, setNow] = React.useState(NOW_FALLBACK);

  React.useEffect(() => {
    fetch("/profile.json")
      .then((r) => r.json())
      .then((data) => {
        if (data.now) setNow(data.now);
      })
      .catch(() => {}); // keep fallback on error
  }, []);

  // swap body background to cream while on this page
  React.useEffect(() => {
    const prev = document.body.style.background;
    document.body.style.background = NB.paper;
    return () => {
      document.body.style.background = prev;
    };
  }, []);

  return (
    <>
      <SEO
        title="Now — Alex Gao"
        description="What Alex Gao is doing now — building, learning, consuming."
        keywords={["Alex Gao", "alexgaoth", "now"]}
        path={APP_ROUTES.now}
      />
      <div style={{ minHeight: "100vh", background: NB.paper }}>
        <Board onBack={() => navigate(APP_ROUTES.home)} now={now} />
      </div>
    </>
  );
};

export default NowPage;
