import { useTranslation } from 'react-i18next';
import { Star } from 'lucide-react';
import { REVIEW_MAX_RATING } from '../data/reviews';

const STARS = Array.from({ length: REVIEW_MAX_RATING }, (_, index) => index + 1);

// Оценка звёздами. Без onChange — просто показывает оценку,
// с onChange — группа переключателей для выбора оценки в форме.
export default function RatingStars({ rating, onChange, name, disabled = false }) {
  const { t } = useTranslation();

  if (!onChange) {
    return (
      <span className="rating-stars" role="img" aria-label={t('reviews.ratingLabel', { rating })}>
        {STARS.map((star) => (
          <Star
            key={star}
            size={18}
            className={star <= rating ? 'is-filled' : undefined}
            aria-hidden="true"
          />
        ))}
      </span>
    );
  }

  return (
    <span className="rating-stars rating-stars--input">
      {STARS.map((star) => (
        <label key={star} className="rating-stars__option">
          <input
            type="radio"
            className="visually-hidden"
            name={name}
            value={star}
            checked={rating === star}
            disabled={disabled}
            onChange={() => onChange(star)}
          />
          <Star size={30} className={star <= rating ? 'is-filled' : undefined} aria-hidden="true" />
          <span className="visually-hidden">{t('reviews.form.ratingOption', { count: star })}</span>
        </label>
      ))}
    </span>
  );
}
