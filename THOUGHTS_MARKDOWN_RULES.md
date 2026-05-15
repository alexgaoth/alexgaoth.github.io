# Thoughts Markdown Rules

This file defines how to write a valid thought article for the React site at `main-section/`.

The source markdown lives in:

- `main-section/src/data/thoughts/`

The generated outputs are:

- `main-section/src/data/thoughtsManifest.json`
- `main-section/public/content/thoughts/`
- `main-section/public/sitemap.xml`
- `main-section/public/rss.xml`

## 1. Where to add a new thought

Add one new `.md` file inside:

```text
main-section/src/data/thoughts/
```

Example:

```text
main-section/src/data/thoughts/my_new_article.md
```

The filename itself does not control the public URL. The `slug` in frontmatter does.

## 2. Required frontmatter

Every thought must begin with frontmatter.

Required fields:

- `slug`
- `title`
- `date`
- `excerpt`
- `image`
- `tags`

Template:

```md
---
slug: my-new-article
title: My New Article
date: 2026-05-15
excerpt: A short summary of what this article is about.
image: /resources/default.jpg
tags:
  - Writing
  - Math
  - Philosophy
---

# My New Article

Start writing here.
```

## 3. Frontmatter rules

### `slug`

- Must be unique across all thought articles.
- Must be lowercase kebab-case only.
- Valid example: `my-new-article`
- Invalid examples:
  - `My-New-Article`
  - `my_new_article`
  - `my new article`

This becomes the URL:

```text
https://alexgaoth.com/thoughts/my-new-article
```

### `title`

- Must be a non-empty string.
- This is the article title shown on the site and used in SEO metadata.

### `date`

- Must be in exact `YYYY-MM-DD` format.
- The date must be a real calendar date.

Valid:

```text
2026-05-15
```

Invalid:

```text
2026-5-15
2026/05/15
May 15, 2026
```

### `excerpt`

- Must be a non-empty string.
- Keep it short and readable.
- This is used in previews, metadata, and RSS.

### `image`

- Must be a root-relative path.
- Usually this means something inside `main-section/public/resources/`.

Valid:

```text
/resources/default.jpg
/resources/my-image.png
```

Invalid:

```text
resources/default.jpg
./resources/default.jpg
https://example.com/image.jpg
```

### `tags`

- Must be a non-empty array of strings.
- Every tag must be a real non-empty string.

Valid:

```yaml
tags:
  - History
  - Politics
  - Writing
```

Invalid:

```yaml
tags: []
```

## 4. Body rules

- The article body must not be empty.
- Normal Markdown is supported.
- GitHub-flavored Markdown is supported through `remark-gfm`.

This means you can use:

- headings
- bold and italics
- blockquotes
- ordered and unordered lists
- fenced code blocks
- tables
- task lists
- strikethrough

## 5. Recommended article structure

Use this pattern unless you have a reason not to:

```md
---
slug: example-article
title: Example Article
date: 2026-05-15
excerpt: One clear sentence describing the article.
image: /resources/default.jpg
tags:
  - Example
  - Writing
---

# Example Article

Opening paragraph.

## First Section

Main argument.

## Second Section

Further development.
```

## 6. LaTeX and math rules

Math is supported in three ways.

### Inline math

Use single dollar signs:

```md
The identity is $e^{i\pi} + 1 = 0$.
```

### Display math

Use double dollar signs:

```md
$$
\int_0^1 x^2 \, dx = \frac{1}{3}
$$
```

### Explicit math blocks

If you want a block that clearly announces itself as math while writing, use fenced code blocks with `math` or `latex`:

````md
```math
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
```
````

or

````md
```latex
\nabla \cdot \vec{E} = \frac{\rho}{\varepsilon_0}
```
````

These are converted into display math before render.

### Recommendation

Use:

- `$...$` for short inline math
- `$$...$$` for standard display math
- ```` ```math ```` for larger or more deliberate blocks you want to notice while editing

## 7. What not to do with math

- Do not put math inside normal triple-backtick code blocks unless the fence is `math` or `latex`.
- Do not use malformed delimiters like a single opening `$` without a closing `$`.
- Do not assume code blocks are rendered as math unless they are marked `math` or `latex`.

## 8. Images

If you reference an image in frontmatter, the file should exist under:

```text
main-section/public/resources/
```

Example:

```text
main-section/public/resources/my-image.jpg
```

Then frontmatter should use:

```yaml
image: /resources/my-image.jpg
```

## 9. Build and generation workflow

After adding or changing a thought locally, run:

```bash
cd main-section
npm run generate-thoughts
```

This regenerates:

- the thoughts manifest
- the copied public markdown files
- the sitemap
- the RSS feed

Production build also does this automatically because `npm build` runs the generator first.

## 10. What will fail the generator

The generator will fail if:

- frontmatter is missing
- `slug` is missing
- `slug` is not lowercase kebab-case
- two articles share the same `slug`
- `title` is empty
- `date` is not exact `YYYY-MM-DD`
- `date` is not a real date
- `excerpt` is empty
- `image` is not root-relative
- `tags` is empty
- the article body is empty

## 11. Practical checklist before committing

- file is inside `main-section/src/data/thoughts/`
- frontmatter exists
- `slug` is unique
- `date` is exact `YYYY-MM-DD`
- `image` begins with `/resources/`
- `tags` is non-empty
- article has a body
- `npm run generate-thoughts` has been run

## 12. Minimal valid example

````md
---
slug: proof-with-math
title: Proof With Math
date: 2026-05-15
excerpt: A short note with inline and block mathematics.
image: /resources/default.jpg
tags:
  - Math
  - Notes
---

# Proof With Math

We begin with $a^2 - b^2 = (a-b)(a+b)$.

```math
\sum_{k=1}^{n} k = \frac{n(n+1)}{2}
```
````

## 13. Short version

If you want the shortest possible rule set:

1. Put a `.md` file in `main-section/src/data/thoughts/`.
2. Add valid frontmatter with `slug`, `title`, `date`, `excerpt`, `image`, and `tags`.
3. Write normal markdown below it.
4. Use `$...$`, `$$...$$`, or ` ```math ` for LaTeX.
5. Run `cd main-section && npm run generate-thoughts`.
