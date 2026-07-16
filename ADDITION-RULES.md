# Addition Rules

How to add anything to alexgaoth.com. The site is the Astro app in `/astro`;
every change below deploys on push to `master`.

**Golden rules for everything:**

1. Never change an existing URL — content changes are free, URL changes forfeit ranking history.
2. New images go in `astro/public/resources/` with descriptive filenames (`signalor-dashboard.png`, not `img_0231.png`).
3. Verify before pushing: `cd astro && npm run build` (the build fails on invalid content), then spot-check with
   `node scripts/audit-raw-html.mjs astro/dist <file.html>:<route>`.

## Thought (essay)

One `.md` file in `astro/src/data/thoughts/`. The build validates frontmatter and fails loudly if it's wrong.

```md
---
slug: my-new-article        # unique, lowercase-kebab-case → alexgaoth.com/thoughts/my-new-article
title: My New Article
date: 2026-05-15            # exact YYYY-MM-DD
excerpt: One clear sentence describing the article.
image: /resources/my-image.jpg   # root-relative, file exists in astro/public/resources/
tags: [History, Writing]    # non-empty
# optional:
modified: 2026-06-01        # bump ONLY on meaningful edits (drives sitemap lastmod)
related: [another-slug]     # hand-picked related articles; same-tag articles fill in otherwise
---

Opening paragraph. Normal + GitHub-flavored markdown.
```

- Math: `$inline$`, `$$display$$`, or a ` ```math ` fence — rendered to static SVG at build; no other code fence is treated as math.
- Don't repeat the title as a `# heading` (it's demoted to h2 anyway; the page renders the title).
- Sitemap, RSS, and llms.txt update automatically on push. The Buttondown subscriber email is
  currently **paused** — flip `if: false` to `if: true` in `.github/workflows/notify-new-thought.yml`
  to resume it.
- The homepage WRITING panel shows a hand-picked trio: update `WRITINGS` in `astro/src/data/homeRailData.js` if the new piece should appear there.

## Poem or ci

Add an entry to `poems` or `ciPieces` in `astro/src/data/poetryData.js` (copy a neighbor: id, title,
`lines`, `linesEn` per-line translations, `context`/`contextEn`, optional `claudeZh`/`claudeEn`, ci also `tune`).
Then append the piece to the matching plain-text export `astro/public/poetry.txt` or `ci.txt` — those are manual.

## Project

- Card on /projects: add to `projects.content` in `astro/src/data/content.js`
  (name, tech, description, image/images, liveDemo/github/pypi links).
- Standalone page at /projects/<slug> (optional, for projects worth indexing): in `astro/src/lib/projectPages.js`
  add the slug to `FEATURED_SLUGS` and write 1–5 paragraphs in `PROSE`. The slug is the name lowercased with
  non-alphanumerics → `-`. The page and sitemap entry appear automatically.
- Homepage BUILT panel: add a ship to `SHIPS` in `astro/src/data/homeRailData.js`; its `anchor` must equal the project slug.

## Quote

Add to `quotes.content` in `astro/src/data/content.js`: `{ quote, author, description (or null), relatedArticles: [thought-slugs] or null }`.

## Now page

Edit `astro/public/profile.json` (from mobile: GitHub web UI → that file → edit). The commit rebuilds the site,
so both the static shell and the live fetch serve the new data. `NOW_FALLBACK` in `astro/src/data/nowData.js`
is only the offline fallback — sync it when convenient, not urgently.

## Gallery photo

Upload the image to the R2 bucket behind `photos.alexgaoth.com` — that's it, no code. Filename becomes the
alt text (`sunset-over-geisel.jpg` → "sunset over geisel"); camera-roll names get a generic alt. Deploy the
listing worker from `/workers/gallery-list` with `npx wrangler deploy` only if the worker itself changes.

## Regent (3D statue)

Put the `.glb` (and optional looping `.mp3`) in `astro/public/regents/`, then add an entry
(name, glb, audio, bio) to `astro/src/lib/regentsData.js`. The static shell and the scene both read it.

## Resume / career facts

- `astro/src/data/content.js` → `resume` (the /resume page).
- `astro/src/data/homeRailData.js` → `EXPERIENCE` / `EDUCATION` / `TROPHIES` (the homepage panel — hand-tightened wording, edit separately).
- `astro/src/data/profileData.js` → facts/focus on /about.
- Replace `resume.pdf` in **both** `astro/public/` (served at alexgaoth.com/resume.pdf) and the repo root (intro site).
- If identity-level facts change (job title, school), also update the Person JSON-LD in
  `astro/src/layouts/BaseLayout.astro` and `astro/src/pages/about.astro` — schema must match visible text.

## New page / route

Create `astro/src/pages/<name>.astro` wrapped in `BaseLayout` (title, description, keywords, `path`), with one `<h1>`,
real `<a href>` links, and content in source HTML. Add the route to `STATIC_ROUTES` in `astro/src/pages/sitemap.xml.js`
and link it from at least one existing page. Interactive parts go in `astro/src/islands/` behind `client:load`/`client:only`.
