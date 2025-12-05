import { cn } from '@/lib/utils';
import { PixelLoader } from './PixelLoader';
import type { PixelButtonProps } from '@/types';

const variantStyles = {
  primary: 'bg-pixel-primary text-pixel-darkest hover:bg-pixel-secondary',
  secondary: 'bg-pixel-surface-alt text-pixel-text hover:bg-pixel-bg-alt',
  ghost: 'bg-transparent border-transparent shadow-none hover:bg-pixel-surface-alt',
  danger: 'bg-[var(--pixel-error)] text-white hover:opacity-90',
};

const sizeStyles = {
  sm: 'px-3 py-2 text-[10px] border-2',
  md: 'px-4 py-3 text-xs border-4',
  lg: 'px-6 py-4 text-sm border-4',
};

/**
 * PixelButton
 * A pixel-art styled button component with various variants and sizes
 */
export function PixelButton({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  className,
  onClick,
  type = 'button',
}: PixelButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      onClick={onClick}
      className={cn(
        // Base styles
        'relative inline-flex items-center justify-center gap-2',
        'font-pixel uppercase tracking-wider',
        'border-pixel-border',
        'transition-all duration-100 ease-out',
        'select-none cursor-pointer',

        // Shadow
        size === 'sm' ? 'shadow-pixel-sm' : 'shadow-pixel',

        // Variant
        variantStyles[variant],

        // Size
        sizeStyles[size],

        // States
        'hover:enabled:-translate-x-0.5 hover:enabled:-translate-y-0.5',
        size === 'sm'
          ? 'hover:enabled:shadow-[3px_3px_0px_0px_var(--pixel-shadow)]'
          : 'hover:enabled:shadow-[6px_6px_0px_0px_var(--pixel-shadow)]',

        'active:enabled:translate-x-0.5 active:enabled:translate-y-0.5',
        size === 'sm'
          ? 'active:enabled:shadow-[1px_1px_0px_0px_var(--pixel-shadow)]'
          : 'active:enabled:shadow-[2px_2px_0px_0px_var(--pixel-shadow)]',

        // Disabled
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none',

        // Focus
        'focus-visible:outline-4 focus-visible:outline-dashed focus-visible:outline-pixel-accent focus-visible:outline-offset-2',

        className
      )}
    >
      {loading && <PixelLoader size="sm" />}
      <span className={cn(loading && 'opacity-70')}>{children}</span>
    </button>
  );
}
