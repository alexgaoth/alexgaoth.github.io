// The /gallery grid + lightbox island. The static shell (back link, h1,
// intro copy, footer) lives in pages/gallery.astro.
//
// Astro server-renders this component at build time, so when the page is
// built with `initialPhotos` (fetched in gallery.astro's frontmatter) the
// first frames ship as real <img loading="lazy"> tags in the static HTML.
// On hydration the island fetches the fresh, full list.json and replaces
// them, in a random order that changes every visit.
import { useCallback, useEffect, useState } from 'react';
import { LIST_URL, photosFromList } from '../lib/gallery.js';

const MONO = "'Space Mono', monospace";

// Fisher–Yates: a fresh random order on every visit.
function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// The list worker intermittently throws (Cloudflare 1101 — about 1 request
// in 5 in Nov 2026), so try a few times before settling for no list.
async function fetchList(attempts = 3) {
  for (let i = 0; i < attempts; i += 1) {
    try {
      const res = await fetch(LIST_URL);
      if (res.ok) return await res.json();
    } catch {
      // network / CORS on the error page — try again
    }
  }
  return null;
}

function Eyebrow({ children, color = '#888' }) {
  return (
    <span
      style={{
        fontFamily: MONO,
        fontSize: 12,
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
        // Placeholder box until the file arrives, then its own ratio. Without
        // it every unloaded image is 0px tall, all count as in view, and
        // loading="lazy" fetches the whole bucket at once.
        aspectRatio: 'auto 3 / 4',
        marginBottom: 10,
        breakInside: 'avoid',
        cursor: 'zoom-in',
      }}
    />
  );
}

export default function GalleryGrid({ initialPhotos = [] }) {
  // 'loading' | 'ready' | 'empty'
  const [status, setStatus] = useState(initialPhotos.length > 0 ? 'ready' : 'loading');
  const [photos, setPhotos] = useState(initialPhotos);
  const [active, setActive] = useState(null); // index into photos, or null

  useEffect(() => {
    let cancelled = false;

    fetchList().then((data) => {
      if (cancelled) return;
      const fresh = photosFromList(data);
      if (fresh.length > 0) {
        setPhotos(shuffle(fresh));
        setStatus('ready');
      } else if (initialPhotos.length === 0) {
        // Worker down, offline — keep any build-time photos rather than
        // blanking the page; otherwise quiet empty state.
        setStatus('empty');
      }
    });

    return () => { cancelled = true; };
    // initialPhotos is build-time static — run once on mount.
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      {status === 'ready' && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.6rem' }}>
          <Eyebrow color="#bbb">
            {photos.length} frame{photos.length === 1 ? '' : 's'}
          </Eyebrow>
        </div>
      )}

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
    </>
  );
}
