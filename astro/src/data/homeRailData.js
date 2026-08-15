// Static data for the home preview rail (BUILT → WRITING → EXPERIENCE).
// Shared by the CRA HomePreviewRail and the Astro homepage — edit here only.
import { APP_ROUTES } from '../config/site.js';
import { content } from './content.js';
import { projectSlug } from '../lib/slug.js';
import { githubCardImage } from '../lib/projectImage.js';

// Homepage-only facts and hand-tightened copy, keyed by project slug.
// Optional — a project without an entry still ships with defaults derived
// from its content.js card. year defaults to the build year, so date new
// projects here once they stop being current.
const SHIP_FACTS = {
  'signalor': {
    year: "2026",
    name: "signalor.app",
    tech: "svelte · py · docker · ts",
    status: "live",
    desc: "google analytics for brands. transparent, holistic, in production.",
    img: "/resources/signalor.png",
  },
  'ucsd-crimes-log-tracker': {
    year: "2025",
    name: "ucsd_crimes",
    tech: "react · py · selenium",
    status: "live",
    img: "/resources/ucsd_crimes.png",
  },
  'dont-hallucinate': {
    year: "2025",
    tech: "py · powershell · bash",
    status: "pypi",
    img: "/resources/dont_hallucinate.png",
  },
  '3d-fractal-simulator': {
    year: "2024",
    name: "3d julia set sim",
    tech: "unity · c# · math",
    status: "live",
    img: "/resources/julia_set.png",
  },
  'political-speech-classifier': {
    year: "2024",
    name: "speech classifier",
    tech: "py · linear algebra",
    status: "98.9% acc",
    img: "/resources/political_speech.png",
  },
  '2d-pixel-plateformer': {
    year: "2023",
    name: "pixel platformer",
    tech: "godot · gdscript",
    status: "playable",
    img: "/resources/godot_game.png",
  },
  'this-very-website': {
    year: "2022",
    name: "alexgaoth.com v0",
    tech: "html · css · js",
    status: "live",
    img: "/resources/this_website.png",
  },
  'claude-iterate': { year: "2026" },
  'routine-architect': { year: "2026" },
  'outcast-virus': { year: "2026", status: "devpost" },
  'weighted-map': { year: "2026" },
  'ferrodoc': { year: "2026" },
};

// Built things that never got a /projects card.
const EXTRA_SHIPS = [
  {
    year: "2024",
    name: "radians.co.uk",
    tech: "react · node · mongo",
    status: "shipped",
    img: "/resources/default.jpg",
  },
];

// The build log derives from the /projects cards in content.js — add a card
// there and it appears here on the next build, newest year first. UI surfaces
// show the top X that fit them (the rail panel slices; a scene handles any
// count).
export const SHIPS = [
  ...content.projects.content.map((p) => {
    const slug = projectSlug(p.name);
    const facts = SHIP_FACTS[slug] ?? {};
    return {
      year: facts.year ?? String(new Date().getFullYear()),
      name: facts.name ?? p.name.toLowerCase(),
      tech: facts.tech ?? (p.tech ?? '').toLowerCase().split(/,\s*/).join(' · '),
      status:
        facts.status ??
        (p.liveDemo ? 'live' : p.pypi ? 'pypi' : p.github ? 'github' : 'shipped'),
      desc: facts.desc,
      img: facts.img ?? githubCardImage(p) ?? p.image ?? p.images?.[0] ?? '/resources/default.jpg',
      anchor: slug,
    };
  }),
  ...EXTRA_SHIPS,
].sort((a, b) => Number(b.year) - Number(a.year));

export const TROPHIES = [
  { stamp: "GOLD", label: "British Mathematical Olympiad I", year: "2024,2025" },
  { stamp: "GOLD", label: "British Informatics Olympiad", year: "2025" },
  {
    stamp: "5 Hackathon Wins",
    label: "YCxBrowserUse, Bow Capital, SDxAnthropic etc...",
    year: "2024–26",
  },
];

export const WRITINGS = [
  {
    pull: '"history is very rarely about what actually happened, but how events are interpreted"',
    title: "Winning the Battle of Manzikert",
    date: "2025.08",
    tag: "history",
    read: "5m",
    slug: "winning-the-battle-of-manzikert",
  },
  {
    pull: '"without others, hell has no meaning"',
    title: "Submitting to the Symbolic Order",
    date: "2025.11",
    tag: "lacan",
    read: "2m",
    slug: "submitting-to-the-symbolic-order",
  },
  {
    pull: '"inventing a nation and defending AT THE SAME TIME?, i wish i was sun yatsen"',
    title: "Chinese Modernisation",
    date: "2024.09",
    tag: "history",
    read: "2m",
    slug: "chinese-nationalization-modernization-is-actually-quite-intersting",
  },
];

// doors into the personal side of the site
export const DOORS = [
  { glyph: "诗", label: "poetry", note: "chinese verse", to: APP_ROUTES.poetry },
  { glyph: "词", label: "ci", note: "to song-dynasty tunes", to: APP_ROUTES.ci },
];

// compressed from the resume data in src/data/content.js
export const EXPERIENCE = [
  {
    role: "software & devops intern",
    org: "ibm · san jose",
    period: "2026",
    desc: "watsonx assistant for z · aiops, finn release features",
  },
  {
    role: "founder & cto",
    org: "signalor",
    period: "2025–26",
    desc: "public-sentiment intelligence · product, data infrastructure",
  },
];

export const EDUCATION = [
  { school: "uc san diego", detail: "math-cs · class of 2029" },
  { school: "st paul's, london", detail: "a-levels · 2023–25" },
];

export const DOMAINS = [
  "mathematics",
  "computer science",
  "history",
  "linguistics",
  "data science",
];

export const TONGUES = ["english (native)", "中文 (native)", "தமிழ் (learning)"];
