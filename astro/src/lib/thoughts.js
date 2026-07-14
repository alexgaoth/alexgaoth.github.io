// Shared helpers for the thoughts collection — the logic that used to live in
// main-section/scripts/generate-thoughts-index.js (read time, ordering,
// absolute URLs, RFC-822 dates) plus related-article selection.
import { getCollection } from 'astro:content';
import { SITE } from '../config/site.js';

export function buildAbsoluteUrl(routePath) {
  return routePath === '/' ? `${SITE.appUrl}/` : `${SITE.appUrl}${routePath}`;
}

export function thoughtUrl(slug) {
  return buildAbsoluteUrl(`/thoughts/${slug}`);
}

export function calculateReadTime(content) {
  const words = `${content}`.trim().split(/\s+/).length;
  return `${Math.ceil(words / 225)} min read`;
}

export function toRfc822Date(dateString) {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).toUTCString();
}

export function toIsoDateString(dateString) {
  return `${dateString}T00:00:00.000Z`;
}

// All thoughts, newest first — the ordering every consumer expects.
export async function getThoughts() {
  const entries = await getCollection('thoughts');
  return entries.sort((a, b) => new Date(b.data.date) - new Date(a.data.date));
}

// 2–3 related articles: hand-picked `related` slugs first, then shared-tag
// matches, then most recent — so every article page links onward (SEO-PLAN
// Phase 2: the site's structure should be discoverable through normal links).
export function pickRelated(entry, allEntries, max = 3) {
  const others = allEntries.filter((other) => other.data.slug !== entry.data.slug);
  const chosen = [];
  const take = (candidate) => {
    if (candidate && chosen.length < max && !chosen.includes(candidate)) {
      chosen.push(candidate);
    }
  };

  for (const slug of entry.data.related || []) {
    take(others.find((other) => other.data.slug === slug));
  }

  const ownTags = new Set(entry.data.tags.map((tag) => tag.toLowerCase()));
  for (const other of others) {
    if (other.data.tags.some((tag) => ownTags.has(tag.toLowerCase()))) take(other);
  }

  for (const other of others) take(other);

  return chosen;
}
