# CLAUDE.md

Read `ADDITION-RULES.md` before adding or changing any site content — golden
rule 1: never change an existing URL. `README.md` covers repo layout, the two
deploy surfaces, and the homepage's fractal layer (section 2). `DESIGN.md`
is the style guide for any visual work; `CONTEXT.md` (gitignored) holds deeper
orientation and the owner's priorities.

## Commands

- Build + validate: `cd astro && npm run build` — fails on bad thought
  frontmatter. If it fails resolving `sharp`, run `npm install --no-save sharp`
  in `astro/`: a fresh `npm install` on this machine leaves it out.
- Crawler-view audit, from the repo root (inside `astro/` it dies with "Invalid URL"):
  `node scripts/audit-raw-html.mjs astro/dist index.html:/ about.html:/about`.
  Standing FAILs, all accepted: /art + /gallery (400-char text floor), /poetry + /ci (link count).

## Gotchas

- `astro/src/lib/qjulia/homeShots.js` is generated: edit
  `scripts/home-shots/make-home.mjs` and rerun it from the repo root. A hand
  edit is overwritten next run, and can route the camera through the solid.
- `@react-three/drei` and `simplex-noise` look unused but are required by
  `RegentsScene.jsx` and `ArtBackground.jsx` — don't prune them from
  `astro/package.json`.
- The homepage's fractal runs at ≥768px, and in a lighter portrait layout on
  phones below it (not under reduced motion or data saver); check phones with
  puppeteer's `isMobile`/`hasTouch` viewport. To verify it visually without the Chrome
  extension: `npm run preview`, then drive headless Chrome (puppeteer-core,
  `/usr/bin/google-chrome-stable`, `--headless=new --use-gl=angle --use-angle=gl
  --ignore-gpu-blocklist` — WebGL2 needs the GPU) and screenshot while
  scrolling; `/?debug` exposes `window.qjHome`, and `window.qjStats.mode ===
  'idle'` means the frame is sharp. Add `&nobumps` when a script jumps the
  scroll: the speed bumps hold programmatic scrolls like a fast visitor. Headless draws no classic scrollbar, but
  the owner's Chrome has a 15px one: map page positions onto the fixed canvas
  with its `clientWidth`, never `innerWidth`. `loading="lazy"` images never
  load in a `fullPage` shot — blank boxes there are not broken images.
- Astro scoped `<style>` compiles to `[data-astro-cid-*]`, outranking plain
  class rules in `components.css` — a component's media overrides belong in
  that component. `components.css` also still carries React-era rules for
  elements the Astro port never renders — grep the markup before trusting one.
- Static HTML must stay complete without JS: canvas layers are chrome over
  content — text lives in the DOM, never as texture.
- Project cards without their own image load GitHub's social card live from
  opengraph.githubassets.com (`lib/projectImage.js`), which answers 429 after a
  burst of fetches from one IP. A broken card in local preview is that, not a bad
  URL — keep the fixed hash `1`; GitHub already re-renders it every ~6h.
- Verifying a deploy: Vercel's ETag on a static file equals the file's md5 —
  compare against local `md5sum`. This machine's network has intermittently
  reset TLS to alexgaoth.com (site fine globally; seen 2026-08, cleared days
  later) — if local curl/Chrome fail, verify through an external proxy before
  concluding the site is down.
