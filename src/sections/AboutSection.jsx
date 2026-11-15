import { useTranslation } from 'react-i18next';
import { Flower2, HandHeart, Heart, Leaf, Sparkles } from 'lucide-react';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import mainImage from '../assets/images/tulips-hands.jpg';
import rosesImage from '../assets/images/peach-roses.jpg';
import gerberaImage from '../assets/images/gerbera.jpg';

const VALUES = [
  { id: 'love', Icon: Heart },
  { id: 'individual', Icon: HandHeart },
  { id: 'author', Icon: Flower2 },
  { id: 'quality', Icon: Leaf },
  { id: 'care', Icon: Sparkles },
];

export default function AboutSection() {
  const { t } = useTranslation();

  return (
    <section className="section about" aria-labelledby="about-title">
      <div className="container">
        <SectionHeading
          as="h1"
          id="about-title"
          eyebrow={t('about.eyebrow')}
          title={t('about.title')}
        />

        <div className="about__intro">
          <Reveal className="about__collage">
            <img
              className="about__photo about__photo--main"
              src={mainImage}
              alt={t('about.images.main')}
              width="1200"
              height="1113"
            />
            <img
              className="about__photo about__photo--roses"
              src={rosesImage}
              alt={t('about.images.roses')}
              loading="lazy"
              decoding="async"
              width="1200"
              height="799"
            />
            <img
              className="about__photo about__photo--gerbera"
              src={gerberaImage}
              alt={t('about.images.gerbera')}
              loading="lazy"
              decoding="async"
              width="1200"
              height="799"
            />
          </Reveal>

          <Reveal className="about__story" delay={120}>
            <p className="about__lead">{t('about.lead')}</p>
            <blockquote className="about__quote">
              <p>{t('about.quote')}</p>
            </blockquote>
          </Reveal>
        </div>

        <ul className="values">
          {VALUES.map(({ id, Icon }, index) => (
            <Reveal as="li" key={id} className="value-card" delay={(index % 3) * 100}>
              <span className="value-card__icon" aria-hidden="true">
                <Icon size={24} />
              </span>
              <h2 className="value-card__title">{t(`about.values.${id}.title`)}</h2>
              <p className="value-card__text">{t(`about.values.${id}.text`)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
