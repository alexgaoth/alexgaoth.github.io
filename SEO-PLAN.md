# SEO + Visibility Plan — alexgaoth.com

Written 2026-07-13. Two parts: **Phase 0** is an afternoon of standalone fixes that pay off
immediately and survive any future migration. **Phases 1–4** are the Astro migration of
`/main-section`, which is the structural fix for the site's core SEO weakness (the CRA SPA
serves an empty HTML shell to every crawler).

This is broader than "rank in Google". The target is: **make Alex's identity, writing,
projects, images, and live site surfaces easy for humans, classic search engines, social
preview bots, and AI-answer systems to crawl, quote, understand, and trust.**

Source-backed assumptions, checked against current public guidance on 2026-07-13:
- Google says its AI features (AI Overviews / AI Mode) use the same foundational SEO
  requirements as Search: pages need to be crawlable, indexed, snippet-eligible, internally
  findable, textually available, fast/good to use, and backed by structured data that matches
  visible page content. There is no special schema or `llms.txt` requirement for Google AI
  features; `llms.txt` is useful as a hedge for non-Google crawlers, not as a Google ranking
  mechanism.
- Google still documents JavaScript SEO as a special risk area: links, canonical tags,
  metadata, lazy-loaded content, and important text should not depend on fragile client-only
  rendering when the content can be rendered statically.
- Sitemap `lastmod` is useful only when accurate. `changefreq` and `priority` remain mostly
  legacy hints, not meaningful Google ranking levers.
- Image SEO depends on real image context: descriptive filenames, alt text, captions or
  nearby text, dimensions, crawlable image URLs, and good page context.
- Multilingual pages require reciprocal, self-referencing `hreflang` alternates if they are
  meant to be treated as localized equivalents.

