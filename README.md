# alexgaoth.github.io

## TODO — planned rebuild

Two structural changes, not tweaks. The current format is the thing being replaced.

**1. `/about` → the static identity page. SHIPPED.** Turned into a plain, static,
"ai-researcher / academia" page: no motion, no islands, fast, readable. This
becomes the canonical answer to "who is this person" — the page to link in a bio
and the one AI search surfaces should cite. Today that answer only exists on the
intro doorway (`intro.alexgaoth.com`), which canonicalizes away.

*Decided:* academic register **within** the existing ink/mono system — Space
Mono/Grotesk, black on white, one narrow column, zero motion, structure carries
the sobriety. No DESIGN.md exception needed. Fold the intro site's tldr
(Math-CS @ UCSD · building Signalor · interning at IBM/Bloomberg · "talk to me
abt…") into this page; the intro site then has no unique content left.

**2. `/` → a scroll-driven WebGL layer. PARKED, fifth attempt.**

Five concepts built, none kept. Four (folding sheet, ink star chart, transit
map, handscroll) were judged not bold enough and sit on the **`home-3d`**
branch. The fifth — "one stroke 一笔", a single calligraphic brushstroke
dragging down the page, coiling once per act and fraying into four tails that
land on the directory cards — is retired to the **`home-one-stroke`** branch.
What the animation should be is an open question again.

`master` carries no 3D code and no canvas. The homepage is the static ledger
plus the DOM choreography in `index.astro` (fixed title rise, directory
reveal, progress track, scroll hint). Also retired with the stroke: the two
fixed overlay phrases that used to play over the return stage ("this site is
an index…" / "if you found things here interesting…").

The concept-independent machinery, on `home-one-stroke` unless noted — a new
style is one file:

- `astro/src/lib/homeScroll.js` — **on master**, since the DOM choreography
  uses it. The scroll contract: every visual state is a pure function of
  `scrollY`, so any style runs exactly in reverse when you scroll back. Also
  reports where the four cards physically are, measured from the DOM.
- `astro/src/lib/homeSceneData.js` — the spine: three acts, then four finale
  cards, derived from the data the site already publishes. Add a project and
  the animation gains it.
- `astro/src/islands/scenes/registry.js` — styles declare id, camera, enabled.
- `scripts/check-scenes.mjs` — fails the build if the spine breaks or a scene
  module has a named export (which silently unmounts the canvas).
- The isolation that must not regress: a 4KB eager chunk on `/`, three.js
  behind a dynamic import, zero payload on mobile and under
  `prefers-reduced-motion`, and a complete static page without any of it.

Constraints that survive whatever comes next:
- Static HTML stays complete in source — chrome over content, never the content
  itself. Text stays in the DOM; never text-as-texture.
- Desktop only. Mobile gets the ledger.
- No URL changes (ADDITION-RULES golden rule 1).
- Procedural geometry only on `/` — it is the most-crawled route.

---

Personal website repo for Alex Gao (`alexgaoth`). Two deployed surfaces:

| Surface | Path | Stack | Host | Domain |
| --- | --- | --- | --- | --- |
| Intro site | `/` | Static HTML/CSS/JS | GitHub Pages | `intro.alexgaoth.com` |
| Main site | `/astro` | Astro 5 (+ React islands) | Vercel | `alexgaoth.com` |

`app.alexgaoth.com` is a legacy hostname that redirects to `alexgaoth.com`. The intro site is a
deliberate doorway: it canonicalizes to `alexgaoth.com` and has no sitemap of its own.

Every page of the main site is static HTML at build time — full per-route meta, canonical, Open
Graph, and JSON-LD in source, with interactivity hydrating as islands. See `ADDITION-RULES.md`
for how to add content of any kind.

## Repo layout

```text
/
  index.html, css/, js/     Intro site (GitHub Pages)
  source/                   Intro site images
  robots.txt, CNAME         Intro host doorway config
  resume.pdf                Intro-site copy of the resume
  .nojekyll                 REQUIRED — GH Pages must not run Jekyll over /astro
  scripts/                  audit-raw-html.mjs (SEO audit), send-thought-notification.py
  workers/gallery-list/     Cloudflare Worker listing the gallery R2 bucket
  .github/workflows/        Buttondown email on new thought

/astro                      The main site (Vercel, root directory = astro)
  src/pages/                One file per route; rss.xml/sitemap.xml/llms.txt are endpoints
  src/layouts/BaseLayout.astro   Site-wide head: meta, canonical, OG, base JSON-LD
  src/islands/              React islands (now board, regents scene, gallery grid, ink canvas)
  src/data/                 content.js, profileData.js, homeRailData.js, nowData.js,
                            poetryData.js, thoughts/*.md (content collection)
  src/lib/                  thoughts/gallery/projects/supabase helpers
  src/config/site.js        SITE constants, APP_ROUTES, NAVIGATION_ITEMS — single source for URLs/nav
  public/                   Static assets; profile.json is the canonical "now" data
```

## Main site routes

`/` · `/about` · `/resume` · `/projects` · `/projects/:slug` (featured) · `/thoughts` ·
`/thoughts/:slug` · `/writing` · `/quotes` · `/now` · `/art` · `/gallery` · `/regents` ·
`/poetry` · `/poetry/en` · `/ci` · `/ci/en`

## Development

```bash
cd astro
npm install
npm run dev     # local dev server
npm run build   # static build into astro/dist (validates thought frontmatter)
```

Guest slips on `/now` need `astro/.env` with `PUBLIC_SUPABASE_URL` and
`PUBLIC_SUPABASE_ANON_KEY` (same values live in the Vercel project settings).

Verify a build the way a crawler sees it:

```bash
node scripts/audit-raw-html.mjs astro/dist index.html:/ about.html:/about
node scripts/audit-raw-html.mjs https://alexgaoth.com / /about /thoughts   # against production
```

## Deployment

Push to `master` deploys both halves: GitHub Pages serves the repo root (intro), Vercel builds
`/astro` (root directory `astro`, `cleanUrls` on). If a GitHub Pages build wedges in "building",
re-kick it: `gh api -X POST repos/{owner}/{repo}/pages/builds`.

## SEO upkeep (monthly, ~1h)

- Search Console: indexed-page counts, not-indexed reasons, sitemap health, Core Web Vitals.
- Only bump a thought's `modified` frontmatter on meaningful edits — it drives sitemap `lastmod`.
- Add internal links when publishing; keep titles specific; keep structured data matching visible text.
- Quarterly: test a few identity/topic prompts in AI search surfaces (Google AI Mode, Perplexity,
  ChatGPT, Claude, Copilot) and note whether site pages get cited.
