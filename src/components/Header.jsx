import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Menu, ShoppingBag, X } from 'lucide-react';
import Logo from './Logo.jsx';
import Button from './Button.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';
import ThemeToggle from './ThemeToggle.jsx';
import AccountMenu from './AccountMenu.jsx';
import { useCart } from '../context/CartContext.jsx';
import { NAV_ITEMS } from '../data/navigation';

export default function Header() {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const { count: cartCount } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  // Закрываем мобильное меню при переходе на другую страницу.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    document.body.classList.add('menu-open');
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`header${scrolled || menuOpen ? ' header--raised' : ''}`}>
      <div className="container header__inner">
        <Logo onClick={closeMenu} />

        <div id="main-menu" className={`header__panel${menuOpen ? ' is-open' : ''}`}>
          <nav className="nav" aria-label={t('nav.label')}>
            <ul className="nav__list">
              {NAV_ITEMS.map(({ id, path }) => (
                <li key={id}>
                  <NavLink to={path} end={path === '/'} className="nav__link" onClick={closeMenu}>
                    {t(`nav.${id}`)}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          <div className="header__panel-row">
            <LanguageSwitcher />
            {/* На самых узких экранах переключатель темы живёт в меню, а не в шапке */}
            <ThemeToggle className="header__theme--panel" />
          </div>
          <Button to="/contact" size="sm" className="header__cta" onClick={closeMenu}>
            {t('header.cta')}
          </Button>
        </div>

        <div className="header__tools">
          <ThemeToggle className="header__theme--bar" />
          <Link
            to="/cart"
            className="header__cart"
            aria-label={t('cart.headerLabel', { count: cartCount })}
            title={t('cart.title')}
            onClick={closeMenu}
          >
            <ShoppingBag size={22} aria-hidden="true" />
            {cartCount > 0 && (
              <span className="header__cart-count" aria-hidden="true">
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </Link>
          <AccountMenu />
          <button
            type="button"
            className="header__burger"
            aria-expanded={menuOpen}
            aria-controls="main-menu"
            aria-label={menuOpen ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
    </header>
  );
}
