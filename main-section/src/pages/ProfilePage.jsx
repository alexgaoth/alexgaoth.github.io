import SEO from '../components/SEO';
import ContentPage from '../components/layout/ContentPage';
import { APP_ROUTES, SITE, buildAppUrl } from '../config/site';
import { profileData } from '../data/profileData';

const profileStructuredData = [
  {
    '@context': 'https://schema.org',
    '@type': 'ProfilePage',
    name: `${SITE.name} (${SITE.handle})`,
    url: buildAppUrl(APP_ROUTES.about),
    mainEntity: {
      '@type': 'Person',
      name: SITE.name,
      alternateName: profileData.aliases,
      url: SITE.rootUrl,
      sameAs: SITE.socialProfiles,
      description: SITE.description,
    },
  },
];

const ProfilePage = () => (
  <>
    <SEO
      title="About — Alex Gao (alexgaoth)"
      description="Profile page for Alex Gao, also known online as alexgaoth."
      keywords={['Alex Gao', 'alexgaoth', 'about', 'profile', 'UCSD']}
      path={APP_ROUTES.about}
      structuredData={profileStructuredData}
    />
    <ContentPage>
      <div className="space-y-large">
        <section>
          <h1 className="title-page">{profileData.title}</h1>
          {profileData.intro.map((paragraph) => (
            <p key={paragraph} className="text-gray" style={{ maxWidth: '48rem' }}>
              {paragraph}
            </p>
          ))}
        </section>

        <section>
          <h2 className="title-section">Names And Aliases</h2>
          <div className="skills-grid">
            {profileData.aliases.map((alias) => (
              <span key={alias} className="tag-white">
                {alias}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="title-section">Current Focus</h2>
          <div className="space-y-medium">
            {profileData.focus.map((item) => (
              <p key={item} className="text-gray">{item}</p>
            ))}
          </div>
        </section>

        <section>
          <h2 className="title-section">Identity Facts</h2>
          <div className="space-y-medium">
            {profileData.facts.map((fact) => (
              <div key={fact.label} className="experience-item">
                <h3 className="experience-role">{fact.label}</h3>
                <p className="text-gray">{fact.value}</p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="title-section">Where To Find Me</h2>
          <div className="project-links">
            {profileData.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="project-link"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section>
          <h2 className="title-section">Search Phrases I Want To Collapse Into One Identity</h2>
          <div className="skills-grid">
            {profileData.searchableQueries.map((query) => (
              <span key={query} className="tag-white">
                {query}
              </span>
            ))}
          </div>
        </section>
      </div>
    </ContentPage>
  </>
);

export default ProfilePage;
