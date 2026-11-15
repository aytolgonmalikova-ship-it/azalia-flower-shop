import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import Reveal from '../components/Reveal.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import { FEATURED_PRODUCT_IDS } from '../data/products';
import { useProducts } from '../hooks/useProducts';

// Избранные товары; если часть из них удалена или скрыта, блок дополняется
// первыми товарами каталога.
function pickFeatured(products) {
  const featured = FEATURED_PRODUCT_IDS.map((id) => products.find((item) => item.id === id)).filter(
    Boolean,
  );
  const rest = products.filter((item) => !featured.includes(item));
  return [...featured, ...rest].slice(0, FEATURED_PRODUCT_IDS.length);
}

// Короткая витрина каталога на главной странице.
export default function FeaturedProducts() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const featured = useMemo(() => pickFeatured(products), [products]);

  return (
    <section className="section featured" aria-labelledby="featured-title">
      <div className="container">
        <SectionHeading
          id="featured-title"
          eyebrow={t('catalog.featured.eyebrow')}
          title={t('catalog.featured.title')}
          subtitle={t('catalog.featured.subtitle')}
        />

        <ul className="catalog__grid catalog__grid--featured">
          {featured.map((item, index) => (
            <Reveal as="li" key={item.id} className="catalog__item" delay={(index % 4) * 90}>
              <ProductCard product={item} />
            </Reveal>
          ))}
        </ul>

        <p className="featured__more">
          <Link to="/catalog" className="text-link">
            <span>{t('catalog.featured.link')}</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </p>
      </div>
    </section>
  );
}
