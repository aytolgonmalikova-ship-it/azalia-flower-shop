import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowUpRight,
  CircleAlert,
  CircleCheck,
  Flower2,
  Info,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareText,
  ShieldCheck,
  ShoppingBag,
  X,
} from 'lucide-react';
import FlowerIcon from '../FlowerIcon.jsx';
import LanguageSwitcher from '../LanguageSwitcher.jsx';
import ScrollToTop from '../ScrollToTop.jsx';
import ThemeToggle from '../ThemeToggle.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ADMIN_NAV_ITEMS } from '../../data/admin';

const NAV_ICONS = {
  dashboard: LayoutDashboard,
  products: Flower2,
  orders: ShoppingBag,
  reviews: MessageSquareText,
  admins: ShieldCheck,
};

const TOAST_DURATION_MS = 3200;

// Каркас админ-панели: боковое меню, верхняя панель и область страницы.
export default function AdminLayout() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { orders, reviews, toast, dismissToast } = useAdmin();
  const { user, isMainAdmin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  // Раздел «Администраторы» виден только главному администратору.
  const navItems = ADMIN_NAV_ITEMS.filter(({ id }) => id !== 'admins' || isMainAdmin);

  // Счётчики в меню: что требует внимания администратора.
  const badges = {
    orders: orders.filter((order) => order.status === 'new').length,
    reviews: reviews.filter((review) => review.status === 'pending').length,
  };

  // На телефоне и планшете меню закрывается при переходе в другой раздел.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [menuOpen]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(dismissToast, TOAST_DURATION_MS);
    return () => clearTimeout(timer);
  }, [toast, dismissToast]);

  return (
    <div className="admin">
      <a href="#admin-main" className="skip-link">
        {t('common.skipToContent')}
      </a>
      <ScrollToTop />

      <aside id="admin-menu" className={`admin__sidebar${menuOpen ? ' is-open' : ''}`}>
        <div className="admin__brand">
          <Link to="/admin" className="logo">
            <span className="logo__mark">
              <FlowerIcon size={30} />
            </span>
            <span className="logo__text">
              <span className="logo__name">{t('brand.name')}</span>
              <span className="logo__caption">{t('admin.caption')}</span>
            </span>
          </Link>
          <button
            type="button"
            className="header__burger admin__menu-close"
            aria-label={t('admin.nav.closeMenu')}
            onClick={() => setMenuOpen(false)}
          >
            <X size={22} />
          </button>
        </div>

        <nav className="admin-nav" aria-label={t('admin.nav.label')}>
          <ul className="admin-nav__list">
            {navItems.map(({ id, path }) => {
              const Icon = NAV_ICONS[id];
              return (
                <li key={id}>
                  <NavLink to={path} end={path === '/admin'} className="admin-nav__link">
                    <span className="admin-nav__icon" aria-hidden="true">
                      <Icon size={19} />
                    </span>
                    <span className="admin-nav__label">{t(`admin.nav.${id}`)}</span>
                    {badges[id] > 0 && <span className="admin-nav__badge">{badges[id]}</span>}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="admin__sidebar-footer">
          <div className="admin__account">
            <span className="admin__account-email" title={user?.email}>
              {user?.email}
            </span>
            <button type="button" className="admin-action" onClick={signOut}>
              <LogOut size={16} aria-hidden="true" />
              {t('admin.auth.signOut')}
            </button>
          </div>
          <LanguageSwitcher />
          <Link to="/" className="text-link">
            <span>{t('admin.nav.backToSite')}</span>
            <ArrowUpRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </aside>

      {menuOpen && (
        <div className="admin__overlay" aria-hidden="true" onClick={() => setMenuOpen(false)} />
      )}

      <div className="admin__body">
        <header className="admin__topbar">
          <button
            type="button"
            className="header__burger admin__menu-open"
            aria-expanded={menuOpen}
            aria-controls="admin-menu"
            aria-label={t('admin.nav.openMenu')}
            onClick={() => setMenuOpen(true)}
          >
            <Menu size={24} />
          </button>
          <p className="admin__topbar-title">{t('admin.title')}</p>
          <ThemeToggle />
        </header>

        <main id="admin-main" className="admin__main">
          <Outlet />
          <p className="admin__note">
            <Info size={16} aria-hidden="true" />
            <span>{t('admin.demoNote')}</span>
          </p>
        </main>
      </div>

      <div className="admin-toast-region" role="status" aria-live="polite">
        {toast && (
          <p key={toast.id} className={`admin-toast admin-toast--${toast.type}`}>
            {toast.type === 'error' ? (
              <CircleAlert size={19} aria-hidden="true" />
            ) : (
              <CircleCheck size={19} aria-hidden="true" />
            )}
            <span>{toast.message}</span>
          </p>
        )}
      </div>
    </div>
  );
}
