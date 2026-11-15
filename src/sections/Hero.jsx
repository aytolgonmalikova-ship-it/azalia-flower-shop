import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Button from '../components/Button.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';
import { PRODUCT_CATEGORIES } from '../data/products';
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
            <Button to="/catalog">{t('hero.cta')}</Button>
            <Button href="#services" variant="secondary">
              {t('hero.secondary')}
            </Button>
          </div>
          {/* Быстрый переход в нужный раздел каталога — без прокрутки главной */}
          <nav className="hero__quick" aria-label={t('hero.quickLabel')}>
            <ul className="hero__quick-list">
              {PRODUCT_CATEGORIES.map((category) => (
                <li key={category}>
                  <Link to={`/catalog?category=${category}`} className="chip chip--sm chip--link">
                    {t(`catalog.categories.${category}`)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
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
