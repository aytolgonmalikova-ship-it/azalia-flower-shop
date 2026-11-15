import { useTranslation } from 'react-i18next';
import { LANGUAGES } from '../data/languages';

export default function LanguageSwitcher() {
  const { t, i18n } = useTranslation();
  const current = i18n.resolvedLanguage ?? i18n.language;

  return (
    <div className="lang-switcher" role="group" aria-label={t('lang.label')}>
      {LANGUAGES.map(({ code, short }) => (
        <button
          key={code}
          type="button"
          lang={code}
          className={`lang-switcher__button${current === code ? ' is-active' : ''}`}
          aria-pressed={current === code}
          title={t(`lang.${code}`)}
          onClick={() => i18n.changeLanguage(code)}
        >
          <span aria-hidden="true">{short}</span>
          <span className="visually-hidden">{t(`lang.${code}`)}</span>
        </button>
      ))}
    </div>
  );
}
