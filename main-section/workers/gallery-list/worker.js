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
// Responses are cached for 5 minutes (cache-control below), so a fresh
// upload can take up to that long to appear on /gallery.

const IMAGE_RE = /\.(jpe?g|png|webp|gif|avif)$/i;

export default {
  async fetch(request, env) {
    const objects = [];
    let cursor;
    do {
      const page = await env.GALLERY.list({ cursor, limit: 1000 });
      objects.push(...page.objects);
      cursor = page.truncated ? page.cursor : undefined;
    } while (cursor);

    const images = objects
      .filter((o) => IMAGE_RE.test(o.key))
      .sort((a, b) => new Date(b.uploaded) - new Date(a.uploaded))
      .map((o) => ({ key: o.key, uploaded: o.uploaded }));

    return new Response(JSON.stringify(images), {
      headers: {
        'content-type': 'application/json',
        'access-control-allow-origin': '*',
        'cache-control': 'public, max-age=300',
      },
    });
  },
};
