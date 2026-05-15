export function getCompactGridDimensions(totalCards, availableHeight = 550, cardHeight = 200) {
  const maxRows = Math.max(1, Math.floor(availableHeight / cardHeight));
  const columns = Math.max(1, Math.ceil(totalCards / maxRows));
  const rows = Math.max(1, Math.ceil(totalCards / columns));

  return {
    columns,
    rows,
  };
}
