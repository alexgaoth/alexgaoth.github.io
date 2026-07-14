import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Thought articles load straight from the CRA app's markdown so there is one
// source of truth until cutover (same convention as config/data/styles).
// The schema enforces the editorial frontmatter contract from SEO-PLAN
// Phase 2 — the same rules generate-thoughts-index.js validates.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const thoughts = defineCollection({
  loader: glob({ pattern: '*.md', base: '../main-section/src/data/thoughts' }),
  schema: z.object({
    title: z.string().min(1),
    slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
    date: z.string().regex(DATE_RE),
    // bump only when the article meaningfully changes — drives sitemap
    // lastmod and article:modified_time
    modified: z.string().regex(DATE_RE).optional(),
    excerpt: z.string().min(1),
    image: z.string().startsWith('/'),
    tags: z.array(z.string().min(1)).nonempty(),
    // optional hand-picked related article slugs; same-tag articles fill in
    related: z.array(z.string()).optional(),
  }),
});

export const collections = { thoughts };
