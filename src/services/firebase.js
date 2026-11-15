/*
 * Подключение Firebase.
 *
 * Настройки проекта берутся из переменных окружения VITE_FIREBASE_* (файл .env),
 * так же как ключи EmailJS. Эти значения не секретные: они попадают в код сайта
 * в браузере, а доступ к данным ограничивают правила безопасности Firestore.
 *
 * Использование: import { db } from '../services/firebase';
 */
import { initializeApp } from 'firebase/app';
// Облегчённый клиент Firestore: обычные запросы без постоянного соединения.
// Сайту хватает разовых чтений и записей (товары, заказы, отзывы), а этот вариант
// в разы меньше по размеру.
import { getFirestore } from 'firebase/firestore/lite';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
