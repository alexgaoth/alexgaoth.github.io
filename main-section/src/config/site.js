export const SITE = {
  name: 'Alex Gao',
  handle: 'alexgaoth',
  twitterHandle: '@alexgaoth',
  title: 'Alex Gao — Student Builder',
  description: 'Alex Gao (alexgaoth). Student builder at UCSD.',
  keywords: ['Alex Gao', 'alexgaoth', 'Student Builder', 'UCSD'],
  rootUrl: 'https://alexgaoth.com',
  appUrl: 'https://app.alexgaoth.com',
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
  resume: '/resume',
  projects: '/projects',
  thoughts: '/thoughts',
  quotes: '/quotes',
  now: '/now',
  art: '/art',
  regents: '/regents',
  poetry: '/poetry',
  poetryEn: '/poetry/en',
  ci: '/ci',
  ciEn: '/ci/en',
};

export const NAVIGATION_ITEMS = [
  { path: APP_ROUTES.resume, label: 'Resume' },
  { path: APP_ROUTES.projects, label: 'Things I Made' },
  { path: APP_ROUTES.thoughts, label: 'Thoughts' },
  { path: APP_ROUTES.quotes, label: 'Quotes' },
  { path: APP_ROUTES.poetry, label: '诗' },
  { path: APP_ROUTES.ci, label: '词' },
  { path: APP_ROUTES.now, label: 'Now', isNowButton: true },
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
