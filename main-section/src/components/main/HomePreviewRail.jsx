import { useState } from "react";
import { Link } from "react-router-dom";
import { APP_ROUTES } from "../../config/site";
import {
  SHIPS,
  TROPHIES,
  WRITINGS,
  DOORS,
  EXPERIENCE,
  EDUCATION,
  DOMAINS,
  TONGUES,
} from "../../data/homeRailData";

/* ── Static data for the preview rail lives in src/data/homeRailData.js ────── */


// ── Shared atoms ────────────────────────────────────────────────────────────

const MONO = "'Space Mono', monospace";
const GROTESK = "'Space Grotesk', sans-serif";

function Eyebrow({ children, color = "#888", extraStyle }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 11,
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color,
        fontWeight: 400,
        ...extraStyle,
      }}
    >
      {children}
    </span>
  );
}

function MegaTitle({ children }) {
  return (
    <h2
      style={{
        fontFamily: GROTESK,
        fontWeight: 600,
        fontSize: "clamp(1.8rem, 4.8vw, 3.8rem)",
        letterSpacing: "-0.035em",
        lineHeight: 0.95,
        margin: 0,
        color: "#000",
      }}
    >
      {children}
    </h2>
  );
}

function PanelChrome({
  idx,
  total,
  eyebrow,
  title,
  sub,
  children,
  footerLeft,
  footerRight,
  footerLink,
}) {
  return (
    <div
      style={{
        flex: 1,
        width: "100%",
        color: "#000",
        boxSizing: "border-box",
        maxWidth: "1440px",
        margin: "0 auto",
        padding:
          "clamp(1.3rem,2.4vw,2.2rem) clamp(1.5rem,2.5vw,2.5rem) clamp(1rem,1.8vw,1.8rem)",
        display: "flex",
        flexDirection: "column",
        fontFamily: MONO,
        overflow: "hidden",
        // keep panel content above the absolutely-positioned DitherWash
        position: "relative",
        zIndex: 1,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: "clamp(0.6rem,1.1vw,1.1rem)",
          flexShrink: 0,
        }}
      >
        <Eyebrow color="#888">{eyebrow}</Eyebrow>
        {/*<Eyebrow color="#888">
          {String(idx).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </Eyebrow>*/}
      </header>

      <div style={{ marginBottom: "0.2rem", flexShrink: 0 }}>
        <MegaTitle>{title}</MegaTitle>
      </div>

      {sub && (
        <p
          style={{
            fontSize: "clamp(0.68rem,0.82vw,0.82rem)",
            color: "#888",
            margin: "0 0 clamp(0.65rem,1.1vw,1.1rem)",
            letterSpacing: "0.02em",
            maxWidth: "70ch",
            flexShrink: 0,
            lineHeight: 1.5,
          }}
        >
          {sub}
        </p>
      )}

      <div
        style={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <footer
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginTop: "clamp(0.5rem,0.9vw,0.9rem)",
          paddingTop: "0.45rem",
          borderTop: "1px solid rgba(0,0,0,0.08)",
          flexShrink: 0,
        }}
      >
        <Eyebrow color="#888" extraStyle={{ fontSize: 10 }}>
          {footerLeft}
        </Eyebrow>
        <Link
          to={footerLink}
          style={{
            fontSize: 11,
            color: "#000",
            letterSpacing: "0.04em",
            textDecoration: "none",
            opacity: 0.85,
            fontFamily: MONO,
          }}
        >
          {footerRight}
        </Link>
      </footer>
    </div>
  );
}

// ── 01 BUILT ─────────────────────────────────────────────────────────────────

