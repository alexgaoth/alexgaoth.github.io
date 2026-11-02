// Data for /about (ProfilePage). The aliases and searchable queries exist for
// findability — keep them intact even if the presentation changes. /about is
// prose, so its sentences live in about.astro; what stays here is the identity
// strings those sentences and the JSON-LD both need. Anything that changes
// month to month belongs in public/profile.json (/now), not here.
export const profileData = {
  aliases: [
    'Alex Gao',
    'alexgaoth',
    'Tianhao Gao',
    'Tianhao (Alex) Gao',
  ],
  email: 'alexgaoth@gmail.com',
  links: [
    { label: 'github', handle: 'alexgaoth', href: 'https://github.com/alexgaoth' },
    { label: 'linkedin', handle: 'in/alexgaoth', href: 'https://linkedin.com/in/alexgaoth' },
    { label: 'x / twitter', handle: '@alexgaoth', href: 'https://twitter.com/alexgaoth' },
    { label: 'instagram', handle: '@alexgaoth', href: 'https://instagram.com/alexgaoth' },
  ],
  mirrors: [
    { label: 'main site', href: 'https://alexgaoth.com/' },
    { label: 'intro site', href: 'https://intro.alexgaoth.com/' },
    { label: 'legacy redirect', href: 'https://app.alexgaoth.com/' },
  ],
  searchableQueries: [
    'Alex Gao',
    'alexgaoth',
    'Alex Gao UCSD',
    'Alex Gao student builder',
    'alexgaoth projects',
  ],
};
