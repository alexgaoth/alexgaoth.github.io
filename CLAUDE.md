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

## Gotchas

- The homepage has no canvas on `master`; the 3D concepts are parked on the
  `home-3d` and `home-one-stroke` branches (README says which is which). Don't
  reinvent the scaffolding — the spine, the registry and the build guard are
  on `home-one-stroke`.
- `@react-three/drei` and `simplex-noise` look unused but are required by
  `RegentsScene.jsx` and `ArtBackground.jsx` — don't prune them from
  `astro/package.json`.
- The homepage DOM choreography runs only at ≥768px viewport width without
  `prefers-reduced-motion`. To verify it visually without the Chrome
  extension: `npm run preview`, then drive headless Chrome (puppeteer-core,
  `/usr/bin/google-chrome`, `--headless=new --enable-unsafe-swiftshader`) and
  screenshot while scrolling.
- Static HTML must stay complete without JS: canvas layers are chrome over
  content — text lives in the DOM, never as texture.
- Verifying a deploy: Vercel's ETag on a static file equals the file's md5 —
  compare against local `md5sum`. As of 2026-08 this machine's network resets
  TLS to alexgaoth.com (site is fine globally; vercel.com loads) — check the
  live site through an external proxy, not local curl or Chrome.
