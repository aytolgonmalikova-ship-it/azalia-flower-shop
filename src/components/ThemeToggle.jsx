import { useTranslation } from 'react-i18next';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';

const PETAL_ANGLES = [0, 45, 90, 135, 180, 225, 270, 315];

// Кнопка-цветок: лепестки поворачиваются при смене темы.
export default function ThemeToggle({ className = '' }) {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      onClick={toggleTheme}
      aria-label={isDark ? t('theme.toLight') : t('theme.toDark')}
      title={isDark ? t('theme.toLight') : t('theme.toDark')}
    >
      <svg className="theme-toggle__flower" viewBox="-50 -50 100 100" aria-hidden="true">
        {PETAL_ANGLES.map((angle) => (
          <ellipse key={angle} cx="0" cy="-27" rx="15" ry="21" transform={`rotate(${angle})`} />
        ))}
        <circle r="30" />
      </svg>
      <span className="theme-toggle__icon" aria-hidden="true">
        {isDark ? <Sun size={19} /> : <Moon size={19} />}
      </span>
    </button>
  );
}
