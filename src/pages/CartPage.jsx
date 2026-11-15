import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CircleAlert,
  CircleCheck,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  Send,
  Store,
  Trash2,
  Truck,
} from 'lucide-react';
import Button from '../components/Button.jsx';
import FlowerIcon from '../components/FlowerIcon.jsx';
import FormField from '../components/FormField.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { productText } from '../data/products';
import { useProducts } from '../hooks/useProducts';
import {
  ORDER_ADDRESS_MAX,
  ORDER_ADDRESS_MIN,
  ORDER_COMMENT_MAX,
  ORDER_NAME_MAX,
  ORDER_NAME_MIN,
  ORDER_PHONE_MAX,
  ORDER_PHONE_MIN_DIGITS,
  ORDER_QUANTITY_MAX,
  createOrder,
  deliveryCost,
} from '../services/orders';
import { PHONE_COUNTRY_CODE } from '../utils/validation';

const ERRORS = 'cart.form.errors';
const FIELD_ORDER = ['name', 'phone', 'address', 'comment'];
const DELIVERY_OPTIONS = [
  { value: 'delivery', icon: Truck },
  { value: 'pickup', icon: Store },
];

function validate(values, deliveryType) {
  const errors = {};
  const name = values.name.trim();
  const phone = values.phone.trim();
  const address = values.address.trim();

  if (!name) errors.name = { key: `${ERRORS}.nameRequired` };
  else if (name.length < ORDER_NAME_MIN) {
    errors.name = { key: `${ERRORS}.nameShort`, params: { min: ORDER_NAME_MIN } };
  }

  // Пустым считается и поле, где остался только код страны.
  const digits = phone.replace(/\D/g, '');
  if (!digits || phone === PHONE_COUNTRY_CODE) errors.phone = { key: `${ERRORS}.phoneRequired` };
  else if (digits.length < ORDER_PHONE_MIN_DIGITS) errors.phone = { key: `${ERRORS}.phoneInvalid` };

  // При самовывозе поле адреса скрыто и не проверяется.
  if (deliveryType === 'pickup') return errors;

  if (!address) errors.address = { key: `${ERRORS}.addressRequired` };
  else if (address.length < ORDER_ADDRESS_MIN) {
    errors.address = { key: `${ERRORS}.addressShort`, params: { min: ORDER_ADDRESS_MIN } };
  }
  return errors;
}

/*
 * Корзина и оформление заказа (/cart). Заказ сохраняется в Firestore, коллекция orders
 * (services/orders.js), и сразу появляется в админ-панели со статусом «Новый».
 */
