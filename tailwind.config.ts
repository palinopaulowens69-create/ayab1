import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}', './lib/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#7A0019',
          dark: '#520011',
          light: '#A3122F',
        },
        gold: '#F0AC00',
        paper: '#F3F4F6',
        ink: '#1B1A1E',
        line: '#E1E2E6',
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
