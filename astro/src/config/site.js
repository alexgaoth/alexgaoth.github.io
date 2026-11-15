export const SITE = {
  name: 'Alex Gao',
  handle: 'alexgaoth',
  twitterHandle: '@alexgaoth',
  title: 'Alex Gao (alexgaoth)',
  description: 'alex gao (alexgaoth) — personal site.',
  keywords: ['Alex Gao', 'alexgaoth'],
  rootUrl: 'https://alexgaoth.com',
  appUrl: 'https://alexgaoth.com',
  legacyAppUrl: 'https://app.alexgaoth.com',
  personalUrl: 'https://intro.alexgaoth.com',
  defaultImagePath: '/logo.jpg',
  socialProfiles: [
    'https://github.com/alexgaoth',
    'https://linkedin.com/in/alexgaoth',
    'https://twitter.com/alexgaoth',
    'https://instagram.com/alexgaoth',
  ],
};

export const APP_ROUTES = {
  home: '/',
  about: '/about',
  resume: '/resume',
  projects: '/projects',
  thoughts: '/thoughts',
  quotes: '/quotes',
  now: '/now',
  art: '/art',
  gallery: '/gallery',
  regents: '/regents',
  poetry: '/poetry',
  poetryEn: '/poetry/en',
  ci: '/ci',
  ciEn: '/ci/en',
  writing: '/writing',
};

// Labels match each page's own title. `sections` are other paths the item
// counts as current for (/writing, the writing hub, is under Thoughts).
export const NAVIGATION_ITEMS = [
  { path: APP_ROUTES.resume, label: 'At Work' },
  { path: APP_ROUTES.projects, label: 'Projects' },
  { path: APP_ROUTES.thoughts, label: 'Thoughts', sections: [APP_ROUTES.writing] },
  { path: APP_ROUTES.quotes, label: 'Quotes' },
  { path: APP_ROUTES.about, label: 'About' },
];

export function buildAppUrl(path = APP_ROUTES.home) {
  return path === APP_ROUTES.home ? `${SITE.appUrl}/` : `${SITE.appUrl}${path}`;
}

export function buildRootUrl(path = '/') {
  return path === '/' ? `${SITE.rootUrl}/` : `${SITE.rootUrl}${path}`;
}

export function buildAssetUrl(path = SITE.defaultImagePath) {
  return path.startsWith('http') ? path : `${SITE.appUrl}${path}`;
}
