// Itinatakda nito ang Tailwind content paths, AYAB colors, fonts, at radius tokens.
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#1769E0',
          dark: '#0B4DB3',
          light: '#4D91F2',
        },
        gold: '#F2B84B',
        paper: '#F3F7FC',
        ink: '#17243A',
        line: '#DFE8F3',
        success: '#1E7A46',
        warning: '#B5790A',
        danger: '#B3261E',
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      borderRadius: {
        ticket: '14px',
      },
    },
  },
  plugins: [],
};

export default config;
