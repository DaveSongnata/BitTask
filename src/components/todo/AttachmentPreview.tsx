import { useThumbnailPreview, useLinkPreview } from '@/hooks';
import { formatFileSize } from '@/lib/utils';
import { cn } from '@/lib/utils';
import type { Attachment } from '@/types';

interface AttachmentPreviewProps {
  attachment: Attachment;
  onDelete?: () => void;
  showDetails?: boolean;
  onClick?: () => void;
}

/**
 * AttachmentPreview
 * Preview component for different attachment types
 */
export function AttachmentPreview({
  attachment,
  onDelete,
  showDetails = false,
  onClick,
}: AttachmentPreviewProps) {
  const thumbnailUrl = useThumbnailPreview(
    attachment.type !== 'link' ? attachment : undefined
  );

  // For links, use link preview hook
  const { preview, favicon, domain } = useLinkPreview(
    attachment.type === 'link' ? attachment.url : undefined
  );

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else if (attachment.type === 'link' && attachment.url) {
      window.open(attachment.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div
      className={cn(
        'relative group',
        'bg-pixel-surface border-4 border-pixel-border',
        'overflow-hidden cursor-pointer',
        'hover:border-pixel-accent transition-colors'
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
      {/* Preview Content */}
      <div className="aspect-square flex items-center justify-center bg-pixel-surface-alt">
        {attachment.type === 'image' && thumbnailUrl && (
          <img
            src={thumbnailUrl}
            alt={attachment.filename}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}

        {attachment.type === 'audio' && (
          <div className="flex flex-col items-center gap-2 p-4">
            <svg
              className="w-8 h-8 text-pixel-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M18 3a1 1 0 00-1.196-.98l-10 2A1 1 0 006 5v9.114A4.369 4.369 0 005 14c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V7.82l8-1.6v5.894A4.37 4.37 0 0015 12c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2V3z" />
            </svg>
            <span className="font-pixel text-[8px] text-pixel-text-muted truncate max-w-full px-2">
              Audio
            </span>
          </div>
        )}

        {attachment.type === 'pdf' && (
          <div className="flex flex-col items-center gap-2 p-4">
            <svg
              className="w-8 h-8 text-pixel-primary"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-pixel text-[8px] text-pixel-text-muted">PDF</span>
          </div>
        )}

        {attachment.type === 'link' && (
          <div className="flex flex-col items-center gap-2 p-4 w-full">
            {favicon ? (
              <img src={favicon} alt="" className="w-6 h-6" />
            ) : (
              <svg
                className="w-8 h-8 text-pixel-primary"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="font-pixel text-[8px] text-pixel-text-muted truncate max-w-full px-2">
              {domain}
            </span>
            {preview && !preview.success && (
              <span className="font-pixel text-[6px] text-pixel-warning">
                Preview unavailable
              </span>
            )}
          </div>
        )}
      </div>

      {/* Details */}
      {showDetails && (
        <div className="p-2 border-t-4 border-pixel-border">
          <p className="font-pixel text-[8px] text-pixel-text truncate">
            {attachment.type === 'link'
              ? preview?.title ?? domain
              : attachment.filename}
          </p>
          {attachment.type !== 'link' && (
            <p className="font-pixel text-[6px] text-pixel-text-muted">
              {formatFileSize(attachment.size)}
            </p>
          )}
        </div>
      )}

      {/* Delete Button */}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className={cn(
            'absolute top-1 right-1',
            'w-6 h-6 flex items-center justify-center',
            'bg-[var(--pixel-error)] text-white',
            'border-2 border-pixel-border',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'hover:bg-red-600'
          )}
          aria-label="Delete attachment"
        >
          <span className="font-pixel text-[10px]">×</span>
        </button>
      )}
    </div>
  );
}
