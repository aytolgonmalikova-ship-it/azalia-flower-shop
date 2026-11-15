import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './locales/ru/translation.json';
import ky from './locales/ky/translation.json';
import en from './locales/en/translation.json';
import { DEFAULT_LANGUAGE, LANGUAGE_CODES } from './data/languages';
import { readStorage, writeStorage } from './utils/storage';

const STORAGE_KEY = 'azalia-lang';

function getInitialLanguage() {
  const saved = readStorage(STORAGE_KEY);
  if (LANGUAGE_CODES.includes(saved)) return saved;

  const browserLanguages = navigator.languages ?? [navigator.language ?? ''];
  const match = browserLanguages
    .map((language) => language.slice(0, 2).toLowerCase())
    .find((code) => LANGUAGE_CODES.includes(code));
  return match ?? DEFAULT_LANGUAGE;
}

function syncDocument(language) {
  document.documentElement.lang = language;
  document.title = i18n.t('meta.title');
  document
    .querySelector('meta[name="description"]')
    ?.setAttribute('content', i18n.t('meta.description'));
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    ky: { translation: ky },
    en: { translation: en },
  },
  lng: getInitialLanguage(),
  fallbackLng: DEFAULT_LANGUAGE,
  supportedLngs: LANGUAGE_CODES,
  interpolation: { escapeValue: false },
});

i18n.on('languageChanged', (language) => {
  writeStorage(STORAGE_KEY, language);
  syncDocument(language);
});

syncDocument(i18n.language);

export default i18n;
