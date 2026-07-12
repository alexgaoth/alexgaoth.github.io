# DESIGN.md — alexgaoth.com style guide

Working reference for building or rebuilding pages so they feel like one site.
The canonical expression of this language is the home page panel rail
(`main-section/src/components/main/HomePreviewRail.jsx`). When in doubt, copy it.

## The site in one line

Black ink on white paper, mono type, log files and ledgers — a serious,
professional surface with doors into the personal side (art, poetry, now).

## Typography

Two faces, loaded in `src/styles/global.css`:

- **Space Mono** — the body. Everything defaults to it (`body { font-family: 'Space Mono' }`).
  Used for meta, labels, log rows, paragraphs, links, footers.
- **Space Grotesk** — display only. Mega titles, card headings, trophy stamps.
  Weight 600, tight tracking (`letter-spacing: -0.035em`), tight leading (`line-height: 0.95`).

Recurring atoms (copy these, don't invent new ones):

- **Eyebrow** — mono, 10–11px, `letter-spacing: 0.22em`, uppercase, `#888`.
  Written as a code comment: `// what i have`, `// present`, `// build log`.
  Sits above titles and above every sub-block.
- **Mega title** — Grotesk 600, `clamp(1.8rem, 4.8vw, 3.8rem)`, one word, uppercase,
  **with a trailing dot in a muted color** (`#ccc` or `rgba(0,0,0,0.18)`): `BUILT.` `WRITING.` `EXPERIENCE.`
- **Sub line** — mono, ~0.7–0.82rem, `#888`, one lowercase sentence under the title,
  max-width ~70ch. Dry, a little wry: "the true answers is uncountable many things but few of value".
- Body/log text runs small: 9–12.5px in panels, 0.875–1rem in article pages.

## Color

Defined as CSS vars in `global.css`:

- `--ink: #000`, `--paper: #fff` — the whole site is black on white.
- `--muted: #888` (secondary text), `#999`/`#bbb`/`#ccc` for progressively dimmer meta.
- `--subtle: rgba(0,0,0,0.18)` (strong hairline), `--hairline: rgba(0,0,0,0.08)` (faint rule).
- **Cream accent**: `rgb(235,225,200)` — one warm wash per page at most, painted as a
  gradient into a section (see WRITING panel) so it scrolls in spatially. Not for chrome.
- Green only as a live-pulse dot (`#0f6` / `#0a7` with the `rail-pulse` keyframe).
- No other color. No shadows in the panel language (soft shadows exist only on
  legacy card components). No border-radius, ever.

## Interaction

- **Hover = invert.** Rows and cards flip to black background / white text
  (`background:#000; color:#fff`, transition 0.12–0.2s). Borders flip too.
  This is the single hover convention; don't add underlines, scales, or color shifts.
- Links styled as text carry `→` arrows; arrows may nudge right on hover (art-strip).
- Live/now things get the pulsing dot.

## Layout patterns

- **Panel** (`PanelChrome`): eyebrow → mega title → sub line → content → footer rail.
  Footer rail is pinned at the bottom: hairline top border, mono 10–11px, left = a dry
  note ("see them all · github.com/alexgaoth"), right = a route link ("/projects →").
  Max width 1440px for full-bleed panels; content pages use `.content-wrapper`
  (1152px) or `.content-wrapper-narrow` (768px).
- **Log rows**: grid rows (`year | name · stack | status`) with `1px solid #eee`
  dividers, a solid `1px solid #000` header rule top and bottom of the header row,
  uppercase mono column headers at 9px / 0.18em tracking. Whole row is the link.
- **Bordered cards**: `1px solid #000` (panels) or `2px solid black` (legacy content
  pages), square corners, natural height. Hover inverts.
- **Two-column split**: desktop `1.35fr 1fr` — meat on the left, log/meta column on
  the right; collapses to one column on mobile (right column often dropped entirely).
- **Status chips**: uppercase mono 8.5–9px in a `1px solid currentColor` box, no fill
  (`live`, `wip`, `stuck`).
- **Inline lists**: items joined by `·` in `#bbb`, `white-space: nowrap` per item.
- **Numbered items**: `01` `02` index in `#bbb` before each line (NOW cells).
- **Natural height + intentional whitespace**: content sits at its own height inside
  a `min-height: 100vh` section; the empty space below is deliberate. Don't stretch
  content to fill.

## Spacing & density

- Panels are dense inside (6–12px paddings on rows, 8–18px gaps between blocks)
  but generous outside (clamp-based panel padding, whole-viewport sections).
- Vertical rhythm on content pages via `.space-y-large` (3rem) / `-medium` (2rem).
- Hairlines (`rgba(0,0,0,0.08–0.18)`) separate; solid black rules declare.

## Voice

- **lowercase everywhere** — titles are the exception (uppercase mega words).
- Spare, human, slightly self-deprecating. Facts over adjectives.
- Comments-as-labels (`// who`, `// elsewhere`) instead of headings like "Where To Find Me".
- Prefer deleting a sentence to adding one. Nothing that reads AI-generated.

## Responsiveness

- App-level pages get an `isMobile` width check (≤768px) or plain responsive CSS.
  Prefer plain CSS (`repeat(auto-fit, minmax(...))`, clamp(), collapsing grids) for
  new pages. On mobile: one column, drop the secondary/meta column if it crowds.

## Site structure / roles

- `/` (main page) — the professional, serious layer: BUILT / WRITING / EXPERIENCE panels.
- `/about`, `/resume`, `/projects`, `/thoughts`, `/quotes` — content pages under
  `NavigationBar` (via `ContentPage` layout), same ink-on-paper language.
- Doors to the personal side: `/art` (ink-wash, serif, its own quiet language),
  `/poetry`, `/ci`, `/regents` (Cormorant Garamond, paper grain), `/now`
  (warm paper `#efe9d6`, draggable cards). These pages may break the mono/ink
  system deliberately — everything else must not.
- SEO: every page renders `src/components/SEO.jsx` (helmet meta + JSON-LD);
  aliases and searchable queries live in `src/data/profileData.js`. Keep them.
