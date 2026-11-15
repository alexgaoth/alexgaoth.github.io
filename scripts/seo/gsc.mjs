// Weekly Search Console snapshot for alexgaoth.com — read-only, no dependencies.
// Credentials: GSC_KEY_JSON (the service-account JSON, raw or base64) or GSC_KEY_FILE (a path to it).
// Usage: node scripts/seo/gsc.mjs [days=28]
import { createSign } from 'node:crypto';
import { readFileSync } from 'node:fs';

const SITE = 'sc-domain:alexgaoth.com';
const HOST = 'https://alexgaoth.com/';
const TRACKED = ['alex gao', 'alexgaoth', 'alex gao ucsd', 'tianhao gao', 'alexander gao', 'gaoism', 'sublationism'];

function loadKey() {
  const raw = process.env.GSC_KEY_JSON ?? readFileSync(process.env.GSC_KEY_FILE, 'utf8');
  const text = raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8');
  return JSON.parse(text);
}

async function token(key) {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString('base64url');
  const body = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
    iss: key.client_email,
    scope: 'https://www.googleapis.com/auth/webmasters.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = createSign('RSA-SHA256').update(body).sign(key.private_key, 'base64url');
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: `${body}.${sig}` }),
  });
  if (!res.ok) throw new Error(`token: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

async function api(tok, path, body) {
  const res = await fetch(`https://searchconsole.googleapis.com${path}`, {
    method: 'POST',
    headers: { authorization: `Bearer ${tok}`, 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${path}: ${res.status} ${await res.text()}`);
  return res.json();
}

const day = (d) => new Date(Date.now() - d * 864e5).toISOString().slice(0, 10);
const days = Number(process.argv[2] ?? 28);
const range = { startDate: day(days + 3), endDate: day(3) }; // GSC data lags ~3 days
const onHost = { dimension: 'page', operator: 'contains', expression: '://alexgaoth.com' };
const row = (r) => `${r.keys.join(' | ')} | ${r.clicks} | ${r.impressions} | ${r.position.toFixed(1)}`;

const tok = await token(loadKey());
const enc = encodeURIComponent(SITE);
const query = (dimensions, filters = [onHost]) =>
  api(tok, `/webmasters/v3/sites/${enc}/searchAnalytics/query`, {
    ...range, dimensions, rowLimit: 100, dimensionFilterGroups: [{ filters }],
  }).then((r) => r.rows ?? []);

console.log(`# Search Console, ${range.startDate} → ${range.endDate} (alexgaoth.com only)\n`);

console.log('## Tracked queries (query | clicks | impressions | avg position)');
for (const q of TRACKED) {
  const [r] = await query(['query'], [{ dimension: 'query', operator: 'equals', expression: q }]);
  console.log(r ? row(r) : `${q} | – | – | not shown`);
}

console.log('\n## Pages (page | clicks | impressions | avg position)');
for (const r of await query(['page'])) console.log(row(r));

console.log('\n## Top queries for alexgaoth.com pages (query | page | clicks | impressions | avg position)');
for (const r of (await query(['query', 'page'])).slice(0, 40)) console.log(row(r));

console.log('\n## Index status of every sitemap URL (url | verdict | coverage | last crawl)');
const sitemap = await (await fetch(`${HOST}sitemap.xml`)).text();
for (const [, url] of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
  const { inspectionResult: ir } = await api(tok, '/v1/urlInspection/index:inspect', { inspectionUrl: url, siteUrl: SITE });
  const s = ir.indexStatusResult;
  console.log(`${url} | ${s.verdict} | ${s.coverageState} | ${s.lastCrawlTime ?? 'never'}`);
}
