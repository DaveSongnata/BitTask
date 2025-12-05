import { cn } from '@/lib/utils';
import type { ReactNode } from 'react';

interface SafeAreaContainerProps {
  children: ReactNode;
  className?: string;
}

/**
 * SafeAreaContainer
 * Wrapper component that handles safe area insets for iOS/Android devices
 * Ensures content doesn't get hidden behind notches, home indicators, etc.
 */
export function SafeAreaContainer({ children, className }: SafeAreaContainerProps) {
  return (
    <div
      className={cn(
        'safe-area-container',
        'min-h-screen max-w-full bg-pixel-bg text-pixel-text',
        'flex flex-col',
        'pixel-scrollbar overflow-x-hidden overflow-y-auto',
        className
      )}
    >
      {children}
    </div>
  );
}
