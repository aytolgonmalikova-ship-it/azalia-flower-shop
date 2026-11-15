import { useEffect, useSyncExternalStore } from 'react';
import { reviewsStore } from '../utils/reviewsStore';

// Одобренные отзывы для сайта. status: 'idle' | 'loading' | 'ready' | 'error'.
export function useApprovedReviews() {
  const { items, status } = useSyncExternalStore(reviewsStore.subscribe, reviewsStore.getApproved);

  useEffect(() => {
    if (status === 'idle') reviewsStore.loadApproved();
  }, [status]);

  return { reviews: items, status, reload: reviewsStore.loadApproved };
}

// Все отзывы для админ-панели. Список обновляется при каждом открытии панели.
export function useAllReviews() {
  const { items, status } = useSyncExternalStore(reviewsStore.subscribe, reviewsStore.getAll);

  useEffect(() => {
    reviewsStore.loadAll();
  }, []);

  return { reviews: items, status, reload: reviewsStore.loadAll };
}
