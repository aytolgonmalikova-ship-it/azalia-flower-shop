/*
 * Справочники админ-панели: разделы, статусы и роли.
 * Сами данные (товары, заказы, отзывы, администраторы) лежат в Firestore.
 */

// Разделы панели. Подписи лежат в переводах: admin.nav.<id>.
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', path: '/admin' },
  { id: 'products', path: '/admin/products' },
  { id: 'orders', path: '/admin/orders' },
  { id: 'reviews', path: '/admin/reviews' },
  { id: 'admins', path: '/admin/admins' },
];

// Подписи статусов: admin.orders.statuses.<id>, admin.reviews.statuses.<id>.
export const ORDER_STATUSES = ['new', 'processing', 'delivering', 'completed', 'cancelled'];
// Отзывы общие для сайта и панели, поэтому лежат отдельно: data/reviews.js.
export { REVIEW_STATUSES } from './reviews';

// Роли администраторов. Подписи: admin.admins.roles.<id>.
export const ADMIN_ROLE_MAIN = 'main';
export const ADMIN_ROLE_ADMIN = 'admin';
