import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronDown, LoaderCircle, PenLine } from 'lucide-react';
import '../locales/registerReviews';
import Button from '../components/Button.jsx';
import Reveal from '../components/Reveal.jsx';
import ReviewCard from '../components/ReviewCard.jsx';
import ReviewForm from '../components/ReviewForm.jsx';
import SectionHeading from '../components/SectionHeading.jsx';
import StatusMessage from '../components/StatusMessage.jsx';
import { useApprovedReviews } from '../hooks/useReviews';

const VISIBLE_LIMIT = 6;

// Отзывы на главной странице: только одобренные администратором (из Firestore),
// плюс форма нового отзыва.
export default function ReviewsSection() {
  const { t } = useTranslation();
  const { reviews: approved, status, reload } = useApprovedReviews();
  const [expanded, setExpanded] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const visible = expanded ? approved : approved.slice(0, VISIBLE_LIMIT);

  return (
    <section className="section reviews" aria-labelledby="reviews-title">
      <div className="container">
        <SectionHeading
          id="reviews-title"
          eyebrow={t('reviews.eyebrow')}
          title={t('reviews.title')}
          subtitle={t('reviews.subtitle')}
        />

        {status === 'error' ? (
          <StatusMessage
            type="error"
            title={t('reviews.errorTitle')}
            text={t('reviews.errorText')}
            actionLabel={t('reviews.retry')}
            onAction={reload}
          />
        ) : status !== 'ready' ? (
          <p className="reviews__loading" role="status">
            <LoaderCircle size={20} className="spinner" aria-hidden="true" />
            <span>{t('reviews.loading')}</span>
          </p>
        ) : approved.length === 0 ? (
          <StatusMessage title={t('reviews.emptyTitle')} text={t('reviews.emptyText')} />
        ) : (
          <ul className="reviews__grid">
            {visible.map((review, index) => (
              <Reveal as="li" key={review.id} delay={(index % 3) * 90}>
                <ReviewCard review={review} />
              </Reveal>
            ))}
          </ul>
        )}

        {approved.length > VISIBLE_LIMIT && !expanded && (
          <p className="reviews__more">
            <button
              type="button"
              className="text-link reviews__more-button"
              onClick={() => setExpanded(true)}
            >
              <span>{t('reviews.showAll')}</span>
              <ChevronDown size={18} aria-hidden="true" />
            </button>
          </p>
        )}

        {formOpen ? (
          <div id="review-form" className="card reviews__form">
            <ReviewForm onClose={() => setFormOpen(false)} />
          </div>
        ) : (
          <p className="reviews__actions">
            <Button icon={<PenLine size={18} />} onClick={() => setFormOpen(true)}>
              {t('reviews.leave')}
            </Button>
          </p>
        )}
      </div>
    </section>
  );
}
