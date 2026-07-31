# alexgaoth.github.io

## TODO — planned rebuild

Two structural changes, not tweaks. The current format is the thing being replaced.

**1. `/about` → the static identity page.** Turn it into a plain, static,
"ai-researcher / academia" page: no motion, no islands, fast, readable. This
becomes the canonical answer to "who is this person" — the page to link in a bio
and the one AI search surfaces should cite. Today that answer only exists on the
intro doorway (`intro.alexgaoth.com`), which canonicalizes away.

*Decided:* academic register **within** the existing ink/mono system — Space
Mono/Grotesk, black on white, one narrow column, zero motion, structure carries
the sobriety. No DESIGN.md exception needed. Fold the intro site's tldr
(Math-CS @ UCSD · building Signalor · interning at IBM/Bloomberg · "talk to me
abt…") into this page; the intro site then has no unique content left.

**2. `/` → one 3D object, driven by scroll.** The dithered-wash transition is a
lame translation of the ink-on-paper language into motion — replace it. The home
rails (BUILT / WRITING / EXPERIENCE) become faces/perspectives of a single
three.js object that the scroll position rotates through. At the end of the
scroll, it resolves into the four directory squares and the subpage strips.

*Decided:* a four-faced solid on an **orthographic** camera — white faces, 1px
black edges, no shading, no shadows, no PBR. It reads as a rotating technical
drawing, not a webgl demo. A quarter-turn per section; at the end the solid
**unfolds into its own net**, and the net's four panels land as the directory
cards. The form and the sitemap are the same shape.

*Decided:* **desktop only.** Mobile gets no canvas and no three.js payload — the
static panels as one continuous ledger, per DESIGN.md. The 3D is a desktop reward.

Constraints that survive the rebuild:
- Static HTML stays complete in source — the 3D is chrome over content, never the
  content itself (see the `/regents` pattern: static shell + `client:only` island).
  Text stays in the DOM and the camera moves behind it; never text-as-texture.
- Keep the existing choreography contract (`index.astro`): every visual state is a
  pure function of `scrollY`, so scrolling back runs it in reverse. Swapping the
  renderer must not swap that.
- Procedural geometry only — no GLTF/meshopt (that's the `/regents` weight profile,
  and `/` is the most-crawled route). Hydrate on idle, not load.
- No URL changes (ADDITION-RULES golden rule 1).
- `prefers-reduced-motion` keeps a working, static page.

Open: the 4th face. Three rails occupy three faces; the fourth is the directory
face that unfolds into the 2×2. Confirm before building the geometry.

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
