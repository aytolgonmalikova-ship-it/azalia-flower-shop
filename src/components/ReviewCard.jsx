import { useTranslation } from 'react-i18next';
import RatingStars from './RatingStars.jsx';

// Карточка одобренного отзыва на сайте.
export default function ReviewCard({ review }) {
  const { i18n } = useTranslation();
  const date = new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(review.createdAt));

  return (
    <figure className="review-card">
      <RatingStars rating={review.rating} />
      <blockquote className="review-card__text">{review.text}</blockquote>
      <figcaption className="review-card__author">
        <span className="review-card__avatar" aria-hidden="true">
          {review.author.charAt(0).toUpperCase()}
        </span>
        <span>
          <span className="review-card__name">{review.author}</span>
          <time className="review-card__date" dateTime={review.createdAt}>
            {date}
          </time>
        </span>
      </figcaption>
    </figure>
  );
}
