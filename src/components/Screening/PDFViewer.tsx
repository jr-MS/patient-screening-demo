import React, { useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { SourceLocation } from '../../types';

// Configure PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  pdfUrl: string;
  highlightLocations?: SourceLocation[];
  currentPage?: number;
  onPageChange?: (page: number) => void;
}

export const PDFViewer: React.FC<PDFViewerProps> = ({
  pdfUrl,
  highlightLocations = [],
  currentPage,
  onPageChange
}) => {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(currentPage || 1);
  const [pageScale, setPageScale] = useState<number>(1);
  const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number }>({ width: 0, height: 0 });
  const baseWidth = 800;
  const pageWidth = baseWidth * pageScale;

  // Sync with external currentPage prop
  React.useEffect(() => {
    if (currentPage && currentPage !== pageNumber) {
      setPageNumber(currentPage);
    }
  }, [currentPage]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const onPageLoadSuccess = (page: any) => {
    const viewport = page.getViewport({ scale: 1 });
    setPageDimensions({ width: viewport.width, height: viewport.height });
    console.log('PDF Page dimensions:', { width: viewport.width, height: viewport.height });
  };

  const goToPrevPage = () => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const goToNextPage = () => {
    if (pageNumber < numPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
    }
  };

  const zoomIn = () => setPageScale(prev => Math.min(prev + 0.1, 2));
  const zoomOut = () => setPageScale(prev => Math.max(prev - 0.1, 0.5));
  const resetZoom = () => setPageScale(1);

  // Filter highlights for current page
  const currentPageHighlights = highlightLocations.filter(loc => loc.page === pageNumber);
  
  // Debug logging
  React.useEffect(() => {
    if (currentPageHighlights.length > 0) {
      console.log('Current page highlights:', currentPageHighlights);
      console.log('Page dimensions:', pageDimensions);
      console.log('Render width:', pageWidth);
    }
  }, [currentPageHighlights, pageDimensions, pageWidth]);

  return (
    <div className="flex flex-col h-full bg-gray-100 rounded-lg overflow-hidden">
      {/* PDF Navigation */}
      <div className="bg-white border-b border-border p-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
            className="px-3 py-1 bg-primary text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            上一页
          </button>
          <span className="text-sm text-text-secondary">
            第 {pageNumber} / {numPages} 页
          </span>
          <button
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
            className="px-3 py-1 bg-primary text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            下一页
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button className="px-2 py-1 border rounded" onClick={zoomOut}>-</button>
          <span className="text-sm text-text-secondary">{Math.round(pageScale * 100)}%</span>
          <button className="px-2 py-1 border rounded" onClick={zoomIn}>+</button>
          <button className="px-2 py-1 border rounded" onClick={resetZoom}>重置</button>
        </div>
      </div>

      {/* PDF Content with Highlights */}
      <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-gray-50">
        <div className="relative">
          <Document
            file={pdfUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <div className="text-text-secondary">加载 PDF 中...</div>
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8">
                <div className="text-red-600">PDF 加载失败</div>
              </div>
            }
          >
            <Page
              pageNumber={pageNumber}
              width={pageWidth}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              onLoadSuccess={onPageLoadSuccess}
            />
          </Document>

          {/* Render highlight boxes on top of PDF */}
          {currentPageHighlights.map((highlight, idx) => {
            if (!highlight.boundingBox || !pageDimensions.width) return null;
            
            const { x, y, w, h } = highlight.boundingBox;
            
            // Scale factor: rendered page width / actual PDF page width
            const scale = pageWidth / pageDimensions.width;
            
            // Convert PDF coordinates to pixel coordinates
            const left = x * scale;
            const top = y * scale;
            const width = w * scale;
            const height = h * scale;
            
            console.log(`Highlight ${idx}: bbox(${x}, ${y}, ${w}, ${h}) -> render(${left}, ${top}, ${width}, ${height}), scale=${scale}`);
            
            return (
              <div
                key={idx}
                className="absolute border-2 border-yellow-400 bg-yellow-200 bg-opacity-30 pointer-events-none rounded"
                style={{
                  left: `${left}px`,
                  top: `${top}px`,
                  width: `${width}px`,
                  height: `${height}px`,
                }}
                title={highlight.text}
              />
            );
          })}
        </div>
      </div>

      {/* Info */}
      {highlightLocations.length > 0 && (
        <div className="bg-white border-t border-border p-4 text-sm">
          <div className="text-primary font-medium">
            ✓ 已识别 {highlightLocations.length} 处关键信息
          </div>
          {currentPageHighlights.length > 0 && (
            <div className="text-yellow-600 mt-1">
              📍 当前页面有 {currentPageHighlights.length} 处高亮
            </div>
          )}
        </div>
      )}
    </div>
  );
};
