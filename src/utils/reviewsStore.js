import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore/lite';
import { REVIEW_STATUS_APPROVED, REVIEW_STATUS_PENDING } from '../data/reviews';
import { db } from '../services/firebase';

/*
 * Общее хранилище отзывов для сайта и админ-панели. Данные лежат в Firestore,
 * коллекция reviews. Документ: author, rating, text, status, createdAt.
 *
 * Кто что может, решают правила Firestore (firestore.rules в корне проекта):
 *  - гость читает только одобренные отзывы и создаёт новые со статусом «На модерации»;
 *  - главный администратор читает все, меняет статус и удаляет.
 *
 * Два независимых списка:
 *  - approved — одобренные отзывы для сайта;
 *  - all — все отзывы для панели (запрос проходит только после входа администратора).
 * Состояние списка: idle → loading → ready | error.
 */
const COLLECTION = 'reviews';
const IDLE = { status: 'idle', items: [] };

let state = { approved: IDLE, all: IDLE };
const listeners = new Set();

function setList(key, value) {
  state = { ...state, [key]: value };
  listeners.forEach((listener) => listener());
}

function toReview(snapshot) {
  const { author, rating, text, status, createdAt } = snapshot.data();
  return {
    id: snapshot.id,
    author,
    rating,
    text,
    status,
    createdAt: createdAt?.toDate?.().toISOString() ?? null,
  };
}

const byNewest = (a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? '');

async function load(key, source) {
  if (state[key].status === 'loading') return;
  setList(key, { status: 'loading', items: state[key].items });
  try {
    const snapshot = await getDocs(source());
    setList(key, { status: 'ready', items: snapshot.docs.map(toReview).sort(byNewest) });
  } catch (error) {
    setList(key, { status: 'error', items: [], error: error.code ?? 'unknown' });
  }
}

export const reviewsStore = {
  subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getApproved: () => state.approved,
  getAll: () => state.all,

  // Условие по статусу обязательно: без него правила Firestore отклонят запрос гостя.
  // Сортируем в браузере, чтобы не заводить составной индекс.
  loadApproved: () =>
    load('approved', () =>
      query(collection(db, COLLECTION), where('status', '==', REVIEW_STATUS_APPROVED)),
    ),

  loadAll: () => load('all', () => collection(db, COLLECTION)),

  // Новый отзыв клиента всегда уходит на модерацию и не виден на сайте до одобрения.
  // Набор полей и статус дополнительно проверяют правила Firestore.
  async add({ author, rating, text }) {
    await addDoc(collection(db, COLLECTION), {
      author,
      rating,
      text,
      status: REVIEW_STATUS_PENDING,
      createdAt: serverTimestamp(),
    });
  },

  async setStatus(id, status) {
    await updateDoc(doc(db, COLLECTION, id), { status });
    setList('all', {
      ...state.all,
      items: state.all.items.map((review) => (review.id === id ? { ...review, status } : review)),
    });
    // Список для сайта устарел — он загрузится заново при следующем показе раздела.
    setList('approved', IDLE);
  },

  async remove(id) {
    await deleteDoc(doc(db, COLLECTION, id));
    setList('all', { ...state.all, items: state.all.items.filter((review) => review.id !== id) });
    setList('approved', IDLE);
  },

  // После выхода администратора полный список в памяти не остаётся.
  clearAll: () => setList('all', IDLE),
};
