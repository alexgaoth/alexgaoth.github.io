# SEO Plan — alexgaoth.com

Written 2026-07-13. Two parts: **Phase 0** is an afternoon of standalone fixes that pay off
immediately and survive any future migration. **Phases 1–4** are the Astro migration of
`/main-section`, which is the structural fix for the site's core SEO weakness (the CRA SPA
serves an empty HTML shell to every crawler).

Decisions already made:
- **Stay on Vercel.** Hosting has ~zero SEO impact for a static/SPA site; Vercel and Cloudflare
  both serve from a global CDN. The SEO problem lives in the code, not the host, and Astro
  deploys on Vercel with zero friction. Do not spend time on a host migration.
- **Astro over Next/prerendering.** react-snap is unmaintained and breaks on modern Node.
  Next SSG works but keeps everything in React. Astro fits this site's exact shape — mostly
  static content (thoughts, poetry, quotes, resume) with a few interactive islands
  (`/regents` three.js, `/now` Supabase guest slips) — and existing React components can be
  kept as islands via `@astrojs/react`, so it's a port, not a rewrite. CRA is deprecated
  anyway, so a migration off it is inevitable; better to land somewhere that solves SEO
  at the same time.

---

## Phase 0 — Standalone fixes (do now, before/independent of migration)

### 0.1 Remove the hardcoded canonical + og:url from the CRA template
**Where:** `main-section/public/index.html` (canonical at ~line 20, og:url / twitter:url below it).
**Why:** The template ships `<link rel="canonical" href="https://alexgaoth.com/">` on every
route. Helmet overrides it after JS hydration, but any crawler reading raw HTML — Google's
first-pass fetch, Bing, all LLM crawlers, all social preview bots — sees every page
canonicalized to the homepage. A canonical to `/` is literally an instruction to *not index*
`/thoughts/*`, `/poetry`, etc. as separate pages. This is the single most damaging line on
the site. The generic title/description/OG tags in the template can stay (they're the correct
fallback for `/`); it's specifically the URL-bearing tags (canonical, og:url, twitter:url)
that must not be baked in.

### 0.2 Fix the root (GitHub Pages / intro.alexgaoth.com) robots.txt and sitemap.xml
**Where:** `/robots.txt`, `/sitemap.xml` at repo root.
**Why:** These files are served on `intro.alexgaoth.com` but describe `alexgaoth.com`:
- The sitemap lists `https://alexgaoth.com/...` URLs. Cross-host sitemap entries are ignored
  by Google unless both hosts are cross-verified in Search Console — so this sitemap does
  nothing today.
- It also lists `/JuliaSetFractal/`, `/UCSD_Crimes/`, and `/resume.pdf` on `alexgaoth.com`,
  which don't exist on the Vercel deployment — a sitemap full of 404s erodes crawler trust.
- robots.txt disallows `/main-section/` and `/node_modules/` (paths that don't exist on the
  deployed intro site) and points to the retired `app.alexgaoth.com`.

**Change:** Rewrite both to describe `intro.alexgaoth.com` only (its actual pages), and add a
prominent link from the intro site to `alexgaoth.com` so crawlers understand which host is
the primary identity. Alternatively, if the intro site is meant to be a doorway rather than
an indexed property, mark it `noindex` and canonical it to `alexgaoth.com` — decide one way,
don't leave it ambiguous.

