import { fileURLToPath } from 'node:url';
import react from '@astrojs/react';
import { defineConfig } from 'astro/config';

// URLs must match production exactly (no trailing slash): build "file" format
// emits /about.html instead of /about/index.html, which Vercel's cleanUrls
// serves at /about — keeping every existing URL byte-identical.
export default defineConfig({
  site: 'https://alexgaoth.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  integrations: [react()],
  vite: {
    server: {
      // Config, data, and styles are imported from ../main-section so there is
      // one source of truth during the parallel-run period.
      fs: { allow: [fileURLToPath(new URL('..', import.meta.url))] },
    },
  },
});
