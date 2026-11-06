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
date: "2026-05-15"          # quoted YYYY-MM-DD — an unquoted date fails the schema
excerpt: One clear sentence describing the article.
image: /resources/my-image.jpg   # root-relative, file exists in astro/public/resources/
tags: [History, Writing]    # non-empty
# optional:
modified: "2026-06-01"      # quoted; bump ONLY on meaningful edits (drives sitemap lastmod)
related: [another-slug]     # hand-picked related articles; same-tag articles fill in otherwise
---

Opening paragraph. Normal + GitHub-flavored markdown.
```

- Math: `$inline$`, `$$display$$`, or a ` ```math ` fence — rendered to static SVG at build; no other code fence is treated as math.
- Don't repeat the title as a `# heading` (it's demoted to h2 anyway; the page renders the title).
- Sitemap, RSS, and llms.txt update automatically on push. The Buttondown subscriber email is
  currently **paused** — flip `if: false` to `if: true` in `.github/workflows/notify-new-thought.yml`
  to resume it.

## Poem or ci

Add an entry to `poems` or `ciPieces` in `astro/src/data/poetryData.js` (copy a neighbor: id, title,
`lines`, `linesEn` per-line translations, `context`/`contextEn`, optional `claudeZh`/`claudeEn`, ci also `tune`).
Then append the piece to the matching plain-text export `astro/public/poetry.txt` or `ci.txt` — those are manual.

## Project

- Card on /projects: add to `projects.content` in `astro/src/data/content.js`
  (name, tech, description, image/images, liveDemo/github/pypi links, `post` for an X post).
  Array order is page order. A project with a repo may omit the image: the card
  shows the repo's GitHub social card, linked to the repo (`lib/projectImage.js`).
- Pictures are 1200 × 630 (the Open Graph size), named `<project>-og.png`. Every card's
  picture frame is fixed at that ratio, so any other shape is cropped to fill it, centred.
  Where that crop would cut something (a tall map, a screenshot with content at its edges),
  export a 1200 × 630 version that extends the picture's own edge colour instead — as
  `weighted-map-driving-time-og.jpg` and `dont-hallucinate-og.png` do.
- Group (several cards folded into one card that opens a subpage at /projects/<slug>): give each
  member card `group: "<slug>"` and add the group's slug, name, tech, description and optional image
  to `projects.groups`. The card sits where its first member sits; the page and sitemap entry appear
  automatically. Never reuse a retired slug — `astro/vercel.json` redirects five old project-page URLs.
- Homepage slideshow ("here are some things i have built"): hand-picked, the `shows` list at the top of
  `astro/src/pages/index.astro` (name, 1200 × 630 picture, link). A new project appears there only if added.

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

- /resume is "Me at Work": Alex's own words on each job, hand-written in `astro/src/pages/resume.astro`,
  plus a link to `resume.pdf`, which is the record. `content.js` → `resume` keeps only `education` and
  `achievements`, which /about reads.
- `astro/src/data/profileData.js` → the socials, aliases and mirrors named in /about's prose.
  /about itself is short hand-written paragraphs in `about.astro` — edit them there, and keep them
  prose (see DESIGN.md). Anything that changes month to month goes in `public/profile.json` (/now).
- Replace `resume.pdf` in **both** `astro/public/` (served at alexgaoth.com/resume.pdf) and the repo root (intro site).
- Also regenerate `astro/public/resources/resume.jpg` — the homepage directory card shows it, so it silently goes stale:
  `pdftoppm -f 1 -l 1 -jpeg -scale-to-x 1600 -scale-to-y -1 resume.pdf out`, then crop the top to 1600×1201.
- If identity-level facts change (job title, school), also update the Person JSON-LD in
  `astro/src/layouts/BaseLayout.astro` and `astro/src/pages/about.astro` — schema must match visible text.

## New page / route

Create `astro/src/pages/<name>.astro` wrapped in `BaseLayout` (title, description, keywords, `path`), with one `<h1>`,
real `<a href>` links, and content in source HTML. Add the route to `STATIC_ROUTES` in `astro/src/pages/sitemap.xml.js`
and link it from at least one existing page. Interactive parts go in `astro/src/islands/` behind `client:load`/`client:only`.

## Homepage

`/` is the title, four short sections in Alex's words each held beside a view of a quaternion
Julia set (ray-marched live, `astro/src/lib/qjulia/`), then the directory cards and the footer.
What to edit for what:

- Words, the slideshow, section lengths: `astro/src/pages/index.astro` (sections, the `shows`
  list, the `.fx-gap` heights and the live section heights in its style).
- Notes (a short arrow and one caption on a view): the hidden `.fx-notes` list in the same file,
  one `<li>` per view, by shot id; `data-dx`/`data-dy` place the caption, in viewport heights from
  the view's subject — keep it in the frame's empty paper, since the caption has no box.
- The set's equation: the `.fx-math` line in the fractal section of the same file.
- Intro length and the title's rise: `INTRO_VH` / `RISE` / `FADE` in the page's choreography script;
  how long the title holds still while its "o" becomes the ball: `TITLE_HOLD_VH` in
  `astro/src/lib/homeScroll.js` (the fractal layer reads it too).
- The views themselves and the camera's path between them: `scripts/home-shots/make-home.mjs`,
  then `node scripts/home-shots/make-home.mjs` from the repo root rewrites
  `astro/src/lib/qjulia/homeShots.js` — generated, never edit it by hand: the generator routes
  every move clear of the solid.
- How long holds and moves last, the ball's size and place in the titles' "o", the notes' look:
  the constants at the top of `astro/src/lib/qjulia/home.js`; the letter ↔ ball animations are
  the `.title-o` CSS in `index.astro`.
- Speed bumps — how long a fast first pass is held at the first "o", at "cut open" and at the
  landing: `BUMPS` in `home.js` (`bumpSpans` says where). `/?nobumps` shows the page without them.

Check on a desktop-width window: mobile, reduced motion and no-WebGL2 get the words as one plain
column, which must stay complete on its own.
