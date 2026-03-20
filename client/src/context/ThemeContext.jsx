import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'splitease-theme';
const ThemeContext = createContext(null);

const applyTheme = (theme) => {
  const root = document.documentElement;
  if (theme === 'dark') root.classList.add('dark');
  else root.classList.remove('dark');
  root.setAttribute('data-theme', theme);
};

const getInitialTheme = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch { /* private browsing */ }
  return 'light'; // default is light
};

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState(() => {
    const t = getInitialTheme();
    applyTheme(t); // apply before first render to avoid flash
    return t;
  });

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    applyTheme(next);
    setThemeState(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch { /* noop */ }
  };

  // Sync if localStorage changes in another tab
  useEffect(() => {
    const handler = (e) => {
      if (e.key === STORAGE_KEY && (e.newValue === 'light' || e.newValue === 'dark')) {
        applyTheme(e.newValue);
        setThemeState(e.newValue);
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
