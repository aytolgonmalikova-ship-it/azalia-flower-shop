import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowUpRight } from 'lucide-react';
import FlowerIcon from '../FlowerIcon.jsx';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import ThemeToggle from '../ThemeToggle.jsx';

// Общий каркас экранов до входа в панель: форма входа, проверка доступа, отказ.
export default function AuthScreen({ title, subtitle, children }) {
  const { t } = useTranslation();

  return (
    <div className="admin admin-auth">
      <div className="admin-auth__tools">
        <LanguageSwitcher />
        <ThemeToggle />
      </div>

      <main className="admin-auth__card">
        <span className="logo__mark admin-auth__mark" aria-hidden="true">
          <FlowerIcon size={34} />
        </span>
        <p className="eyebrow">{t('brand.full')}</p>
        <h1 className="admin-auth__title">{title}</h1>
        {subtitle && <p className="admin-auth__subtitle">{subtitle}</p>}
        {children}
      </main>

      <Link to="/" className="text-link">
        <span>{t('admin.nav.backToSite')}</span>
        <ArrowUpRight size={17} aria-hidden="true" />
      </Link>
    </div>
  );
}
