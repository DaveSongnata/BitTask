import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import type { ThemeName, ThemeMode } from '@/types';

interface ThemeContextValue {
  theme: ThemeName;
  mode: ThemeMode;
  resolvedMode: 'light' | 'dark';
  setTheme: (theme: ThemeName) => void;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const THEME_STORAGE_KEY = 'bittask-theme';
const MODE_STORAGE_KEY = 'bittask-mode';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * ThemeProvider
 * Provides theme context with persistence to localStorage
 * Supports SLSO8 (default) and Original (PixelActUI) themes
 * Supports light, dark, and system modes
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeName>(() => {
    if (typeof window === 'undefined') return 'slso8';
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return (stored === 'slso8' || stored === 'original') ? stored : 'slso8';
  });

  const [mode, setModeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'system';
    const stored = localStorage.getItem(MODE_STORAGE_KEY);
    return (stored === 'light' || stored === 'dark' || stored === 'system') ? stored : 'system';
  });

  const [systemPrefersDark, setSystemPrefersDark] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Resolve the actual mode based on system preference
  const resolvedMode: 'light' | 'dark' =
    mode === 'system' ? (systemPrefersDark ? 'dark' : 'light') : mode;

  // Listen to system color scheme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme and mode to document
  useEffect(() => {
    const root = document.documentElement;

    // Set theme
    root.setAttribute('data-theme', theme);

    // Set mode
    root.setAttribute('data-mode', mode);

    // Also set class for Tailwind dark mode
    if (resolvedMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // Update meta theme-color
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        resolvedMode === 'dark' ? '#0d2b45' : '#ffecd6'
      );
    }
  }, [theme, mode, resolvedMode]);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  }, []);

  const setMode = useCallback((newMode: ThemeMode) => {
    setModeState(newMode);
    localStorage.setItem(MODE_STORAGE_KEY, newMode);
  }, []);

  const toggleMode = useCallback(() => {
    const nextMode: ThemeMode =
      mode === 'light' ? 'dark' : mode === 'dark' ? 'system' : 'light';
    setMode(nextMode);
  }, [mode, setMode]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        mode,
        resolvedMode,
        setTheme,
        setMode,
        toggleMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

/**
 * useTheme hook
 * Access theme context from any component
 */
export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}
