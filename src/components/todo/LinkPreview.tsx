import { useLinkPreview } from '@/hooks';
import { PixelLoader } from '@/components/ui';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface LinkPreviewProps {
  attachment: Attachment;
  className?: string;
  onClick?: () => void;
}

/**
 * LinkPreview
 * Preview card for link attachments with OpenGraph data
 * Shows fallback if CORS blocks the preview
 */
export function LinkPreview({ attachment, className, onClick }: LinkPreviewProps) {
  const { preview, isLoading, favicon, domain } = useLinkPreview(attachment.url);

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (attachment.url) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  if (isLoading) {
    return (
      <div
        className={cn(
          'bg-pixel-surface border-4 border-pixel-border p-4',
          'flex items-center justify-center',
          className
        )}
      >
        <PixelLoader size="sm" />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'bg-pixel-surface border-4 border-pixel-border',
        'cursor-pointer hover:border-pixel-accent transition-colors',
        className
      )}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {/* Preview Image */}
      {preview?.image && (
        <div className="aspect-video overflow-hidden border-b-4 border-pixel-border bg-pixel-surface-alt">
          <img
            src={preview.image}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => {
              // Hide broken images
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Content */}
      <div className="p-3">
        {/* Site Info */}
        <div className="flex items-center gap-2 mb-2">
          {favicon && (
            <img src={favicon} alt="" className="w-4 h-4" />
          )}
          <span className="font-pixel text-[8px] text-pixel-text-muted truncate">
            {preview?.siteName ?? domain}
          </span>
        </div>

        {/* Title */}
        <h4 className="font-pixel text-[10px] text-pixel-text mb-1 line-clamp-2">
          {preview?.title ?? attachment.url}
        </h4>

        {/* Description */}
        {preview?.description && (
          <p className="font-pixel text-[8px] text-pixel-text-muted line-clamp-2">
            {preview.description}
          </p>
        )}

        {/* Fallback Message */}
        {preview && !preview.success && (
          <p className="font-pixel text-[8px] text-pixel-warning mt-2">
            Preview unavailable
          </p>
        )}
      </div>

      {/* External Link Indicator */}
      <div className="absolute top-2 right-2 p-1 bg-pixel-surface/80 border-2 border-pixel-border">
        <svg
          className="w-3 h-3 text-pixel-text-muted"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="square"
            strokeWidth={2}
            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
          />
        </svg>
      </div>
    </div>
  );
}
