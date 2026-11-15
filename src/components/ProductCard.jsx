import { useTranslation } from 'react-i18next';
import { ShoppingBag } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import Button from './Button.jsx';
import FlowerIcon from './FlowerIcon.jsx';
import { useCart } from '../context/CartContext.jsx';
import { WHATSAPP_URL } from '../data/contacts';
import { productText } from '../data/products';

/*
 * Карточка товара: фотография, категория, название, описание, цена, кнопка «В корзину»
 * и быстрый заказ через WhatsApp. Если товара нет в наличии (inStock: false),
 * на фото появляется метка «Нет в наличии», а заказать его нельзя.
 */
export default function ProductCard({ product, headingLevel: Heading = 'h3' }) {
  const { t, i18n } = useTranslation();
  const { add, quantityOf } = useCart();
  const { id, name, description, price, image, color, category, imagePosition } = product;
  const outOfStock = product.inStock === false;
  const inCart = quantityOf(id);

  const title = productText(t, name);
  const priceLabel = t('catalog.price', {
    price: new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language).format(price),
  });
  const orderUrl = `${WHATSAPP_URL}?text=${encodeURIComponent(
    t('catalog.orderMessage', { name: title, price: priceLabel }),
  )}`;

  return (
    <article className={`product-card${outOfStock ? ' product-card--out' : ''}`}>
      <div className="product-card__media">
        {image ? (
          <img
            src={image}
            alt={title}
            loading="lazy"
            decoding="async"
            width="600"
            height="600"
            style={imagePosition ? { objectPosition: imagePosition } : undefined}
          />
        ) : (
          <span className="product-card__placeholder" aria-hidden="true">
            <FlowerIcon size={64} />
          </span>
        )}
        {outOfStock && <span className="product-card__badge">{t('catalog.outOfStock')}</span>}
        <span className="product-card__tag">{t(`catalog.categories.${category}`)}</span>
      </div>
      <div className="product-card__body">
        <Heading className="product-card__title">{title}</Heading>
        <p className="product-card__text">{productText(t, description)}</p>
        <p className="product-card__color">
          <span className={`color-dot color-dot--${color}`} aria-hidden="true" />
          {t(`catalog.colors.${color}`)}
        </p>
        <div className="product-card__footer">
          <p className="product-card__price">{priceLabel}</p>
          {outOfStock ? (
            <Button variant="secondary" size="sm" className="product-card__action" disabled>
              {t('catalog.outOfStock')}
            </Button>
          ) : (
            <div className="product-card__actions">
              <Button
                variant="secondary"
                size="sm"
                icon={<ShoppingBag size={18} />}
                className="product-card__action"
                aria-label={t('catalog.addToCartLabel', { name: title })}
                onClick={() => add(id)}
              >
                {inCart > 0 ? t('catalog.inCart', { count: inCart }) : t('catalog.addToCart')}
              </Button>
              <a
                href={orderUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="product-card__whatsapp"
                aria-label={t('catalog.orderLabel', { name: title })}
                title={t('catalog.order')}
              >
                <FaWhatsapp size={20} aria-hidden="true" />
              </a>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
