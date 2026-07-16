# SEO Checkup — post-migration punch list

The Astro migration is done; this is what remains. Check items off as they land.
Standing conventions live in ADDITION-RULES.md and README; this file is the finite TODO
plus the recurring checkup script. Delete the one-time sections as they complete.

## 1. One-time, right after the Vercel flip

- [ ] **Production audit** — every route must serve real HTML with self-canonicals:
  `node scripts/audit-raw-html.mjs https://alexgaoth.com / /about /resume /projects /thoughts /thoughts/winning-the-battle-of-manzikert /writing /quotes /now /poetry /poetry/en /ci /ci/en /regents /projects/signalor`
- [ ] **404 behavior** — `curl -sI https://alexgaoth.com/asdf` returns status 404 and the styled 404 page.
- [ ] **Feeds live** — `/sitemap.xml`, `/rss.xml`, `/llms.txt`, `/profile.json` all 200 with fresh content.
- [ ] **Search Console** — resubmit `sitemap.xml`; *Validate Fix* on the old robots.txt issue;
  *Request indexing* for `/`, `/about`, `/thoughts`, each essay, `/projects/signalor`.
- [ ] **Social preview caches** — run `/thoughts/winning-the-battle-of-manzikert` and `/projects/signalor`
  through Facebook Sharing Debugger, X card validator, LinkedIn Post Inspector; confirm route-specific
  title/image, hit re-scrape where stale.
- [ ] **Lighthouse mobile** on `/`, one essay, `/regents` — record scores as the post-migration baseline.
- [ ] **GA4 sanity** — pages report shows alexgaoth.com routes (tag now ships in BaseLayout, no SPA history dependency).

## 2. Weeks 2–4 — watch the needle

- [ ] GSC Pages report: **"Crawled — currently not indexed" should fall** as Google re-fetches.
  This number is the success metric of the whole migration. If specific essays remain stuck
  after ~a month, investigate (fetch as Google, check canonical/robots, internal links).
- [ ] Impressions/CTR in GSC Performance start registering for essay queries.

## 3. Small improvements, any time

- [ ] **Essay title pass** — fix typos and sharpen titles for CTR *without touching slugs/URLs*
  ("An short article…", "…actually quite intersting"). Titles are the search snippet.
- [ ] **Citations in factual essays** (Manzikert, China modernisation) — visible sources build trust
  with both Google and AI-answer systems. Personal essays don't need them.
- [ ] **Default OG image** — replace logo.jpg with a purpose-made 1200×630 card; per-essay images
  already work.
- [ ] **Image weight** — `signalor.png` and `godot_game.png` are ~1MB each; compress like the
  zaporo/default pass (resize + q82). Add width/height attributes where layout shift is visible.
- [ ] **GitHub READMEs** — point signalor, UCSD_Crimes, JuliaSetFractal, dont-hallucinate repos
  at their `https://alexgaoth.com/projects/<slug>` pages (entity consolidation).
- [ ] **robots.txt policy note** — add a comment stating AI crawlers are deliberately allowed,
  so the stance reads as policy, not accident.
- [ ] **Dead liveDemo links** — `alexgaoth.com/JuliaSetFractal/` and `/UCSD_Crimes/` in
  `astro/src/data/content.js` likely 404 (old GH-Pages project sites). Find their real homes or drop the links.

## 4. Recurring — monthly (~1h)

- [ ] GSC: indexed count, new not-indexed reasons, sitemap health, crawl errors, Core Web Vitals.
- [ ] GSC Performance: top queries, impressions, CTR — note movement, adjust titles/descriptions if
  a page earns impressions but no clicks.
- [ ] Internal links: new content links to related old content and vice versa.
- [ ] `modified` frontmatter only bumped on meaningful edits this month (spot-check the sitemap).

## 5. Recurring — quarterly

- [ ] AI-answer visibility: ask Google AI Mode, Perplexity, ChatGPT, Claude, Copilot things like
  "who is Alex Gao UCSD", "signalor app", "battle of Manzikert alternative history essay".
  Record whether alexgaoth.com is cited and which page. Track over time.
- [ ] Topic-hub check: if 3+ essays now cluster on one topic (history, AI, philosophy), build the
  `/thoughts/<topic>` hub — a short page with real copy linking them (was deliberately deferred
  while the cluster was thin).
- [ ] Bing Webmaster Tools: same review as GSC, lighter touch.

## The one real lever

Everything above is maintenance. Rankings now grow from **publishing**: every new essay is a
fully indexable asset the day it lands. Write; the plumbing is done.
