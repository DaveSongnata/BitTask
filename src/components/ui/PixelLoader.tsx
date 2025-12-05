import { cn } from '@/lib/utils';

interface PixelLoaderProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeStyles = {
  sm: 'h-2 w-2',
  md: 'h-3 w-3',
  lg: 'h-4 w-4',
};

const gapStyles = {
  sm: 'gap-1',
  md: 'gap-1.5',
  lg: 'gap-2',
};

/**
 * PixelLoader
 * A pixel-art styled loading indicator
 */
export function PixelLoader({ size = 'md', className }: PixelLoaderProps) {
  return (
    <div
      className={cn('pixel-loader inline-flex items-center', gapStyles[size], className)}
      role="status"
      aria-label="Loading"
    >
      <span
        className={cn(
          'pixel-loader-dot bg-pixel-primary',
          sizeStyles[size],
          'animate-[pixel-loader-bounce_0.6s_infinite_alternate]'
        )}
        style={{ animationDelay: '0ms' }}
      />
      <span
        className={cn(
          'pixel-loader-dot bg-pixel-primary',
          sizeStyles[size],
          'animate-[pixel-loader-bounce_0.6s_infinite_alternate]'
        )}
        style={{ animationDelay: '200ms' }}
      />
      <span
        className={cn(
          'pixel-loader-dot bg-pixel-primary',
          sizeStyles[size],
          'animate-[pixel-loader-bounce_0.6s_infinite_alternate]'
        )}
        style={{ animationDelay: '400ms' }}
      />
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * PixelLoaderFullscreen
 * Full screen loading overlay
 */
export function PixelLoaderFullscreen() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-pixel-bg/80 backdrop-blur-sm">
      <div className="pixel-card p-8">
        <PixelLoader size="lg" />
        <p className="mt-4 font-pixel text-xs text-pixel-text-muted">Loading...</p>
      </div>
    </div>
  );
}
