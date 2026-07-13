// Single source of truth for site constants, routes, and navigation lives in
// the CRA app until cutover (SEO-PLAN Phase 1: keep src/config/site.js as the
// single source for URLs/nav). This re-export keeps the Astro side in sync.
export * from '../../../main-section/src/config/site.js';
