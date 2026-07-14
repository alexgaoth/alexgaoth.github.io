// Shared gallery list/caption logic — used by both the build-time fetch in
// pages/gallery.astro and the client island islands/GalleryGrid.jsx, so the
// static HTML and the hydrated grid derive identical alt text and URLs.
// Mirrors main-section/src/pages/GalleryPage.jsx.

export const GALLERY_BASE_URL = 'https://photos.alexgaoth.com';
export const LIST_URL = `${GALLERY_BASE_URL}/list.json`;

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
// camera-roll style names carry no meaning — generic alt for them
const NOISE_RE = /^(img|dsc|pxl|screenshot|photo|image)[-_ ]?\d/i;

export const altFromName = (key) => {
  const base = key.split('/').pop().replace(IMAGE_RE, '');
  if (NOISE_RE.test(base)) return '';
  return base.replace(/[-_]+/g, ' ').trim();
};

// Worker returns [{ key, uploaded }] newest first; tolerate bare strings too.
export const photosFromList = (data) => {
  const keys = Array.isArray(data)
    ? data
        .map((item) => (typeof item === 'string' ? item : item && item.key))
        .filter((key) => typeof key === 'string' && IMAGE_RE.test(key))
    : [];
  return keys.map((key) => ({
    src: `${GALLERY_BASE_URL}/${encodeURI(key)}`,
    alt: altFromName(key),
  }));
};
