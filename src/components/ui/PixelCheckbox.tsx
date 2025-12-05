import { cn } from '@/lib/utils';

interface PixelCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
  size?: 'sm' | 'md';
}

/**
 * PixelCheckbox
 * A pixel-art styled checkbox component
 */
export function PixelCheckbox({
  checked,
  onChange,
  label,
  disabled = false,
  className,
  id,
  name,
  size = 'md',
}: PixelCheckboxProps) {
  const checkboxId = id ?? name ?? `checkbox-${Math.random().toString(36).substring(7)}`;

  return (
    <div className={cn('inline-flex items-center gap-3', className)}>
      <div className="relative">
        <input
          type="checkbox"
          id={checkboxId}
          name={name}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          className={cn(
            // Hide native checkbox but keep accessible
            'peer sr-only'
          )}
        />
        <label
          htmlFor={checkboxId}
          className={cn(
            // Custom checkbox appearance
            'flex cursor-pointer items-center justify-center',
            'border-pixel-border bg-pixel-surface',
            'transition-colors duration-100',

            // Size variants
            size === 'sm' ? 'h-4 w-4 border-2' : 'h-6 w-6 border-4',

            // Checked state
            'peer-checked:bg-pixel-primary',

            // Focus state
            'peer-focus-visible:outline peer-focus-visible:outline-4',
            'peer-focus-visible:outline-dashed peer-focus-visible:outline-pixel-accent',
            'peer-focus-visible:outline-offset-2',

            // Disabled state
            'peer-disabled:opacity-50 peer-disabled:cursor-not-allowed'
          )}
        >
          {/* Checkmark */}
          <svg
            className={cn(
              'text-pixel-darkest',
              'transition-opacity duration-100',
              size === 'sm' ? 'h-2.5 w-2.5' : 'h-4 w-4',
              checked ? 'opacity-100' : 'opacity-0'
            )}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={4}
          >
            <path strokeLinecap="square" strokeLinejoin="miter" d="M5 13l4 4L19 7" />
          </svg>
        </label>
      </div>
      {label && (
        <label
          htmlFor={checkboxId}
          className={cn(
            'font-pixel text-xs text-pixel-text cursor-pointer select-none',
            disabled && 'opacity-50 cursor-not-allowed'
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}
