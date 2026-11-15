/*
 * Общие константы отзывов для сайта и админ-панели.
 * Сами отзывы хранятся в Firestore (см. utils/reviewsStore.js).
 *
 * status: pending — на модерации, approved — виден на сайте, rejected — отклонён.
 * Ограничения длины и оценки продублированы в правилах Firestore (firestore.rules):
 * при изменении значений здесь поменяйте их и там.
 */
export const REVIEW_STATUS_PENDING = 'pending';
export const REVIEW_STATUS_APPROVED = 'approved';
export const REVIEW_STATUS_REJECTED = 'rejected';

// Подписи статусов для админ-панели: admin.reviews.statuses.<id>.
export const REVIEW_STATUSES = [
  REVIEW_STATUS_PENDING,
  REVIEW_STATUS_APPROVED,
  REVIEW_STATUS_REJECTED,
];

export const REVIEW_NAME_MAX_LENGTH = 40;
export const REVIEW_TEXT_MIN_LENGTH = 10;
export const REVIEW_TEXT_MAX_LENGTH = 600;
export const REVIEW_MAX_RATING = 5;
