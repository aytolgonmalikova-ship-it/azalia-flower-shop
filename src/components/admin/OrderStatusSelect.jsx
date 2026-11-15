import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoaderCircle } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext.jsx';
import { ORDER_STATUSES } from '../../data/admin';

/*
 * Компактный список для смены статуса заказа; цвет точки соответствует статусу.
 * Новый статус сразу записывается в Firestore: пока идёт запрос, вместо точки
 * показан индикатор сохранения, а список заблокирован. При ошибке статус не меняется.
 */
export default function OrderStatusSelect({ order }) {
  const { t } = useTranslation();
  const { setOrderStatus, notify } = useAdmin();
  const [saving, setSaving] = useState(false);

  const handleChange = async (event) => {
    const status = event.target.value;
    if (saving || status === order.status) return;
    setSaving(true);
    try {
      await setOrderStatus(order.id, status);
      notify(t('admin.orders.toast.statusChanged', { id: order.number }));
    } catch (error) {
      notify(
        t(
          error?.code === 'permission-denied'
            ? 'admin.orders.toast.denied'
            : 'admin.orders.toast.error',
        ),
        'error',
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <span
      className={`admin-status-select admin-badge--${order.status}${saving ? ' is-saving' : ''}`}
      aria-busy={saving}
    >
      {saving ? (
        <LoaderCircle size={14} className="spinner" aria-hidden="true" />
      ) : (
        <span className="admin-badge__dot" aria-hidden="true" />
      )}
      <select
        className="admin-status-select__control"
        value={order.status}
        disabled={saving}
        aria-label={t('admin.orders.statusLabel', { id: order.number })}
        onChange={handleChange}
      >
        {ORDER_STATUSES.map((status) => (
          <option key={status} value={status}>
            {t(`admin.orders.statuses.${status}`)}
          </option>
        ))}
      </select>
      {saving && <span className="visually-hidden">{t('admin.common.saving')}</span>}
    </span>
  );
}
