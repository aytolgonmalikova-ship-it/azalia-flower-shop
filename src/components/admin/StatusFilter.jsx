import { useTranslation } from 'react-i18next';

const ALL = 'all';

// Фильтр по статусу: чипы-лепестки, как в каталоге сайта, с количеством записей.
export default function StatusFilter({ label, statuses, translationPrefix, items, value, onChange }) {
  const { t } = useTranslation();

  const options = [
    { id: ALL, title: t('admin.common.all'), count: items.length },
    ...statuses.map((status) => ({
      id: status,
      title: t(`${translationPrefix}.${status}`),
      count: items.filter((entry) => entry.status === status).length,
    })),
  ];

  return (
    <div className="admin-filter" role="group" aria-label={label}>
      {options.map(({ id, title, count }) => (
        <button
          key={id}
          type="button"
          className={`chip${value === id ? ' is-active' : ''}`}
          aria-pressed={value === id}
          onClick={() => onChange(id)}
        >
          <span>{title}</span>
          <span className="admin-filter__count">{count}</span>
        </button>
      ))}
    </div>
  );
}
