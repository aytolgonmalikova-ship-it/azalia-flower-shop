import { useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import CatalogToolbar from '../components/CatalogToolbar.jsx';
import ProductCard from '../components/ProductCard.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { filterProducts, PRODUCT_CATEGORIES, sortProducts } from '../data/products';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';

/*
 * Каталог. Над списком — компактный заголовок с хлебными крошками и липкая панель
 * (разделы, цвет, сортировка), поэтому искать нужный раздел прокруткой не нужно.
 * Сетка: 2 колонки на телефоне, 3 на планшете, 4 на компьютере.
 */
export default function CatalogSection() {
  const { t } = useTranslation();
  const { filters, sort, toggle, setCategory, setSort, reset, resetColors, activeCount } =
    useProductFilters();
  // Товары из Firestore (пока они загружаются — локальный каталог), без скрытых.
  const { products: catalog } = useProducts();
  const listRef = useRef(null);

  const products = useMemo(
    () => sortProducts(filterProducts(catalog, filters), sort),
    [catalog, filters, sort],
  );

  // Количество во вкладках разделов — с учётом выбранных цветов.
  const counts = useMemo(() => {
    const byColor = filterProducts(catalog, { colors: filters.colors });
    const result = { all: byColor.length };
    PRODUCT_CATEGORIES.forEach((category) => {
      result[category] = byColor.filter((item) => item.category === category).length;
    });
    return result;
  }, [catalog, filters.colors]);

  // Если список уже прокручен под липкую панель, после смены раздела возвращаемся
  // к его началу (сразу под панелью).
  const scrollToList = () => {
    const list = listRef.current;
    const bar = list?.parentElement?.querySelector('.catalog-bar');
    if (!list || !bar) return;
    const barBottom = bar.getBoundingClientRect().bottom;
    const listTop = list.getBoundingClientRect().top;
    if (listTop >= barBottom) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({
      top: window.scrollY + listTop - barBottom,
      behavior: reduce ? 'auto' : 'smooth',
    });
  };

  const handleCategory = (category) => {
    setCategory(category);
    scrollToList();
  };

  const activeCategory = filters.categories.length === 1 ? filters.categories[0] : null;

  return (
    <section className="section catalog" aria-labelledby="catalog-title">
      <div className="container catalog__head">
        <Breadcrumbs
          items={[
            { label: t('nav.home'), to: '/' },
            { label: t('nav.catalog'), to: activeCategory ? '/catalog' : undefined },
            activeCategory && { label: t(`catalog.categories.${activeCategory}`) },
          ]}
        />
        <h1 id="catalog-title" className="catalog__title">
          {activeCategory ? t(`catalog.categories.${activeCategory}`) : t('catalog.title')}
        </h1>
        <p className="catalog__subtitle">{t('catalog.subtitle')}</p>
      </div>

      <CatalogToolbar
        filters={filters}
        sort={sort}
        counts={counts}
        onCategory={handleCategory}
        onToggleColor={(value) => toggle('colors', value)}
        onResetColors={resetColors}
        onSort={setSort}
      />

      <div ref={listRef} className="container catalog__list">
        <p className="catalog__count" role="status" aria-live="polite">
          {t('catalog.found', { count: products.length })}
          {activeCount > 0 && (
            <button type="button" className="catalog__count-reset" onClick={reset}>
              {t('catalog.filters.reset')}
            </button>
          )}
        </p>

        {products.length === 0 ? (
          <StatusMessage
            title={t('catalog.emptyTitle')}
            text={t('catalog.emptyText')}
            actionLabel={t('catalog.filters.reset')}
            onAction={reset}
          />
        ) : (
          <ul className="catalog__grid">
            {products.map((item) => (
              <li key={item.id} className="catalog__item">
                <ProductCard product={item} headingLevel="h2" />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
