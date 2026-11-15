import { useTranslation } from 'react-i18next';
import Button from '../components/Button.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';

export default function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <section className="section not-found" aria-labelledby="not-found-title">
      <div className="container not-found__inner">
        <FlowerIcon size={72} className="not-found__flower" />
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 id="not-found-title" className="not-found__title">
          {t('notFound.title')}
        </h1>
        <p className="not-found__text">{t('notFound.text')}</p>
        <Button to="/">{t('notFound.back')}</Button>
      </div>
    </section>
  );
}