function BuildLogRow({ ship, onHover, isMobile }) {
  const [hover, setHover] = useState(false);
  const to = ship.anchor
    ? `${APP_ROUTES.projects}#project-${ship.anchor}`
    : APP_ROUTES.projects;

  return (
    <Link
      to={to}
      style={{ textDecoration: "none", color: "inherit" }}
      onMouseEnter={() => {
        setHover(true);
        if (onHover) onHover(ship);
      }}
      onMouseLeave={() => {
        setHover(false);
        if (onHover) onHover(null);
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "44px 1fr auto",
          gap: 10,
          padding: isMobile ? "10px 6px" : "6px 6px",
          borderBottom: "1px solid #eee",
          background: hover ? "#000" : "transparent",
          color: hover ? "#fff" : "#000",
          transition: "background 0.12s, color 0.12s",
          cursor: "pointer",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: 10.5,
            fontWeight: 600,
            color: hover ? "rgba(255,255,255,0.6)" : "#999",
          }}
        >
          {ship.year}
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 12.5,
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ship.name}
          </div>
          <div
            style={{
              fontSize: 9.5,
              color: hover ? "rgba(255,255,255,0.55)" : "#888",
              letterSpacing: "0.02em",
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {ship.tech}
          </div>
        </div>
        <span
          style={{
            fontSize: 8.5,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: hover ? "#fff" : "#000",
            border: `1px solid ${hover ? "#fff" : "#000"}`,
            padding: "2px 5px",
            whiteSpace: "nowrap",
          }}
        >
          {ship.status}
        </span>
      </div>
    </Link>
  );
}

function BuiltPanel({ isMobile }) {
  const [hoveredShip, setHoveredShip] = useState(null);
  const featured = SHIPS[0];
  const rest = SHIPS.slice(1);
  // hero shows the hovered row's project; falls back to signalor when nothing hovered
  const displayShip = hoveredShip || featured;
  const heroTo = displayShip.anchor
    ? `${APP_ROUTES.projects}#project-${displayShip.anchor}`
    : APP_ROUTES.projects;

  return (
    <PanelChrome
      idx={1}
      total={3}
      eyebrow="// what i have"
      title={
        <>
          BUILT<span style={{ color: "#ccc" }}>.</span>
        </>
      }
      sub="the true answers is uncountable many things but few of value"
      footerLeft="see them all · github.com/alexgaoth"
      footerRight="/projects →"
      footerLink={APP_ROUTES.projects}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
          gap: "clamp(0.8rem,1.8vw,1.6rem)",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          alignItems: "flex-start",
        }}
      >
        {/* Hero — desktop only. Image swaps to match whichever row is hovered. */}
        {!isMobile && (
          <Link
            to={heroTo}
            style={{
              display: "flex",
              flexDirection: "column",
              border: "1px solid #000",
              textDecoration: "none",
              color: "inherit",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                width: "100%",
                aspectRatio: "16/9",
                background: "#f4f1ea",
                position: "relative",
                overflow: "hidden",
                flexShrink: 0,
              }}
            >
              <img
                key={displayShip.name}
                src={process.env.PUBLIC_URL + displayShip.img}
                alt={displayShip.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  display: "block",
                }}
              />
              {displayShip.status === "live" && (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#000",
                    color: "#fff",
                    padding: "3px 8px",
                    fontSize: 9,
                    letterSpacing: "0.22em",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontFamily: MONO,
                  }}
                >
                  <span
                    className="rail-pulse"
                    style={{
                      display: "inline-block",
                      width: 5,
                      height: 5,
                      background: "#0f6",
                      borderRadius: "50%",
                    }}
                  />
                  LIVE
                </div>
              )}
            </div>
            <div
              style={{
                flexShrink: 0,
                borderTop: "1px solid #000",
                background: "#fff",
                padding: "10px 14px 12px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  gap: 12,
                  marginBottom: 4,
                }}
              >
                <h3
                  style={{
                    fontFamily: GROTESK,
                    fontSize: "clamp(0.92rem,1.3vw,1.2rem)",
                    margin: 0,
                    letterSpacing: "-0.015em",
                    fontWeight: 600,
                  }}
                >
                  {displayShip.name}
                </h3>
                <Eyebrow color="#888">{displayShip.year}</Eyebrow>
              </div>
              {displayShip.desc && (
                <p
                  style={{
                    fontSize: 11.5,
                    margin: "0 0 8px",
                    lineHeight: 1.5,
                    color: "#555",
                  }}
                >
                  {displayShip.desc}
                </p>
              )}
              <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
                {displayShip.tech.split(" · ").map((t) => (
                  <span
                    key={t}
                    style={{
                      background: "#000",
                      color: "#fff",
                      padding: "2px 7px",
                      fontSize: 9.5,
                      letterSpacing: "0.06em",
                    }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        )}

        {/* Build log */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: 5,
              flexShrink: 0,
            }}
          >
            <Eyebrow color="#666">
              {'// build log'}
            </Eyebrow>
            <Eyebrow color="#bbb">desc ↓</Eyebrow>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "44px 1fr auto",
              gap: 10,
              padding: "4px 6px",
              borderTop: "1px solid #000",
              borderBottom: "1px solid #000",
              fontSize: 9,
              letterSpacing: "0.18em",
              color: "#000",
              textTransform: "uppercase",
              fontWeight: 500,
              flexShrink: 0,
            }}
          >
            <span>year</span>
            <span>name · stack</span>
            <span>status</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            {/* Mobile shows a capped log — the footer rail carries the rest. */}
            {(isMobile ? SHIPS.slice(0, 5) : rest).map((s) => (
              <BuildLogRow
                key={s.name}
                ship={s}
                isMobile={isMobile}
                onHover={!isMobile ? setHoveredShip : undefined}
              />
            ))}
          </div>
        </div>
      </div>
    </PanelChrome>
  );
}

