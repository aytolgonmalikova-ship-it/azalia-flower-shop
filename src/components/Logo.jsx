import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import FlowerIcon from './FlowerIcon.jsx';

export default function Logo({ onClick }) {
  const { t } = useTranslation();

  return (
    <Link to="/" className="logo" aria-label={t('brand.homeLink')} onClick={onClick}>
      <span className="logo__mark">
        <FlowerIcon size={30} />
      </span>
      <span className="logo__text">
        <span className="logo__name">{t('brand.name')}</span>
        <span className="logo__caption">{t('brand.caption')}</span>
      </span>
    </Link>
  );
}
