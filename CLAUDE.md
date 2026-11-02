# CLAUDE.md

Read `ADDITION-RULES.md` before adding or changing any site content — golden
rule 1: never change an existing URL. `README.md` covers repo layout, the two
deploy surfaces, and where the parked homepage WebGL layer lives. `DESIGN.md`
is the style guide for any visual work; `CONTEXT.md` (gitignored) holds deeper
orientation and the owner's priorities.

## Commands

- Build + validate: `cd astro && npm run build` — fails on bad thought
  frontmatter.
- Crawler-view audit: `node scripts/audit-raw-html.mjs astro/dist index.html:/ about.html:/about`.
  Standing FAILs, all accepted: /art + /gallery (400-char text floor), /poetry + /ci (link count).

## Gotchas

- The homepage has no canvas on `master`. Before starting a sixth concept,
  read README section 2 — the spine, the scene registry and the build guard
  already exist on `home-one-stroke`; don't reinvent the scaffolding.
- `@react-three/drei` and `simplex-noise` look unused but are required by
  `RegentsScene.jsx` and `ArtBackground.jsx` — don't prune them from
  `astro/package.json`.
- The homepage DOM choreography runs only at ≥768px viewport width without
  `prefers-reduced-motion`. To verify it visually without the Chrome
  extension: `npm run preview`, then drive headless Chrome (puppeteer-core,
  `/usr/bin/google-chrome`, `--headless=new --enable-unsafe-swiftshader`) and
  screenshot while scrolling. `loading="lazy"` images never load in a
  `fullPage` shot — blank boxes there are not broken images; measure instead.
- Astro scoped `<style>` compiles to `[data-astro-cid-*]`, outranking plain
  class rules in `components.css` — a component's media overrides belong in
  that component. `components.css` also still carries React-era rules for
  elements the Astro port never renders — grep the markup before trusting one.
- Static HTML must stay complete without JS: canvas layers are chrome over
  content — text lives in the DOM, never as texture.
- Verifying a deploy: Vercel's ETag on a static file equals the file's md5 —
  compare against local `md5sum`. This machine's network has intermittently
  reset TLS to alexgaoth.com (site fine globally; seen 2026-08, cleared days
  later) — if local curl/Chrome fail, verify through an external proxy before
  concluding the site is down.