// ── 02 WRITING ───────────────────────────────────────────────────────────────

function WritingCard({ w }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={`${APP_ROUTES.thoughts}/${w.slug}`}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        border: "1px solid #000",
        padding: "12px 14px",
        background: hover ? "#000" : "transparent",
        color: hover ? "#fff" : "#000",
        transition: "background 0.15s, color 0.15s",
        textDecoration: "none",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      <div
        style={{
          fontStyle: "italic",
          fontSize: 12,
          lineHeight: 1.5,
          fontFamily: MONO,
        }}
      >
        {w.pull}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 8,
        }}
      >
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: 9.5,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              fontWeight: 700,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {w.title}
          </div>
          <div
            style={{
              fontSize: 9,
              opacity: 0.65,
              marginTop: 2,
              letterSpacing: "0.04em",
            }}
          >
            {w.date} · {w.tag} · {w.read}
          </div>
        </div>
        <span style={{ fontSize: 12 }}>→</span>
      </div>
    </Link>
  );
}

function TrophyRow({ t }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 10,
        padding: "7px 6px",
        borderBottom: "1px solid rgba(0,0,0,0.12)",
        alignItems: "baseline",
      }}
    >
      <span
        style={{
          fontFamily: GROTESK,
          fontWeight: 600,
          fontSize: 13,
          whiteSpace: "nowrap",
        }}
      >
        [{t.stamp}]
      </span>
      <span
        style={{
          fontSize: 10.5,
          lineHeight: 1.35,
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {t.label}
      </span>
      <span style={{ fontSize: 9.5, color: "#999", letterSpacing: "0.06em" }}>
        {t.year}
      </span>
    </div>
  );
}

function InlineList({ label, items }) {
  return (
    <div>
      <Eyebrow color="#888">{"// "}{label}</Eyebrow>
      <p
        style={{
          margin: "6px 0 0",
          fontSize: 11.5,
          lineHeight: 1.7,
          color: "#000",
          letterSpacing: "0.02em",
        }}
      >
        {items.map((item, i) => (
          <span key={item} style={{ whiteSpace: "nowrap" }}>
            {item}
            {i < items.length - 1 && (
              <span style={{ color: "#bbb" }}> &nbsp;·&nbsp; </span>
            )}
          </span>
        ))}
      </p>
    </div>
  );
}

function DoorRow({ d, isMobile }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={d.to}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        padding: isMobile ? "12px 10px" : "9px 10px",
        border: "1px solid #000",
        background: hover ? "#000" : "transparent",
        color: hover ? "#fff" : "#000",
        transition: "background 0.12s, color 0.12s",
        textDecoration: "none",
      }}
    >
      <span
        style={{
          fontFamily: GROTESK,
          fontWeight: 600,
          fontSize: 18,
          lineHeight: 1,
        }}
      >
        {d.glyph}
      </span>
      <span style={{ minWidth: 0 }}>
        <span
          style={{
            fontSize: 10.5,
            letterSpacing: "0.16em",
            textTransform: "uppercase",
            fontWeight: 700,
          }}
        >
          {d.label}
        </span>
        <span
          style={{
            display: "block",
            fontSize: 9.5,
            opacity: 0.6,
            marginTop: 2,
            letterSpacing: "0.04em",
          }}
        >
          {d.note}
        </span>
      </span>
      <span style={{ fontSize: 12 }}>→</span>
    </Link>
  );
}

