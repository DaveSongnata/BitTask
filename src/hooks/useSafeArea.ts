import { useState, useEffect } from 'react';

interface SafeAreaInsets {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

/**
 * useSafeArea
 * Provides safe area inset values for iOS/Android devices
 * Useful for programmatic positioning that can't use CSS env()
 */
export function useSafeArea(): SafeAreaInsets {
  const [insets, setInsets] = useState<SafeAreaInsets>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  useEffect(() => {
    const updateInsets = () => {
      // Get computed values from CSS custom properties
      const style = getComputedStyle(document.documentElement);

      // Parse the CSS values (they include 'px' suffix)
      const parseValue = (value: string): number => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Try to get from CSS custom properties first
      let top = parseValue(style.getPropertyValue('--sat').trim());
      let bottom = parseValue(style.getPropertyValue('--sab').trim());
      let left = parseValue(style.getPropertyValue('--sal').trim());
      let right = parseValue(style.getPropertyValue('--sar').trim());

      // Fallback: create a temporary element to measure
      if (top === 0 && bottom === 0 && left === 0 && right === 0) {
        const testElement = document.createElement('div');
        testElement.style.cssText = `
          position: fixed;
          top: env(safe-area-inset-top, 0px);
          bottom: env(safe-area-inset-bottom, 0px);
          left: env(safe-area-inset-left, 0px);
          right: env(safe-area-inset-right, 0px);
          pointer-events: none;
          visibility: hidden;
        `;
        document.body.appendChild(testElement);

        const rect = testElement.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const windowWidth = window.innerWidth;

        top = rect.top;
        bottom = windowHeight - rect.bottom;
        left = rect.left;
        right = windowWidth - rect.right;

        document.body.removeChild(testElement);
      }

      setInsets({ top, bottom, left, right });
    };

    // Initial update
    updateInsets();

    // Update on resize and orientation change
    window.addEventListener('resize', updateInsets);
    window.addEventListener('orientationchange', updateInsets);

    // Update when viewport-fit changes (e.g., keyboard appears)
    const resizeObserver = new ResizeObserver(updateInsets);
    resizeObserver.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateInsets);
      window.removeEventListener('orientationchange', updateInsets);
      resizeObserver.disconnect();
    };
  }, []);

  return insets;
}

/**
 * Check if device has a notch or significant safe area
 */
export function useHasNotch(): boolean {
  const { top, bottom } = useSafeArea();
  // Consider notch present if top inset > 20px or bottom > 20px (home indicator)
  return top > 20 || bottom > 20;
}

/**
 * Check if device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  const [isLandscape, setIsLandscape] = useState(
    typeof window !== 'undefined' ? window.innerWidth > window.innerHeight : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsLandscape(window.innerWidth > window.innerHeight);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return isLandscape;
}
