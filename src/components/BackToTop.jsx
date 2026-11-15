import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowUp } from 'lucide-react';

// Сколько нужно прокрутить (в высотах экрана), чтобы появилась кнопка.
const SHOW_AFTER_SCREENS = 1.5;

// Плавающая кнопка «Наверх»: появляется на длинных страницах после прокрутки.
export default function BackToTop() {
  const { t } = useTranslation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > window.innerHeight * SHOW_AFTER_SCREENS);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollUp = () => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
    document.getElementById('main')?.focus({ preventScroll: true });
  };

  return (
    <button
      type="button"
      className={`back-to-top${visible ? ' is-visible' : ''}`}
      aria-label={t('common.backToTop')}
      title={t('common.backToTop')}
      tabIndex={visible ? 0 : -1}
      aria-hidden={!visible}
      onClick={scrollUp}
    >
      <ArrowUp size={22} aria-hidden="true" />
    </button>
  );
}
