import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        card: 'var(--card)',
        border: 'var(--border)',
        borderLight: 'var(--borderLight)',
        text: 'var(--text)',
        sub: 'var(--sub)',
        muted: 'var(--muted)',
        accent: 'var(--accent)',
        accentLight: 'var(--accentLight)',
        accentDark: 'var(--accentDark)',
        success: 'var(--success)',
        successLight: 'var(--successLight)',
        warn: 'var(--warn)',
        warnLight: 'var(--warnLight)',
        danger: 'var(--danger)',
        dangerLight: 'var(--dangerLight)',
        dark: 'var(--dark)',
        darkSoft: 'var(--darkSoft)',
      },
      fontFamily: {
        sans: ['"Zen Kaku Gothic New"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
