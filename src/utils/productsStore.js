import {
  addProduct,
  deleteProduct,
  fetchProducts,
  seedProducts,
  updateProduct,
} from '../services/products';

/*
 * Общий список товаров для сайта и админ-панели (данные — в Firestore, services/products.js).
 * Список один, поэтому изменения из панели сразу видны на витрине без повторной загрузки.
 *
 * Состояние: idle → loading → ready | error.
 * error: null, 'denied' (отказ правил Firestore) или 'failed' (сеть и прочие сбои).
 */
const IDLE = { status: 'idle', items: [], error: null };

let state = IDLE;
const listeners = new Set();

function setState(next) {
  state = next;
  listeners.forEach((listener) => listener());
}

const setItems = (items) => setState({ ...state, items });

export const toErrorKind = (error) => (error?.code === 'permission-denied' ? 'denied' : 'failed');

async function load() {
  if (state.status === 'loading') return;
  setState({ status: 'loading', items: state.items, error: null });
  try {
    setState({ status: 'ready', items: await fetchProducts(), error: null });
  } catch (error) {
    setState({ status: 'error', items: [], error: toErrorKind(error) });
  }
}

export const productsStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getState: () => state,
  load,

  // Запросы ниже возвращают Promise и могут завершиться ошибкой: её показывает страница.
  async add(values) {
    const product = await addProduct(values);
    setItems([product, ...state.items]);
  },

  async update(id, patch) {
    const saved = await updateProduct(id, patch);
    setItems(state.items.map((item) => (item.id === id ? { ...item, ...saved } : item)));
  },

  async remove(id) {
    await deleteProduct(id);
    setItems(state.items.filter((item) => item.id !== id));
  },

  // Стартовый каталог: после записи список перечитывается, даже если часть товаров не записалась.
  async seed() {
    try {
      return await seedProducts();
    } finally {
      await load();
    }
  },
};
