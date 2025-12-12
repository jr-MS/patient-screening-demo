export const highlightText = (
  text: string,
  ranges: Array<{ start: number; end: number }>
): string => {
  if (!ranges || ranges.length === 0) return text;
  
  let result = '';
  let lastIndex = 0;
  
  // Sort ranges by start position
  const sortedRanges = [...ranges].sort((a, b) => a.start - b.start);
  
  sortedRanges.forEach(range => {
    // Add text before highlight
    result += text.substring(lastIndex, range.start);
    // Add highlighted text
    result += `<mark class="highlight">${text.substring(range.start, range.end)}</mark>`;
    lastIndex = range.end;
  });
  
  // Add remaining text
  result += text.substring(lastIndex);
  
  return result;
};

export const findTextPosition = (text: string, searchText: string): { start: number; end: number } | null => {
  const index = text.indexOf(searchText);
  if (index === -1) return null;
  
  return {
    start: index,
    end: index + searchText.length
  };
};
