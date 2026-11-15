import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAllProducts } from '../hooks/useProducts';
import { useAllReviews } from '../hooks/useReviews';
import { addAdmin, fetchAdmins, removeAdmin, transferOwnership } from '../services/admins';
import { fetchOrders, updateOrderStatus } from '../services/orders';
import { productsStore, toErrorKind } from '../utils/productsStore';
import { reviewsStore } from '../utils/reviewsStore';
import { useAuth } from './AuthContext.jsx';

/*
 * Состояние админ-панели.
 *
 * Все данные хранятся в Firestore: товары (services/products.js), заказы
 * (services/orders.js), отзывы и список администраторов. Функции изменения возвращают
 * Promise и могут завершиться ошибкой (например, permission-denied) — её показывает страница.
 */
const AdminContext = createContext(null);

// Состояние списка (администраторы, заказы): idle → loading → ready | error.
// error: null, 'denied' (отказ правил Firestore) или 'failed' (сеть и прочие сбои).
const ADMINS_IDLE = { status: 'idle', items: [], error: null };
const ORDERS_IDLE = { status: 'idle', items: [], error: null };

export function AdminProvider({ children }) {
  const { user, isMainAdmin, refreshRole } = useAuth();
  const currentUid = user?.uid ?? null;
  // Товары общие с витриной сайта: изменения из панели сразу видны покупателям.
  const {
    products,
    status: productsStatus,
    error: productsError,
    reload: reloadProducts,
  } = useAllProducts();
  const [orderList, setOrderList] = useState(ORDERS_IDLE);
  // Отзывы общие с публичным сайтом: клиент оставляет отзыв, здесь он проходит модерацию.
  const { reviews, status: reviewsStatus, reload: reloadReviews } = useAllReviews();
  const [adminList, setAdminList] = useState(ADMINS_IDLE);
  const [toast, setToast] = useState(null);

  // type: 'success' | 'error'
  const notify = useCallback(
    (message, type = 'success') => setToast({ id: Date.now(), message, type }),
    [],
  );
  const dismissToast = useCallback(() => setToast(null), []);

  // Заказы из Firestore, от новых к старым. Загружаются при каждом открытии панели.
  const reloadOrders = useCallback(async () => {
    setOrderList((current) => ({ status: 'loading', items: current.items, error: null }));
    try {
      setOrderList({ status: 'ready', items: await fetchOrders(), error: null });
    } catch (error) {
      setOrderList({ status: 'error', items: [], error: toErrorKind(error) });
    }
  }, []);

  useEffect(() => {
    reloadOrders();
  }, [reloadOrders]);

  // Статус сначала записывается в Firestore и только потом меняется в списке:
  // счётчики на главной панели и в меню считаются из этого же списка.
  const setOrderStatus = useCallback(async (id, status) => {
    await updateOrderStatus(id, status);
    setOrderList((current) => ({
      ...current,
      items: current.items.map((order) => (order.id === id ? { ...order, status } : order)),
    }));
  }, []);

  const reloadAdmins = useCallback(async () => {
    setAdminList((current) => ({ status: 'loading', items: current.items, error: null }));
    try {
      setAdminList({ status: 'ready', items: await fetchAdmins(), error: null });
    } catch (error) {
      setAdminList({
        status: 'error',
        items: [],
        error: toErrorKind(error),
      });
    }
  }, []);

  // Список администраторов доступен только главному: остальным правила Firestore откажут.
  useEffect(() => {
    if (isMainAdmin) reloadAdmins();
    else setAdminList(ADMINS_IDLE);
  }, [isMainAdmin, reloadAdmins]);

  // Добавление и удаление администраторов (может только главный). Ошибку получает
  // страница; после успеха список перечитывается из Firestore.
  const createAdmin = useCallback(
    async (values) => {
      await addAdmin(values);
      await reloadAdmins();
    },
    [reloadAdmins],
  );

  const deleteAdmin = useCallback(
    async (uid) => {
      await removeAdmin(uid, currentUid);
      await reloadAdmins();
    },
    [currentUid, reloadAdmins],
  );

  // Передача полномочий главного администратора. После неё текущий пользователь
  // становится обычным администратором, поэтому роль перечитывается из Firestore.
  const transferMainAdmin = useCallback(
    async (uid) => {
      await transferOwnership(uid);
      try {
        await refreshRole();
      } catch {
        // Полномочия уже переданы; роль в интерфейсе обновится при следующем входе.
      }
    },
    [refreshRole],
  );

  const value = useMemo(
    () => ({
      products,
      productsStatus,
      productsError,
      reloadProducts,
      orders: orderList.items,
      ordersStatus: orderList.status,
      ordersError: orderList.error,
      reloadOrders,
      reviews,
      reviewsStatus,
      reloadReviews,
      admins: adminList.items,
      adminsStatus: adminList.status,
      adminsError: adminList.error,
      reloadAdmins,
      createAdmin,
      deleteAdmin,
      transferMainAdmin,
      toast,
      notify,
      dismissToast,

      // Запросы к Firestore: возвращают Promise и могут завершиться ошибкой.
      addProduct: productsStore.add,
      updateProduct: productsStore.update,
      deleteProduct: productsStore.remove,
      seedProducts: productsStore.seed,
      setOrderStatus,
      setReviewStatus: reviewsStore.setStatus,
      deleteReview: reviewsStore.remove,
    }),
    [
      products,
      productsStatus,
      productsError,
      reloadProducts,
      orderList,
      reloadOrders,
      setOrderStatus,
      reviews,
      reviewsStatus,
      reloadReviews,
      adminList,
      reloadAdmins,
      createAdmin,
      deleteAdmin,
      transferMainAdmin,
      toast,
      notify,
      dismissToast,
    ],
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>');
  return context;
}
