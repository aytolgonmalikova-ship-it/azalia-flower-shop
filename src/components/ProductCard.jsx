import { useTranslation } from 'react-i18next';
import { Check, ShoppingBag } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import Button from './Button.jsx';
import FlowerIcon from './FlowerIcon.jsx';
import { useCart } from '../context/CartContext.jsx';
import { WHATSAPP_URL } from '../data/contacts';
import { isOnSale, productText } from '../data/products';

/*
 * Карточка товара: фотография, категория, название, описание, цена, кнопка «В корзину»
 * и быстрый заказ через WhatsApp. Если товара нет в наличии (inStock: false),
 * на фото появляется метка «Нет в наличии», а заказать его нельзя.
 * Метки «Хит», «Новинка» и размер скидки (oldPrice) — в левом верхнем углу фото.
 * На узких экранах (2 колонки) описание и цвет скрываются стилями, подпись кнопки сокращается.
 */
export default function ProductCard({ product, headingLevel: Heading = 'h3' }) {
  const { t, i18n } = useTranslation();
  const { add, quantityOf } = useCart();
  const { id, name, description, price, image, color, category, imagePosition } = product;
  const outOfStock = product.inStock === false;
  const inCart = quantityOf(id);

  const title = productText(t, name);
  const numberFormat = new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language);
  const priceLabel = t('catalog.price', { price: numberFormat.format(price) });
  const onSale = isOnSale(product);
  const discount = onSale ? Math.round((1 - price / product.oldPrice) * 100) : 0;
  const badges = [
    product.isHit && { id: 'hit', label: t('catalog.badges.hit') },
    product.isNew && { id: 'new', label: t('catalog.badges.new') },
    onSale && { id: 'sale', label: t('catalog.badges.sale', { percent: discount }) },
  ].filter(Boolean);
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
        {badges.length > 0 && (
          <ul className="product-card__badges">
            {badges.map(({ id: badge, label }) => (
              <li key={badge} className={`product-card__flag product-card__flag--${badge}`}>
                {label}
              </li>
            ))}
          </ul>
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
          <p className="product-card__price">
            <span>{priceLabel}</span>
            {onSale && (
              <s className="product-card__old-price">
                <span className="visually-hidden">{t('catalog.oldPriceLabel')} </span>
                {t('catalog.price', { price: numberFormat.format(product.oldPrice) })}
              </s>
            )}
          </p>
          {outOfStock ? (
            <Button variant="secondary" size="sm" className="product-card__action" disabled>
              {t('catalog.outOfStock')}
            </Button>
          ) : (
            <div className="product-card__actions">
              <Button
                variant="secondary"
                size="sm"
                icon={inCart > 0 ? <Check size={18} /> : <ShoppingBag size={18} />}
                className="product-card__action"
                aria-label={t('catalog.addToCartLabel', { name: title })}
                onClick={() => add(id)}
              >
                <span className="product-card__label-full">
                  {inCart > 0 ? t('catalog.inCart', { count: inCart }) : t('catalog.addToCart')}
                </span>
                <span className="product-card__label-short" aria-hidden="true">
                  {inCart > 0 ? t('catalog.inCartShort', { count: inCart }) : t('catalog.addToCartShort')}
                </span>
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
