# alexgaoth.github.io

## TODO — planned rebuild

Two structural changes, not tweaks. The current format is the thing being replaced.

**1. `/about` → the static identity page. SHIPPED.** Turned into a plain, static,
"ai-researcher / academia" page: no motion, no islands, fast, readable. This
becomes the canonical answer to "who is this person" — the page to link in a bio
and the one AI search surfaces should cite. Today that answer only exists on the
intro doorway (`intro.alexgaoth.com`), which canonicalizes away.

*Shipped as:* a researcher's homepage, **outside** the ink/mono system — the
one deliberate exception on the professional side (DESIGN.md records it).
System sans, default browser link colours, no nav bar, no islands, ~40 lines
of CSS in the page itself. Short paragraphs of short, direct sentences — who, what he
studies, builds and writes, where the rest is — with the links inside the sentences. No
lists: the record is `resume.pdf`, linked from /resume. The intro site's tldr is folded in; the intro site has no unique
content left.

**2. `/` → a scroll-driven WebGL layer. SHIPPED, sixth concept (2026-11-04).**

The homepage is a quaternion Julia set: the k = 0 slice of the filled set for
c = −0.2 + 0.8i, from Paul Bourke's catalogue, ray-marched live in raw WebGL2 on
a fixed canvas behind the page. At rest the title keeps its own "o"; a first
nudge of scroll turns the letter into a ball while the title holds still. The
title then rises off it, and the ball grows through the slice's
four-dimensional stages, holds a view beside each of four short sections of
text, and lands in the second title's "o" above the directory cards, where the
letter takes over from it. The camera is a pure function of `scrollY`, so scrolling back
runs it in reverse. A fast first pass is held for a moment at the three moments that only
work if seen: the first "o" turning into the ball, "cut open", and the landing.

- `astro/src/pages/index.astro` — the words, the slideshow, the notes, the
  section lengths, the letter ↔ ball CSS, and the intro/return choreography.
- `astro/src/lib/qjulia/` — `home.js` (the page layer: anchors, pacing, the
  ball, the notes), `homeShots.js` (the generated journey), `scene.js`, and the
  renderer (`renderer.js`, `shaders.js`, `stage.js`, `path.js`).
- `scripts/home-shots/` — `make-home.mjs` writes `homeShots.js`, routing every
  move clear of the solid on the CPU (`route.mjs`, `qjcpu.mjs`).
- `astro/src/lib/homeScroll.js` — `motionEnabled()` and the return stage's
  scroll math.

ADDITION-RULES.md → Homepage lists what to edit for what. The renderer and the
61-shot reel it came from live in a separate local repo, `~/Documents/qjulia`.
The five earlier concepts (folding sheet, ink star chart, transit map,
handscroll, one stroke 一笔) and their scaffolding stay on the `home-3d` and
`home-one-stroke` branches; nothing on master uses them.

Constraints that hold:
- Static HTML stays complete in source — chrome over content, never the content
  itself. Text stays in the DOM; never text-as-texture.
- About 2 KB of eager JS, the renderer behind a dynamic import. Phones (under
  768px) that can take it get a lighter portrait layout (`phoneMotionEnabled`
  in `homeScroll.js`, the `phone` branches in `home.js`): words pinned at the
  top on a paper fade, each view framed below, no speed bumps, refinement
  capped at 1.25 device pixels and 10 samples. Reduced motion, data saver, a
  phone reporting under 4 GB and no WebGL2 get the sections as one plain column.
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
  scripts/                  audit-raw-html.mjs (SEO audit), send-thought-notification.py,
                            home-shots/ (generates the homepage fractal's journey)
  workers/gallery-list/     Cloudflare Worker listing the gallery R2 bucket
  .github/workflows/        Buttondown email on new thought

/astro                      The main site (Vercel, root directory = astro)
  src/pages/                One file per route; rss.xml/sitemap.xml/llms.txt are endpoints
  src/layouts/BaseLayout.astro   Site-wide head: meta, canonical, OG, base JSON-LD
  src/islands/              React islands (now board, regents scene, gallery grid, ink canvas)
  src/data/                 content.js, profileData.js, nowData.js,
                            poetryData.js, thoughts/*.md (content collection)
  src/lib/                  thoughts/gallery/projects/supabase helpers; qjulia/ (the homepage fractal)
  src/config/site.js        SITE constants, APP_ROUTES, NAVIGATION_ITEMS — single source for URLs/nav
  public/                   Static assets; profile.json is the canonical "now" data
```

## Main site routes

`/` · `/about` · `/resume` · `/projects` · `/projects/:group` (claude-code, maps) · `/thoughts` ·
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
