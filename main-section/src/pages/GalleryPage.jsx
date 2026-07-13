import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { APP_ROUTES } from '../config/site';

/**
 * /gallery — photos served from a Cloudflare R2 public bucket.
 *
 * Configuration (Vercel → Project → Settings → Environment Variables):
 *   REACT_APP_GALLERY_BASE_URL
 *     Public base URL of the bucket (no trailing slash needed), e.g.
 *       https://pub-xxxxxxxxxxxxxxxx.r2.dev
 *     or a custom domain like https://photos.alexgaoth.com
 *     Being a REACT_APP_* var it is baked in at build time — redeploy after setting it.
 *
 * Bucket contract — upload alongside the images a `manifest.json` at the base URL
 * (`${REACT_APP_GALLERY_BASE_URL}/manifest.json`), a JSON array, newest first:
 *   [
 *     { "src": "kyoto-alley.jpg", "caption": "kyoto, off the philosopher's path", "date": "2026-05" },
 *     { "src": "https://elsewhere.example/full-url-also-ok.jpg" }
 *   ]
 *   - src      required — filename relative to the base URL, or an absolute URL
 *   - caption  optional — shown under the photo and in the lightbox
 *   - date     optional — free-form string, shown next to the caption
 * The bucket needs public read access and CORS allowing GET from https://alexgaoth.com
 * (manifest.json is fetched cross-origin; the <img> tags themselves don't need CORS).
 *
 * Until the env var is set and the manifest exists, the page renders a quiet
 * "gallery loading soon" empty state — no errors, nothing broken.
 */

const GALLERY_BASE_URL = (process.env.REACT_APP_GALLERY_BASE_URL || '').replace(/\/+$/, '');

const resolveSrc = (src) => (/^https?:\/\//.test(src) ? src : `${GALLERY_BASE_URL}/${src}`);

const MONO = "'Space Mono', monospace";
const GROTESK = "'Space Grotesk', sans-serif";

const captionLine = (photo) =>
  [photo.caption, photo.date].filter(Boolean).join(' · ');

function Eyebrow({ children, color = '#888' }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 10,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
        fontWeight: 400,
      }}
    >
      {children}
    </span>
  );
}

function Photo({ photo, onOpen }) {
  const [hover, setHover] = useState(false);
  const line = captionLine(photo);
  return (
    <figure
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        margin: 0,
        border: '1px solid #000',
        background: hover ? '#000' : '#fff',
        color: hover ? '#fff' : '#000',
        transition: 'background 0.15s, color 0.15s',
        cursor: 'zoom-in',
      }}
    >
      <img
        src={resolveSrc(photo.src)}
        alt={photo.caption || 'photograph'}
        loading="lazy"
        style={{ display: 'block', width: '100%', height: 'auto' }}
      />
      {line && (
        <figcaption
          style={{
            borderTop: `1px solid ${hover ? '#fff' : '#000'}`,
            padding: '7px 10px',
            fontFamily: MONO,
            fontSize: 10,
            letterSpacing: '0.06em',
            textTransform: 'lowercase',
            color: hover ? 'rgba(255,255,255,0.75)' : '#888',
            lineHeight: 1.5,
          }}
        >
          {line}
        </figcaption>
      )}
    </figure>
  );
}

