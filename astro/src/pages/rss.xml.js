// Same URL, item shape, and GUIDs as the CRA generator's rss.xml, so existing
// subscribers and Search Console submissions carry over untouched at cutover.
import { getThoughts, thoughtUrl, toRfc822Date, buildAbsoluteUrl } from '../lib/thoughts.js';

function escapeXml(value) {
  return `${value}`
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export async function GET() {
  const thoughts = await getThoughts();
  const newest = thoughts[0].data;

  const items = thoughts.map((entry) => {
    const article = entry.data;
    const articleUrl = thoughtUrl(article.slug);

    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${articleUrl}</link>
      <guid>${articleUrl}</guid>
      <pubDate>${toRfc822Date(article.date)}</pubDate>
      <description>${escapeXml(article.excerpt)}</description>
    </item>`;
  }).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Alex Gao Thoughts</title>
    <link>${buildAbsoluteUrl('/thoughts')}</link>
    <description>Writing by Alex Gao (alexgaoth).</description>
    <lastBuildDate>${toRfc822Date(newest.modified || newest.date)}</lastBuildDate>
    <language>en-us</language>
${items}
  </channel>
</rss>
`;

  return new Response(rss, {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' },
  });
}