function WritingPanel({ isMobile }) {
  const DIM = "#888";
  return (
    <PanelChrome
      idx={2}
      total={3}
      eyebrow="// what i think"
      title={
        <>
          WRITING<span style={{ color: "rgba(0,0,0,0.18)" }}>.</span>
        </>
      }
      sub="i like to think, and make others think."
      footerLeft="the long version is in /thoughts"
      footerRight="/thoughts →"
      footerLink={APP_ROUTES.thoughts}
    >
      {/* Mirrors BUILT: main column left, doors column right,
          content at natural height — whitespace below is intentional. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
          gap: "clamp(0.8rem,1.8vw,1.6rem)",
          alignItems: "flex-start",
        }}
      >
        {/* Writings — the meat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Eyebrow color={DIM}>{'// recent thoughts'}</Eyebrow>
          {WRITINGS.map((w, i) => (
            <WritingCard key={i} w={w} />
          ))}
        </div>

        {/* Doors into the personal side — shown on mobile too */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <Eyebrow color={DIM}>{'// the personal side'}</Eyebrow>
          {DOORS.map((d) => (
            <DoorRow key={d.label} d={d} isMobile={isMobile} />
          ))}
        </div>
      </div>
    </PanelChrome>
  );
}

// ── 03 EXPERIENCE ────────────────────────────────────────────────────────────

function ExperienceRow({ e }) {
  return (
    <div
      style={{
        padding: "8px 6px",
        borderBottom: "1px solid #eee",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: 10,
        }}
      >
        <span
          style={{
            fontFamily: GROTESK,
            fontWeight: 600,
            fontSize: 13,
            letterSpacing: "-0.01em",
          }}
        >
          {e.role}
        </span>
        <span
          style={{ fontSize: 9.5, color: "#999", letterSpacing: "0.06em" }}
        >
          {e.period}
        </span>
      </div>
      <div
        style={{
          fontSize: 10.5,
          marginTop: 2,
          letterSpacing: "0.02em",
        }}
      >
        {e.org}
      </div>
      <div
        style={{
          fontSize: 9.5,
          color: "#888",
          marginTop: 2,
          letterSpacing: "0.02em",
        }}
      >
        {e.desc}
      </div>
    </div>
  );
}

function EducationRow({ e }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto",
        gap: 10,
        padding: "7px 6px",
        borderBottom: "1px solid #eee",
        alignItems: "baseline",
      }}
    >
      <span style={{ fontSize: 11.5, fontWeight: 500 }}>{e.school}</span>
      <span style={{ fontSize: 9.5, color: "#888", letterSpacing: "0.04em" }}>
        {e.detail}
      </span>
    </div>
  );
}

// Single entry point to the live /now page — the live grid moved off the
// home rail; NowPage still fetches profile.json itself.
function NowStrip({ isMobile }) {
  const [hover, setHover] = useState(false);
  return (
    <Link
      to={APP_ROUTES.now}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: isMobile ? "12px 10px" : "8px 10px",
        border: "1px solid #000",
        background: hover ? "#000" : "transparent",
        color: hover ? "#fff" : "#000",
        transition: "background 0.12s, color 0.12s",
        textDecoration: "none",
        marginTop: "clamp(0.8rem,1.6vw,1.4rem)",
      }}
    >
      <span
        className="rail-pulse"
        style={{
          display: "inline-block",
          width: 6,
          height: 6,
          background: hover ? "#0f6" : "#0a7",
          borderRadius: "50%",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 11, letterSpacing: "0.04em", flex: 1 }}>
        what i'm doing right now, updated from my phone
      </span>
      <span style={{ fontSize: 12 }}>→</span>
    </Link>
  );
}

function ExperiencePanel({ isMobile }) {
  const DIM = "#888";
  return (
    <PanelChrome
      idx={3}
      total={3}
      eyebrow="// on paper"
      title={
        <>
          EXPERIENCE<span style={{ color: "#ccc" }}>.</span>
        </>
      }
      sub="math-cs @ ucsd, class of 2029 · previously st paul's london"
      footerLeft="full record in /resume"
      footerRight="/resume →"
      footerLink={APP_ROUTES.resume}
    >
      {/* Mirrors BUILT: main column left, log-style column right,
          content at natural height — whitespace below is intentional. */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1.35fr 1fr",
          gap: "clamp(0.8rem,1.8vw,1.6rem)",
          alignItems: "flex-start",
        }}
      >
        {/* Work + education — the meat */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <div style={{ marginBottom: 5 }}>
              <Eyebrow color={DIM}>{'// work'}</Eyebrow>
            </div>
            <div style={{ borderTop: "1px solid #000" }}>
              {EXPERIENCE.map((e) => (
                <ExperienceRow key={e.role} e={e} />
              ))}
            </div>
          </div>
          <div>
            <div style={{ marginBottom: 5 }}>
              <Eyebrow color={DIM}>{'// education'}</Eyebrow>
            </div>
            <div style={{ borderTop: "1px solid #000" }}>
              {EDUCATION.map((e) => (
                <EducationRow key={e.school} e={e} />
              ))}
            </div>
          </div>
        </div>

        {/* Trophies log + inline lists — desktop only */}
        {!isMobile && (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ marginBottom: 5 }}>
                <Eyebrow color={DIM}>{'// trophies'}</Eyebrow>
              </div>
              <div style={{ borderTop: "1px solid #000" }}>
                {TROPHIES.map((t) => (
                  <TrophyRow key={t.label} t={t} />
                ))}
              </div>
            </div>
            <InlineList label="domains of attention" items={DOMAINS} />
            <InlineList label="tongues" items={TONGUES} />
          </div>
        )}
      </div>

      {/* Live status — one door to /now */}
      <NowStrip isMobile={isMobile} />
    </PanelChrome>
  );
}

