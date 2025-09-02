import { useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface UseDarkModeReturn {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

export const useDarkMode = (): UseDarkModeReturn => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    const stored = localStorage.getItem('theme') as Theme;
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored;
    }
    return 'system';
  });

  const [isDark, setIsDark] = useState(false);

  // Function to get the effective theme (resolving 'system' to actual preference)
  const getEffectiveTheme = (currentTheme: Theme): 'light' | 'dark' => {
    if (currentTheme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return currentTheme;
  };

  // Update theme and apply to document
  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    
    const effectiveTheme = getEffectiveTheme(newTheme);
    setIsDark(effectiveTheme === 'dark');
    
    // Apply theme to document
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
  };

  // Toggle between light and dark (skipping system)
  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = () => {
      if (theme === 'system') {
        const effectiveTheme = getEffectiveTheme('system');
        setIsDark(effectiveTheme === 'dark');
        document.documentElement.setAttribute('data-theme', effectiveTheme);
        document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    
    // Set initial theme
    const effectiveTheme = getEffectiveTheme(theme);
    setIsDark(effectiveTheme === 'dark');
    document.documentElement.setAttribute('data-theme', effectiveTheme);
    document.documentElement.classList.toggle('dark', effectiveTheme === 'dark');

    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  return {
    theme,
    isDark,
    setTheme,
    toggleTheme,
  };
};