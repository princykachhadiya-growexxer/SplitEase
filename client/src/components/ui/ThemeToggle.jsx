import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

/**
 * ThemeToggle
 * A polished sun/moon button that toggles between light and dark mode.
 *
 * Props:
 *   size     — 'sm' | 'md' (default 'md')
 *   showLabel — show "Light" / "Dark" text beside the icon (default false)
 */
const ThemeToggle = ({ size = 'md', showLabel = false }) => {
  const { theme, toggleTheme, syncing } = useTheme();
  const isDark = theme === 'dark';

  const iconSize = size === 'sm' ? 15 : 17;

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle"
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {/* Animated icon swap */}
      <span
        className="flex items-center gap-2"
        style={{
          transition: 'opacity 150ms ease, transform 200ms ease',
        }}
      >
        {isDark ? (
          <Sun
            size={iconSize}
            className="text-amber-400"
            style={{ animation: 'spin-slow 0.4s ease' }}
          />
        ) : (
          <Moon
            size={iconSize}
            className="text-slate-500"
            style={{ animation: 'spin-slow 0.4s ease' }}
          />
        )}

        {showLabel && (
          <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
            {isDark ? 'Light' : 'Dark'}
          </span>
        )}
      </span>

      {/* Tiny sync dot — shows while saving to DB */}
      {syncing && (
        <span
          className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-brand-500"
          title="Saving preference…"
        />
      )}
    </button>
  );
};

export default ThemeToggle;
