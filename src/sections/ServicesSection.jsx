import { useTranslation } from 'react-i18next';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import ServiceCard from '../components/ServiceCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useServices } from '../hooks/useServices';

const SKELETON_COUNT = 4;

// titleAs="h1" — когда секция является главным содержимым страницы.
export default function ServicesSection({ titleAs = 'h2' }) {
  const { t } = useTranslation();
  const { status, services, reload } = useServices();
  const cardHeading = titleAs === 'h1' ? 'h2' : 'h3';

  return (
    <section id="services" className="section services" aria-labelledby="services-title">
      <div className="container">
        <SectionHeading
          as={titleAs}
          id="services-title"
          eyebrow={t('services.eyebrow')}
          title={t('services.title')}
          subtitle={t('services.subtitle')}
        />

        {status === 'loading' && (
          <div className="services__grid" role="status" aria-busy="true">
            <span className="visually-hidden">{t('services.loading')}</span>
            {Array.from({ length: SKELETON_COUNT }, (_, index) => (
              <div key={index} className="service-card service-card--skeleton" aria-hidden="true">
                <div className="service-card__media skeleton" />
                <div className="service-card__body">
                  <span className="skeleton skeleton--title" />
                  <span className="skeleton skeleton--line" />
                  <span className="skeleton skeleton--line skeleton--short" />
                  <span className="skeleton skeleton--button" />
                </div>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && (
          <StatusMessage
            type="error"
            title={t('services.errorTitle')}
            text={t('services.errorText')}
            actionLabel={t('services.retry')}
            onAction={reload}
          />
        )}

        {status === 'success' && services.length === 0 && (
          <StatusMessage title={t('services.emptyTitle')} text={t('services.emptyText')} />
        )}

        {status === 'success' && services.length > 0 && (
          <ul className="services__grid">
            {services.map((service, index) => (
              <Reveal as="li" key={service.id} delay={(index % 2) * 120}>
                <ServiceCard service={service} headingLevel={cardHeading} />
              </Reveal>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
