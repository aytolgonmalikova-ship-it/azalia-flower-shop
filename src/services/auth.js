/*
 * Вход через Firebase Authentication (email и пароль): клиенты сайта и администраторы.
 *
 * Учётные записи общие. Администратор — это пользователь, у которого есть роль
 * в Firestore (services/admins.js); у обычного клиента роли нет.
 * Настоящую защиту дают правила Firestore (файл firestore.rules в корне проекта).
 */
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { app } from './firebase';
import { createUserProfile, ensureUserProfile } from './users';

const auth = getAuth(app);

export const subscribeToAuth = (callback) => onAuthStateChanged(auth, callback);

// ---------- Администраторы (панель /admin) ----------
export const signInAdmin = (email, password) => signInWithEmailAndPassword(auth, email, password);

export const signOutAdmin = () => signOut(auth);

// ---------- Клиенты сайта ----------

// Профиль в Firestore вторичен: если он не записался (нет сети, правила ещё
// не опубликованы), сам вход или регистрация всё равно считаются успешными.
async function quietly(task) {
  try {
    await task();
  } catch (error) {
    console.warn('[auth] Не удалось сохранить профиль пользователя:', error);
  }
}

// Регистрация: учётная запись, имя в ней и профиль users/{uid}.
// Ошибку бросает только само создание учётной записи.
export async function registerUser({ name, email, password, phone }) {
  const { user } = await createUserWithEmailAndPassword(auth, email, password);
  await quietly(() => updateProfile(user, { displayName: name }));
  await quietly(() => createUserProfile(user, { name, phone }));
  return user;
}

export async function signInUser(email, password) {
  const { user } = await signInWithEmailAndPassword(auth, email, password);
  await quietly(() => ensureUserProfile(user));
  return user;
}

export const signOutUser = () => signOut(auth);