export default function CartPage() {
  const { t, i18n } = useTranslation();
  const { user } = useAuth();
  const { items, setQuantity, remove, clear } = useCart();
  const { products, status: productsStatus } = useProducts();
  const formRef = useRef(null);
  const [values, setValues] = useState(() => ({
    name: user?.displayName?.trim() ?? '',
    phone: `${PHONE_COUNTRY_CODE} `,
    address: '',
    comment: '',
  }));
  // deliveryType: 'delivery' — курьерская доставка, 'pickup' — самовывоз.
  const [deliveryType, setDeliveryType] = useState('delivery');
  const [errors, setErrors] = useState({});
  // status: 'idle' | 'loading' | 'error'; placed — номер оформленного заказа.
  const [status, setStatus] = useState('idle');
  const [placed, setPlaced] = useState(null);

  const isSubmitting = status === 'loading';
  // Пока каталог загружается из Firestore, цены могут быть неактуальными.
  const catalogLoading = productsStatus === 'idle' || productsStatus === 'loading';

  const numberFormat = new Intl.NumberFormat(i18n.resolvedLanguage ?? i18n.language);
  const price = (value) => t('catalog.price', { price: numberFormat.format(value) });

  // Позиции корзины с актуальными данными товара. Товар мог быть удалён, скрыт
  // или закончиться после того, как его положили в корзину: такой в заказ не войдёт.
  const lines = items.map(({ productId, quantity }) => {
    const product = products.find((item) => item.id === productId);
    return { productId, quantity, product, available: Boolean(product?.inStock) };
  });
  const orderLines = lines.filter((line) => line.available);
  const subtotal = orderLines.reduce((sum, line) => sum + line.product.price * line.quantity, 0);
  const isPickup = deliveryType === 'pickup';
  const delivery = deliveryCost(deliveryType);
  const total = subtotal + delivery;
  const hasUnavailable = !catalogLoading && orderLines.length < lines.length;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (errors[name]) setErrors(({ [name]: _removed, ...rest }) => rest);
    if (status === 'error') setStatus('idle');
  };

  const handleDeliveryChange = (event) => {
    setDeliveryType(event.target.value);
    if (errors.address) setErrors(({ address: _removed, ...rest }) => rest);
    if (status === 'error') setStatus('idle');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (isSubmitting || catalogLoading || orderLines.length === 0) return;

    const validationErrors = validate(values, deliveryType);
    setErrors(validationErrors);
    const firstInvalid = FIELD_ORDER.find((name) => validationErrors[name]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setStatus('loading');
    try {
      const order = await createOrder({
        items: orderLines.map(({ product, quantity }) => ({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity,
        })),
        customer: { name: values.name, phone: values.phone, address: values.address },
        deliveryType,
        comment: values.comment,
        userId: user?.uid ?? null,
        email: user?.email ?? '',
      });
      clear();
      setPlaced(order.number);
      setStatus('idle');
    } catch {
      setStatus('error');
    }
  };

  const fieldProps = (name) => ({
    id: `order-${name}`,
    name,
    value: values[name],
    error: errors[name],
    onChange: handleChange,
    disabled: isSubmitting,
  });

  let content;
  if (placed) {
    content = (
      <div className="card cart__result">
        <div className="form-result" role="status">
          <span className="form-result__icon" aria-hidden="true">
            <CircleCheck size={34} />
          </span>
          <h2 className="form-result__title">{t('cart.success.title')}</h2>
          <p className="form-result__text">{t('cart.success.text', { number: placed })}</p>
          <Button to="/catalog" variant="secondary" size="sm">
            {t('cart.toCatalog')}
          </Button>
        </div>
      </div>
    );
  } else if (items.length === 0) {
    content = (
      <div className="cart__empty">
        <StatusMessage title={t('cart.emptyTitle')} text={t('cart.emptyText')} />
        <Button to="/catalog">{t('cart.toCatalog')}</Button>
      </div>
    );
  } else {
    content = (
      <div className="cart__grid">
        <section className="card cart__items" aria-labelledby="cart-items-title">
          <h2 id="cart-items-title" className="card__title">
            {t('cart.itemsTitle')}
          </h2>

          <ul className="cart-list">
            {lines.map(({ productId, quantity, product, available }) => {
              const title = product ? productText(t, product.name) : t('cart.removedProduct');
              const unavailable = !available && !catalogLoading;
              return (
                <li
                  key={productId}
                  className={`cart-line${unavailable ? ' cart-line--unavailable' : ''}`}
                >
                  {product?.image ? (
                    <img
                      className="cart-line__thumb"
                      src={product.image}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      width="72"
                      height="72"
                      style={
                        product.imagePosition ? { objectPosition: product.imagePosition } : undefined
                      }
                    />
                  ) : (
                    <span className="cart-line__thumb cart-line__thumb--empty" aria-hidden="true">
                      <FlowerIcon size={28} />
                    </span>
                  )}

                  <div className="cart-line__info">
                    <p className="cart-line__title">{title}</p>
                    {unavailable ? (
                      <p className="cart-line__note">{t('cart.unavailable')}</p>
                    ) : (
                      product && <p className="cart-line__price">{price(product.price)}</p>
                    )}
                  </div>

                  {available && (
                    <div
                      className="cart-qty"
                      role="group"
                      aria-label={t('cart.quantityLabel', { name: title })}
                    >
                      <button
                        type="button"
                        className="cart-qty__btn"
                        aria-label={t('cart.decrease')}
                        disabled={quantity <= 1 || isSubmitting}
                        onClick={() => setQuantity(productId, quantity - 1)}
                      >
                        <Minus size={16} />
                      </button>
                      <span className="cart-qty__value" aria-live="polite">
                        {quantity}
                      </span>
                      <button
                        type="button"
                        className="cart-qty__btn"
                        aria-label={t('cart.increase')}
                        disabled={quantity >= ORDER_QUANTITY_MAX || isSubmitting}
                        onClick={() => setQuantity(productId, quantity + 1)}
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  )}

                  {available && (
                    <strong className="cart-line__total">{price(product.price * quantity)}</strong>
                  )}

                  <button
                    type="button"
                    className="cart-line__remove"
                    aria-label={t('cart.removeLabel', { name: title })}
                    title={t('cart.remove')}
                    disabled={isSubmitting}
                    onClick={() => remove(productId)}
                  >
                    <Trash2 size={18} />
                  </button>
                </li>
              );
            })}
          </ul>

          {hasUnavailable && <p className="cart__notice">{t('cart.unavailableNote')}</p>}

          <dl className="cart__summary">
            <div>
              <dt>{t('cart.subtotal')}</dt>
              <dd>{price(subtotal)}</dd>
            </div>
            <div>
              <dt>{t(isPickup ? 'cart.pickupCost' : 'cart.deliveryCost')}</dt>
              <dd>{delivery > 0 ? price(delivery) : t('cart.free')}</dd>
            </div>
          </dl>

          <p className="cart__total">
            <span>{t('cart.total')}</span>
            <strong>{price(total)}</strong>
          </p>
        </section>

        <section className="card cart__checkout" aria-labelledby="cart-checkout-title">
          <h2 id="cart-checkout-title" className="card__title">
            {t('cart.form.title')}
          </h2>

          <form ref={formRef} className="contact-form" onSubmit={handleSubmit} noValidate>
            <FormField
              {...fieldProps('name')}
              label={t('cart.form.name')}
              placeholder={t('cart.form.namePlaceholder')}
              type="text"
              autoComplete="name"
              maxLength={ORDER_NAME_MAX}
            />
            <FormField
              {...fieldProps('phone')}
              label={t('cart.form.phone')}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              maxLength={ORDER_PHONE_MAX}
            />

            <fieldset className="delivery-choice" disabled={isSubmitting}>
              <legend className="field__label">{t('cart.form.deliveryType')}</legend>
              <div className="delivery-choice__options">
                {DELIVERY_OPTIONS.map(({ value, icon: Icon }) => (
                  <label key={value} className="delivery-option">
                    <input
                      type="radio"
                      name="deliveryType"
                      className="delivery-option__input"
                      value={value}
                      checked={deliveryType === value}
                      onChange={handleDeliveryChange}
                    />
                    <span className="delivery-option__card">
                      <Icon size={24} aria-hidden="true" />
                      <span className="delivery-option__text">
                        <span className="delivery-option__title">{t(`cart.form.${value}`)}</span>
                        <span className="delivery-option__hint">
                          {t(`cart.form.${value}Hint`)}
                        </span>
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {isPickup ? (
              <p className="delivery-pickup">
                <MapPin size={20} aria-hidden="true" />
                <span>{t('cart.form.pickupNote')}</span>
              </p>
            ) : (
              <FormField
                {...fieldProps('address')}
                label={t('cart.form.address')}
                placeholder={t('cart.form.addressPlaceholder')}
                type="text"
                autoComplete="street-address"
                maxLength={ORDER_ADDRESS_MAX}
              />
            )}
            <FormField
              {...fieldProps('comment')}
              label={t('cart.form.comment')}
              placeholder={t('cart.form.commentPlaceholder')}
              required={false}
              multiline
              rows={3}
              maxLength={ORDER_COMMENT_MAX}
            />

            {status === 'error' && (
              <div className="form-alert" role="alert">
                <CircleAlert size={22} aria-hidden="true" />
                <div>
                  <p className="form-alert__title">{t('cart.form.errorTitle')}</p>
                  <p>{t('cart.form.errorText')}</p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="contact-form__submit"
              disabled={isSubmitting || catalogLoading || orderLines.length === 0}
              aria-busy={isSubmitting}
              icon={
                isSubmitting ? <LoaderCircle size={19} className="spinner" /> : <Send size={18} />
              }
            >
              {isSubmitting
                ? t('cart.form.submitting')
                : t('cart.form.submit', { total: price(total) })}
            </Button>
          </form>
        </section>
      </div>
    );
  }

  return (
    <section className="section cart" aria-labelledby="cart-title">
      <div className="container">
        <SectionHeading
          as="h1"
          id="cart-title"
          eyebrow={t('cart.eyebrow')}
          title={t('cart.title')}
          subtitle={placed || items.length === 0 ? undefined : t('cart.subtitle')}
        />
        {content}
      </div>
    </section>
  );
}
