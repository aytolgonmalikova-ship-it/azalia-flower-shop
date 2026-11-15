import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowRight, Flower2, MessageSquareText, ShieldCheck, ShoppingBag } from 'lucide-react';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ReviewStars from '../../components/admin/ReviewStars.jsx';
import StatCard from '../../components/admin/StatCard.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { ADMIN_ROLE_MAIN } from '../../data/admin';
import { getOrderTotal, useAdminFormat } from '../../hooks/useAdminFormat';

const RECENT_ORDERS_LIMIT = 5;
const PENDING_REVIEWS_LIMIT = 3;

export default function AdminDashboardPage() {
  const { t } = useTranslation();
  const { text, price, dateTime } = useAdminFormat();
  const {
    products,
    productsStatus,
    orders,
    ordersStatus,
    reviews,
    reviewsStatus,
    admins,
    adminsStatus,
  } = useAdmin();
  const { user, isMainAdmin } = useAuth();
  // Пока данные не пришли из Firestore, в карточках показан прочерк, а не ноль.
  // Во время повторной загрузки остаются прежние значения.
  const productsReady = productsStatus === 'ready' || products.length > 0;
  const ordersReady = ordersStatus === 'ready' || orders.length > 0;
  const reviewsReady = reviewsStatus === 'ready';
  const adminsReady = adminsStatus === 'ready';

  const pendingReviews = reviews.filter((review) => review.status === 'pending');
  const mainAdmin = admins.find((admin) => admin.role === ADMIN_ROLE_MAIN);
  // Эту карточку видит только главный администратор, то есть главный — он сам.
  const mainAdminName = mainAdmin?.name || mainAdmin?.email || user?.email || '—';

  const stats = [
    {
      id: 'products',
      icon: Flower2,
      value: productsReady ? products.length : '—',
      hint: t('admin.dashboard.hints.outOfStock', {
        count: productsReady ? products.filter((product) => !product.inStock).length : '—',
      }),
    },
    {
      id: 'orders',
      icon: ShoppingBag,
      value: ordersReady ? orders.length : '—',
      hint: t('admin.dashboard.hints.newOrders', {
        count: ordersReady ? orders.filter((order) => order.status === 'new').length : '—',
      }),
    },
    {
      id: 'reviews',
      icon: MessageSquareText,
      value: reviewsReady ? reviews.length : '—',
      hint: t('admin.dashboard.hints.pendingReviews', {
        count: reviewsReady ? pendingReviews.length : '—',
      }),
    },
  ];

  // Список администраторов доступен только главному администратору.
  if (isMainAdmin) {
    stats.push({
      id: 'admins',
      icon: ShieldCheck,
      value: adminsReady ? admins.length : '—',
      hint: t('admin.dashboard.hints.mainAdmin', { name: adminsReady ? mainAdminName : '—' }),
    });
  }

  return (
    <>
      <PageHeader
        eyebrow={t('brand.full')}
        title={t('admin.dashboard.title')}
        subtitle={t('admin.dashboard.subtitle')}
      />

      <ul className="admin-stats">
        {stats.map(({ id, icon, value, hint }) => (
          <li key={id}>
            <StatCard
              to={`/admin/${id}`}
              icon={icon}
              label={t(`admin.dashboard.stats.${id}`)}
              value={value}
              hint={hint}
            />
          </li>
        ))}
      </ul>

      <div className="admin-dashboard">
        <section className="admin-panel" aria-labelledby="recent-orders">
          <div className="admin-panel__header">
            <h2 id="recent-orders" className="admin-panel__title">
              {t('admin.dashboard.recentOrders')}
            </h2>
            <Link to="/admin/orders" className="text-link">
              <span>{t('admin.common.viewAll')}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {!ordersReady ? (
            <p className="admin-panel__empty">
              {t(ordersStatus === 'error' ? 'admin.orders.loadErrorTitle' : 'admin.common.loading')}
            </p>
          ) : orders.length === 0 ? (
            <p className="admin-panel__empty">{t('admin.dashboard.noOrders')}</p>
          ) : (
            <ul className="admin-order-feed">
              {orders.slice(0, RECENT_ORDERS_LIMIT).map((order) => (
                <li key={order.id} className="admin-order-feed__item">
                  <div>
                    <span className="admin-strong">{order.number}</span>
                    <span className="admin-sub">{dateTime(order.createdAt)}</span>
                  </div>
                  <span className="admin-order-feed__customer">{order.customer.name || '—'}</span>
                  <strong className="admin-order-feed__total">{price(getOrderTotal(order))}</strong>
                  <span className="admin-order-feed__status">
                    <StatusBadge tone={order.status}>
                      {t(`admin.orders.statuses.${order.status}`)}
                    </StatusBadge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="admin-panel" aria-labelledby="pending-reviews">
          <div className="admin-panel__header">
            <h2 id="pending-reviews" className="admin-panel__title">
              {t('admin.dashboard.pendingReviews')}
            </h2>
            <Link to="/admin/reviews" className="text-link">
              <span>{t('admin.common.viewAll')}</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
          {!reviewsReady ? (
            <p className="admin-panel__empty">
              {t(reviewsStatus === 'error' ? 'admin.reviews.loadErrorTitle' : 'admin.common.loading')}
            </p>
          ) : pendingReviews.length === 0 ? (
            <p className="admin-panel__empty">{t('admin.dashboard.noPendingReviews')}</p>
          ) : (
            <ul className="admin-feed">
              {pendingReviews.slice(0, PENDING_REVIEWS_LIMIT).map((review) => (
                <li key={review.id} className="admin-feed__item">
                  <div className="admin-feed__head">
                    <span className="admin-strong">{review.author}</span>
                    <ReviewStars rating={review.rating} />
                  </div>
                  {review.product && (
                    <p className="admin-sub">
                      {t('admin.reviews.about', { name: text(review.product) })}
                    </p>
                  )}
                  <p className="admin-feed__text">{review.text}</p>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
