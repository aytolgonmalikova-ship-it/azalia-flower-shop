import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { readStorage, writeStorage } from '../utils/storage';

const STORAGE_KEY = 'azalia-theme';
const TRANSITION_CLASS = 'theme-transition';
const TRANSITION_MS = 500;
const THEME_COLORS = { light: '#F7E8F1', dark: '#1D1420' };

const ThemeContext = createContext(null);

function isTheme(value) {
  return value === 'light' || value === 'dark';
}

function getSystemTheme() {
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialTheme() {
  const saved = readStorage(STORAGE_KEY);
  return isTheme(saved) ? saved : getSystemTheme();
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', THEME_COLORS[theme]);
  }, [theme]);

  // Пока пользователь сам не выбрал тему, следуем за системной настройкой.
  useEffect(() => {
    const query = window.matchMedia?.('(prefers-color-scheme: dark)');
    if (!query) return undefined;
    const handleChange = (event) => {
      if (!isTheme(readStorage(STORAGE_KEY))) {
        setTheme(event.matches ? 'dark' : 'light');
      }
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, []);

  const toggleTheme = useCallback(() => {
    // Класс включает плавный переход цветов только на время смены темы.
    const root = document.documentElement;
    root.classList.add(TRANSITION_CLASS);
    window.setTimeout(() => root.classList.remove(TRANSITION_CLASS), TRANSITION_MS);

    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      writeStorage(STORAGE_KEY, next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used inside ThemeProvider');
  return context;
}
