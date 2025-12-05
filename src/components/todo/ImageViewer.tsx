import { useState } from 'react';
import { useFilePreview } from '@/hooks';
import { PixelButton, PixelLoader } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface ImageViewerProps {
  attachment: Attachment;
  className?: string;
  onClose?: () => void;
}

/**
 * ImageViewer
 * Full-screen image viewer with zoom controls
 */
export function ImageViewer({ attachment, className, onClose }: ImageViewerProps) {
  const { previewUrl, isLoading, error } = useFilePreview(attachment);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const zoomIn = () => setScale((prev) => Math.min(prev + 0.5, 5));
  const zoomOut = () => {
    setScale((prev) => Math.max(prev - 0.5, 1));
    if (scale <= 1.5) {
      setPosition({ x: 0, y: 0 });
    }
  };
  const resetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && scale > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <PixelLoader size="lg" />
      </div>
    );
  }

  if (error || !previewUrl) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="font-pixel text-xs text-pixel-error">{error ?? 'Failed to load image'}</p>
        {onClose && (
          <PixelButton onClick={onClose} variant="secondary">
            Close
          </PixelButton>
        )}
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full bg-pixel-darkest', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-2 border-b-4 border-pixel-border bg-pixel-surface">
        <div className="flex items-center gap-2">
          <PixelButton size="sm" variant="ghost" onClick={zoomOut} disabled={scale <= 1}>
            -
          </PixelButton>
          <span className="font-pixel text-[10px] w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <PixelButton size="sm" variant="ghost" onClick={zoomIn} disabled={scale >= 5}>
            +
          </PixelButton>
          <PixelButton size="sm" variant="ghost" onClick={resetZoom}>
            Reset
          </PixelButton>
        </div>

        {onClose && (
          <PixelButton size="sm" variant="ghost" onClick={onClose}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="square" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </PixelButton>
        )}
      </div>

      {/* Image */}
      <div
        className={cn(
          'flex-1 overflow-hidden flex items-center justify-center',
          scale > 1 && 'cursor-move'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img
          src={previewUrl}
          alt={attachment.filename}
          className="max-w-full max-h-full object-contain select-none"
          style={{
            transform: `scale(${scale}) translate(${position.x / scale}px, ${position.y / scale}px)`,
            transition: isDragging ? 'none' : 'transform 0.2s ease',
          }}
          draggable={false}
        />
      </div>

      {/* Filename */}
      <div className="p-2 border-t-4 border-pixel-border bg-pixel-surface">
        <p className="font-pixel text-[8px] text-pixel-text-muted truncate text-center">
          {attachment.filename}
        </p>
      </div>
    </div>
  );
}
