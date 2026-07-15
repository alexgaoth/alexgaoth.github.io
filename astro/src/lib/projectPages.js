// Standalone project pages (SEO-PLAN Phase 3.5). Everything here is
// assembled from copy that already exists on the site — content.js project
// entries plus the home rail's SHIPS facts — so the pages stay truthful.
import { content } from '../../../main-section/src/data/content.js';
import { SHIPS } from '../../../main-section/src/data/homeRailData.js';

// Must match projectSlug() in ProjectsPage.jsx — /projects#project-<slug>
// anchors and these page URLs share slugs.
export const projectSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// The projects worth a standalone page (plan candidates).
const FEATURED_SLUGS = [
  'signalor',
  'this-very-website',
  'ucsd-crimes-log-tracker',
  '3d-fractal-simulator',
  'dont-hallucinate',
];

// ── ALEX: write here ─────────────────────────────────────────────────────
// A few sentences per project, in your own voice: the problem, your role,
// what you learned / what makes it worth reading about. Each string renders
// as one paragraph on the project's page. Leave '' to render nothing.
const PROSE = {
  'signalor': [
    '',
  ],
  'this-very-website': [
    '',
  ],
  'ucsd-crimes-log-tracker': [
    '',
  ],
  '3d-fractal-simulator': [
    '',
  ],
  'dont-hallucinate': [
    '',
  ],
};

// 'This very website' is a CreativeWork; the rest are software.
const CREATIVE_WORK_SLUGS = new Set(['this-very-website']);

export function getFeaturedProjects() {
  return FEATURED_SLUGS.map((slug) => {
    const project = content.projects.content.find((p) => projectSlug(p.name) === slug);
    const ship = SHIPS.find((s) => s.anchor === slug);
    if (!project) throw new Error(`Featured project slug not found in content.js: ${slug}`);
    return {
      slug,
      project,
      ship: ship || null,
      schemaType: CREATIVE_WORK_SLUGS.has(slug) ? 'CreativeWork' : 'SoftwareApplication',
      images: project.images || (project.image ? [project.image] : []),
      prose: (PROSE[slug] || []).filter((paragraph) => paragraph.trim()),
    };
  });
}
