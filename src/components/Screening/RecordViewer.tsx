import React, { useEffect, useRef } from 'react';

interface RecordViewerProps {
  record: string;
  highlightRanges?: Array<{ start: number; end: number }>;
}

export const RecordViewer: React.FC<RecordViewerProps> = ({ record, highlightRanges = [] }) => {
  const viewerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (viewerRef.current && highlightRanges.length > 0) {
      // Scroll to first highlight
      const highlights = viewerRef.current.querySelectorAll('mark');
      if (highlights.length > 0) {
        highlights[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [highlightRanges]);
  
  const renderHighlightedText = () => {
    if (highlightRanges.length === 0) {
      return record;
    }
    
    const sortedRanges = [...highlightRanges].sort((a, b) => a.start - b.start);
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    
    sortedRanges.forEach((range, idx) => {
      // Add text before highlight
      if (range.start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {record.substring(lastIndex, range.start)}
          </span>
        );
      }
      
      // Add highlighted text
      parts.push(
        <mark key={`mark-${idx}`} className="highlight">
          {record.substring(range.start, range.end)}
        </mark>
      );
      
      lastIndex = range.end;
    });
    
    // Add remaining text
    if (lastIndex < record.length) {
      parts.push(
        <span key="text-end">
          {record.substring(lastIndex)}
        </span>
      );
    }
    
    return parts;
  };
  
  return (
    <div
      ref={viewerRef}
      className="bg-gray-50 border border-border rounded-lg p-6 h-full overflow-y-auto"
    >
      <div className="font-mono text-sm whitespace-pre-wrap leading-relaxed">
        {renderHighlightedText()}
      </div>
    </div>
  );
};
