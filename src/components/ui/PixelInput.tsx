import { cn } from '@/lib/utils';
import type { PixelInputProps } from '@/types';

/**
 * PixelInput
 * A pixel-art styled input component with error state support
 */
export function PixelInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  disabled = false,
  error,
  className,
  name,
  id,
  required,
  maxLength,
}: PixelInputProps) {
  return (
    <div className="w-full">
      <input
        type={type}
        name={name}
        id={id}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        maxLength={maxLength}
        className={cn(
          // Base styles
          'pixel-input w-full',
          'font-pixel text-xs',
          'placeholder:text-pixel-text-muted placeholder:opacity-60',

          // Error state
          error && 'border-[var(--pixel-error)] focus:border-[var(--pixel-error)]',

          // Disabled
          disabled && 'opacity-50 cursor-not-allowed',

          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${id ?? name}-error` : undefined}
      />
      {error && (
        <p
          id={`${id ?? name}-error`}
          className="mt-2 text-[10px] font-pixel text-[var(--pixel-error)]"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
