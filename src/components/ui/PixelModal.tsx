import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { PixelButton } from './PixelButton';
import type { PixelModalProps } from '@/types';

/**
 * PixelModal
 * A pixel-art styled modal/dialog component with accessibility support
 */
export function PixelModal({ open, onClose, title, children, className }: PixelModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Handle escape key
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    },
    [onClose]
  );

  // Trap focus inside modal
  useEffect(() => {
    if (!open) return;

    // Store the current active element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Focus the modal
    modalRef.current?.focus();

    // Add escape key listener
    document.addEventListener('keydown', handleKeyDown);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';

      // Restore focus
      previousActiveElement.current?.focus();
    };
  }, [open, handleKeyDown]);

  // Handle click outside
  const handleOverlayClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  if (!open) return null;

  return createPortal(
    <div
      className="pixel-modal-overlay animate-in fade-in duration-150"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'modal-title' : undefined}
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className={cn(
          'pixel-modal modal-safe',
          'w-full max-w-lg',
          'animate-in zoom-in-95 duration-150',
          className
        )}
      >
        {/* Header */}
        {title && (
          <div className="pixel-modal-header">
            <h2 id="modal-title" className="font-pixel text-sm uppercase">
              {title}
            </h2>
            <PixelButton
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="!p-1 !border-2 !shadow-none hover:!bg-pixel-secondary"
              aria-label="Close modal"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path strokeLinecap="square" strokeLinejoin="miter" d="M6 6l12 12M6 18L18 6" />
              </svg>
            </PixelButton>
          </div>
        )}

        {/* Body */}
        <div className="pixel-modal-body pixel-scrollbar max-h-[60vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
