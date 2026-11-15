import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import ProductCard from '../components/ProductCard.jsx';
import ProductFilters from '../components/ProductFilters.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { filterProducts } from '../data/products';
import { useProductFilters } from '../hooks/useProductFilters';
import { useProducts } from '../hooks/useProducts';

export default function CatalogSection() {
  const { t } = useTranslation();
  const { filters, toggle, reset, activeCount } = useProductFilters();
  // Товары из Firestore (пока они загружаются — локальный каталог), без скрытых.
  const { products: catalog } = useProducts();
  const products = useMemo(() => filterProducts(catalog, filters), [catalog, filters]);

  return (
    <section className="section catalog" aria-labelledby="catalog-title">
      <div className="container">
        <SectionHeading
          as="h1"
          id="catalog-title"
          eyebrow={t('catalog.eyebrow')}
          title={t('catalog.title')}
          subtitle={t('catalog.subtitle')}
        />

        <ProductFilters
          filters={filters}
          onToggle={toggle}
          onReset={reset}
          activeCount={activeCount}
        />

        <p className="catalog__count" role="status" aria-live="polite">
          {t('catalog.found', { count: products.length })}
          {activeCount > 0 && (
            <span className="catalog__count-note">
              {' '}
              · {t('catalog.filters.active', { count: activeCount })}
            </span>
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