const GalleryPage = () => {
  // 'loading' | 'ready' | 'empty' — with no base URL configured we are 'empty' from the start.
  const [status, setStatus] = useState(GALLERY_BASE_URL ? 'loading' : 'empty');
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null); // index into photos, or null

  useEffect(() => {
    if (!GALLERY_BASE_URL) return undefined;
    let cancelled = false;

    fetch(`${GALLERY_BASE_URL}/manifest.json`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        const valid = Array.isArray(data)
          ? data.filter((item) => item && typeof item.src === 'string' && item.src)
          : [];
        if (valid.length > 0) {
          setPhotos(valid);
          setStatus('ready');
        } else {
          setStatus('empty');
        }
      })
      .catch(() => {
        // Bucket not configured yet, offline, CORS, bad JSON — all land on the quiet empty state.
        if (!cancelled) setStatus('empty');
      });

    return () => { cancelled = true; };
  }, []);

  const closeLightbox = useCallback(() => setActive(null), []);

  useEffect(() => {
    if (active === null) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [active, closeLightbox]);

  const activePhoto = active !== null ? photos[active] : null;

  return (
    <>
      <SEO
        title="Gallery — Alex Gao"
        description="A photo gallery by Alex Gao — moments collected along the way."
        keywords={['Alex Gao', 'gallery', 'photography', 'photos']}
        path={APP_ROUTES.gallery}
      />

      <div
        style={{
          minHeight: '100vh',
          background: '#fff',
          color: '#000',
          fontFamily: MONO,
          boxSizing: 'border-box',
          display: 'flex',
          flexDirection: 'column',
          padding:
            'clamp(1.4rem,2.6vw,2.4rem) clamp(1.2rem,2.5vw,2.5rem) clamp(1rem,1.8vw,1.8rem)',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '1152px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
          }}
        >
          <Link
            to={APP_ROUTES.home}
            state={{ skipParallax: true }}
            style={{
              alignSelf: 'flex-start',
              fontFamily: MONO,
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'lowercase',
              color: '#000',
              textDecoration: 'none',
              opacity: 0.4,
              marginBottom: '1.4rem',
            }}
          >
            ← back
          </Link>

          <header style={{ marginBottom: 'clamp(1rem,1.8vw,1.8rem)' }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
                marginBottom: '0.6rem',
              }}
            >
              <Eyebrow>{'// what i saw'}</Eyebrow>
              {status === 'ready' && (
                <Eyebrow color="#bbb">
                  {photos.length} frame{photos.length === 1 ? '' : 's'}
                </Eyebrow>
              )}
            </div>
            <h1
              style={{
                fontFamily: GROTESK,
                fontWeight: 600,
                fontSize: 'clamp(1.8rem, 4.8vw, 3.8rem)',
                letterSpacing: '-0.035em',
                lineHeight: 0.95,
                margin: '0 0 0.7rem',
              }}
            >
              GALLERY<span style={{ color: '#ccc' }}>.</span>
            </h1>
            <p
              style={{
                fontSize: 'clamp(0.68rem,0.82vw,0.82rem)',
                color: '#888',
                margin: 0,
                letterSpacing: '0.02em',
                maxWidth: '70ch',
                lineHeight: 1.5,
              }}
            >
              photographs, newest first. proof i sometimes look up from the screen.
            </p>
          </header>

          {status === 'ready' ? (
            <main
              style={{
                flex: 1,
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
                gap: 10,
                alignItems: 'start',
                alignContent: 'start',
              }}
            >
              {photos.map((photo, index) => (
                <Photo
                  key={`${photo.src}-${index}`}
                  photo={photo}
                  onOpen={() => setActive(index)}
                />
              ))}
            </main>
          ) : (
            <main
              style={{
                flex: 1,
                minHeight: '40vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Eyebrow color="#bbb">
                {status === 'loading' ? 'developing…' : 'gallery loading soon'}
              </Eyebrow>
            </main>
          )}

          <footer
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: 12,
              marginTop: 'clamp(1.2rem,2vw,2rem)',
              paddingTop: '0.45rem',
              borderTop: '1px solid rgba(0,0,0,0.08)',
            }}
          >
            <Eyebrow>shot on whatever was on hand</Eyebrow>
            <Link
              to={APP_ROUTES.home}
              state={{ skipParallax: true }}
              style={{
                fontSize: 11,
                color: '#000',
                letterSpacing: '0.04em',
                textDecoration: 'none',
                opacity: 0.85,
                fontFamily: MONO,
                whiteSpace: 'nowrap',
              }}
            >
              / →
            </Link>
          </footer>
        </div>

        {activePhoto && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              zIndex: 100,
              background: 'rgba(255, 255, 255, 0.97)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '3rem 1.5rem',
              boxSizing: 'border-box',
              cursor: 'zoom-out',
            }}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.caption || 'photograph'}
          >
            <img
              src={resolveSrc(activePhoto.src)}
              alt={activePhoto.caption || 'photograph'}
              style={{
                maxWidth: '100%',
                maxHeight: '82vh',
                display: 'block',
                border: '1px solid #000',
              }}
            />
            {captionLine(activePhoto) && (
              <div
                style={{
                  marginTop: '1rem',
                  fontFamily: MONO,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  textTransform: 'lowercase',
                  color: '#555',
                  textAlign: 'center',
                  maxWidth: '48ch',
                  lineHeight: 1.7,
                }}
              >
                {captionLine(activePhoto)}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GalleryPage;
