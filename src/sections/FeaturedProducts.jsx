import { useId, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import Carousel from '../components/Carousel.jsx';
import ProductCard from '../components/ProductCard.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { pickShowcase, SHOWCASE_TABS } from '../data/products';
import { useProducts } from '../hooks/useProducts';

/*
 * Витрина на главной: вкладки «Хиты продаж», «Новинки», «Скидки» и одна горизонтальная
 * карусель вместо нескольких длинных блоков. Пустые подборки не показываются.
 */
export default function FeaturedProducts() {
  const { t } = useTranslation();
  const baseId = useId();
  const tabRefs = useRef({});
  const { products } = useProducts();

  const groups = useMemo(
    () =>
      SHOWCASE_TABS.map((tab) => ({ tab, items: pickShowcase(products, tab) })).filter(
        ({ items }) => items.length > 0,
      ),
    [products],
  );

  const [selected, setSelected] = useState(SHOWCASE_TABS[0]);
  const current = groups.find(({ tab }) => tab === selected) ?? groups[0];

  // Клавиатура по шаблону WAI-ARIA Tabs: стрелки, Home и End.
  const handleKeyDown = (event) => {
    const index = groups.findIndex(({ tab }) => tab === current.tab);
    const last = groups.length - 1;
    const next = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (next === undefined) return;
    event.preventDefault();
    const { tab } = groups[next];
    setSelected(tab);
    tabRefs.current[tab]?.focus();
  };

  if (!current) return null;

  const tabId = (tab) => `${baseId}-tab-${tab}`;
  const panelId = `${baseId}-panel`;

  return (
    <section className="section section--tight featured" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading
          id="featured-title"
          eyebrow={t('catalog.featured.eyebrow')}
          title={t('catalog.featured.title')}
        />

        <div className="showcase__bar">
          <div
            className="showcase__tabs"
            role="tablist"
            aria-label={t('catalog.featured.tabsLabel')}
            onKeyDown={handleKeyDown}
          >
            {groups.map(({ tab, items }) => {
              const active = tab === current.tab;
              return (
                <button
                  key={tab}
                  ref={(node) => {
                    tabRefs.current[tab] = node;
                  }}
                  type="button"
                  role="tab"
                  id={tabId(tab)}
                  aria-selected={active}
                  aria-controls={panelId}
                  tabIndex={active ? 0 : -1}
                  className={`catalog-tab${active ? ' is-active' : ''}`}
                  onClick={() => setSelected(tab)}
                >
                  <span>{t(`catalog.featured.tabs.${tab}`)}</span>
                  <span className="catalog-tab__count">{items.length}</span>
                </button>
              );
            })}
          </div>
          <Link to="/catalog" className="text-link showcase__all">
            <span>{t('catalog.featured.link')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>

        <div id={panelId} role="tabpanel" aria-labelledby={tabId(current.tab)}>
          <Carousel key={current.tab} label={t(`catalog.featured.tabs.${current.tab}`)}>
            {current.items.map((item) => (
              <li key={item.id} className="carousel__item catalog__item">
                <ProductCard product={item} />
              </li>
            ))}
          </Carousel>
        </div>
      </div>
    </section>
  );
}
