# alexgaoth.github.io

Personal website repo for Alex Gao (`alexgaoth`). This repository currently contains two
deployed surfaces:

| Surface | Path | Stack | Host | Domain |
| --- | --- | --- | --- | --- |
| Intro site | `/` | Static HTML/CSS/JS | GitHub Pages | `intro.alexgaoth.com` |
| Main site | `/main-section` | React 18, Create React App | Vercel | `alexgaoth.com` |

`app.alexgaoth.com` is a legacy hostname that redirects to `alexgaoth.com`.

## Repo Layout

```text
/
  index.html             Static intro site entry point
  css/, js/              Intro site styles and behavior
  source/                Intro site images
  profile.json           Root "now" data copy, editable from GitHub web/mobile
  robots.txt, sitemap.xml

/main-section
  src/App.js             Main site route table
  src/config/site.js     Site constants, route paths, navigation items
  src/pages/             Route-level React pages
  src/components/        Shared UI, SEO, layout, content components
  src/data/              Resume, profile, poetry, thoughts, now data
  scripts/               Build-time generators
  public/                Static assets, generated sitemap/RSS, profile copy
  workers/gallery-list/  Cloudflare Worker for the gallery R2 listing endpoint
```

## Main Site Routes

The Vercel app serves:

- `/`
- `/about`
- `/resume`
- `/projects`
- `/thoughts`
- `/thoughts/:slug`
- `/quotes`
- `/now`
- `/art`
- `/gallery`
- `/regents`
- `/poetry`
- `/poetry/en`
- `/ci`
- `/ci/en`

Route constants and navigation labels live in `main-section/src/config/site.js`.

## Development

Run the main site locally from `main-section`:

```bash
cd main-section
npm install
npm start
```

Build the main site:

```bash
cd main-section
npm run build
```

The build runs `prebuild`, which regenerates the thoughts manifest, public markdown copies,
RSS feed, sitemap, and build-time environment file.

The root intro site is static and can be opened directly from `index.html`.

## Thoughts Pipeline

Thought articles are source markdown files in:

```text
main-section/src/data/thoughts/
```

After adding or editing a thought, run:

```bash
cd main-section
npm run generate-thoughts
```

This updates:

- `main-section/src/data/thoughtsManifest.json`
- `main-section/public/content/thoughts/*.md`
- `main-section/public/sitemap.xml`
- `main-section/public/rss.xml`

Do not hand-edit those generated files.

## Now Data

The `/now` page currently depends on multiple copies of profile data:

- `main-section/src/data/nowData.js` as the static fallback
- `main-section/public/profile.json` as the Vercel-served runtime copy
- `/profile.json` as the GitHub Pages/root copy

Keep these in sync when changing the public "now" content.

## Gallery

`/gallery` loads images from `photos.alexgaoth.com`. The listing endpoint is backed by the
Cloudflare Worker in `main-section/workers/gallery-list/`, which reads from an R2 bucket.

## SEO Notes

The main site is still a CRA single-page app. It uses `react-helmet-async` for route metadata,
and build scripts generate `sitemap.xml` and `rss.xml`, but crawlers that do not execute
JavaScript still receive the same empty HTML shell for app routes. See `SEO-PLAN.md` for the
current migration and cleanup plan.
