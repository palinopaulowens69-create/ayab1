'use client';

import { MoonIcon, SunIcon } from './Icons';
import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800 active:scale-95 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-white"
      aria-label={label}
      title={label}
    >
      {theme === 'dark' ? <SunIcon width={18} height={18} /> : <MoonIcon width={18} height={18} />}
    </button>
  );
}
