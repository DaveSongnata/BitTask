import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface PixelCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  as?: 'div' | 'article' | 'section';
}

interface PixelCardHeaderProps {
  children: ReactNode;
  className?: string;
}

interface PixelCardBodyProps {
  children: ReactNode;
  className?: string;
}

interface PixelCardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * PixelCard
 * A pixel-art styled card component with header, body, and footer slots
 */
export function PixelCard({ children, className, onClick, as: Component = 'div' }: PixelCardProps) {
  const isClickable = !!onClick;

  return (
    <Component
      className={cn(
        'pixel-card',
        isClickable && [
          'cursor-pointer',
          'transition-all duration-100',
          'hover:-translate-x-0.5 hover:-translate-y-0.5',
          'hover:shadow-[6px_6px_0px_0px_var(--pixel-shadow)]',
          'active:translate-x-0.5 active:translate-y-0.5',
          'active:shadow-[2px_2px_0px_0px_var(--pixel-shadow)]',
        ],
        className
      )}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      {children}
    </Component>
  );
}

export function PixelCardHeader({ children, className }: PixelCardHeaderProps) {
  return <div className={cn('pixel-card-header', className)}>{children}</div>;
}

export function PixelCardBody({ children, className }: PixelCardBodyProps) {
  return <div className={cn('py-2', className)}>{children}</div>;
}

export function PixelCardFooter({ children, className }: PixelCardFooterProps) {
  return (
    <div
      className={cn('border-t-4 border-pixel-border pt-3 mt-3 flex items-center gap-2', className)}
    >
      {children}
    </div>
  );
}
