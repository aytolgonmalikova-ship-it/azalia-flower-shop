import { useTranslation } from 'react-i18next';
import { Check, RotateCcw } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS } from '../data/products';

function FilterGroup({ group, title, options, selected, onToggle, renderLabel, withDots = false }) {
  return (
    <div className="filters__group" role="group" aria-label={title}>
      <p className="filters__title" aria-hidden="true">
        {title}
      </p>
      <ul className="filters__list">
        {options.map((value) => {
          const active = selected.includes(value);
          return (
            <li key={value}>
              <button
                type="button"
                className={`chip${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => onToggle(group, value)}
              >
                {withDots && <span className={`color-dot color-dot--${value}`} aria-hidden="true" />}
                <span>{renderLabel(value)}</span>
                {active && <Check size={15} strokeWidth={3} aria-hidden="true" />}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

// Фильтры каталога: в каждой группе можно отметить несколько значений сразу.
export default function ProductFilters({ filters, onToggle, onReset, activeCount }) {
  const { t } = useTranslation();

  return (
    <div className="filters">
      <FilterGroup
        group="colors"
        title={t('catalog.filters.color')}
        options={PRODUCT_COLORS}
        selected={filters.colors}
        onToggle={onToggle}
        renderLabel={(value) => t(`catalog.colors.${value}`)}
        withDots
      />
      <FilterGroup
        group="categories"
        title={t('catalog.filters.category')}
        options={PRODUCT_CATEGORIES}
        selected={filters.categories}
        onToggle={onToggle}
        renderLabel={(value) => t(`catalog.categories.${value}`)}
      />
      <div className="filters__actions">
        <button
          type="button"
          className="filters__reset"
          onClick={onReset}
          disabled={activeCount === 0}
        >
          <RotateCcw size={16} aria-hidden="true" />
          <span>{t('catalog.filters.reset')}</span>
        </button>
      </div>
    </div>
  );
}
