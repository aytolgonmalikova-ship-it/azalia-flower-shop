import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight } from 'lucide-react';

/*
 * Хлебные крошки: items = [{ label, to? }]. Последний пункт — текущая страница (без ссылки).
 */
export default function Breadcrumbs({ items }) {
  const { t } = useTranslation();
  const list = items.filter(Boolean);

  return (
    <nav className="breadcrumbs" aria-label={t('common.breadcrumbs')}>
      <ol className="breadcrumbs__list">
        {list.map(({ label, to }, index) => {
          const current = index === list.length - 1;
          return (
            <li key={`${index}-${label}`} className="breadcrumbs__item">
              {current || !to ? (
                <span aria-current={current ? 'page' : undefined}>{label}</span>
              ) : (
                <Link to={to} className="breadcrumbs__link">
                  {label}
                </Link>
              )}
              {!current && <ChevronRight size={14} aria-hidden="true" className="breadcrumbs__sep" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
