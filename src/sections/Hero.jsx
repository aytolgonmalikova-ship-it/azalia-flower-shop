import { useTranslation } from 'react-i18next';
import Button from '../components/Button.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';
import heroImage from '../assets/images/hero-roses.jpg';

export default function Hero() {
  const { t } = useTranslation();

  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="container">
        <div className="hero__content">
          <p className="eyebrow hero__eyebrow">
            <FlowerIcon size={16} />
            <span>{t('hero.eyebrow')}</span>
          </p>
          <h1 id="hero-title" className="hero__title">
            {t('hero.titleStart')} <em>{t('hero.titleAccent')}</em>
          </h1>
          <p className="hero__subtitle">{t('hero.subtitle')}</p>
          <div className="hero__actions">
            <Button to="/contact">{t('hero.cta')}</Button>
            <Button href="#services" variant="secondary">
              {t('hero.secondary')}
            </Button>
          </div>
        </div>
      </div>

      <div className="hero__visual">
        <img
          src={heroImage}
          alt={t('hero.imageAlt')}
          width="1920"
          height="1282"
          fetchPriority="high"
        />
      </div>
    </section>
  );
}
