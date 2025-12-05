import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PixelWindowProps {
  children: ReactNode;
  title?: string;
  className?: string;
  onClose?: () => void;
}

/**
 * PixelWindow
 * A pixel-art styled window/panel component reminiscent of old OS windows
 */
export function PixelWindow({ children, title, className, onClose }: PixelWindowProps) {
  return (
    <div
      className={cn(
        'bg-pixel-surface border-4 border-pixel-border',
        'shadow-pixel',
        className
      )}
    >
      {/* Title bar */}
      <div className="flex items-center justify-between bg-pixel-primary px-3 py-2 border-b-4 border-pixel-border">
        <div className="flex items-center gap-2">
          {/* Window icon (decorative pixels) */}
          <div className="grid grid-cols-2 gap-0.5">
            <div className="h-1.5 w-1.5 bg-pixel-darkest" />
            <div className="h-1.5 w-1.5 bg-pixel-darkest" />
            <div className="h-1.5 w-1.5 bg-pixel-darkest" />
            <div className="h-1.5 w-1.5 bg-pixel-darkest" />
          </div>
          {title && (
            <span className="font-pixel text-[10px] uppercase text-pixel-darkest truncate">
              {title}
            </span>
          )}
        </div>

        {/* Window controls */}
        <div className="flex items-center gap-1">
          {onClose && (
            <button
              onClick={onClose}
              className={cn(
                'h-5 w-5 flex items-center justify-center',
                'bg-pixel-surface border-2 border-pixel-border',
                'hover:bg-[var(--pixel-error)] hover:text-white',
                'focus-visible:outline-2 focus-visible:outline-pixel-accent',
                'transition-colors duration-100'
              )}
              aria-label="Close window"
            >
              <span className="font-pixel text-[8px] leading-none">×</span>
            </button>
          )}
        </div>
      </div>

      {/* Window content */}
      <div className="p-4">{children}</div>
    </div>
  );
}
