import { useTranslation } from 'react-i18next';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';

export default function CtaBanner() {
  const { t } = useTranslation();

  return (
    <section className="section cta" aria-labelledby="cta-title">
      <div className="container">
        <Reveal className="cta__card">
          <FlowerIcon className="cta__flower cta__flower--left" size={120} />
          <FlowerIcon className="cta__flower cta__flower--right" size={90} />
          <h2 id="cta-title" className="cta__title">
            {t('cta.title')}
          </h2>
          <p className="cta__text">{t('cta.text')}</p>
          <div className="cta__actions">
            <Button to="/contact">{t('cta.button')}</Button>
            <WhatsAppButton />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
