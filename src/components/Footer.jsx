import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { FaInstagram, FaTelegram, FaWhatsapp } from 'react-icons/fa6';
import Logo from './Logo.jsx';
import { NAV_ITEMS } from '../data/navigation';
import { PHONE_DISPLAY, PHONE_HREF, SOCIAL_LINKS, WHATSAPP_URL } from '../data/contacts';

const SOCIAL_ICONS = { instagram: FaInstagram, telegram: FaTelegram };

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo />
          <p className="footer__description">{t('footer.description')}</p>
        </div>

        <nav className="footer__column" aria-label={t('footer.navTitle')}>
          <h2 className="footer__title">{t('footer.navTitle')}</h2>
          <ul className="footer__list">
            {NAV_ITEMS.map(({ id, path }) => (
              <li key={id}>
                <Link to={path} className="footer__link">
                  {t(`nav.${id}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="footer__column">
          <h2 className="footer__title">{t('footer.contactsTitle')}</h2>
          <ul className="footer__list">
            <li>
              <a href={PHONE_HREF} className="footer__link footer__link--icon">
                <Phone size={18} aria-hidden="true" />
                <span>{PHONE_DISPLAY}</span>
              </a>
            </li>
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__link footer__link--icon"
              >
                <FaWhatsapp size={19} aria-hidden="true" />
                <span>{t('footer.whatsapp')}</span>
              </a>
            </li>
          </ul>
        </div>

        <div className="footer__column">
          <h2 className="footer__title">{t('footer.socialTitle')}</h2>
          <ul className="footer__social">
            <li>
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-link"
                aria-label={t('footer.whatsapp')}
                title={t('footer.whatsapp')}
              >
                <FaWhatsapp size={20} aria-hidden="true" />
              </a>
            </li>
            {SOCIAL_LINKS.map(({ id, url }) => {
              const Icon = SOCIAL_ICONS[id];
              return (
                <li key={id}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__social-link"
                    aria-label={t(`footer.${id}`)}
                    title={t(`footer.${id}`)}
                  >
                    <Icon size={20} aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
          <p className="footer__note">{t('footer.socialDemo')}</p>
        </div>
      </div>

      <div className="container footer__bottom">
        <p>{t('footer.rights', { year })}</p>
      </div>
    </footer>
  );
}