References checked:
- Google Search Central: AI features and your website
  (https://developers.google.com/search/docs/appearance/ai-features)
- Google Search Central: JavaScript SEO basics
  (https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- Google Search Central: Build and submit a sitemap
  (https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- Google Search Central: Image SEO best practices
  (https://developers.google.com/search/docs/appearance/google-images)
- Google Search Central: Localized versions of your pages
  (https://developers.google.com/search/docs/specialty/international/localized-versions)
- Google Search Central: ProfilePage, Breadcrumb, Article, and SoftwareApplication
  structured-data docs.

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
**Why:** Thought URLs already use frontmatter dates, but static routes still get the build
date as `lastmod`, so every build implies pages like `/about`, `/projects`, and `/quotes`
changed even when they did not. Google says sitemap dates are useful only when they are
consistently accurate; inaccurate build-date churn trains the useful signal into noise.
`changefreq` and `priority` are legacy hints and not worth optimizing around.
**Change:** For `/thoughts/:slug`, keep using frontmatter `date`, add a `modified` field
when needed, and prefer `modified || date` for `lastmod`. For static routes, either omit
`lastmod` or store real per-route modified dates that are only bumped when the page
meaningfully changes.

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
**Why:** Some LLM crawlers and tools may use it as a discovery shortcut, and they mostly
don't execute JS — exactly the crawlers the SPA is invisible to today. An `llms.txt`
summarizing who Alex is and linking the key pages/thoughts is a cheap hedge. The existing
`poetry.txt` / `ci.txt` plain-text exports show this instinct is already there; this
generalizes it.
**Caveat:** Google explicitly says no AI-specific machine-readable file is required for AI
Overviews / AI Mode. Treat `llms.txt` as extra distribution, not as the core AI-search fix.

### 0.9 Raw-HTML crawlability audit
**Where:** local scripts or one-off shell checks against production and previews.
**Why:** The current site often "looks fine" in a browser while source HTML is nearly empty.
That is the failure mode the plan is trying to end. Add a repeatable audit before doing
large migrations.
**Check:** For every sitemap URL, fetch raw HTML and verify:
- status is 200 (or intended 301/308);
- `<title>`, meta description, canonical, OG title/description/image are present and correct;
- one visible `<h1>` exists in source HTML for static pages;
- article pages contain the article body in source HTML after Astro migration;
- internal navigation links are real `<a href>` links, not JS-only click handlers;
- images have crawlable URLs, dimensions where practical, and useful alt/context.

### 0.10 Search appearance and social-preview audit
**Where:** Open Graph/Twitter cards, favicons, site name, article images.
**Why:** Social bots usually do not execute client JS. The static template's generic OG tags
make every shared route look like the homepage. Fixing canonical without fixing route-level
OG previews leaves a major discovery channel weak.
**Change:** Define a default OG image plus per-article/per-project images. Verify `/thoughts/*`,
`/projects`, `/resume`, `/now`, `/poetry`, and `/ci` with a no-JS HTML fetch and social
debuggers after Astro preview deploys.

### 0.11 Add a 404/redirect/canonical policy
**Where:** `main-section/vercel.json`, Astro redirects config, sitemap generator.
**Why:** The root sitemap currently references stale URLs, and `app.alexgaoth.com` is legacy.
During migration, URL churn is the easiest way to lose accumulated signals.
**Change:**
- keep existing public URLs stable;
- preserve `app.alexgaoth.com/*` redirects;
- redirect stale root sitemap URLs to their modern equivalents if valuable, otherwise remove
  them and let them 404 intentionally;
- create a useful 404 page with links to `/`, `/thoughts`, `/projects`, `/about`;
- never put redirected, 404, noindex, or canonicalized-away URLs in the sitemap.

### 0.12 Accessibility as SEO hygiene
**Where:** layouts, nav, gallery, article pages, interactive islands.
**Why:** Accessibility and crawlability overlap: semantic headings, real links, alt text,
labels, and readable text improve both assistive tech and machine understanding.
**Change:** During Astro migration, enforce one logical H1, ordered headings, descriptive
link text, labelled form inputs, keyboard navigation for menus/gallery, and no text hidden
behind hover-only interactions on important pages.

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

**Non-negotiable output:** every Phase 1 route must return meaningful source HTML without
client JS: page title, description, canonical, OG tags, one H1, primary text, visible nav
links, and JSON-LD where applicable.

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

**Add while here:**
- **Topic hubs:** add collection pages beyond `/thoughts`, such as `/thoughts/ai`,
  `/thoughts/history`, `/thoughts/philosophy`, and `/writing`. These should be short,
  useful pages with real copy and links to the relevant essays, not tag dumps.
- **Related links:** every thought page should link to 2-5 related thoughts/projects/pages.
  Search engines should be able to discover the site's conceptual structure through normal
  links, not just through `sitemap.xml`.
- **Editorial frontmatter:** require `title`, `slug`, `description`/`excerpt`, `date`,
  optional `modified`, `image`, `tags`, and optional `related`. The `modified` date should
  only change when the article meaningfully changes.
- **Article summaries:** add a short human-written summary or dek near the top of long
  thought pages. This helps readers, snippets, AI-answer extraction, and social previews.
- **Plain-text exports:** keep RSS and optionally add text/markdown index files for writing,
  but make canonical HTML the source of truth.

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

**Static shell requirement:** `/now`, `/gallery`, and `/regents` should each have useful
static source HTML even if their interactive island fails. For `/now`, render the latest
profile data at build time or from a canonical JSON fetch during build. For `/gallery`, add
indexable intro/caption text and do not make the R2 worker the only source of page meaning.
For `/regents`, include static copy describing the piece and lazy-load the three.js scene.

## Phase 3.5 — Authority, entity, and media layer

**What:** Strengthen the site's external and semantic identity once the main pages are static.

**Why:** A personal site is not just a bundle of pages. Search systems need to understand
that `alexgaoth`, Alex Gao, GitHub, LinkedIn, Signalor, writing, projects, and UCSD context
are the same entity cluster.

**Work:**
- Make `/about` the canonical identity page for Alex. It should contain the stable bio,
  aliases, social profiles, project links, education, and contact paths.
- Add richer page-specific structured data:
  - `Person` / `ProfilePage` on `/about`;
  - `WebSite` on `/`;
  - `Article` or `BlogPosting` on `/thoughts/:slug`;
  - `BreadcrumbList` on nested pages;
  - `CreativeWork` for poetry/ci pages;
  - `SoftwareApplication` or `CreativeWork`-style data for major project pages where it
    matches visible content.
- Keep structured data boring and truthful. It must match visible page text; do not stuff
  schema with claims that are not on the page.
- Normalize external profile links so GitHub, LinkedIn, X/Twitter, Signalor, Buttondown,
  and project READMEs all point back to `https://alexgaoth.com/about` or the relevant
  canonical page.
- Create stronger standalone project pages for the most important projects instead of
  only a projects index. Good candidates: Signalor, this website, UCSD Crimes, Julia Set,
  AI-agent work. Each page should include problem, role, stack, screenshots, links, and
  what makes it worth indexing.
- Treat images as first-class content: descriptive filenames for new images, alt text,
  dimensions, captions/nearby text, width/height to reduce layout shift, and compressed
  modern formats where practical. Article/project OG images should be inspectable and
  specific, not just a generic logo.
- For `/gallery`, consider an image sitemap or static generated gallery index if the R2
  inventory becomes important enough to rank. At minimum, expose a stable HTML route with
  a representative subset and descriptive copy.

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

**Pre-cutover acceptance criteria:**
- `curl -L` of every sitemap URL returns the expected status and meaningful source HTML.
- All canonical URLs are self-canonical unless deliberately redirected/canonicalized.
- No sitemap URL is redirected, 404, noindex, blocked by robots, or canonicalized to another
  page.
- `/robots.txt` and `/sitemap.xml` are correct for both `alexgaoth.com` and
  `intro.alexgaoth.com`.
- Article pages contain the article text in source HTML.
- Poetry/ci language versions have reciprocal, self-referencing `hreflang`.
- Open Graph previews are route-specific.
- RSS validates and keeps stable GUIDs.
- Search Console property and sitemap submission are ready before DNS/build cutover.
- Analytics works on `alexgaoth.com`, not only `intro.alexgaoth.com`.
- Lighthouse/Core Web Vitals smoke test passes for `/`, `/thoughts/:slug`, `/projects`,
  `/now`, `/gallery`, and `/regents` on mobile.

## Ongoing visibility program

**Cadence:** monthly, after the migration is live.

**Search Console / analytics:**
- Verify `alexgaoth.com`, `intro.alexgaoth.com`, and any legacy host that still serves
  redirects. Prefer domain properties if DNS access makes that easy.
- Track indexed pages, not-indexed reasons, sitemap health, top queries, CTR, impressions,
  average position, crawl errors, and Core Web Vitals.
- Pair Search Console with analytics so AI/search visits can be evaluated by engagement,
  not just click count.
- Add Bing Webmaster Tools. Bing, Copilot, DuckDuckGo, and other surfaces are worth the
  small setup cost.

**Content maintenance:**
- Refresh old articles only when there is meaningful new substance. Update `modified`
  frontmatter and sitemap `lastmod` only then.
- Add internal links whenever a new thought/project is published.
- Periodically create or improve hub pages when several articles cluster around the same
  topic.
- Keep titles human and specific. Avoid generic "Thoughts on X" if the article has a sharper
  claim.
- Keep meta descriptions written for click clarity, not keyword stuffing.

**AI-answer visibility:**
- Do not chase fake "GEO" hacks. The durable work is still: crawlable HTML, clear claims,
  original experience, sourceable facts, internal links, fast pages, and consistent entity
  signals.
- Test a short list of prompts quarterly in Google AI Mode/AI Overviews, Perplexity,
  ChatGPT browsing/search, Claude search, and Bing/Copilot. Record whether Alex/site pages
  are cited and which page is cited.
- Add citations/outbound references inside factual essays when they strengthen trust.
  Personal essays do not need academic footnotes, but factual/history/technical claims
  benefit from visible sources.
- Decide whether to allow AI training/crawling separately from search crawling. Blocking
  broad AI crawlers can reduce inclusion in some AI answer systems; allowing them can
  increase discoverability but gives up control. Make this an explicit policy in
  `robots.txt`, not an accident.

**Risk controls:**
- Avoid doorway pages, thin tag pages, AI-generated filler, hidden text, and schema that
  doesn't match the page. They dilute a small personal site's strongest asset: authenticity.
- Keep the intro site from competing with the main site. It should either be a deliberately
  indexed intro with canonical, accurate sitemap, and strong links to `alexgaoth.com`, or a
  noindexed doorway. Ambiguity is the current problem.
- Keep build artifacts and generated files out of manual edits. A stale generated sitemap is
  worse than no sitemap because it teaches crawlers not to trust the file.

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
| 0.8 llms.txt | minutes | speculative distribution hedge |
| 0.9 raw-HTML audit | ~1h | high — catches the exact SPA failure mode |
| 0.10 social-preview audit | ~1h | medium — improves sharing/discovery |
| 0.11 redirects/404/canonical policy | ~1h | medium — protects URL equity |
| 0.12 accessibility pass | ongoing | medium — improves crawlability and UX |
| Phase 1 | ~1–2 days | high |
| Phase 2 | ~2–3 days | **highest — the point of the migration** |
| Phase 3 | ~1–2 days | medium (perf + fragility cleanup) |
| Phase 3.5 | ~1–2 days | medium/high — entity, media, and project depth |
| Phase 4 | ~0.5 day | protects everything above |
| Ongoing visibility program | ~1h/month | compounding — keeps signals fresh and measured |

Phase 0 items are independent of each other and of the migration — they can land in any
order, today. The phases are sequential.

## Short priority order

If time is limited, do this:
1. Remove hardcoded URL-bearing meta from the CRA template.
2. Fix root robots/sitemap ambiguity.
3. Verify Search Console + analytics.
4. Ship Astro source HTML for `/`, `/about`, `/projects`, `/resume`, `/thoughts`, and
   `/thoughts/:slug`.
5. Add route-specific OG images/meta and Article schema.
6. Add internal links and topic hubs.
7. Port `/now`, `/gallery`, `/regents` as static shells with client islands.
8. Add richer entity/project/media work.
9. Start monthly Search Console + AI-answer visibility checks.
