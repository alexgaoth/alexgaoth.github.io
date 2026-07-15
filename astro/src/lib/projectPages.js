// Standalone project pages (SEO-PLAN Phase 3.5). Everything here is
// assembled from copy that already exists on the site — content.js project
// entries plus the home rail's SHIPS facts — so the pages stay truthful.
import { content } from '../data/content.js';
import { SHIPS } from '../data/homeRailData.js';

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


const PROSE = {
  'signalor': [
    'I am the CTO of Signalor, and we transform public sentiment data processing into actionable insights. ',
  ],
  'this-very-website': [
    'This website has been the one of my earliest person project, and it has came so far, some weird design/artchitexture choices i take on here, are legacy of previous version and a residue of my early technical days.',
  ],
  'ucsd-crimes-log-tracker': [
    'Scrapes and tracks UCSD crime logs. Is marginally helpful if ones wants a laugh',
  ],
  '3d-fractal-simulator': [
    'A 3D fractal simulator that renders 2D julia set fractal shapes in a 3D space. One if not my proudest high school project.',
  ],
  'dont-hallucinate': [
    'You know what they say out there: Negative reinforcement for your agents get them further than any post training',
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
