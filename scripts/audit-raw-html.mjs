#!/usr/bin/env node
// Raw-HTML crawlability audit (SEO-PLAN 0.9). Verifies what a no-JS crawler
// actually receives: status, title, meta description, self-canonical, OG tags,
// one h1, real internal links, and visible text.
//
// Usage:
//   node scripts/audit-raw-html.mjs https://alexgaoth.com / /about /thoughts
//   node scripts/audit-raw-html.mjs astro/dist index.html:/ about.html:/about
//
// First arg is a base URL (fetch mode) or a directory (file mode). Remaining
// args are paths; in file mode use <file>:<canonical-path>.
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const CANONICAL_HOST = 'https://alexgaoth.com';
const [target, ...specs] = process.argv.slice(2);

if (!target || specs.length === 0) {
  console.error('usage: audit-raw-html.mjs <baseUrl|distDir> <path|file:path>...');
  process.exit(2);
}

const isDir = (() => {
  try { return statSync(target).isDirectory(); } catch { return false; }
})();

function expectedCanonical(routePath) {
  return routePath === '/' ? `${CANONICAL_HOST}/` : `${CANONICAL_HOST}${routePath}`;
}

function auditHtml(label, html, routePath) {
  const problems = [];

  const title = html.match(/<title>([^<]*)<\/title>/)?.[1];
  if (!title) problems.push('missing <title>');

  if (!/<meta name="description" content="[^"]+"/.test(html)) {
    problems.push('missing meta description');
  }

  const canonical = html.match(/<link rel="canonical" href="([^"]*)"/)?.[1];
  const expected = expectedCanonical(routePath);
  if (!canonical) {
    problems.push('missing canonical (SPA shell? helmet-only?)');
  } else if (canonical !== expected) {
    problems.push(`canonical=${canonical} expected=${expected}`);
  }

  const ogUrl = html.match(/<meta property="og:url" content="([^"]*)"/)?.[1];
  if (ogUrl && ogUrl !== expected) problems.push(`og:url=${ogUrl} expected=${expected}`);
  if (!/<meta property="og:title" content="[^"]+"/.test(html)) problems.push('missing og:title');
  if (!/<meta property="og:image" content="[^"]+"/.test(html)) problems.push('missing og:image');

  const h1s = html.match(/<h1[\s>]/g)?.length ?? 0;
  if (h1s !== 1) problems.push(`h1 count=${h1s}`);

  const links = html.match(/<a href="\/[^"]*"/g)?.length ?? 0;
  if (links < 3) problems.push(`only ${links} internal <a href> links`);

  const textLen = html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ').length;
  if (textLen < 400) problems.push(`visible text only ~${textLen} chars`);

  if (problems.length) {
    console.log(`FAIL ${label}`);
    for (const p of problems) console.log(`  - ${p}`);
    return false;
  }
  console.log(`OK   ${label}  title="${title}"  text~${textLen}ch  links=${links}`);
  return true;
}

let failures = 0;

for (const spec of specs) {
  if (isDir) {
    const [file, routePath] = spec.split(':');
    const html = readFileSync(join(target, file), 'utf8');
    if (!auditHtml(file, html, routePath ?? '/')) failures++;
  } else {
    const url = new URL(spec, target).toString();
    const res = await fetch(url, { redirect: 'manual' });
    if (res.status !== 200) {
      console.log(`FAIL ${spec}\n  - status ${res.status}${res.headers.get('location') ? ` → ${res.headers.get('location')}` : ''}`);
      failures++;
      continue;
    }
    if (!auditHtml(spec, await res.text(), spec)) failures++;
  }
}

process.exit(failures ? 1 : 0);
