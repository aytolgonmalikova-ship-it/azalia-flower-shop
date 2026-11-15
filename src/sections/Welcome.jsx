import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Flower2, Leaf, Sparkles } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';
import welcomeImage from '../assets/images/peony-interior.jpg';

const FEATURES = [
  { id: 'fresh', Icon: Leaf },
  { id: 'author', Icon: Flower2 },
  { id: 'care', Icon: Sparkles },
];

export default function Welcome() {
  const { t } = useTranslation();

  return (
    <section className="section welcome" aria-labelledby="welcome-title">
      <div className="container">
        <div className="welcome__top">
          <Reveal className="welcome__media">
            <img
              src={welcomeImage}
              alt={t('welcome.imageAlt')}
              loading="lazy"
              decoding="async"
              width="1280"
              height="853"
            />
          </Reveal>
          <Reveal className="welcome__content" delay={120}>
            <p className="eyebrow">
              <FlowerIcon size={16} />
              <span>{t('welcome.eyebrow')}</span>
            </p>
            <h2 id="welcome-title" className="welcome__title">
              {t('welcome.title')}
            </h2>
            <p className="welcome__text">{t('welcome.text')}</p>
            <Link to="/about" className="text-link">
              <span>{t('welcome.link')}</span>
              <ArrowRight size={18} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>

        <ul className="features">
          {FEATURES.map(({ id, Icon }, index) => (
            <Reveal as="li" key={id} className="feature" delay={index * 110}>
              <span className="feature__icon" aria-hidden="true">
                <Icon size={24} />
              </span>
              <h3 className="feature__title">{t(`welcome.features.${id}.title`)}</h3>
              <p className="feature__text">{t(`welcome.features.${id}.text`)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
