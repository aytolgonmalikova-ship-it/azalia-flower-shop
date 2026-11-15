import { useTranslation } from 'react-i18next';
import Button from './Button.jsx';

export default function ServiceCard({ service, headingLevel: Heading = 'h3' }) {
  const { t } = useTranslation();
  const { id, image } = service;

  return (
    <article className="service-card">
      <div className="service-card__media">
        <img
          src={image}
          alt={t(`services.items.${id}.imageAlt`)}
          loading="lazy"
          decoding="async"
          width="600"
          height="450"
        />
      </div>
      <div className="service-card__body">
        <Heading className="service-card__title">{t(`services.items.${id}.title`)}</Heading>
        <p className="service-card__text">{t(`services.items.${id}.description`)}</p>
        <Button
          to={`/contact?service=${id}`}
          variant="secondary"
          size="sm"
          className="service-card__action"
        >
          {t('services.order')}
        </Button>
      </div>
    </article>
  );
}
