import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Check, Copy, LoaderCircle, LogOut, ShieldCheck, ShoppingBag } from 'lucide-react';
import Button from '../components/Button.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const COPIED_RESET_MS = 2500;

// Копирование с запасным способом для браузеров без Clipboard API (или без https).
async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.appendChild(field);
    field.select();
    let copied = false;
    try {
      copied = document.execCommand('copy');
    } catch {
      copied = false;
    }
    field.remove();
    return copied;
  }
}

// Личный кабинет (/account). Сюда попадают только вошедшие пользователи (RequireAuth).
export default function AccountPage() {
  const { t } = useTranslation();
  const { user, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  // copyState: 'idle' | 'copied' | 'failed'
  const [copyState, setCopyState] = useState('idle');
  const [signingOut, setSigningOut] = useState(false);
  const resetTimer = useRef(null);

  useEffect(() => () => clearTimeout(resetTimer.current), []);

  const handleCopy = async () => {
    const copied = await copyText(user.uid);
    setCopyState(copied ? 'copied' : 'failed');
    clearTimeout(resetTimer.current);
    resetTimer.current = setTimeout(() => setCopyState('idle'), COPIED_RESET_MS);
  };

  const handleSignOut = async () => {
    if (signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch {
      setSigningOut(false);
    }
  };

  const name = user.displayName?.trim();
  const copied = copyState === 'copied';

  return (
    <section className="section account" aria-labelledby="account-title">
      <div className="container account__inner">
        <header className="account__header">
          <p className="eyebrow">{t('account.eyebrow')}</p>
          <h1 id="account-title" className="account__title">
            {name ? t('account.greeting', { name }) : t('account.title')}
          </h1>
        </header>

        <div className="account__grid">
          <section className="card account-card" aria-labelledby="account-profile-title">
            <h2 id="account-profile-title" className="card__title">
              {t('account.profile.title')}
            </h2>

            <dl className="account-details">
              <div className="account-details__row">
                <dt>{t('account.profile.name')}</dt>
                <dd>{name || t('account.profile.noName')}</dd>
              </div>
              <div className="account-details__row">
                <dt>{t('account.profile.email')}</dt>
                <dd>{user.email}</dd>
              </div>
            </dl>

            <div className="account-uid">
              <p id="account-uid-label" className="account-uid__label">
                {t('account.profile.uid')}
              </p>
              <div className="account-uid__row">
                <code className="account-uid__value" aria-labelledby="account-uid-label">
                  {user.uid}
                </code>
                <button type="button" className="account-uid__copy" onClick={handleCopy}>
                  {copied ? (
                    <Check size={17} aria-hidden="true" />
                  ) : (
                    <Copy size={17} aria-hidden="true" />
                  )}
                  <span>{copied ? t('account.profile.copied') : t('account.profile.copy')}</span>
                </button>
              </div>
              <p className="account-uid__hint" role="status">
                {copyState === 'failed'
                  ? t('account.profile.copyFailed')
                  : t('account.profile.uidHint')}
              </p>
            </div>

            <div className="account-card__actions">
              {isAdmin && (
                <Link to="/admin" className="text-link">
                  <ShieldCheck size={18} aria-hidden="true" />
                  <span>{t('account.adminPanel')}</span>
                </Link>
              )}
              <Button
                variant="secondary"
                size="sm"
                disabled={signingOut}
                aria-busy={signingOut}
                icon={
                  signingOut ? (
                    <LoaderCircle size={18} className="spinner" />
                  ) : (
                    <LogOut size={17} />
                  )
                }
                onClick={handleSignOut}
              >
                {t('account.signOut')}
              </Button>
            </div>
          </section>

          <section className="card account-card" aria-labelledby="account-orders-title">
            <h2 id="account-orders-title" className="card__title">
              {t('account.orders.title')}
            </h2>
            <div className="account-orders">
              <span className="account-orders__icon" aria-hidden="true">
                <ShoppingBag size={26} />
              </span>
              <p className="account-orders__title">{t('account.orders.emptyTitle')}</p>
              <p className="account-orders__text">{t('account.orders.emptyText')}</p>
              <Button to="/catalog" size="sm">
                {t('account.orders.toCatalog')}
              </Button>
            </div>
          </section>
        </div>
      </div>
    </section>
  );
}
