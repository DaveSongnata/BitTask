import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PixelToolbarProps {
  children: ReactNode;
  className?: string;
  position?: 'top' | 'bottom';
}

/**
 * PixelToolbar
 * A pixel-art styled toolbar for navigation or actions
 */
export function PixelToolbar({ children, className, position = 'top' }: PixelToolbarProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between gap-2',
        'bg-pixel-surface border-pixel-border',
        'px-4 py-3 overflow-hidden',

        // Position-specific styles
        position === 'top' && [
          'border-b-4',
          'sticky-top-safe',
          'header-with-notch',
        ],
        position === 'bottom' && [
          'border-t-4',
          'fixed-bottom-safe',
          'bottom-nav-safe',
        ],

        className
      )}
      role="toolbar"
    >
      {children}
    </div>
  );
}

interface PixelToolbarGroupProps {
  children: ReactNode;
  className?: string;
}

export function PixelToolbarGroup({ children, className }: PixelToolbarGroupProps) {
  return <div className={cn('flex items-center gap-2', className)}>{children}</div>;
}

interface PixelToolbarTitleProps {
  children: ReactNode;
  className?: string;
}

export function PixelToolbarTitle({ children, className }: PixelToolbarTitleProps) {
  return (
    <h1 className={cn('font-pixel text-sm uppercase text-pixel-text truncate', className)}>
      {children}
    </h1>
  );
}
