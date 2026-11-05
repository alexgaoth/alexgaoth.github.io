// The one slug rule for projects — /projects#project-<slug> anchors (and the
// same anchors on group subpages, and the homepage slideshow's links, written
// out in index.astro) all share it.
// Slugs are load-bearing URLs (ADDITION-RULES golden rule 1): renaming a
// project card changes its slug, so keep names stable or freeze the slug.
export const projectSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
