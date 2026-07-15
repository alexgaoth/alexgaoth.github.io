// Same URL and shape as the CRA generator's sitemap (SEO-PLAN Phase 4: keep
// /sitemap.xml identical across the cutover). Honest lastmod only: thoughts
// use modified||date, static routes carry none.
import { buildAbsoluteUrl, getThoughts, thoughtUrl } from '../lib/thoughts.js';
import { getFeaturedProjects } from '../lib/projectPages.js';

const STATIC_ROUTES = [
  '/',
  '/about',
  '/now',
  '/resume',
  '/projects',
  '/thoughts',
  '/quotes',
  '/art',
  '/gallery',
  '/regents',
  '/poetry',
  '/poetry/en',
  '/ci',
  '/ci/en',
  '/writing',
  ...getFeaturedProjects().map((entry) => `/projects/${entry.slug}`),
];

export async function GET() {
  const thoughts = await getThoughts();

  const staticEntries = STATIC_ROUTES.map((routePath) => `  <url>
    <loc>${buildAbsoluteUrl(routePath)}</loc>
  </url>`);

  const thoughtEntries = thoughts.map((entry) => `  <url>
    <loc>${thoughtUrl(entry.data.slug)}</loc>
    <lastmod>${entry.data.modified || entry.data.date}</lastmod>
  </url>`);

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${[...staticEntries, ...thoughtEntries].join('\n\n')}
</urlset>
`;

  return new Response(sitemap, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' },
  });
}
