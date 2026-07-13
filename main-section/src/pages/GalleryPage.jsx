import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { APP_ROUTES } from '../config/site';

/**
 * /gallery — raw pictures served from the Cloudflare R2 bucket behind
 * https://photos.alexgaoth.com. No manifest to maintain: R2 doesn't allow
 * anonymous bucket listing, so a tiny Worker (workers/gallery-list/)
 * answers GET photos.alexgaoth.com/list.json with the bucket contents.
 * Whatever images are in the bucket appear here, newest upload first —
 * adding a photo is just an upload, nothing else.
 *
 * Pictures render bare — no borders, no names shown. Filenames only feed
 * the images' alt text. Until the worker route exists and the bucket has
 * images, the page renders a quiet "gallery loading soon" empty state.
 */

const GALLERY_BASE_URL = 'https://photos.alexgaoth.com';
const LIST_URL = `${GALLERY_BASE_URL}/list.json`;

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
// camera-roll style names carry no meaning — generic alt for them
const NOISE_RE = /^(img|dsc|pxl|screenshot|photo|image)[-_ ]?\d/i;

const altFromName = (key) => {
  const base = key.split('/').pop().replace(IMAGE_RE, '');
  if (NOISE_RE.test(base)) return '';
  return base.replace(/[-_]+/g, ' ').trim();
};

const MONO = "'Space Mono', monospace";
const GROTESK = "'Space Grotesk', sans-serif";

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
  return (
    <img
      src={photo.src}
      alt={photo.alt || 'photograph'}
      loading="lazy"
      onClick={onOpen}
      style={{
        display: 'block',
        width: '100%',
        height: 'auto',
        marginBottom: 10,
        breakInside: 'avoid',
        cursor: 'zoom-in',
      }}
    />
  );
}

const GalleryPage = () => {
  // 'loading' | 'ready' | 'empty'
  const [status, setStatus] = useState('loading');
  const [photos, setPhotos] = useState([]);
  const [active, setActive] = useState(null); // index into photos, or null

  useEffect(() => {
    let cancelled = false;

    fetch(LIST_URL)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled) return;
        // Worker returns [{ key, uploaded }] newest first; tolerate bare strings too.
        const keys = Array.isArray(data)
          ? data
              .map((item) => (typeof item === 'string' ? item : item && item.key))
              .filter((key) => typeof key === 'string' && IMAGE_RE.test(key))
          : [];
        if (keys.length > 0) {
          setPhotos(keys.map((key) => ({
            src: `${GALLERY_BASE_URL}/${encodeURI(key)}`,
            alt: altFromName(key),
          })));
          setStatus('ready');
        } else {
          setStatus('empty');
        }
      })
      .catch(() => {
        // Worker route not deployed yet, offline, CORS — all land on the quiet empty state.
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
              <Eyebrow>{'// '}</Eyebrow>
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

            </p>
          </header>

          {status === 'ready' ? (
            /* Masonry via CSS columns: each photo keeps its aspect ratio at a
               reasonable column width; column count auto-fits the page. */
            <main
              style={{
                flex: 1,
                columnWidth: 300,
                columnGap: 10,
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
            aria-label={activePhoto.alt || 'photograph'}
          >
            <img
              src={activePhoto.src}
              alt={activePhoto.alt || 'photograph'}
              style={{
                maxWidth: '100%',
                maxHeight: '88vh',
                display: 'block',
              }}
            />
          </div>
        )}
      </div>
    </>
  );
};

export default GalleryPage;
