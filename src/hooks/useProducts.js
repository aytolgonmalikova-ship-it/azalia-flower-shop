import { useEffect, useMemo, useSyncExternalStore } from 'react';
import { PRODUCTS } from '../data/products';
import { productsStore } from '../utils/productsStore';

/*
 * Товары для витрины сайта.
 *
 * Данные приходят из Firestore. Пока они загружаются, а также при ошибке или если
 * коллекция ещё пуста (стартовый каталог не загружен), показывается локальный каталог
 * из data/products.js — сайт не остаётся пустым.
 *
 * products — только товары с isVisible (скрытые на витрину не попадают);
 * status: 'idle' | 'loading' | 'ready' | 'error';
 * isLive: true — показаны актуальные данные из Firestore (цены можно отправлять в заказ).
 */
export function useProducts() {
  const { items, status } = useSyncExternalStore(productsStore.subscribe, productsStore.getState);

  useEffect(() => {
    if (status === 'idle') productsStore.load();
  }, [status]);

  return useMemo(() => {
    const isLive = status === 'ready' && items.length > 0;
    const source = isLive ? items : PRODUCTS;
    return { products: source.filter((item) => item.isVisible), status, isLive };
  }, [items, status]);
}

// Все товары для админ-панели. Список обновляется при каждом открытии панели.
export function useAllProducts() {
  const { items, status, error } = useSyncExternalStore(
    productsStore.subscribe,
    productsStore.getState,
  );

  useEffect(() => {
    productsStore.load();
  }, []);

  return { products: items, status, error, reload: productsStore.load };
}
