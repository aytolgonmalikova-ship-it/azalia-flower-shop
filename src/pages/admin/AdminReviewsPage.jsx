import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Ban, Check, LoaderCircle, RefreshCw, Trash2 } from 'lucide-react';
import StatusMessage from '../../components/StatusMessage.jsx';
import ConfirmDialog from '../../components/admin/ConfirmDialog.jsx';
import PageHeader from '../../components/admin/PageHeader.jsx';
import ReviewStars from '../../components/admin/ReviewStars.jsx';
import StatusBadge from '../../components/admin/StatusBadge.jsx';
import StatusFilter from '../../components/admin/StatusFilter.jsx';
import { useAdmin } from '../../context/AdminContext.jsx';
import { REVIEW_STATUSES } from '../../data/admin';
import { useAdminFormat } from '../../hooks/useAdminFormat';

const ALL = 'all';

export default function AdminReviewsPage() {
  const { t } = useTranslation();
  const { text, date } = useAdminFormat();
  const { reviews, reviewsStatus, reloadReviews, setReviewStatus, deleteReview, notify } =
    useAdmin();
  const [status, setStatus] = useState(ALL);
  const [deleting, setDeleting] = useState(null);
  // id отзыва, по которому сейчас идёт запрос к Firestore.
  const [busyId, setBusyId] = useState(null);
  const isLoading = reviewsStatus === 'loading' || reviewsStatus === 'idle';

  const visible = status === ALL ? reviews : reviews.filter((review) => review.status === status);

  const run = async (id, action, successMessage) => {
    setBusyId(id);
    try {
      await action();
      notify(successMessage);
    } catch {
      notify(t('admin.reviews.toast.error'), 'error');
    } finally {
      setBusyId(null);
    }
  };

  const moderate = (review, nextStatus) =>
    run(
      review.id,
      () => setReviewStatus(review.id, nextStatus),
      t(`admin.reviews.toast.${nextStatus}`),
    );

  return (
    <>
      <PageHeader title={t('admin.reviews.title')} subtitle={t('admin.reviews.subtitle')}>
        <button type="button" className="admin-action" disabled={isLoading} onClick={reloadReviews}>
          {isLoading ? (
            <LoaderCircle size={16} className="spinner" aria-hidden="true" />
          ) : (
            <RefreshCw size={16} aria-hidden="true" />
          )}
          {t('admin.common.refresh')}
        </button>
      </PageHeader>

      <StatusFilter
        label={t('admin.reviews.filterLabel')}
        statuses={REVIEW_STATUSES}
        translationPrefix="admin.reviews.statuses"
        items={reviews}
        value={status}
        onChange={setStatus}
      />

      {reviewsStatus === 'error' ? (
        <StatusMessage
          type="error"
          title={t('admin.reviews.loadErrorTitle')}
          text={t('admin.reviews.loadErrorText')}
          actionLabel={t('admin.common.retry')}
          onAction={reloadReviews}
        />
      ) : isLoading && reviews.length === 0 ? (
        <p className="admin-loading" role="status">
          <LoaderCircle size={20} className="spinner" aria-hidden="true" />
          <span>{t('admin.common.loading')}</span>
        </p>
      ) : visible.length === 0 ? (
        <StatusMessage title={t('admin.reviews.emptyTitle')} text={t('admin.reviews.emptyText')} />
      ) : (
        <ul className="admin-reviews">
          {visible.map((review) => (
            <li key={review.id}>
              <article className="admin-review">
                <header className="admin-review__head">
                  <span className="admin-avatar" aria-hidden="true">
                    {review.author.charAt(0)}
                  </span>
                  <div className="admin-review__author">
                    <h2 className="admin-review__name">{review.author}</h2>
                    <span className="admin-sub">
                      {review.createdAt ? date(review.createdAt) : ''}
                    </span>
                  </div>
                  <StatusBadge tone={review.status}>
                    {t(`admin.reviews.statuses.${review.status}`)}
                  </StatusBadge>
                </header>

                <ReviewStars rating={review.rating} />
                <p className="admin-review__text">{review.text}</p>
                {review.product && (
                  <p className="admin-sub">
                    {t('admin.reviews.about', { name: text(review.product) })}
                  </p>
                )}

                <footer className="admin-review__actions">
                  {review.status !== 'approved' && (
                    <button
                      type="button"
                      className="admin-action admin-action--success"
                      disabled={busyId === review.id}
                      onClick={() => moderate(review, 'approved')}
                    >
                      <Check size={17} aria-hidden="true" />
                      {t('admin.reviews.approve')}
                    </button>
                  )}
                  {review.status !== 'rejected' && (
                    <button
                      type="button"
                      className="admin-action"
                      disabled={busyId === review.id}
                      onClick={() => moderate(review, 'rejected')}
                    >
                      <Ban size={16} aria-hidden="true" />
                      {t('admin.reviews.reject')}
                    </button>
                  )}
                  <button
                    type="button"
                    className="admin-icon-btn admin-icon-btn--danger admin-review__delete"
                    aria-label={t('admin.reviews.deleteLabel', { name: review.author })}
                    title={t('admin.common.delete')}
                    disabled={busyId === review.id}
                    onClick={() => setDeleting(review)}
                  >
                    <Trash2 size={18} />
                  </button>
                </footer>
              </article>
            </li>
          ))}
        </ul>
      )}

      {deleting && (
        <ConfirmDialog
          danger
          title={t('admin.reviews.deleteTitle')}
          text={t('admin.reviews.deleteText', { name: deleting.author })}
          onConfirm={() =>
            run(deleting.id, () => deleteReview(deleting.id), t('admin.reviews.toast.deleted'))
          }
          onClose={() => setDeleting(null)}
        />
      )}
    </>
  );
}
