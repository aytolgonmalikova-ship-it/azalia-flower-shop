import { useEffect, useId, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowDownUp, Check, ChevronDown, RotateCcw, SlidersHorizontal } from 'lucide-react';
import { PRODUCT_CATEGORIES, PRODUCT_COLORS, PRODUCT_SORTS } from '../data/products';

/*
 * Липкая панель каталога: остаётся под шапкой при прокрутке, поэтому раздел,
 * цвет и сортировку можно сменить из любого места списка.
 *  - вкладки разделов (одна активная или «Все») с количеством товаров;
 *  - кнопка «Цвет» раскрывает компактную строку цветов (можно выбрать несколько);
 *  - сортировка.
 * counts — { all, [category]: number } с учётом выбранных цветов.
 */
export default function CatalogToolbar({
  filters,
  sort,
  counts,
  onCategory,
  onToggleColor,
  onResetColors,
  onSort,
}) {
  const { t } = useTranslation();
  const panelId = useId();
  const tabsRef = useRef(null);
  const [colorsOpen, setColorsOpen] = useState(filters.colors.length > 0);
  const active = filters.categories.join(',');
  const colorCount = filters.colors.length;

  // Активная вкладка всегда видна в горизонтальной ленте (на телефоне лента прокручивается).
  useEffect(() => {
    const list = tabsRef.current;
    const tab = list?.querySelector('[aria-pressed="true"]');
    if (!list || !tab) return;
    const left = tab.offsetLeft - (list.clientWidth - tab.offsetWidth) / 2;
    list.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
  }, [active]);

  const tabs = [null, ...PRODUCT_CATEGORIES];

  return (
    <div className="catalog-bar">
      <div className="container catalog-bar__inner">
        <ul ref={tabsRef} className="catalog-tabs" aria-label={t('catalog.sectionsLabel')}>
          {tabs.map((category) => {
            const pressed = category
              ? filters.categories.includes(category)
              : filters.categories.length === 0;
            const count = category ? (counts[category] ?? 0) : counts.all;
            return (
              <li key={category ?? 'all'}>
                <button
                  type="button"
                  className={`catalog-tab${pressed ? ' is-active' : ''}`}
                  aria-pressed={pressed}
                  onClick={() => onCategory(category)}
                >
                  <span>{category ? t(`catalog.categories.${category}`) : t('catalog.all')}</span>
                  <span className="catalog-tab__count">{count}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div className="catalog-bar__tools">
          <button
            type="button"
            className={`catalog-tool${colorCount > 0 ? ' is-active' : ''}`}
            aria-expanded={colorsOpen}
            aria-controls={panelId}
            onClick={() => setColorsOpen((open) => !open)}
          >
            <SlidersHorizontal size={17} aria-hidden="true" />
            <span className="catalog-tool__text">{t('catalog.filters.color')}</span>
            {colorCount > 0 && <span className="catalog-tool__badge">{colorCount}</span>}
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`catalog-tool__chevron${colorsOpen ? ' is-open' : ''}`}
            />
          </button>

          <label className="catalog-sort">
            <ArrowDownUp size={17} aria-hidden="true" />
            <span className="visually-hidden">{t('catalog.sort.label')}</span>
            <select value={sort} onChange={(event) => onSort(event.target.value)}>
              {PRODUCT_SORTS.map((value) => (
                <option key={value} value={value}>
                  {t(`catalog.sort.${value}`)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div id={panelId} className="container catalog-bar__panel" hidden={!colorsOpen}>
        <ul className="catalog-colors" aria-label={t('catalog.filters.color')}>
          {PRODUCT_COLORS.map((value) => {
            const selected = filters.colors.includes(value);
            return (
              <li key={value}>
                <button
                  type="button"
                  className={`chip chip--sm${selected ? ' is-active' : ''}`}
                  aria-pressed={selected}
                  onClick={() => onToggleColor(value)}
                >
                  <span className={`color-dot color-dot--${value}`} aria-hidden="true" />
                  <span>{t(`catalog.colors.${value}`)}</span>
                  {selected && <Check size={14} strokeWidth={3} aria-hidden="true" />}
                </button>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              className="filters__reset"
              onClick={onResetColors}
              disabled={colorCount === 0}
            >
              <RotateCcw size={15} aria-hidden="true" />
              <span>{t('catalog.filters.anyColor')}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
}