// ── WRITING transition: 1-bit dither zones ───────────────────────────────────
// The cream lives in the document, not on the screen: WRITING is a solid
// cream section, and dedicated transition zones sit between it and its
// neighbours. Each zone is a ramp of dither bands (25% → 50% → 75% cream
// pixels), so scrolling through it sweeps the screen's cream coverage up
// continuously, pixel-locked to the scroll — no thresholds, no lag, and no
// bleed over the neighbouring panels' content. The pixels themselves tick
// between dither phases (.dither-band in components.css) so the surface
// reads as live signal, not static paint.
const CREAM = "rgb(235,225,200)";
const CELL = 8; // dither pixel size (px) — keep in sync with --dither-cell in components.css

// conic-gradient tiles: what fraction of each CELL×CELL pixel is cream
const DITHER_TILES = {
  25: `conic-gradient(${CREAM} 25%, rgba(0,0,0,0) 0)`,
  50: `conic-gradient(${CREAM} 25%, rgba(0,0,0,0) 0 50%, ${CREAM} 0 75%, rgba(0,0,0,0) 0)`,
  75: `conic-gradient(rgba(0,0,0,0) 25%, ${CREAM} 0)`,
};

// A spacer that dissolves white → cream (or the reverse) between sections.
function DitherZone({ reverse }) {
  const steps = reverse ? [75, 50, 25] : [25, 50, 75];
  return (
    <div
      aria-hidden
      style={{
        height: "clamp(160px, 36vh, 400px)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {steps.map((coverage, i) => (
        <div
          key={coverage}
          className="dither-band"
          style={{
            flex: 1,
            backgroundImage: DITHER_TILES[coverage],
            backgroundSize: `${CELL}px ${CELL}px`,
            // stagger alternate bands half a cell so it reads as dithering
            backgroundPosition: i % 2 ? `${CELL / 2}px 0` : "0 0",
            // staggered bands need a matching animation end so the tick stays
            // a clean half-cell phase flip (see dither-tick in components.css)
            "--dither-cell": i % 2 ? `${CELL * 1.5}px` : `${CELL}px`,
            // alternate tick direction for an organic crawl
            animationDirection: i % 2 ? "reverse" : "normal",
          }}
        />
      ))}
    </div>
  );
}

function PanelSection({ Panel, isMobile, background }) {
  return (
    <section
      style={{
        width: "100%",
        minHeight: isMobile ? "auto" : "100vh",
        display: "flex",
        flexDirection: "column",
        background: background || "transparent",
      }}
    >
      <Panel isMobile={isMobile} />
    </section>
  );
}

// ── HomePreviewRail ───────────────────────────────────────────────────────────
// Desktop: each panel locks to a full viewport with the footer rail pinned at
// the bottom. Mobile: panels collapse to natural height so content → footer →
// next panel reads continuously, with no dead half-screens. MainPage measures
// the rail's real height for its scroll math, so the dither zones' extra
// height is safe.
const HomePreviewRail = ({ isMobile }) => (
  <>
    <PanelSection Panel={BuiltPanel} isMobile={isMobile} />
    <DitherZone />
    <PanelSection Panel={WritingPanel} isMobile={isMobile} background={CREAM} />
    <DitherZone reverse />
    <PanelSection Panel={ExperiencePanel} isMobile={isMobile} />
  </>
);

export default HomePreviewRail;
