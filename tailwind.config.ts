import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class', '[data-mode="dark"]'],
  theme: {
    extend: {
      colors: {
        // SLSO8 Palette
        slso8: {
          0: '#ffecd6',
          1: '#ffd4a3',
          2: '#ffaa5e',
          3: '#d08159',
          4: '#8d697a',
          5: '#544e68',
          6: '#203c56',
          7: '#0d2b45',
        },
        // Semantic pixel colors (use CSS variables for theme switching)
        pixel: {
          bg: 'var(--pixel-bg)',
          'bg-alt': 'var(--pixel-bg-alt)',
          primary: 'var(--pixel-primary)',
          secondary: 'var(--pixel-secondary)',
          muted: 'var(--pixel-muted)',
          dark: 'var(--pixel-dark)',
          darker: 'var(--pixel-darker)',
          darkest: 'var(--pixel-darkest)',
          text: 'var(--pixel-text)',
          'text-muted': 'var(--pixel-text-muted)',
          border: 'var(--pixel-border)',
          accent: 'var(--pixel-accent)',
          surface: 'var(--pixel-surface)',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        mono: ['ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px var(--pixel-border)',
        'pixel-sm': '2px 2px 0px 0px var(--pixel-border)',
        'pixel-inset': 'inset 2px 2px 0px 0px var(--pixel-border)',
      },
      borderWidth: {
        pixel: '4px',
        'pixel-sm': '2px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      animation: {
        'pixel-blink': 'pixel-blink 1s step-start infinite',
        'pixel-bounce': 'pixel-bounce 0.5s step-end infinite',
      },
      keyframes: {
        'pixel-blink': {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
        'pixel-bounce': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
