import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
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

const MONO = "'IBM Plex Mono', 'Space Mono', 'Roboto Mono', monospace";

const styles = {
  page: {
    minHeight: '100vh',
    background: '#FCFBF8',
    color: '#1A1A1A',
    fontFamily: MONO,
    padding: '5.5rem 2.2rem 4rem',
    boxSizing: 'border-box',
  },
  back: {
    position: 'fixed',
    top: '2rem',
    left: '2.2rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.45em',
    fontFamily: MONO,
    fontSize: '0.63rem',
    letterSpacing: '0.18em',
    textTransform: 'lowercase',
    color: '#1A1A1A',
    textDecoration: 'none',
    opacity: 0.32,
    transition: 'opacity 0.25s ease',
    zIndex: 12,
  },
  header: {
    maxWidth: '1100px',
    margin: '0 auto 2.6rem',
  },
  title: {
    fontSize: '0.72rem',
    fontWeight: 400,
    letterSpacing: '0.3em',
    textTransform: 'lowercase',
    opacity: 0.75,
    margin: 0,
  },
  grid: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(240px, 100%), 1fr))',
    gap: '1.6rem 1.4rem',
    alignItems: 'start',
  },
  figure: {
    margin: 0,
    cursor: 'zoom-in',
  },
  img: {
    display: 'block',
    width: '100%',
    height: 'auto',
    filter: 'grayscale(0.08)',
  },
  figcaption: {
    marginTop: '0.55rem',
    fontSize: '0.6rem',
    letterSpacing: '0.14em',
    textTransform: 'lowercase',
    opacity: 0.45,
    lineHeight: 1.6,
  },
  empty: {
    minHeight: '55vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: '0.66rem',
    letterSpacing: '0.24em',
    textTransform: 'lowercase',
    opacity: 0.35,
  },
  lightbox: {
    position: 'fixed',
    inset: 0,
    zIndex: 100,
    background: 'rgba(252, 251, 248, 0.96)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '3rem 1.5rem',
    boxSizing: 'border-box',
    cursor: 'zoom-out',
  },
  lightboxImg: {
    maxWidth: '100%',
    maxHeight: '82vh',
    display: 'block',
    boxShadow: '0 8px 40px rgba(26, 26, 26, 0.12)',
  },
  lightboxCaption: {
    marginTop: '1.1rem',
    fontFamily: MONO,
    fontSize: '0.62rem',
    letterSpacing: '0.16em',
    textTransform: 'lowercase',
    color: '#1A1A1A',
    opacity: 0.55,
    textAlign: 'center',
    maxWidth: '48ch',
    lineHeight: 1.7,
  },
};

const captionLine = (photo) =>
  [photo.caption, photo.date].filter(Boolean).join(' · ');

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

      <div style={styles.page}>
        <Link to={APP_ROUTES.home} style={styles.back}>
          <ArrowLeft size={13} strokeWidth={1} />
          <span>back</span>
        </Link>

        <header style={styles.header}>
          <h1 style={styles.title}>影 — gallery</h1>
        </header>

        {status === 'ready' ? (
          <main style={styles.grid}>
            {photos.map((photo, index) => (
              <figure
                key={`${photo.src}-${index}`}
                style={styles.figure}
                onClick={() => setActive(index)}
              >
                <img
                  src={resolveSrc(photo.src)}
                  alt={photo.caption || 'photograph'}
                  loading="lazy"
                  style={styles.img}
                />
                {captionLine(photo) && (
                  <figcaption style={styles.figcaption}>{captionLine(photo)}</figcaption>
                )}
              </figure>
            ))}
          </main>
        ) : (
          <main style={styles.empty}>
            <span style={styles.emptyText}>
              {status === 'loading' ? 'developing…' : 'gallery loading soon'}
            </span>
          </main>
        )}

        {activePhoto && (
          <div
            style={styles.lightbox}
            onClick={closeLightbox}
            role="dialog"
            aria-modal="true"
            aria-label={activePhoto.caption || 'photograph'}
          >
            <img
              src={resolveSrc(activePhoto.src)}
              alt={activePhoto.caption || 'photograph'}
              style={styles.lightboxImg}
            />
            {captionLine(activePhoto) && (
              <div style={styles.lightboxCaption}>{captionLine(activePhoto)}</div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default GalleryPage;
