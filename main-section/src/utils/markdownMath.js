export function preprocessThoughtMarkdown(markdown) {
  if (typeof markdown !== 'string' || !markdown) {
    return '';
  }

  return markdown.replace(/```(?:math|latex)\s*\n([\s\S]*?)```/g, (_, expression) => {
    const trimmed = `${expression}`.trim();
    return `\n$$\n${trimmed}\n$$\n`;
  });
}
