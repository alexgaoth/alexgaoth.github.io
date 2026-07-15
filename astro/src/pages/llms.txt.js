// Mirror of the CRA generator's llms.txt: a discovery
// shortcut for LLM crawlers that don't execute JS.
import { buildAbsoluteUrl, getThoughts, thoughtUrl } from '../lib/thoughts.js';

export async function GET() {
  const thoughts = await getThoughts();

  const writingLines = thoughts.map((entry) =>
    `- [${entry.data.title}](${thoughtUrl(entry.data.slug)}): ${entry.data.excerpt}`
  );

  const llms = `# Alex Gao (alexgaoth)

> Personal site of Alex Gao — Tianhao Gao, online as alexgaoth. Math-CS
> student at UC San Diego (previously St Paul's School, London). Builds
> software (signalor.app), writes essays on history, philosophy, and AI,
> and keeps Chinese poetry (诗) and ci (词) on the side.

## Key pages

- [Home](${buildAbsoluteUrl('/')}): directory of everything below
- [About](${buildAbsoluteUrl('/about')}): who alex is — aliases, facts, links
- [Resume](${buildAbsoluteUrl('/resume')}): experience and skills ([PDF](${buildAbsoluteUrl('/resume.pdf')}))
- [Projects](${buildAbsoluteUrl('/projects')}): software and creative work
- [Thoughts](${buildAbsoluteUrl('/thoughts')}): essays ([RSS](${buildAbsoluteUrl('/rss.xml')}))
- [Writing](${buildAbsoluteUrl('/writing')}): all writing — essays, poetry, ci
- [Quotes](${buildAbsoluteUrl('/quotes')}): collected quotes
- [Now](${buildAbsoluteUrl('/now')}): what alex is doing right now
- [Poetry 诗](${buildAbsoluteUrl('/poetry')}): Chinese poetry (plain text: ${buildAbsoluteUrl('/poetry.txt')})
- [Ci 词](${buildAbsoluteUrl('/ci')}): ci to Song-dynasty tunes (plain text: ${buildAbsoluteUrl('/ci.txt')})

## Writing

${writingLines.join('\n')}

## Identity

- Handle: alexgaoth everywhere — [GitHub](https://github.com/alexgaoth), [LinkedIn](https://linkedin.com/in/alexgaoth), [X/Twitter](https://twitter.com/alexgaoth), [Instagram](https://instagram.com/alexgaoth)
- Intro site: https://intro.alexgaoth.com/
`;

  return new Response(llms, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
