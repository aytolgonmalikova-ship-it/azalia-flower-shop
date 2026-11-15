import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Eye, LoaderCircle, RefreshCw } from 'lucide-react';
import StatusMessage from '../../components/StatusMessage.jsx';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal.jsx';
import OrderStatusSelect from '../../components/admin/OrderStatusSelect.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import StatusFilter from '../../components/admin/StatusFilter.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { ORDER_STATUSES } from '../../data/admin';
import { getOrderItemsCount, getOrderTotal, useAdminFormat } from '../../hooks/useAdminFormat';

const ALL = 'all';

export default function AdminOrdersPage() {
  const { t } = useTranslation();
  const { text, price, dateTime } = useAdminFormat();
  const { orders, ordersStatus, ordersError, reloadOrders } = useAdmin();
  const [status, setStatus] = useState(ALL);
  const [openedId, setOpenedId] = useState(null);
  const isLoading = ordersStatus === 'loading' || ordersStatus === 'idle';
  const denied = ordersError === 'denied';

  const visible = status === ALL ? orders : orders.filter((order) => order.status === status);
  // Берём заказ из актуального списка, чтобы в окне сразу был виден новый статус.
  const opened = orders.find((order) => order.id === openedId);

  return (
    <>
      <PageHeader title={t('admin.orders.title')} subtitle={t('admin.orders.subtitle')}>
        <button type="button" className="admin-action" disabled={isLoading} onClick={reloadOrders}>
          {isLoading ? (
            <LoaderCircle size={16} className="spinner" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          {t('admin.common.refresh')}
        </button>
      </PageHeader>

      <StatusFilter
        label={t('admin.orders.filterLabel')}
        statuses={ORDER_STATUSES}
        translationPrefix="admin.orders.statuses"
        items={orders}
        value={status}
        onChange={setStatus}
      />

      {ordersStatus === 'error' ? (
        <StatusMessage
          type="error"
          title={t(denied ? 'admin.orders.deniedTitle' : 'admin.orders.loadErrorTitle')}
          text={t(denied ? 'admin.orders.deniedText' : 'admin.orders.loadErrorText')}
          actionLabel={t('admin.common.retry')}
          onAction={reloadOrders}
        />
      ) : isLoading && orders.length === 0 ? (
        <p className="admin-loading" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('admin.common.loading')}</span>
        </p>
      ) : visible.length === 0 ? (
        <StatusMessage title={t('admin.orders.emptyTitle')} text={t('admin.orders.emptyText')} />
      ) : (
        <div className="admin-panel">
          <table className="admin-table">
            <thead>
              <tr>
                <th scope="col">{t('admin.orders.columns.number')}</th>
                <th scope="col">{t('admin.orders.columns.customer')}</th>
                <th scope="col">{t('admin.orders.columns.items')}</th>
                <th scope="col">{t('admin.orders.columns.total')}</th>
                <th scope="col">{t('admin.common.status')}</th>
                <th scope="col" className="admin-table__actions-head">
                  {t('admin.common.actions')}
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const [firstItem] = order.items;
                const moreCount = getOrderItemsCount(order) - (firstItem?.quantity ?? 0);
                return (
                  <tr key={order.id}>
                    <td className="admin-table__primary">
                      <span className="admin-strong admin-nowrap">{order.number}</span>
                      <span className="admin-sub admin-nowrap">{dateTime(order.createdAt)}</span>
                    </td>
                    <td data-label={t('admin.orders.columns.customer')}>
                      <span>{order.customer.name}</span>
                      <span className="admin-sub admin-nowrap">{order.customer.phone}</span>
                    </td>
                    <td data-label={t('admin.orders.columns.items')}>
                      <span>
                        {firstItem ? text(firstItem.name) : '—'}
                        {firstItem?.quantity > 1 && ` × ${firstItem.quantity}`}
                      </span>
                      {moreCount > 0 && (
                        <span className="admin-sub">
                          {t('admin.orders.moreItems', { count: moreCount })}
                        </span>
                      )}
                    </td>
                    <td data-label={t('admin.orders.columns.total')} className="admin-nowrap">
                      <span className="admin-strong">{price(getOrderTotal(order))}</span>
                    </td>
                    <td data-label={t('admin.common.status')}>
                      <OrderStatusSelect order={order} />
                    </td>
                    <td className="admin-table__actions">
                      <button
                        type="button"
                        className="admin-action"
                        aria-label={t('admin.orders.detailsLabel', { id: order.number })}
                        title={t('admin.orders.details')}
                        onClick={() => setOpenedId(order.id)}
                      >
                        <Eye size={17} aria-hidden="true" />
                        <span className="admin-action__label">{t('admin.orders.details')}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {opened && <OrderDetailsModal order={opened} onClose={() => setOpenedId(null)} />}
    </>
  );
}
