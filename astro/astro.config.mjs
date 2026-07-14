import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';
import rehypeMathjaxSvg from 'rehype-mathjax/svg';
import remarkMath from 'remark-math';

// Article pages render their own <h1> from frontmatter; several thought
// bodies open with a markdown "# title" duplicate. Demote body h1s to h2 so
// every page keeps exactly one logical h1.
function rehypeDemoteH1() {
  const walk = (node) => {
    if (node.tagName === 'h1') node.tagName = 'h2';
    for (const child of node.children ?? []) walk(child);
  };
  return walk;
}

// URLs must match production exactly (no trailing slash): build "file" format
// emits /about.html instead of /about/index.html, which Vercel's cleanUrls
// serves at /about — keeping every existing URL byte-identical.
export default defineConfig({
  site: 'https://alexgaoth.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react()],
  // TeX renders to static SVG at build time (SEO-PLAN 0.6 done properly):
  // no MathJax client script ever ships from thought pages.
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [rehypeMathjaxSvg, rehypeDemoteH1],
  },
  vite: {
    server: {
      // Config, data, and styles are imported from ../main-section so there is
      // one source of truth during the parallel-run period.
      fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    },
  },
});
