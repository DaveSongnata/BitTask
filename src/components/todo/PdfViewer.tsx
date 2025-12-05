import { useState, lazy, Suspense } from 'react';
import { PixelButton, PixelLoader } from '@/components/ui';
import { useFilePreview } from '@/hooks';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

// Lazy load react-pdf for code splitting
const Document = lazy(() =>
  import('react-pdf').then((module) => ({ default: module.Document }))
);
const Page = lazy(() =>
  import('react-pdf').then((module) => ({ default: module.Page }))
);

// Configure PDF.js worker
import { pdfjs } from 'react-pdf';
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

interface PdfViewerProps {
  attachment: Attachment;
  className?: string;
}

/**
 * PdfViewer
 * PDF viewer component using react-pdf
 */
export function PdfViewer({ attachment, className }: PdfViewerProps) {
  const { previewUrl, isLoading, error } = useFilePreview(attachment);
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  };

  const zoomIn = () => {
    setScale((prev) => Math.min(prev + 0.25, 3));
  };

  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <PixelLoader />
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="font-pixel text-xs text-pixel-error">{error ?? 'Failed to load PDF'}</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b-4 border-pixel-border bg-pixel-surface">
        {/* Page Navigation */}
        <div className="flex items-center gap-2">
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={goToPrevPage}
            disabled={pageNumber <= 1}
          >
            ←
          </PixelButton>
          <span className="font-pixel text-[10px]">
            {pageNumber} / {numPages}
          </span>
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages}
          >
            →
          </PixelButton>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-2">
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={zoomOut}
            disabled={scale <= 0.5}
          >
            -
          </PixelButton>
          <span className="font-pixel text-[10px] w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <PixelButton
            size="sm"
            variant="ghost"
            onClick={zoomIn}
            disabled={scale >= 3}
          >
            +
          </PixelButton>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto pixel-scrollbar bg-pixel-surface-alt p-4">
        <Suspense
          fallback={
            <div className="flex items-center justify-center p-8">
              <PixelLoader />
            </div>
          }
        >
          <Document
            file={previewUrl}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
              <div className="flex items-center justify-center p-8">
                <PixelLoader />
              </div>
            }
            error={
              <div className="flex items-center justify-center p-8">
                <p className="font-pixel text-xs text-pixel-error">Failed to load PDF</p>
              </div>
            }
            className="flex justify-center"
          >
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={false}
              renderAnnotationLayer={false}
              className="shadow-pixel border-4 border-pixel-border"
            />
          </Document>
        </Suspense>
      </div>

      {/* Filename */}
      <div className="p-2 border-t-4 border-pixel-border bg-pixel-surface">
        <p className="font-pixel text-[8px] text-pixel-text-muted truncate">
          {attachment.filename}
        </p>
      </div>
    </div>
  );
}
