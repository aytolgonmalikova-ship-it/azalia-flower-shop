import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ORDER_ITEMS_MAX, ORDER_QUANTITY_MAX } from '../services/orders';
import { readStorage, writeStorage } from '../utils/storage';

/*
 * Корзина покупателя. В ней хранятся только id товара и количество: название, цена
 * и наличие берутся из актуального каталога в момент показа и оформления заказа.
 * Корзина сохраняется в localStorage и переживает перезагрузку страницы.
 */
const CartContext = createContext(null);

const STORAGE_KEY = 'azalia-cart';

const clampQuantity = (value) =>
  Math.min(ORDER_QUANTITY_MAX, Math.max(1, Math.round(Number(value)) || 1));

function readCart() {
  try {
    const saved = JSON.parse(readStorage(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(saved)) return [];
    return saved
      .filter((item) => typeof item?.productId === 'string' && item.productId)
      .slice(0, ORDER_ITEMS_MAX)
      .map((item) => ({ productId: item.productId, quantity: clampQuantity(item.quantity) }));
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);

  useEffect(() => {
    writeStorage(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  // Корзина, изменённая в другой вкладке, подхватывается и здесь.
  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key === STORAGE_KEY) setItems(readCart());
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const add = useCallback((productId) => {
    setItems((current) => {
      if (current.some((item) => item.productId === productId)) {
        return current.map((item) =>
          item.productId === productId
            ? { ...item, quantity: clampQuantity(item.quantity + 1) }
            : item,
        );
      }
      if (current.length >= ORDER_ITEMS_MAX) return current;
      return [...current, { productId, quantity: 1 }];
    });
  }, []);

  const setQuantity = useCallback((productId, quantity) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId ? { ...item, quantity: clampQuantity(quantity) } : item,
      ),
    );
  }, []);

  const remove = useCallback((productId) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo(
    () => ({
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      quantityOf: (productId) =>
        items.find((item) => item.productId === productId)?.quantity ?? 0,
      add,
      setQuantity,
      remove,
      clear,
    }),
    [items, add, setQuantity, remove, clear],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used inside <CartProvider>');
  return context;
}
