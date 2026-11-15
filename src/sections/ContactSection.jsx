import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Phone } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import ContactForm from '../components/ContactForm.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import WhatsAppButton from '../components/WhatsAppButton.jsx';
import { PHONE_DISPLAY, PHONE_HREF, WHATSAPP_URL } from '../data/contacts';
import { SERVICE_IDS } from '../data/services';

export default function ContactSection() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  // Услуга, выбранная кнопкой «Заказать услугу» (/contact?service=<id>).
  const requestedService = searchParams.get('service');
  const serviceId = SERVICE_IDS.includes(requestedService) ? requestedService : null;

  return (
    <section className="section contact" aria-labelledby="contact-title">
      <div className="container">
        <SectionHeading
          as="h1"
          id="contact-title"
          eyebrow={t('contact.eyebrow')}
          title={t('contact.title')}
          subtitle={t('contact.subtitle')}
        />

        <div className="contact__grid">
          <Reveal className="contact__info card">
            <h2 className="card__title">{t('contact.infoTitle')}</h2>

            <ul className="contact__list">
              <li className="contact__item">
                <span className="contact__icon" aria-hidden="true">
                  <Phone size={20} />
                </span>
                <span>
                  <span className="contact__label">{t('contact.phoneLabel')}</span>
                  <a href={PHONE_HREF} className="contact__value">
                    {PHONE_DISPLAY}
                  </a>
                </span>
              </li>
              <li className="contact__item">
                <span className="contact__icon contact__icon--whatsapp" aria-hidden="true">
                  <FaWhatsapp size={21} />
                </span>
                <span>
                  <span className="contact__label">{t('contact.whatsappLabel')}</span>
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact__value"
                  >
                    {PHONE_DISPLAY}
                  </a>
                </span>
              </li>
            </ul>

            <WhatsAppButton className="contact__whatsapp" />
            <p className="contact__hint">{t('contact.whatsappHint')}</p>
          </Reveal>

          <Reveal className="contact__form card" delay={120}>
            <h2 className="card__title">{t('contact.form.title')}</h2>
            <ContactForm serviceId={serviceId} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
