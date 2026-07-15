import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Thought articles: markdown in src/data/thoughts/, one file per article.
// The schema enforces the editorial frontmatter contract — see
// ADDITION-RULES.md at the repo root before adding one.
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const thoughts = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/data/thoughts' }),
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
