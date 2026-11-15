import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { LogIn, LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

/*
 * Вход и личный кабинет в шапке сайта.
 * Гость видит ссылку «Войти»; вошедший — кнопку с именем и меню:
 * кабинет, админ-панель (только для администраторов) и выход.
 */
export default function AccountMenu() {
  const { t } = useTranslation();
  const { status, user, isAdmin, signOut } = useAuth();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    setOpen(false);
  }, [pathname, status]);

  useEffect(() => {
    if (!open) return undefined;
    const handlePointerDown = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Пока Firebase проверяет сохранённый вход, держим место, чтобы шапка не прыгала.
  if (status === 'loading') return <span className="account-menu__placeholder" aria-hidden="true" />;

  if (status === 'signedOut') {
    return (
      <Link to="/login" className="account-menu__button" title={t('auth.header.signIn')}>
        <LogIn size={20} aria-hidden="true" />
        <span className="account-menu__label">{t('auth.header.signIn')}</span>
      </Link>
    );
  }

  // В шапке — только первое слово имени; без имени — «Кабинет».
  const shortName = user.displayName?.trim().split(/\s+/)[0] || t('auth.header.account');
  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className="account-menu">
      <button
        ref={buttonRef}
        type="button"
        className="account-menu__button"
        aria-expanded={open}
        aria-controls="account-menu-list"
        aria-label={t('auth.header.menuLabel', { name: shortName })}
        title={user.displayName || user.email}
        onClick={() => setOpen((current) => !current)}
      >
        <UserRound size={20} aria-hidden="true" />
        <span className="account-menu__label" aria-hidden="true">
          {shortName}
        </span>
      </button>

      <div id="account-menu-list" className="account-menu__list" hidden={!open}>
        <p className="account-menu__user">{user.email}</p>
        <Link to="/account" className="account-menu__item" onClick={close}>
          <UserRound size={18} aria-hidden="true" />
          <span>{t('auth.header.account')}</span>
        </Link>
        {isAdmin && (
          <Link to="/admin" className="account-menu__item" onClick={close}>
            <ShieldCheck size={18} aria-hidden="true" />
            <span>{t('auth.header.adminPanel')}</span>
          </Link>
        )}
        <button
          type="button"
          className="account-menu__item"
          onClick={() => {
            close();
            signOut();
          }}
        >
          <LogOut size={18} aria-hidden="true" />
          <span>{t('auth.header.signOut')}</span>
        </button>
      </div>
    </div>
  );
}
