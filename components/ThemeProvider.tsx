'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({ theme: 'light', toggleTheme: () => undefined });

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    let storedTheme: string | null = null;
    try {
      storedTheme = window.localStorage.getItem('ayab-theme');
    } catch {
      // Keep the current session usable when browser storage is unavailable.
    }
    const prefersDark = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const nextTheme: Theme = storedTheme === 'dark' || (!storedTheme && prefersDark)
      ? 'dark'
      : 'light';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#0F172A' : '#F8FAFC');
  }, []);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', nextTheme === 'dark' ? '#0F172A' : '#F8FAFC');
    try {
      window.localStorage.setItem('ayab-theme', nextTheme);
    } catch {
      // The theme still applies to this session when storage is unavailable.
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, toggleTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
