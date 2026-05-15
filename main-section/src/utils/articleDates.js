export function parseArticleDate(dateString) {
  if (typeof dateString !== 'string') {
    return null;
  }

  const match = dateString.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (match) {
    const [, year, month, day] = match;
    return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  }

  const parsed = new Date(dateString);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function getArticleYear(dateString) {
  const parsed = parseArticleDate(dateString);
  return parsed ? parsed.getUTCFullYear() : 'Unknown';
}

export function getArticleMonth(dateString, locale = 'en-US') {
  const parsed = parseArticleDate(dateString);
  return parsed
    ? parsed.toLocaleString(locale, { month: 'long', timeZone: 'UTC' })
    : 'Unknown';
}

export function toIsoDateString(dateString) {
  const parsed = parseArticleDate(dateString);
  return parsed ? parsed.toISOString() : undefined;
}
