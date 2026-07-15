# alexgaoth.github.io

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