### 0.3 De-duplicate JSON-LD structured data
**Where:** hardcoded Person + WebSite schemas in `main-section/public/index.html` (~lines
45–77) vs. the same two schemas injected by `src/components/SEO.jsx` on every page.
**Why:** Every rendered page currently carries both schemas twice. Duplicate structured data
is not penalized, but it's noise, it doubles the chance of the two copies drifting out of
sync (they already differ: the hardcoded one has `jobTitle`/`affiliation`, the SEO.jsx one
doesn't), and conflicting Person records make Google less confident about the entity.
**Change:** Keep the *richer* copy in exactly one place. Pre-migration that means the static
template (crawlers without JS see it) and remove the base schemas from `SEO.jsx`, keeping
only the per-article schema there. Post-Astro this resolves naturally since everything is
static.

### 0.4 Real `lastmod` dates in the generated sitemap; drop changefreq/priority
**Where:** `main-section/scripts/generate-thoughts-index.js` → `main-section/public/sitemap.xml`.
**Why:** Every URL currently gets the build date as `lastmod` (all `2026-07-12` right now).
Google explicitly says it ignores `lastmod` from sites where it changes without content
changing — so the one sitemap signal Google actually uses is being trained into worthlessness.
`changefreq` and `priority` are ignored by Google entirely; keeping them is harmless clutter
but clutter nonetheless.
**Change:** For `/thoughts/:slug` use the frontmatter `date` (and a `modified` field if ever
added). For static routes, either omit `lastmod` or hardcode a date that's only bumped when
the page meaningfully changes.

### 0.5 Verify Search Console + analytics coverage
**Where:** Google Search Console (both `alexgaoth.com` and `intro.alexgaoth.com`), GA tag
audit of the React app.
**Why:** GA (G-M3BEDKHCBK) is confirmed only in the intro site's `index.html`; whether the
React app has any measurement is unverified. Without Search Console you cannot see which
routes Google has actually indexed, which are stuck in "Discovered — currently not indexed"
(the classic SPA symptom), or whether the fixes above are working. Every later step in this
plan is blind without this one. This is also the mechanism to formally observe the
before/after of the Astro migration.

### 0.6 Load MathJax conditionally
**Where:** `main-section/public/index.html` (~line 99, CDN `tex-svg.js`).
**Why:** MathJax loads from jsDelivr on every page of the site, math or not. That's a large
third-party script hurting Core Web Vitals sitewide (page-experience signals feed ranking),
and it's the site's only external CDN dependency. Only thought pages containing TeX need it.
**Change:** Move loading into the thought-rendering path, triggered only when a document
contains math delimiters. (In Astro this becomes trivial: include it only in the thought
layout, or better, render TeX to static markup at build time so no client script ships at all.)

### 0.7 Fix the mojibake in root `profile.json`
**Where:** `/profile.json` (repo root — the GitHub-Pages copy edited from mobile).
**Why:** It contains UTF-8 double-encoding (`ÃÂ·` for `·`, garbled Tamil). This data is
user-visible on /now and the intro site; garbled text in rendered pages reads as low-quality
content to both humans and crawlers. Fix the encoding, and re-sync the three "now" copies
while at it (the sync is manual and fragile — noted again in Phase 3).

### 0.8 (Optional, cheap) Add `llms.txt`
**Where:** `main-section/public/llms.txt`.
**Why:** LLM crawlers (GPTBot, ClaudeBot, PerplexityBot) are an increasingly important
discovery channel and mostly don't execute JS — exactly the crawlers the SPA is invisible to
today. An `llms.txt` summarizing who Alex is and linking the key pages/thoughts is a
zero-risk hedge that costs ten minutes. The existing `poetry.txt` / `ci.txt` plain-text
exports show this instinct is already there; this generalizes it.

### Explicitly not doing
- **Meta keywords:** dead since 2009; leave whatever exists, invest nothing further.
- **Cloudflare migration:** see decision at top.
- **react-snap / prerender hacks on CRA:** unmaintained tooling, and Phase 1 obsoletes it.

---

## Phase 1 — Astro skeleton alongside CRA

**What:** Create the Astro project (in-repo, e.g. `/astro` or converting `/main-section`
on a branch), wire `@astrojs/react`, port the layout shell (nav from
`src/config/site.js`, footer, global styles), and stand up the static-content routes first:
`/`, `/about`, `/resume`, `/projects`, `/quotes`.

**Why this shape:**
- **Branch/parallel rather than in-place:** the site stays deployable at every moment;
  Vercel preview deployments let each ported route be checked against production before
  the DNS-level cutover. Push-to-master currently deploys both halves of the repo, so
  half-migrated states must never land on master.
- **Static pages first:** they're the highest SEO value per unit effort — they become real
  HTML immediately, with correct per-route `<title>`, description, canonical, and OG tags
  baked in at build time (this is what finally fixes social/LLM-crawler visibility, which
  helmet can never fix client-side).
- **Keep `src/config/site.js` as the single source for URLs/nav** — it's framework-agnostic
  and the existing convention; the migration shouldn't scatter route strings.

## Phase 2 — Content collections: thoughts, poetry, ci

**What:** Move `src/data/thoughts/*.md` into an Astro content collection; port `/thoughts`,
`/thoughts/:slug`, `/poetry`, `/poetry/en`, `/ci`, `/ci/en`. Replace
`generate-thoughts-index.js` with Astro's content-collection API plus the official sitemap
and RSS integrations.

**Why:**
- **This is the payload of the whole migration.** The thoughts are the site's main organic-
  search surface (long-form, keyworded, linkable), and today each one is an empty `<div
  id="root">` to any first-pass crawler. Statically rendered article pages with per-article
  title/description/OG-image/Article-schema are the difference between the essays being
  findable and not.
- **Deletes the most fragile custom code.** The generator script, the GENERATED manifest,
  the public markdown copies, and the hand-rolled sitemap/RSS all disappear; frontmatter
  gets schema validation for free. Fewer generated-file footguns (CONTEXT.md already warns
  "never hand-edit the generated files" — after this there are no generated files to warn about).
- **TeX at build time:** render math during build (remark plugin) so thought pages ship zero
  MathJax client script — completes 0.6 properly.
- **Bilingual poetry/ci pages** get proper `hreflang` alternates statically, which the
  current helmet-injected alternates never reliably expose to crawlers.

## Phase 3 — Interactive islands: /now and /regents

**What:** Port `NowPage` (Supabase guest slips, realtime) and `RegentsPage` (three.js,
~600KB) as client islands with `client:visible` / `client:only` loading. Consolidate the
"now" data flow while here.

**Why:**
- These two pages are the reason a "just use static HTML" answer was never enough — they're
  genuinely dynamic. Astro's island model means the *page* is still static HTML (indexable
  shell, instant paint) and only the interactive part hydrates. For /regents this preserves
  the existing lazy-load pattern (owner priority #4: visual pieces must load lazily) and
  stops three.js from ever entering the shared bundle.
- **"Now" data cleanup:** three manual copies (`nowData.js` fallback, `main-section/public/
  profile.json`, root `/profile.json`) is the known-fragile spot and the source of the
  mojibake bug. Reduce to one canonical copy fetched (or proxied) by both consumers, keeping
  the mobile-edit workflow (GitHub web UI) intact since that's how the page actually gets
  updated.

## Phase 4 — Cutover and verification

**What:** Point the Vercel project at the Astro build, keep `app.alexgaoth.com` redirects
from `vercel.json`, delete the CRA app once stable.

**Why the verification steps matter:**
- **Parity audit before cutover:** diff every route in the sitemap against production (status
  code, title, canonical, OG tags) so no URL silently 404s — the site's URLs must not change
  at all; changing URLs would forfeit the ranking history the migration is meant to build on.
- **Search Console after cutover:** request re-indexing of key pages and watch the Pages
  report over ~2–4 weeks. Expect "Discovered/Crawled — not indexed" counts to fall as Google
  re-fetches routes and now sees content. This is the measurable success criterion for the
  entire plan (impossible without 0.5).
- **Keep RSS + sitemap URLs identical** (`/rss.xml`, `/sitemap.xml`) so existing subscribers
  and Search Console submissions carry over untouched.

---

## Order and effort

| Step | Effort | SEO impact |
|---|---|---|
| 0.1 canonical fix | minutes | high — unblocks indexing of all subpages |
| 0.2 root robots/sitemap | ~1h | medium — stops sending crawlers to 404s |
| 0.3 JSON-LD dedupe | minutes | low — hygiene |
| 0.4 sitemap lastmod | ~1h | medium — restores the one sitemap signal Google uses |
| 0.5 Search Console/GA | ~1h | enabling — measurement for everything else |
| 0.6 MathJax conditional | ~1h | medium — sitewide Core Web Vitals |
| 0.7 profile.json encoding | minutes | low — content quality |
| 0.8 llms.txt | minutes | speculative but free |
| Phase 1 | ~1–2 days | high |
| Phase 2 | ~2–3 days | **highest — the point of the migration** |
| Phase 3 | ~1–2 days | medium (perf + fragility cleanup) |
| Phase 4 | ~0.5 day | protects everything above |

Phase 0 items are independent of each other and of the migration — they can land in any
order, today. The phases are sequential.
