// Cloudflare Worker: lists the gallery R2 bucket as JSON.
//
// R2 public buckets don't allow anonymous listing, so this worker answers
//   GET https://photos.alexgaoth.com/list.json
// with [{ key, uploaded }, …] sorted newest upload first. GalleryPage.jsx
// fetches it instead of a hand-maintained manifest — adding a photo to the
// gallery is just an upload to the bucket.
//
// Deploy with wrangler from this directory (route + R2 binding live in
// wrangler.toml): `npx wrangler deploy`. The route intercepts only
// /list.json; every other path still serves the bucket via the custom domain.
//
// Responses are cached for 5 minutes, at the edge and in the browser (see
// cache-control below), so a fresh upload can take up to that long to appear
// on /gallery.
//
// Listing the bucket now and then fails, and an uncaught failure is a
// Cloudflare 1101 page (about 1 request in 5 in Nov 2026). So the list is
// tried a few times, kept in the edge cache so most requests don't list at
// all, and a failure that persists answers 503 (the gallery retries) with the
// error in the logs: `npx wrangler tail gallery-list`.

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;
const TRIES = 3;

async function listImages(bucket) {
  const objects = [];
  let cursor;
  do {
    const page = await bucket.list({ cursor, limit: 1000 });
    objects.push(...page.objects);
    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  return objects
    .filter((o) => IMAGE_RE.test(o.key))
    .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))
    .map((o) => ({ key: o.key, uploaded: o.uploaded }));
}

export default {
  async fetch(request, env, ctx) {
    const headers = {
      'content-type': 'application/json',
      'access-control-allow-origin': '*',
    };
    const key = new Request(new URL('/list.json', request.url));
    const cached = await caches.default.match(key);
    if (cached) {
      // the edge hands it back with the zone's browser TTL (4 hours); keep 5 minutes
      const fresh = new Response(cached.body, cached);
      fresh.headers.set('cache-control', 'public, max-age=300');
      return fresh;
    }

    let images;
    for (let i = 1; i <= TRIES && !images; i += 1) {
      try {
        images = await listImages(env.GALLERY);
      } catch (err) {
        console.error(`listing the bucket failed (try ${i} of ${TRIES}):`, err && err.stack ? err.stack : String(err));
      }
    }
    if (!images) {
      return new Response('{"error":"listing the gallery failed"}', {
        status: 503,
        headers: { ...headers, 'cache-control': 'no-store' },
      });
    }

    const response = new Response(JSON.stringify(images), {
      headers: { ...headers, 'cache-control': 'public, max-age=300' },
    });
    ctx.waitUntil(caches.default.put(key, response.clone()));
    return response;
  },
};
