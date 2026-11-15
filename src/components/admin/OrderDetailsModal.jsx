import { useTranslation } from 'react-i18next';
import { MapPin, MessageCircle, Phone, User } from 'lucide-react';
import Button from '../Button.jsx';
import Modal from './Modal.jsx';
import OrderStatusSelect from './OrderStatusSelect.jsx';
import { getOrderTotal, useAdminFormat } from '../../hooks/useAdminFormat';

// Полная информация о заказе: клиент, состав, сумма и смена статуса.
export default function OrderDetailsModal({ order, onClose }) {
  const { t } = useTranslation();
  const { text, price, dateTime } = useAdminFormat();
  const { customer } = order;

  const facts = [
    { icon: User, label: t('admin.orders.customer'), value: customer.name || '—' },
    {
      icon: Phone,
      label: t('admin.orders.phone'),
      value: customer.phone || '—',
      href: customer.phone ? `tel:${customer.phone.replace(/[^\d+]/g, '')}` : undefined,
    },
    { icon: MapPin, label: t('admin.orders.address'), value: customer.address || '—' },
    {
      icon: MessageCircle,
      label: t('admin.orders.comment'),
      value: order.comment || t('admin.orders.noComment'),
    },
  ];

  return (
    <Modal title={t('admin.orders.detailsTitle', { id: order.number })} onClose={onClose}>
      <div className="admin-modal__body admin-order">
        <div className="admin-order__meta">
          <span className="admin-muted">{dateTime(order.createdAt)}</span>
          <OrderStatusSelect order={order} />
        </div>

        <dl className="admin-facts">
          {facts.map(({ icon: Icon, label, value, href }) => (
            <div key={label} className="admin-facts__item">
              <span className="admin-facts__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <div>
                <dt>{label}</dt>
                <dd>{href ? <a href={href}>{value}</a> : value}</dd>
              </div>
            </div>
          ))}
        </dl>

        <section aria-labelledby="order-composition">
          <h3 id="order-composition" className="admin-order__heading">
            {t('admin.orders.composition')}
          </h3>
          <ul className="admin-order__items">
            {order.items.map((item, index) => (
              <li key={`${item.productId}-${index}`} className="admin-order__item">
                <span>{text(item.name)}</span>
                <span className="admin-muted">
                  {item.quantity} × {price(item.price)}
                </span>
                <strong>{price(item.price * item.quantity)}</strong>
              </li>
            ))}
          </ul>
          <p className="admin-order__total">
            <span>{t('admin.orders.total')}</span>
            <strong>{price(getOrderTotal(order))}</strong>
          </p>
        </section>
      </div>
      <div className="admin-modal__footer">
        <Button variant="secondary" size="sm" onClick={onClose}>
          {t('admin.common.close')}
        </Button>
      </div>
    </Modal>
  );
}
