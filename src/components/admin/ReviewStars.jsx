import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';

const STARS = [1, 2, 3, 4, 5];

// Оценка отзыва звёздами; для скринридеров — текстом.
export default function ReviewStars({ rating }) {
  const { t } = useTranslation();

  return (
    <span className="admin-stars" role="img" aria-label={t('admin.reviews.ratingLabel', { rating })}>
      {STARS.map((star) => (
        <Star
          key={star}
          size={16}
          className={star <= rating ? 'is-filled' : undefined}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}
